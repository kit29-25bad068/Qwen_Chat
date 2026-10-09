const STORAGE_KEY_CONVERSATIONS = 'qwen_chat_conversations_v1';
const STORAGE_KEY_ACTIVE_ID = 'qwen_chat_active_id';
const STORAGE_KEY_THEME = 'qwen_chat_theme';

export function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading conversations from localStorage:', e);
    return [];
  }
}

export function saveConversations(conversations) {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
  } catch (e) {
    console.error('Error saving conversations to localStorage:', e);
  }
}

export function createNewConversation(title = 'New Chat') {
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
}

export function loadActiveConversationId() {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || null;
  } catch {
    return null;
  }
}

export function saveActiveConversationId(id) {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }
  } catch (e) {
    console.error('Error saving active conversation ID:', e);
  }
}

export function loadTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    // Default to dark mode if system prefers it, else dark as ChatGPT default
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch (e) {
    console.error('Error saving theme to localStorage:', e);
  }
}

/**
 * Generate a concise title from the user's first message
 * @param {string} firstMessageContent
 * @returns {string}
 */
export function generateChatTitle(firstMessageContent) {
  if (!firstMessageContent) return 'New Chat';
  const clean = firstMessageContent.trim().replace(/\n+/g, ' ');
  return clean.length > 32 ? `${clean.substring(0, 32)}...` : clean;
}
