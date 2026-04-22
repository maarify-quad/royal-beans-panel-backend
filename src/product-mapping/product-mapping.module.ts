import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

// Controllers
import { ProductMappingController } from './product-mapping.controller';

// Services
import { ProductMappingService } from './product-mapping.service';

@Module({
  imports: [HttpModule],
  controllers: [ProductMappingController],
  providers: [ProductMappingService],
  exports: [ProductMappingService],
})
export class ProductMappingModule {}
