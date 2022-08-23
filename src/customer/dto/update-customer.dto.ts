import { PartialType } from '@nestjs/mapped-types';

// DTOs
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  id: string;
}
