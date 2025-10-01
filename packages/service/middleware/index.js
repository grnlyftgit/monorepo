"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const types_1 = require("../types");
const utils_1 = require("../utils");
function errorHandler(error, req, res, next) {
    (0, types_1.logError)(error, {
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query,
    });
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    res.status(statusCode).json((0, utils_1.createErrorResponse)(message));
    next();
}
