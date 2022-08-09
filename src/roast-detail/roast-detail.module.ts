import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { RoastDetail } from './entities/roast-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoastDetail])],
})
export class RoastDetailModule {}
