import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CalculateFinanceDTO {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @IsOptional()
  totalConstantExpense?: number = 0;

  @IsNumber()
  @IsOptional()
  marketingExpense?: number = 0;

  @IsNumber()
  @IsOptional()
  generalCost?: number = 0;

  // @IsNumber()
  // cargoCost: number;

  // @IsNumber()
  // bulkOrderCargoCost: number;

  // @IsNumber()
  // manualOrderCargoCost: number;

  // @IsNumber()
  // shopifyOrderCargoCost: number;
}
