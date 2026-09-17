import { JobStatus } from '../job-status.enum';
export declare class UpdateJobStatusDto {
    status: JobStatus;
    expectedStatus: JobStatus;
}
