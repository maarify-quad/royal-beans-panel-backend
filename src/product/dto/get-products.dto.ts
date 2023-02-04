import { IsNumberString, IsOptional } from 'class-validator';

export class GetProductsDto {
  @IsNumberString()
  @IsOptional()
  page?: string;

  @IsNumberString()
  @IsOptional()
  limit?: string;
}
