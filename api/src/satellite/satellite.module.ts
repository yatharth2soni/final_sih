import { Module } from '@nestjs/common';
import { SatelliteService } from './satellite.service';
import { SatelliteController } from './satellite.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GisService } from '../gis/gis.service';
import { ScopeService } from '../common/services/scope.service';

@Module({
  imports: [PrismaModule],
  controllers: [SatelliteController],
  providers: [SatelliteService, GisService, ScopeService],
  exports: [SatelliteService],
})
export class SatelliteModule {}
