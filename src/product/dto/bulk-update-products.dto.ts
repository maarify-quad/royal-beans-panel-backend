import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { UpdateProductDto } from './update-product.dto';

export class BulkUpdateProductsDto {
  @ValidateNested({ each: true })
  @Type(() => UpdateProductDto)
  @IsArray()
  products: UpdateProductDto[];
}
