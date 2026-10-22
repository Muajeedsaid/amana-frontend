/** "14:05" for today, "12 Oct" for older messages. */
export function formatMessageTime(iso: string | null | undefined, language: 'en' | 'ha') {
  if (!iso) return '';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const locale = language === 'ha' ? 'ha-NG' : 'en-NG';
  const now = new Date();

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  try {
    return sameDay
      ? date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  } catch {
    return sameDay ? date.toTimeString().slice(0, 5) : date.toDateString().slice(4, 10);
  }
}

export function initialsOf(name: string) {
  const clean = name.trim();
  if (!clean) return 'A';

  return (
    clean
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'A'
  );
}

/** "Today", "Yesterday" or "12 Oct 2026" - used for the date chips inside a chat. */
export function formatDayLabel(iso: string, language: 'en' | 'ha') {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(new Date()) - startOf(date)) / 86400000);

  if (diffDays === 0) return language === 'ha' ? 'Yau' : 'Today';
  if (diffDays === 1) return language === 'ha' ? 'Jiya' : 'Yesterday';

  try {
    return date.toLocaleDateString(language === 'ha' ? 'ha-NG' : 'en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date.toDateString();
  }
}

/** Clock time only, "14:05". */
export function formatClock(iso: string, language: 'en' | 'ha') {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  try {
    return date.toLocaleTimeString(language === 'ha' ? 'ha-NG' : 'en-NG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date.toTimeString().slice(0, 5);
  }
}

export function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}