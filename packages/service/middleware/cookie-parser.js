"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
function cookieParserMiddleware({ secret, } = {}) {
    if (secret) {
        return (0, cookie_parser_1.default)(secret); // Use secret for signed cookies if provided
    }
    return (0, cookie_parser_1.default)();
}
exports.default = cookieParserMiddleware;
