import { IsNumberString, IsOptional } from 'class-validator';

export class GetDeliveriesDto {
  @IsNumberString({}, { message: 'Limit metinsel sayı türünde olmalıdır' })
  @IsOptional()
  limit?: string;

  @IsNumberString({}, { message: 'Sayfa metinsel sayı türünde olmalıdır' })
  @IsOptional()
  page?: string;
}
