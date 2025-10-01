"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceNames = exports.getServiceUrl = exports.hasService = exports.getActiveServices = exports.getAllServices = exports.getServiceConfig = exports.servicesConfig = void 0;
const env_1 = __importDefault(require("./env"));
const validateServiceConfig = (config) => {
    if (!config.name || config.name.trim() === "") {
        throw new Error("Service name cannot be empty");
    }
    if (!config.url || !config.url.match(/^https?:\/\/.+/)) {
        throw new Error(`Invalid URL for service ${config.name}`);
    }
    if (config.timeout <= 0) {
        throw new Error(`Timeout must be positive for service ${config.name}`);
    }
    if (config.retries < 0) {
        throw new Error(`Retries cannot be negative for service ${config.name}`);
    }
};
const createServiceConfig = (name, envUrl, defaultUrl, options = {}) => {
    const config = {
        name,
        url: envUrl || defaultUrl,
        healthPath: "/health",
        timeout: 5000,
        retries: 3,
        enabled: true,
        ...options,
    };
    validateServiceConfig(config);
    return config;
};
exports.servicesConfig = {
    auth: createServiceConfig("Auth Service", env_1.default.AUTH_SERVICE_URL, "http://localhost:6001"),
    user: createServiceConfig("User Service", env_1.default.USER_SERVICE_URL, "http://localhost:6002"),
};
const getServiceConfig = (serviceName) => {
    if (!serviceName || serviceName.trim() === "") {
        console.warn("getServiceConfig called with empty service name");
        return undefined;
    }
    return exports.servicesConfig[serviceName];
};
exports.getServiceConfig = getServiceConfig;
const getAllServices = () => {
    return Object.values(exports.servicesConfig);
};
exports.getAllServices = getAllServices;
const getActiveServices = () => {
    return Object.values(exports.servicesConfig).filter((service) => service !== undefined && service.enabled !== false);
};
exports.getActiveServices = getActiveServices;
const hasService = (serviceName) => {
    return serviceName in exports.servicesConfig;
};
exports.hasService = hasService;
const getServiceUrl = (serviceName, path = "") => {
    const config = (0, exports.getServiceConfig)(serviceName);
    if (!config)
        return undefined;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${config.url}${cleanPath}`;
};
exports.getServiceUrl = getServiceUrl;
exports.ServiceNames = {
    AUTH: "auth",
};
