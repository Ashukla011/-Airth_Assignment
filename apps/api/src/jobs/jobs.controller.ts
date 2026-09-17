import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JobsService } from './jobs.service';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a pending job' })
  @ApiCreatedResponse({ description: 'The job was created' })
  create(@Body() input: CreateJobDto) {
    return this.jobsService.create(input);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs, newest first' })
  @ApiOkResponse({ description: 'All jobs' })
  findAll() {
    return this.jobsService.findAll();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Move a job to its next valid status' })
  @ApiOkResponse({ description: 'The job status was updated' })
  @ApiConflictResponse({ description: 'The submitted status was stale' })
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateJobStatusDto,
  ) {
    return this.jobsService.updateStatus(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a job' })
  @ApiNoContentResponse({ description: 'The job was deleted' })
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.jobsService.delete(id);
  }
}
