import cors from "cors";
interface AppCorsProps {
    NODE_ENV: string;
}
export declare const createCors: ({ NODE_ENV }: AppCorsProps) => (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
export {};
//# sourceMappingURL=cors.d.ts.map