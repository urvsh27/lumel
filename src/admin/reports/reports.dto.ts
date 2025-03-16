import { IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class TypeWiseDataDto {
  @IsNotEmpty()
  type: number;

  @IsOptional()
  @IsDateString()
  start_date: Date;

  @IsOptional()
  @IsDateString()
  end_date: Date;
}
