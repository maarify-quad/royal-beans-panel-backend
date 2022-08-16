import { IsNumberString, IsOptional } from 'class-validator';

export class GetRoastsDto {
  @IsNumberString({}, { message: 'Limit metinsel sayı türünde olmalıdır' })
  @IsOptional()
  limit = '50';

  @IsNumberString({}, { message: 'Sayfa metinsel sayı türünde olmalıdır' })
  @IsOptional()
  page = '1';
}
