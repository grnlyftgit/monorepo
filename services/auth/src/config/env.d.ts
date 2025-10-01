type NodeEnv = 'development' | 'production';
interface EnvConfig {
    SERVICE_NAME: string;
    NODE_ENV: NodeEnv;
    PORT: number;
    WEBSITE_URL: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
}
declare const authEnvConfig: EnvConfig;
export default authEnvConfig;
//# sourceMappingURL=env.d.ts.map