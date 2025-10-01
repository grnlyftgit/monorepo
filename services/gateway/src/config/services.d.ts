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
export declare const servicesConfig: ServicesConfig;
export declare const getServiceConfig: (serviceName: string) => ServiceConfig | undefined;
export declare const getAllServices: () => readonly ServiceConfig[];
export declare const getActiveServices: () => readonly ServiceConfig[];
export declare const hasService: (serviceName: string) => boolean;
export declare const getServiceUrl: (serviceName: string, path?: string) => string | undefined;
export declare const ServiceNames: {
    readonly AUTH: "auth";
};
export type ServiceName = (typeof ServiceNames)[keyof typeof ServiceNames];
//# sourceMappingURL=services.d.ts.map