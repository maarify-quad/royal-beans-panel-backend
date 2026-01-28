import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// DTOs
import { CreateFasonOrderProductDto } from '../../order-product/dto/create-fason-order-product.dto';

export class CreateFasonOrderDto {
  userId?: number | null;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsOptional()
  specialNote?: string | null;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => CreateFasonOrderProductDto)
  orderProducts: CreateFasonOrderProductDto[];
}
