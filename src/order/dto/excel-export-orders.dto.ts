import { IsDateString, IsOptional } from 'class-validator';

export class ExcelExportOrdersDTO {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
