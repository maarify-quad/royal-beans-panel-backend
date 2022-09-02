import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { PriceListProduct } from '../entities/price-list-product.entity';

export class UpdatePriceListProductDto extends PartialType(
  OmitType(PriceListProduct, ['id']),
) {
  @IsNumber()
  id: number;
}
