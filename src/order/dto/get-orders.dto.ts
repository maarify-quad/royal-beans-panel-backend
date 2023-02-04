import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';
import { OrderType } from '../entities/order.entity';

export class GetOrdersDto {
  @IsNumberString({}, { message: 'Limit metinsel sayı türünde olmalıdır' })
  @IsOptional()
  readonly limit?: string;

  @IsNumberString({}, { message: 'Sayfa metinsel sayı türünde olmalıdır' })
  @IsOptional()
  readonly page?: string;

  @IsIn(['BULK', 'MANUAL'])
  @IsString()
  @IsOptional()
  readonly type?: OrderType;
}
