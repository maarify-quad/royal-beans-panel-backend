import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';
import { OrderType } from '../entities/order.entity';

export class GetOrdersDto {
  @IsNumberString()
  @IsOptional()
  page?: string;

  @IsNumberString()
  @IsOptional()
  limit?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @IsIn(['BULK', 'MANUAL'])
  @IsString()
  @IsOptional()
  readonly type?: OrderType;
}
