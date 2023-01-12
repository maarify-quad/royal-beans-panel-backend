import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';
import { OrderType } from '../entities/order.entity';

export class GetOrdersDto {
  @IsNumberString({}, { message: 'Limit metinsel sayı türünde olmalıdır' })
  @IsOptional()
  readonly limit = '1';

  @IsNumberString({}, { message: 'Sayfa metinsel sayı türünde olmalıdır' })
  @IsOptional()
  readonly page = '1';

  @IsIn(['BULK', 'MANUAL'])
  @IsString()
  @IsOptional()
  readonly type?: OrderType;
}
