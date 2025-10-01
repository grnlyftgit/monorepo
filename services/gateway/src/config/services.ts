import config from "./env";

export interface ServiceConfig {
  readonly name: string;
  readonly url: string;
  readonly healthPath: string;
  readonly timeout: number;
  readonly retries: number;
  readonly enabled?: boolean;
}

export interface ServicesConfig {
  readonly [key: string]: ServiceConfig;
}

const validateServiceConfig = (config: ServiceConfig): void => {
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

const createServiceConfig = (
  name: string,
  envUrl: string | undefined,
  defaultUrl: string,
  options: Partial<ServiceConfig> = {}
): ServiceConfig => {
  const config: ServiceConfig = {
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

export const servicesConfig: ServicesConfig = {
  auth: createServiceConfig(
    "Auth Service",
    config.AUTH_SERVICE_URL,
    "http://localhost:6001"
  ),
  user: createServiceConfig(
    "User Service",
    config.USER_SERVICE_URL,
    "http://localhost:6002"
  ),
} as const;

export const getServiceConfig = (
  serviceName: string
): ServiceConfig | undefined => {
  if (!serviceName || serviceName.trim() === "") {
    console.warn("getServiceConfig called with empty service name");
    return undefined;
  }
  return servicesConfig[serviceName];
};

export const getAllServices = (): readonly ServiceConfig[] => {
  return Object.values(servicesConfig);
};

export const getActiveServices = (): readonly ServiceConfig[] => {
  return Object.values(servicesConfig).filter(
    (service): service is ServiceConfig =>
      service !== undefined && service.enabled !== false
  );
};

export const hasService = (serviceName: string): boolean => {
  return serviceName in servicesConfig;
};

export const getServiceUrl = (
  serviceName: string,
  path: string = ""
): string | undefined => {
  const config = getServiceConfig(serviceName);
  if (!config) return undefined;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${config.url}${cleanPath}`;
};

export const ServiceNames = {
  AUTH: "auth",
} as const;

export type ServiceName = (typeof ServiceNames)[keyof typeof ServiceNames];
