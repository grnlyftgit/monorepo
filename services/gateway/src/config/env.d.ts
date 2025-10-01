type NodeEnv = "development" | "production";
interface AppConfig {
    NODE_ENV: NodeEnv;
    PORT: number;
    WEBSITE_URL: string;
    AUTH_SERVICE_URL: string;
    USER_SERVICE_URL: string;
}
declare const config: AppConfig;
export default config;
//# sourceMappingURL=env.d.ts.map