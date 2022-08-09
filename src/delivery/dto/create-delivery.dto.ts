import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

// Entities
import { DeliveryDetail } from 'src/delivery-detail/entities/delivery-detail.entity';

// DTOs
import { CreateDeliveryDetailDto } from 'src/delivery-detail/dto/create-delivery-detail.dto';

export class CreateDeliveryDto {
  @IsDateString(
    {},
    {
      message:
        'Sevkiyat tarihi ISO8601 formatında metinsel bir tarih değeri olmalıdır',
    },
  )
  date: Date;

  @IsNotEmpty({ message: "Tedarikçi Id'si gereklidir" })
  @IsString({ message: 'Geçersiz tedarikçi id' })
  supplierId: string;

  @IsArray({ message: 'Sevkiyat detayları dizi türünde bir değer olmalıdır' })
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'Sevkiyat için en az bir ürün gereklidir' })
  @Type(() => CreateDeliveryDetailDto)
  deliveryDetails: DeliveryDetail[];
}
