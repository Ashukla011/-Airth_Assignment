import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { allowedTransitions } from './job-status.enum';
import { JobsRepository } from './jobs.repository';

@Injectable()
export class JobsService {
  constructor(private readonly jobsRepository: JobsRepository) {}

  create(input: CreateJobDto) {
    return this.jobsRepository.create(input);
  }

  findAll() {
    return this.jobsRepository.findAll();
  }

  async updateStatus(id: string, input: UpdateJobStatusDto) {
    if (!allowedTransitions[input.expectedStatus].includes(input.status)) {
      throw new BadRequestException(
        `Invalid transition from ${input.expectedStatus} to ${input.status}`,
      );
    }

    const updatedJob = await this.jobsRepository.updateStatusAtomically(
      id,
      input.expectedStatus,
      input.status,
    );

    if (updatedJob) {
      return updatedJob;
    }

    const currentJob = await this.jobsRepository.findById(id);
    if (!currentJob) {
      throw new NotFoundException(`Job ${id} was not found`);
    }

    throw new ConflictException({
      message:
        'Job status changed since it was last loaded. Refresh and retry.',
      currentStatus: currentJob.status,
    });
  }

  async delete(id: string) {
    const deleted = await this.jobsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Job ${id} was not found`);
    }
  }
}
