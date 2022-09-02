import { PartialType } from '@nestjs/mapped-types';
import { PriceListProduct } from '../entities/price-list-product.entity';

export class UpdatePriceListProductDto extends PartialType(PriceListProduct) {}
