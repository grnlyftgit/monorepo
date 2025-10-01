import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const pgsql = neon(process.env.DATABASE_URL!);
export const neonDB = drizzle({ client: pgsql });

