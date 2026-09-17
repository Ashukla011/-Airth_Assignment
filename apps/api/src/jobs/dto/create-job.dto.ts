import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ example: 'Generate monthly report', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'report', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type!: string;
}
