import { IsNumber } from 'class-validator';

export class UpdateOrderProductDTO {
  @IsNumber()
  quantity: number;
}
