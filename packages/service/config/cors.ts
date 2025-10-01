import cors, { CorsOptions } from "cors";
import config from "./env";

interface AppCorsProps {
  NODE_ENV: string;
}

export const createCors = ({ NODE_ENV }: AppCorsProps) => {
  const corsOptions: CorsOptions = {
    origin(origin, callback) {
      if (
        NODE_ENV === "development" ||
        !origin ||
        config.CORS_WHITELISTED_ORIGINS.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS Error : ${origin} is not allowed`), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: config.CORS_CREDENTIALS,
  };

  return cors(corsOptions);
};
