import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetProductsDto {
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

  @IsString()
  @IsOptional()
  search?: string;
}
