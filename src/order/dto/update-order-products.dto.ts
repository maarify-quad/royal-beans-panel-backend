import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { CreateOrderProductDto } from 'src/order-product/dto/create-order-product.dto';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';

export class UpdateOrderProductsDto {
  @IsNumber()
  orderNumber: number;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => CreateOrderProductDto)
  orderProducts: OrderProduct[];
}
