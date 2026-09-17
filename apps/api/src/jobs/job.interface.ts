import { JobStatus } from './job-status.enum';

export interface Job {
  id: string;
  title: string;
  type: string;
  status: JobStatus;
  createdAt: Date;
}

export interface JobRow {
  id: string;
  title: string;
  type: string;
  status: JobStatus;
  created_at: Date;
}
