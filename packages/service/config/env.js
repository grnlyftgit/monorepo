"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ override: true });
const config = {
    CORS_WHITELISTED_ORIGINS: JSON.parse(process.env.CORS_WHITELISTED_ORIGINS || "[]"),
    CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === "true",
};
exports.default = config;
