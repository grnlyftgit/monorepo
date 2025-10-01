"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCors = void 0;
const cors_1 = __importDefault(require("cors"));
const env_1 = __importDefault(require("./env"));
const createCors = ({ NODE_ENV }) => {
    const corsOptions = {
        origin(origin, callback) {
            if (NODE_ENV === "development" ||
                !origin ||
                env_1.default.CORS_WHITELISTED_ORIGINS.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`CORS Error : ${origin} is not allowed`), false);
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: env_1.default.CORS_CREDENTIALS,
    };
    return (0, cors_1.default)(corsOptions);
};
exports.createCors = createCors;
