"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const database_constants_1 = require("./database.constants");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: database_constants_1.DATABASE_POOL,
                useFactory: () => {
                    if (!process.env.DATABASE_URL) {
                        throw new Error('DATABASE_URL environment variable is required');
                    }
                    const useSsl = process.env.DATABASE_SSL === 'true' ||
                        process.env.NODE_ENV === 'production';
                    return new pg_1.Pool({
                        connectionString: process.env.DATABASE_URL,
                        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
                        max: 10,
                    });
                },
            },
        ],
        exports: [database_constants_1.DATABASE_POOL],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map