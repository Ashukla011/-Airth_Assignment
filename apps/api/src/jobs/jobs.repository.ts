import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.constants';
import { CreateJobDto } from './dto/create-job.dto';
import { JobStatus } from './job-status.enum';
import { Job, JobRow } from './job.interface';

@Injectable()
export class JobsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async create(input: CreateJobDto): Promise<Job> {
    const result = await this.pool.query<JobRow>(
      `INSERT INTO jobs (title, type)
       VALUES ($1, $2)
       RETURNING id, title, type, status, created_at`,
      [input.title.trim(), input.type.trim()],
    );

    return this.mapRow(result.rows[0]);
  }

  async findAll(): Promise<Job[]> {
    const result = await this.pool.query<JobRow>(
      `SELECT id, title, type, status, created_at
       FROM jobs
       ORDER BY created_at DESC`,
    );

    return result.rows.map((row) => this.mapRow(row));
  }

  async findById(id: string): Promise<Job | null> {
    const result = await this.pool.query<JobRow>(
      `SELECT id, title, type, status, created_at
       FROM jobs
       WHERE id = $1`,
      [id],
    );

    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async updateStatusAtomically(
    id: string,
    expectedStatus: JobStatus,
    nextStatus: JobStatus,
  ): Promise<Job | null> {
    const result = await this.pool.query<JobRow>(
      `UPDATE jobs
       SET status = $1
       WHERE id = $2 AND status = $3
       RETURNING id, title, type, status, created_at`,
      [nextStatus, id, expectedStatus],
    );

    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM jobs WHERE id = $1', [
      id,
    ]);
    return (result.rowCount ?? 0) > 0;
  }

  private mapRow(row: JobRow): Job {
    return {
      id: row.id,
      title: row.title,
      type: row.type,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}
