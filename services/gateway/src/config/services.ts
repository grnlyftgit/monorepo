import config from './env';

// ============================================
// Types & Interfaces
// ============================================

export interface ServiceConfig {
  readonly name: string;
  readonly displayName: string;
  readonly url: string;
  readonly proxyPath: string;
  readonly servicePath: string;
  readonly healthPath: string;
  readonly timeout: number;
  readonly retries: number;
  readonly enabled: boolean;
}

export interface ServicesConfig {
  readonly [key: string]: ServiceConfig;
}

// ============================================
// Service Definitions (Single Source of Truth)
// ============================================

export const SERVICE_DEFINITIONS = {
  AUTH: {
    key: 'auth',
    displayName: 'Auth Service',
    proxyPath: '/api/auth',
    servicePath: '/',
    port: 6001,
  },
  USER: {
    key: 'user',
    displayName: 'User Service',
    proxyPath: '/api/user',
    servicePath: '/',
    port: 6002,
  },
  // Add more services here...
} as const;

// Extract service keys for type safety
export type ServiceKey =
  (typeof SERVICE_DEFINITIONS)[keyof typeof SERVICE_DEFINITIONS]['key'];

// ============================================
// Utility Functions
// ============================================

const getProtocol = (): string => {
  return config.NODE_ENV === 'production' ? 'https' : 'http';
};

const buildServiceUrl = (host: string | undefined, port: number): string => {
  const protocol = getProtocol();

  if (host) {
    // If custom host is provided (e.g., from env vars), use it
    return host.startsWith('http') ? host : `${protocol}://${host}`;
  }

  // Default to localhost with port for development
  return `${protocol}://localhost:${port}`;
};


const validateServiceConfig = (config: ServiceConfig): void => {
  const errors: string[] = [];

  if (!config.name?.trim()) {
    errors.push('Service key cannot be empty');
  }

  if (!config.displayName?.trim()) {
    errors.push('Service display name cannot be empty');
  }

  if (!config.url?.match(/^https?:\/\/.+/)) {
    errors.push(`Invalid URL: ${config.url}`);
  }

  if (!config.proxyPath?.startsWith('/')) {
    errors.push('Proxy path must start with /');
  }

  if (config.timeout <= 0) {
    errors.push('Timeout must be positive');
  }

  if (config.retries < 0) {
    errors.push('Retries cannot be negative');
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid configuration for ${config.name}: ${errors.join(', ')}`
    );
  }
};

const createServiceConfig = (
  definition: (typeof SERVICE_DEFINITIONS)[keyof typeof SERVICE_DEFINITIONS],
  envUrl: string | undefined,
  options: Partial<ServiceConfig> = {}
): ServiceConfig => {
  const url = buildServiceUrl(envUrl, definition.port);

  const serviceConfig: ServiceConfig = {
    name: definition.key,
    displayName: definition.displayName,
    url,
    proxyPath: definition.proxyPath,
    servicePath: definition.servicePath,
    healthPath: options.healthPath || '/health',
    timeout: options.timeout || 30000,
    retries: options.retries || 3,
    enabled: options.enabled ?? true,
  };

  validateServiceConfig(serviceConfig);
  return serviceConfig;
};

// ============================================
// Service Configuration
// ============================================

export const servicesConfig: ServicesConfig = {
  [SERVICE_DEFINITIONS.AUTH.key]: createServiceConfig(
    SERVICE_DEFINITIONS.AUTH,
    config.AUTH_SERVICE_URL
  ),
  [SERVICE_DEFINITIONS.USER.key]: createServiceConfig(
    SERVICE_DEFINITIONS.USER,
    config.USER_SERVICE_URL
  ),
} as const;

// ============================================
// Service Access Functions
// ============================================

export const getServiceConfig = (
  serviceName: string
): ServiceConfig | undefined => {
  if (!serviceName?.trim()) {
    console.warn('getServiceConfig called with empty service name');
    return undefined;
  }
  return servicesConfig[serviceName];
};

export const getAllServices = (): readonly ServiceConfig[] => {
  return Object.values(servicesConfig);
};

export const getActiveServices = (): readonly ServiceConfig[] => {
  return Object.values(servicesConfig).filter(
    (service): service is ServiceConfig => service.enabled === true
  );
};

export const getEnabledServiceKeys = (): readonly string[] => {
  return getActiveServices().map((service) => service.name);
};

export const hasService = (serviceName: string): boolean => {
  return serviceName in servicesConfig;
};

export const isServiceEnabled = (serviceName: string): boolean => {
  const service = getServiceConfig(serviceName);
  return service?.enabled ?? false;
};

export const getServiceUrl = (
  serviceName: string,
  path: string = ''
): string | undefined => {
  const service = getServiceConfig(serviceName);
  if (!service) {
    console.warn(`Service not found: ${serviceName}`);
    return undefined;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${service.url}${cleanPath}`;
};

// ============================================
// Service Name Constants (for type safety)
// ============================================

export const ServiceNames = {
  AUTH: SERVICE_DEFINITIONS.AUTH.key,
  USER: SERVICE_DEFINITIONS.USER.key,
} as const;

export type ServiceName = (typeof ServiceNames)[keyof typeof ServiceNames];
