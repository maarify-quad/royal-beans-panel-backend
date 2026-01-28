import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';
import { OrderType } from '../entities/order.entity';

export class GetOrdersDto {
  @IsNumberString()
  @IsOptional()
  readonly page?: string;

  @IsNumberString()
  @IsOptional()
  readonly limit?: string;

  @IsString()
  @IsOptional()
  readonly sortBy?: string;

  @IsString()
  @IsOptional()
  readonly search?: string;

  @IsString()
  @IsOptional()
  readonly sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @IsIn(['BULK', 'MANUAL', 'FASON'])
  @IsString()
  @IsOptional()
  readonly type?: OrderType;
}
