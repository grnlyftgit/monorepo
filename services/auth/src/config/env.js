"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ override: true });
const authEnvConfig = {
    SERVICE_NAME: process.env.SERVICE_NAME,
    NODE_ENV: (process.env.NODE_ENV === 'production'
        ? 'production'
        : 'development'),
    PORT: Number(process.env.PORT),
    WEBSITE_URL: process.env.WEBSITE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
};
exports.default = authEnvConfig;
