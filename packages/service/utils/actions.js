"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleServerShutdown = exports.formatTime = void 0;
const index_1 = require("./index");
const logger_1 = require("../lib/logger");
const logger = (0, logger_1.createLogger)("ServiceActions");
const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
};
exports.formatTime = formatTime;
const handleServerShutdown = async () => {
    try {
        // await disconnectdb();
        logger.info('SERVER SHUTDOWN');
        process.exit(0);
    }
    catch (error) {
        (0, index_1.createErrorResponse)("Error during server shutdown");
    }
};
exports.handleServerShutdown = handleServerShutdown;
