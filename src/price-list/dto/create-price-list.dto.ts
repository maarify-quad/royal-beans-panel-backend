import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePriceListDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  cloneDefaultPriceList?: boolean;
}
