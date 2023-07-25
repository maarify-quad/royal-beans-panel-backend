import { IsNumber, Max, Min } from 'class-validator';

export class CalculateFinanceDTO {
  @Max(12)
  @Min(1)
  @IsNumber()
  month: number;

  @IsNumber()
  totalConstantExpense: number;

  @IsNumber()
  marketingExpense: number;

  @IsNumber()
  generalCost: number;

  @IsNumber()
  cargoCost: number;

  @IsNumber()
  bulkOrderCargoCost: number;

  @IsNumber()
  manualOrderCargoCost: number;

  @IsNumber()
  shopifyOrderCargoCost: number;
}
