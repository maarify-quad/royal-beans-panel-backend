import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDeliveryAddressDto {
  @IsString()
  customerId: string;

  @MaxLength(255)
  @IsString()
  title: string;

  @MaxLength(255)
  @IsString()
  receiverName: string;

  @MaxLength(255)
  @IsString()
  receiverAddress: string;

  @MaxLength(255)
  @IsString()
  receiverPhone: string;

  @MaxLength(255)
  @IsString()
  receiverProvince: string;

  @MaxLength(255)
  @IsString()
  receiverCity: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
