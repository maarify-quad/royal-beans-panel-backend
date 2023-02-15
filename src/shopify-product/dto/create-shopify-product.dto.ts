import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateShopifyProductDto {
  @IsNumber()
  productId: number;

  @MaxLength(255)
  @IsString()
  productTitle: string;

  @IsNumber()
  variantId: number;

  @MaxLength(255)
  @IsString()
  variantTitle: string;
}
