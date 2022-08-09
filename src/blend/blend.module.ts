import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { ProductModule } from 'src/product/product.module';

// Services
import { BlendService } from './blend.service';

// Entities
import { Blend } from './entities/blend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blend]), ProductModule],
  providers: [BlendService],
  exports: [BlendService],
})
export class BlendModule {}
