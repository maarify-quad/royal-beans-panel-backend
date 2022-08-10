import { Module } from '@nestjs/common';

// Modules
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ExcelModule } from 'src/excel/excel.module';

// Controller
import { ProductController } from './product.controller';

// Services
import { ProductService } from './product.service';

// Entities
import { Product } from './entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
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
    ExcelModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
