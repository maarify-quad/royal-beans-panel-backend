import { IsNumber } from 'class-validator';

export class CreateDeciDTO {
  @IsNumber()
  value: number;

  @IsNumber()
  price: number;
}
