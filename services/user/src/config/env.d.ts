type NodeEnv = 'development' | 'production';
interface EnvConfig {
    SERVICE_NAME: string;
    NODE_ENV: NodeEnv;
    PORT: number;
    WEBSITE_URL: string;
}
declare const userEnvConfig: EnvConfig;
export default userEnvConfig;
//# sourceMappingURL=env.d.ts.map