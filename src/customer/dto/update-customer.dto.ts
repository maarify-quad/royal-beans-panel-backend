import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';

// DTOs
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  id: string;

  @IsString({ message: 'İsim metin olmalıdır' })
  @IsOptional()
  readonly name?: string;
}
