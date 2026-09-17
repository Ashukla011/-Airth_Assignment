import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { JobStatus } from '../job-status.enum';

export class UpdateJobStatusDto {
  @ApiProperty({ enum: JobStatus, example: JobStatus.RUNNING })
  @IsEnum(JobStatus)
  status!: JobStatus;

  @ApiProperty({
    enum: JobStatus,
    example: JobStatus.PENDING,
    description: 'Status last seen by the client; used to reject stale updates',
  })
  @IsEnum(JobStatus)
  expectedStatus!: JobStatus;
}
