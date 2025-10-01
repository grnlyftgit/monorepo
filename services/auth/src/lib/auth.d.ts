export declare const auth: import("better-auth").Auth<{
    appName: string;
    baseURL: string;
    telemetry: {
        enabled: false;
    };
    basePath: string;
    secret: string;
    database: (options: import("better-auth").BetterAuthOptions) => import("better-auth").Adapter;
    plugins: [{
        id: "open-api";
        endpoints: {
            generateOpenAPISchema: {
                <AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(inputCtx_0?: ({
                    body?: undefined;
                } & {
                    method?: "GET" | undefined;
                } & {
                    query?: Record<string, any> | undefined;
                } & {
                    params?: Record<string, any>;
                } & {
                    request?: Request;
                } & {
                    headers?: HeadersInit;
                } & {
                    asResponse?: boolean;
                    returnHeaders?: boolean;
                    use?: import("better-auth").Middleware[];
                    path?: string;
                } & {
                    asResponse?: AsResponse | undefined;
                    returnHeaders?: ReturnHeaders | undefined;
                }) | undefined): Promise<[AsResponse] extends [true] ? Response : [ReturnHeaders] extends [true] ? {
                    headers: Headers;
                    response: {
                        openapi: string;
                        info: {
                            title: string;
                            description: string;
                            version: string;
                        };
                        components: {
                            securitySchemes: {
                                apiKeyCookie: {
                                    type: string;
                                    in: string;
                                    name: string;
                                    description: string;
                                };
                                bearerAuth: {
                                    type: string;
                                    scheme: string;
                                    description: string;
                                };
                            };
                            schemas: {
                                [x: string]: {
                                    type: "object";
                                    properties: Record<string, {
                                        type: packages_core_dist_db.DBFieldType;
                                        default?: packages_core_dist_db.DBFieldAttributeConfig | "Generated at runtime";
                                        readOnly?: boolean;
                                    }>;
                                    required?: string[];
                                };
                            };
                        };
                        security: {
                            apiKeyCookie: never[];
                            bearerAuth: never[];
                        }[];
                        servers: {
                            url: string;
                        }[];
                        tags: {
                            name: string;
                            description: string;
                        }[];
                        paths: Record<string, import("better-auth/plugins").Path>;
                    };
                } : {
                    openapi: string;
                    info: {
                        title: string;
                        description: string;
                        version: string;
                    };
                    components: {
                        securitySchemes: {
                            apiKeyCookie: {
                                type: string;
                                in: string;
                                name: string;
                                description: string;
                            };
                            bearerAuth: {
                                type: string;
                                scheme: string;
                                description: string;
                            };
                        };
                        schemas: {
                            [x: string]: {
                                type: "object";
                                properties: Record<string, {
                                    type: packages_core_dist_db.DBFieldType;
                                    default?: packages_core_dist_db.DBFieldAttributeConfig | "Generated at runtime";
                                    readOnly?: boolean;
                                }>;
                                required?: string[];
                            };
                        };
                    };
                    security: {
                        apiKeyCookie: never[];
                        bearerAuth: never[];
                    }[];
                    servers: {
                        url: string;
                    }[];
                    tags: {
                        name: string;
                        description: string;
                    }[];
                    paths: Record<string, import("better-auth/plugins").Path>;
                }>;
                options: {
                    method: "GET";
                } & {
                    use: any[];
                };
                path: "/open-api/generate-schema";
            };
            openAPIReference: {
                <AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(inputCtx_0?: ({
                    body?: undefined;
                } & {
                    method?: "GET" | undefined;
                } & {
                    query?: Record<string, any> | undefined;
                } & {
                    params?: Record<string, any>;
                } & {
                    request?: Request;
                } & {
                    headers?: HeadersInit;
                } & {
                    asResponse?: boolean;
                    returnHeaders?: boolean;
                    use?: import("better-auth").Middleware[];
                    path?: string;
                } & {
                    asResponse?: AsResponse | undefined;
                    returnHeaders?: ReturnHeaders | undefined;
                }) | undefined): Promise<[AsResponse] extends [true] ? Response : [ReturnHeaders] extends [true] ? {
                    headers: Headers;
                    response: Response;
                } : Response>;
                options: {
                    method: "GET";
                    metadata: {
                        isAction: boolean;
                    };
                } & {
                    use: any[];
                };
                path: "/reference";
            };
        };
    }];
}>;
//# sourceMappingURL=auth.d.ts.map