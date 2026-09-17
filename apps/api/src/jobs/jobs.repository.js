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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsRepository = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const database_constants_1 = require("../database/database.constants");
let JobsRepository = class JobsRepository {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async create(input) {
        const result = await this.pool.query(`INSERT INTO jobs (title, type)
       VALUES ($1, $2)
       RETURNING id, title, type, status, created_at`, [input.title.trim(), input.type.trim()]);
        return this.mapRow(result.rows[0]);
    }
    async findAll() {
        const result = await this.pool.query(`SELECT id, title, type, status, created_at
       FROM jobs
       ORDER BY created_at DESC`);
        return result.rows.map((row) => this.mapRow(row));
    }
    async findById(id) {
        const result = await this.pool.query(`SELECT id, title, type, status, created_at
       FROM jobs
       WHERE id = $1`, [id]);
        return result.rows[0] ? this.mapRow(result.rows[0]) : null;
    }
    async updateStatusAtomically(id, expectedStatus, nextStatus) {
        const result = await this.pool.query(`UPDATE jobs
       SET status = $1
       WHERE id = $2 AND status = $3
       RETURNING id, title, type, status, created_at`, [nextStatus, id, expectedStatus]);
        return result.rows[0] ? this.mapRow(result.rows[0]) : null;
    }
    async delete(id) {
        const result = await this.pool.query('DELETE FROM jobs WHERE id = $1', [
            id,
        ]);
        return (result.rowCount ?? 0) > 0;
    }
    mapRow(row) {
        return {
            id: row.id,
            title: row.title,
            type: row.type,
            status: row.status,
            createdAt: row.created_at,
        };
    }
};
exports.JobsRepository = JobsRepository;
exports.JobsRepository = JobsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_constants_1.DATABASE_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], JobsRepository);
//# sourceMappingURL=jobs.repository.js.map