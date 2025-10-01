"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const zlib_1 = __importDefault(require("zlib"));
function compressionFilter(req, res) {
    if (req.headers['x-no-compression']) {
        return false;
    }
    return compression_1.default.filter(req, res);
}
const compressionMiddleware = (0, compression_1.default)({
    level: 9, // Max compression level for smallest payloads, CPU intensive but worth it for API speed over network
    memLevel: 9, // Optimize memory usage for better compression
    threshold: 512, // Compress responses larger than 512 bytes for better throughput
    filter: compressionFilter, // Custom filter to skip compression based on request
    chunkSize: 16 * 1024, // Larger chunks reduce processing stalls and improve streaming
    flush: zlib_1.default.constants.Z_SYNC_FLUSH, // Ensure timely delivery of compressed data
});
exports.default = compressionMiddleware;
