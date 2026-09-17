"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowedTransitions = exports.JobStatus = void 0;
var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "pending";
    JobStatus["RUNNING"] = "running";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
exports.allowedTransitions = {
    [JobStatus.PENDING]: [JobStatus.RUNNING],
    [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
    [JobStatus.COMPLETED]: [],
    [JobStatus.FAILED]: [],
};
//# sourceMappingURL=job-status.enum.js.map