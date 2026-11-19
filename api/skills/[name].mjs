// Vercel Function: GET /api/skills/{name} (one skill, with its SKILL.md).
import { handleGetSkill } from '../../site/server/skills-api.mjs';

export const config = { maxDuration: 10 };

export const GET = (request) => handleGetSkill(request);
export const HEAD = GET;
export const OPTIONS = GET;
export const POST = GET;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
