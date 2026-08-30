import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './environment.controller';

@Module({
  imports: [PrismaModule],
  controllers: [EnvironmentController],
  providers: [EnvironmentService],
  exports: [EnvironmentService],
})
export class EnvironmentModule {}
