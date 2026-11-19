// Vercel Function: GET /api/skills?q=&limit= (list or search the library).
import { handleListSkills } from '../site/server/skills-api.mjs';

export const config = { maxDuration: 10 };

export const GET = (request) => handleListSkills(request);
export const HEAD = GET;
export const OPTIONS = GET;
export const POST = GET;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
