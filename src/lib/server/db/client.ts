import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const queryClient = postgres(import.meta.env.VITE_DATABASE_URL, { ssl: 'require' });
export const db = drizzle(queryClient, { schema });
