import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoastIngredientModule } from 'src/roast-ingredient/roast-ingredient.module';

// Controllers
import { RoastController } from './roast.controller';

// Services
import { RoastService } from './roast.service';

// Entities
import { Roast } from './entities/roast.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Roast]), RoastIngredientModule],
  controllers: [RoastController],
  providers: [RoastService],
})
export class RoastModule {}
