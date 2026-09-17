import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JobsRepository } from './jobs.repository';
export declare class JobsService {
    private readonly jobsRepository;
    constructor(jobsRepository: JobsRepository);
    create(input: CreateJobDto): Promise<import("./job.interface").Job>;
    findAll(): Promise<import("./job.interface").Job[]>;
    updateStatus(id: string, input: UpdateJobStatusDto): Promise<import("./job.interface").Job>;
    delete(id: string): Promise<void>;
}
