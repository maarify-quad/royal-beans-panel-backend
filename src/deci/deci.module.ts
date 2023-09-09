import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { DeciController } from './deci.controller';

// Services
import { DeciService } from './deci.service';

// Entities
import { Deci } from './entities/deci.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Deci])],
  controllers: [DeciController],
  providers: [DeciService],
  exports: [DeciService],
})
export class DeciModule {}
