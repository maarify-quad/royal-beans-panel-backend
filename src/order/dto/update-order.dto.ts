import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @IsNumber()
  orderNumber: number;

  @IsString()
  @IsOptional()
  deliveryType?: string;

  @IsString()
  @IsOptional()
  cargoTrackNo?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
