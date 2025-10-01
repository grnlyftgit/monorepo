"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const drizzle_1 = require("better-auth/adapters/drizzle");
const src_1 = __importDefault(require("@repo/db-neon/src"));
const env_1 = __importDefault(require("../config/env"));
const plugins_1 = require("better-auth/plugins");
const metadata_1 = require("@repo/seo/metadata");
exports.auth = (0, better_auth_1.betterAuth)({
    appName: metadata_1.siteData.name,
    baseURL: env_1.default.BETTER_AUTH_URL,
    telemetry: { enabled: false },
    basePath: '/v1',
    secret: env_1.default.BETTER_AUTH_SECRET,
    database: (0, drizzle_1.drizzleAdapter)(src_1.default, {
        provider: 'pg',
    }),
    plugins: [
        (0, plugins_1.openAPI)({
            path: "/docs"
        }),
    ]
});
