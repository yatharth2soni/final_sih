import { Module } from '@nestjs/common';
import { MinesController } from './mines.controller';
import { OfficersController } from './officers.controller';
import { MinesService } from './mines.service';
import { GisService } from '../gis/gis.service';
import { ScopeService } from '../common/services/scope.service';

@Module({
  controllers: [MinesController, OfficersController],
  providers: [MinesService, GisService, ScopeService],
  exports: [MinesService, GisService],
})
export class MinesModule {}

