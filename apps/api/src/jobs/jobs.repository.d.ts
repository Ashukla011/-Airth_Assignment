import { Pool } from 'pg';
import { CreateJobDto } from './dto/create-job.dto';
import { JobStatus } from './job-status.enum';
import { Job } from './job.interface';
export declare class JobsRepository {
    private readonly pool;
    constructor(pool: Pool);
    create(input: CreateJobDto): Promise<Job>;
    findAll(): Promise<Job[]>;
    findById(id: string): Promise<Job | null>;
    updateStatusAtomically(id: string, expectedStatus: JobStatus, nextStatus: JobStatus): Promise<Job | null>;
    delete(id: string): Promise<boolean>;
    private mapRow;
}
