import { IsBoolean } from 'class-validator';

export class ExcelExportProductsDTO {
  @IsBoolean()
  HM: boolean;

  @IsBoolean()
  YM: boolean;

  @IsBoolean()
  FN: boolean;

  @IsBoolean()
  Other: boolean;
}
