import { IsNumber } from 'class-validator';

export class UpdateDeciDTO {
  @IsNumber()
  price: number;
}
