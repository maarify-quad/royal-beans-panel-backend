import { IsNumberString, IsOptional } from 'class-validator';

export class GetProductsDto {
  @IsNumberString()
  @IsOptional()
  page = '1';

  @IsNumberString()
  @IsOptional()
  limit = '25';
}
