"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ override: true });
const config = {
    NODE_ENV: (process.env.NODE_ENV === "production"
        ? "production"
        : "development"),
    PORT: Number(process.env.PORT),
    WEBSITE_URL: process.env.WEBSITE_URL,
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
    USER_SERVICE_URL: process.env.USER_SERVICE_URL,
};
exports.default = config;
