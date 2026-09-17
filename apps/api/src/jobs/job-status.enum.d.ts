export declare enum JobStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare const allowedTransitions: Record<JobStatus, readonly JobStatus[]>;
