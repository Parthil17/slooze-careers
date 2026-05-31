import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePaymentMethodDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardHolder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expiryDate?: string;
}
