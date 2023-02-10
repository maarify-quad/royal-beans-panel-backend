import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetDeliveriesDto {
  @IsString()
  @IsOptional()
  withDeleted?: string;

  @IsNumberString({}, { message: 'Limit metinsel sayı türünde olmalıdır' })
  @IsOptional()
  limit?: string;

  @IsNumberString({}, { message: 'Sayfa metinsel sayı türünde olmalıdır' })
  @IsOptional()
  page?: string;
}
