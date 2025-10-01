"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.rootAccessCheck = void 0;
const actions_1 = require("../utils/actions");
const rootAccessCheck = ({ serviceName, port, }) => {
    return (_, res) => {
        return res.json({
            success: true,
            message: `Welcome to ${serviceName} Service!`,
            serviceName,
            port,
            timestamp: new Date().toISOString(),
        });
    };
};
exports.rootAccessCheck = rootAccessCheck;
const healthCheck = ({ port, serviceName, version, }) => {
    return (_, res) => {
        const uptime = (0, actions_1.formatTime)(process.uptime());
        return res.json({
            success: true,
            status: 'healthy',
            serviceName,
            version,
            port,
            uptime,
            timestamp: new Date().toISOString(),
        });
    };
};
exports.healthCheck = healthCheck;
