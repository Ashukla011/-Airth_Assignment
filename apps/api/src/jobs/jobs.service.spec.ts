import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JobStatus } from './job-status.enum';
import { Job } from './job.interface';
import { JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';

describe('JobsService', () => {
  let service: JobsService;
  let repository: jest.Mocked<JobsRepository>;
  const pendingJob: Job = {
    id: '49d9d95e-f72b-4b1a-bc67-b14392dab676',
    title: 'Generate report',
    type: 'report',
    status: JobStatus.PENDING,
    createdAt: new Date('2026-09-16T00:00:00.000Z'),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStatusAtomically: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<JobsRepository>;
    service = new JobsService(repository);
  });

  it('moves a pending job to running', async () => {
    const runningJob = { ...pendingJob, status: JobStatus.RUNNING };
    repository.updateStatusAtomically.mockResolvedValue(runningJob);
    await expect(
      service.updateStatus(pendingJob.id, {
        expectedStatus: JobStatus.PENDING,
        status: JobStatus.RUNNING,
      }),
    ).resolves.toEqual(runningJob);
  });

  it('rejects an invalid pending to completed transition', async () => {
    await expect(
      service.updateStatus(pendingJob.id, {
        expectedStatus: JobStatus.PENDING,
        status: JobStatus.COMPLETED,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    // Accessing the Jest mock directly is intentional in this assertion.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.updateStatusAtomically).not.toHaveBeenCalled();
  });

  it('rejects a stale concurrent update with conflict', async () => {
    repository.updateStatusAtomically.mockResolvedValue(null);
    repository.findById.mockResolvedValue({
      ...pendingJob,
      status: JobStatus.RUNNING,
    });
    await expect(
      service.updateStatus(pendingJob.id, {
        expectedStatus: JobStatus.PENDING,
        status: JobStatus.RUNNING,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns not found when the job does not exist', async () => {
    repository.updateStatusAtomically.mockResolvedValue(null);
    repository.findById.mockResolvedValue(null);
    await expect(
      service.updateStatus(pendingJob.id, {
        expectedStatus: JobStatus.PENDING,
        status: JobStatus.RUNNING,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
