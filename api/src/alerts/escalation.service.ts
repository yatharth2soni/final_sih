import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { QueryEscalationsDto } from './dto/query-escalations.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import {
  EscalationLog,
  EscalationOutcome,
  Notification,
  Prisma,
} from '@prisma/client';

export interface RecordAndDeliverParams {
  ruleKey: string;
  resourceType: string;
  resourceId: string;
  stage: number;
  recipientId: string;
  recipientRole?: string;
  notificationPayload: Omit<CreateNotificationDto, 'recipientId'>;
  detail?: Record<string, any>;
  occurredAt?: Date;
}

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) { }

  /**
   * Records and delivers an escalation with idempotency protection.
   *
   * Flow:
   * 1. Check whether the escalation was already processed.
   * 2. Deliver the notification.
   * 3. Persist the escalation log.
   * 4. If another concurrent request inserted the same idempotencyKey,
   *    treat it as an idempotent skip instead of throwing.
   * 5. Persist genuine failures for auditing.
   */
  async recordAndDeliver(
    params: RecordAndDeliverParams,
  ): Promise<{
    outcome: EscalationOutcome;
    log?: EscalationLog;
    notification?: Notification;
  }> {
    const {
      ruleKey,
      resourceType,
      resourceId,
      stage,
      recipientId,
      recipientRole,
      notificationPayload,
      detail,
      occurredAt = new Date(),
    } = params;

    const idempotencyKey = `${ruleKey}:${resourceId}:${stage}:${recipientId}`;

    // ------------------------------------------------------------
    // 1. Fast idempotency check
    // ------------------------------------------------------------
    const existingLog = await this.prisma.escalationLog.findUnique({
      where: { idempotencyKey },
    });

    if (existingLog) {
      this.logger.debug(
        `[Idempotent Skip] ${idempotencyKey} already exists with outcome=${existingLog.outcome}`,
      );

      return {
        outcome: EscalationOutcome.SKIPPED,
        log: existingLog,
      };
    }

    try {
      // ----------------------------------------------------------
      // 2. Create in-app notification
      // ----------------------------------------------------------
      const notification =
        await this.notificationsService.createNotification({
          ...notificationPayload,
          recipientId,
        });

      // ----------------------------------------------------------
      // 3. Create escalation log
      // ----------------------------------------------------------
      try {
        const log = await this.prisma.escalationLog.create({
          data: {
            ruleKey,
            resourceType,
            resourceId,
            stage,
            recipientId,
            recipientRole,
            occurredAt,
            notificationId: notification.id,
            idempotencyKey,
            outcome: EscalationOutcome.SENT,
            detail:
              (detail as Prisma.InputJsonValue) ?? Prisma.JsonNull,
          },
        });

        return {
          outcome: EscalationOutcome.SENT,
          log,
          notification,
        };
      } catch (createErr: any) {
        // --------------------------------------------------------
        // 4. Handle concurrent idempotency race
        //
        // Two requests can both pass findUnique() before either
        // request inserts the row. The database UNIQUE constraint
        // is the final concurrency guard.
        // --------------------------------------------------------
        if (createErr?.code === 'P2002') {
          const concurrentLog =
            await this.prisma.escalationLog.findUnique({
              where: { idempotencyKey },
            });

          if (concurrentLog) {
            this.logger.debug(
              `[Concurrent Idempotent Skip] ${idempotencyKey}`,
            );

            return {
              outcome: EscalationOutcome.SKIPPED,
              log: concurrentLog,
            };
          }
        }

        throw createErr;
      }
    } catch (err: any) {
      this.logger.error(
        `Failed to record and deliver escalation ${idempotencyKey}: ${err.message}`,
        err.stack,
      );

      // ----------------------------------------------------------
      // 5. Persist failure for auditability
      // ----------------------------------------------------------
      try {
        const failLog =
          await this.prisma.escalationLog.upsert({
            where: { idempotencyKey },
            update: {},
            create: {
              ruleKey,
              resourceType,
              resourceId,
              stage,
              recipientId,
              recipientRole,
              occurredAt,
              idempotencyKey,
              outcome: EscalationOutcome.FAILED,
              detail: {
                error: err.message,
              },
            },
          });

        return {
          outcome: EscalationOutcome.FAILED,
          log: failLog,
        };
      } catch (logErr: any) {
        this.logger.error(
          `Could not write failure log for ${idempotencyKey}: ${logErr.message}`,
          logErr.stack,
        );

        return {
          outcome: EscalationOutcome.FAILED,
        };
      }
    }
  }

  /**
   * Query escalation audit log entries.
   */
  async queryEscalations(
    query: QueryEscalationsDto,
  ): Promise<PaginatedResponse<EscalationLog>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.EscalationLogWhereInput = {};

    if (query.resourceType) {
      where.resourceType = query.resourceType;
    }

    if (query.ruleKey) {
      where.ruleKey = query.ruleKey;
    }

    if (query.stage) {
      where.stage = query.stage;
    }

    if (query.outcome) {
      where.outcome = query.outcome;
    }

    if (query.from || query.to) {
      where.occurredAt = {};

      if (query.from) {
        where.occurredAt.gte = new Date(query.from);
      }

      if (query.to) {
        where.occurredAt.lte = new Date(query.to);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.escalationLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          occurredAt: 'desc',
        },
      }),

      this.prisma.escalationLog.count({
        where,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}