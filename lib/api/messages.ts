import { getSession } from '@/lib/auth/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ConversationSummary {
  _id: string;
  artisanProfileId: string;
  with: { name: string; subtitle: string; avatarUrl: string };
  lastMessage: string;
  lastMessageAt: string | null;
  lastSenderRole: 'customer' | 'artisan' | null;
  unread: number;
}

export interface ThreadMessage {
  _id: string;
  senderRole: 'customer' | 'artisan';
  text: string;
  createdAt: string;
  mine: boolean;
}

export interface Thread {
  conversation: ConversationSummary | null;
  messages: ThreadMessage[];
}

export interface UnreadSummary {
  count: number;
  items: ConversationSummary[];
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getSession();

  if (!session) {
    throw new ApiError('Please log in first.', 401);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.token}`,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = 'Something went wrong.';

    try {
      const body = await response.json();
      message = Array.isArray(body.message) ? body.message.join(', ') : body.message || message;
    } catch {
      // keep the generic message
    }

    throw new ApiError(message, response.status);
  }

  return response.json();
}

/** Customer -> artisan. Starts the conversation if this is the first message. */
export function sendFirstMessage(artisanProfileId: string, text: string) {
  return request<{ conversationId: string; message: ThreadMessage }>('/messages/conversations', {
    method: 'POST',
    body: JSON.stringify({ artisanProfileId, text }),
  });
}

export function replyToConversation(conversationId: string, text: string) {
  return request<{ message: ThreadMessage }>(`/messages/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export function getConversationThread(conversationId: string) {
  return request<Thread>(`/messages/conversations/${conversationId}`);
}

export function getThreadWithArtisan(artisanProfileId: string) {
  return request<Thread>(`/messages/with-artisan/${artisanProfileId}`);
}

export function listConversations() {
  return request<ConversationSummary[]>('/messages/conversations');
}

export function getUnread() {
  return request<UnreadSummary>('/messages/unread');
}

/** Tells every open bell / inbox to refresh right now instead of waiting for its timer. */
export const MESSAGES_CHANGED_EVENT = 'amana:messages-changed';

/** Asks the artisan page (if it is the one on screen) to open its chat window. */
export const OPEN_CHAT_EVENT = 'amana:open-chat';

export function announceMessagesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT));
  }
}