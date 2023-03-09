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

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsNumber()
  productId: number;

  @IsString()
  @IsOptional()
  customerId: string | null;

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
