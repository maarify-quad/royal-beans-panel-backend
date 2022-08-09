import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { BlendModule } from 'src/blend/blend.module';

// Controllers
import { RoastController } from './roast.controller';

// Services
import { RoastService } from './roast.service';

// Entities
import { Roast } from './entities/roast.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Roast]), BlendModule],
  controllers: [RoastController],
  providers: [RoastService],
})
export class RoastModule {}
