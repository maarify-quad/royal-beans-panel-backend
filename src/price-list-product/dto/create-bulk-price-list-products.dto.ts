import { IsNumberString } from 'class-validator';

export class CreateBulkPriceListProductsDto {
  @IsNumberString()
  priceListId: string;
}
