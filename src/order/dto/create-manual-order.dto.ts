import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

// Entities
import { OrderProduct } from 'src/order-product/entities/order-product.entity';

// DTOs
import { CreateOrderProductDto } from 'src/order-product/dto/create-order-product.dto';
import { OrderSource } from '../entities/order.entity';

export class CreateManualOrderDto {
  userId?: number | null;

  @IsNumber()
  @IsOptional()
  receiverId?: number | null;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  receiver: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  receiverNeighborhood?: string;

  @IsString()
  @IsOptional()
  receiverAddress?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  receiverCity?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  receiverProvince?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  receiverPhone?: string;

  @IsBoolean()
  isSaveReceiverChecked: boolean;

  @IsEmpty()
  deliveryAddressId?: number;

  @IsString()
  @IsNotEmpty()
  manualInvoiceStatus: string;

  @IsString()
  @IsOptional()
  specialNote?: string;

  @IsString()
  @IsOptional()
  source?: OrderSource = 'dashboard';

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => CreateOrderProductDto)
  orderProducts: OrderProduct[];
}
