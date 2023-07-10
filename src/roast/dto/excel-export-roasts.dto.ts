import { IsDateString, IsOptional } from 'class-validator';

export class ExcelExportRoastsDTO {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
