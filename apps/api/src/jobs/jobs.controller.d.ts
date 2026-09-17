import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JobsService } from './jobs.service';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    create(input: CreateJobDto): Promise<import("./job.interface").Job>;
    findAll(): Promise<import("./job.interface").Job[]>;
    updateStatus(id: string, input: UpdateJobStatusDto): Promise<import("./job.interface").Job>;
    delete(id: string): Promise<void>;
}
