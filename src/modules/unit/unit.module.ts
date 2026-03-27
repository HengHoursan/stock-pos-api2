import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from './entity/unit.entity';
import { UnitRepository } from './repository/unit.repository';
import { UnitService } from './service/unit.service';
import { UnitController } from './controller/unit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  providers: [UnitRepository, UnitService],
  controllers: [UnitController],
  exports: [UnitService],
})
export class UnitModule {}
