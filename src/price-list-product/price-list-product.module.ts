import { Module } from '@nestjs/common';

// Modules
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ProductModule } from 'src/product/product.module';

// Controllers
import { PriceListProductController } from './price-list-product.controller';

// Services
import { PriceListProductService } from './price-list-product.service';

// Entities
import { PriceListProduct } from './entities/price-list-product.entity';
import { ExcelModule } from 'src/excel/excel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceListProduct]),
    MulterModule.register({
      fileFilter(req, file, callback) {
        const allowedMimes = [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        const maxSize = 1024 * 1024 * 5;

        if (!allowedMimes.includes(file.mimetype)) {
          return callback(new Error('Geçersiz excel dosyası'), false);
        }

        if (file.size > maxSize) {
          return callback(
            new Error('Dosya boyutu 5MB dan büyük olamaz'),
            false,
          );
        }

        return callback(null, true);
      },
    }),
    ProductModule,
    ExcelModule,
  ],
  controllers: [PriceListProductController],
  providers: [PriceListProductService],
  exports: [PriceListProductService],
})
export class PriceListProductModule {}
