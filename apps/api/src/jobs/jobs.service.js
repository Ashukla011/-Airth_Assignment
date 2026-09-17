"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const job_status_enum_1 = require("./job-status.enum");
const jobs_repository_1 = require("./jobs.repository");
let JobsService = class JobsService {
    jobsRepository;
    constructor(jobsRepository) {
        this.jobsRepository = jobsRepository;
    }
    create(input) {
        return this.jobsRepository.create(input);
    }
    findAll() {
        return this.jobsRepository.findAll();
    }
    async updateStatus(id, input) {
        if (!job_status_enum_1.allowedTransitions[input.expectedStatus].includes(input.status)) {
            throw new common_1.BadRequestException(`Invalid transition from ${input.expectedStatus} to ${input.status}`);
        }
        const updatedJob = await this.jobsRepository.updateStatusAtomically(id, input.expectedStatus, input.status);
        if (updatedJob) {
            return updatedJob;
        }
        const currentJob = await this.jobsRepository.findById(id);
        if (!currentJob) {
            throw new common_1.NotFoundException(`Job ${id} was not found`);
        }
        throw new common_1.ConflictException({
            message: 'Job status changed since it was last loaded. Refresh and retry.',
            currentStatus: currentJob.status,
        });
    }
    async delete(id) {
        const deleted = await this.jobsRepository.delete(id);
        if (!deleted) {
            throw new common_1.NotFoundException(`Job ${id} was not found`);
        }
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jobs_repository_1.JobsRepository])
], JobsService);
//# sourceMappingURL=jobs.service.js.map