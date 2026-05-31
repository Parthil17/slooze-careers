import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  orderId!: string;

  @ApiProperty()
  @IsString()
  paymentMethodId!: string;
}
