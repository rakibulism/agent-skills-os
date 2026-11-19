/**
 * Copies text. Tries the async Clipboard API first; if it's missing or refused
 * (permission denied, insecure context), falls back to a hidden textarea + execCommand.
 */
export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // fall through to the legacy path
    }
  }
  const active = document.activeElement as HTMLElement | null;
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '0';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    if (!document.execCommand('copy')) throw new Error('Copy command was rejected');
  } finally {
    document.body.removeChild(ta);
    active?.focus?.({ preventScroll: true });
  }
}
