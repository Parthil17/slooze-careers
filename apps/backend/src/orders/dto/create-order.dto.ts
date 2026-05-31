import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Country } from '@slooze/shared';

export class CreateOrderDto {
  @ApiProperty({ enum: Country, example: Country.INDIA })
  @IsEnum(Country)
  country!: Country;
}
