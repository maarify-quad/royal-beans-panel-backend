import { IsNumberString } from 'class-validator';

export class DeleteOrderProductDTO {
  @IsNumberString()
  id: string;
}
