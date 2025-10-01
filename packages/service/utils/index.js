"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFileName = void 0;
exports.createApiResponse = createApiResponse;
exports.createSuccessResponse = createSuccessResponse;
exports.createErrorResponse = createErrorResponse;
exports.createServiceError = createServiceError;
exports.sanitizeInput = sanitizeInput;
const types_1 = require("../types");
const crypto_1 = __importDefault(require("crypto"));
// Create a standardized API response
function createApiResponse(success, data, message, error) {
    return {
        success,
        data,
        message,
        error,
    };
}
function createSuccessResponse(data, message) {
    return createApiResponse(true, data, message);
}
function createErrorResponse(error) {
    return createApiResponse(false, undefined, undefined, error);
}
function createServiceError(message, statusCode = 500, code, details) {
    return new types_1.ServiceError(message, statusCode, code, details);
}
// Sanitize user input data to prevent XSS and other attacks
function sanitizeInput(input) {
    return input
        .replace(/[<>]/g, "") // remove < and > characters
        .trim(); // trim whitespace
}
const generateFileName = (bytes = 16) => crypto_1.default.randomBytes(bytes).toString("hex");
exports.generateFileName = generateFileName;
