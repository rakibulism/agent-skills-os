// JSON responses shared by every API endpoint, so errors always have the same shape:
// { "error": "<what went wrong>", "code": "<machine-readable>", "hint": "<how to fix it>", "docs": "<url>" }

export const DOCS_URL = 'https://skills.rakibulism.space/docs/api';

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

export function jsonError(status, code, message, hint, headers = {}) {
  return json({ error: message, code, hint, docs: DOCS_URL }, status, headers);
}
