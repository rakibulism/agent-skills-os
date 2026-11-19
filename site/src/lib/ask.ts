/** Client side of Ask AI. The endpoint lives in server/ask.mjs. */
export type AskCard =
  | { type: 'skill'; slug: string }
  | { type: 'install'; manager: 'npm' | 'pnpm' | 'yarn' | 'bun' }
  | { type: 'usage'; framework: 'claude' | 'openai' | 'langchain' | 'python' | 'files'; skill: string };

export type AskAnswer = { answer: string; cards: AskCard[]; followups: string[] };

const ENDPOINT = process.env.NEXT_PUBLIC_ASK_ENDPOINT || '/api/ask';

export async function ask(question: string, signal?: AbortSignal): Promise<AskAnswer> {
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal,
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new Error("Couldn't reach Ask AI. Check your connection.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ask AI is unavailable right now.');
  return data as AskAnswer;
}

/** Whether Enter should ask the AI rather than open the top search result. */
export function looksLikeQuestion(q: string) {
  const t = q.trim();
  return (
    t.endsWith('?') ||
    /^(how|what|which|who|can|could|does|do|is|are|why|where|when|should|will|help|show|explain|tell|find|i\s)/i.test(t) ||
    t.split(/\s+/).length >= 4
  );
}
