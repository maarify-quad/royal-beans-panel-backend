import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ExitType } from '../entities/exit.entity';

export class CreateExitDTO {
  @IsDateString()
  date: string;

  @IsNumber()
  @IsOptional()
  orderId: number | null;

  @IsNumber()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  storageAmountAfterExit: number;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  type: ExitType;
}
