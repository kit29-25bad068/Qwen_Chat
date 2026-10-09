export const OLLAMA_MODEL = 'qwen2.5:0.5b';
export const OLLAMA_BASE_URL = '/api'; // Proxied by Vite to http://localhost:11434

/**
 * Checks if the local Ollama server is running and whether qwen2.5:0.5b is available.
 * @returns {Promise<{ isConnected: boolean, hasModel: boolean, models: string[], error?: string }>}
 */
export async function checkOllamaStatus() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${OLLAMA_BASE_URL}/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        isConnected: false,
        hasModel: false,
        models: [],
        error: `Ollama returned status ${res.status}`,
      };
    }

    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    const hasModel = models.some(
      (name) => name === OLLAMA_MODEL || name.startsWith(`${OLLAMA_MODEL}:`) || name.includes('qwen2.5:0.5b')
    );

    return {
      isConnected: true,
      hasModel,
      models,
      error: null,
    };
  } catch (err) {
    return {
      isConnected: false,
      hasModel: false,
      models: [],
      error: 'Unable to connect to Ollama. Please make sure Ollama is running on your laptop.',
    };
  }
}

/**
 * Streams chat completion from Ollama.
 * @param {Array<{ role: 'user' | 'assistant' | 'system', content: string }>} messages
 * @param {Object} options
 * @param {Function} options.onToken - Callback called with each new chunk and accumulated text
 * @param {Function} options.onComplete - Callback when stream finishes successfully
 * @param {Function} options.onError - Callback for errors
 * @param {AbortSignal} [options.signal] - Signal to cancel request
 */
export async function streamChatMessage(messages, { onToken, onComplete, onError, signal }) {
  let accumulatedText = '';

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Model "${OLLAMA_MODEL}" not found. Please ensure it is pulled in your local Ollama.`
        );
      }
      throw new Error(
        `Unable to connect to Ollama (HTTP ${response.status}). Please make sure Ollama is running on your laptop.`
      );
    }

    if (!response.body) {
      throw new Error('No response stream received from Ollama.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep partial line for next iteration

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.message && parsed.message.content) {
            const token = parsed.message.content;
            accumulatedText += token;
            if (onToken) {
              onToken(token, accumulatedText);
            }
          }
          if (parsed.done) {
            if (onComplete) {
              onComplete(accumulatedText);
            }
            return accumulatedText;
          }
        } catch (jsonErr) {
          console.warn('Failed to parse Ollama JSON line:', trimmed, jsonErr);
        }
      }
    }

    // If stream ended without explicit done flag
    if (onComplete) {
      onComplete(accumulatedText);
    }
    return accumulatedText;
  } catch (err) {
    if (err.name === 'AbortError') {
      // User cancelled generation
      if (onComplete) {
        onComplete(accumulatedText, true);
      }
      return accumulatedText;
    }

    let friendlyMessage = 'Unable to connect to Ollama. Please make sure Ollama is running on your laptop.';
    if (err.message && (err.message.includes('Model') || err.message.includes('not found'))) {
      friendlyMessage = err.message;
    }

    if (onError) {
      onError(friendlyMessage);
    } else {
      throw new Error(friendlyMessage);
    }
  }
}
