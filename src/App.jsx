import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import {
  checkOllamaStatus,
  streamChatMessage,
  OLLAMA_MODEL,
} from './services/ollama';
import {
  loadConversations,
  saveConversations,
  createNewConversation,
  loadActiveConversationId,
  saveActiveConversationId,
  loadTheme,
  saveTheme,
  generateChatTitle,
} from './services/storage';

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState({
    isConnected: false,
    hasModel: false,
    models: [],
    error: null,
  });
  const [theme, setTheme] = useState(loadTheme);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const abortControllerRef = useRef(null);

  // Initialize theme class on <html>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Check Ollama connection on mount
  const checkStatus = async () => {
    const status = await checkOllamaStatus();
    setOllamaStatus(status);
    if (!status.isConnected) {
      setErrorMessage(
        'Unable to connect to Ollama. Please make sure Ollama is running on your laptop (http://localhost:11434).'
      );
    } else if (!status.hasModel) {
      setErrorMessage(
        `Ollama is running, but model "${OLLAMA_MODEL}" was not found. Please verify "ollama list".`
      );
    } else {
      setErrorMessage(null);
    }
  };

  useEffect(() => {
    checkStatus();

    // Check Ollama health periodically every 25 seconds
    const interval = setInterval(checkStatus, 25000);
    return () => clearInterval(interval);
  }, []);

  // Initialize conversations from localStorage
  useEffect(() => {
    const loaded = loadConversations();
    const savedActiveId = loadActiveConversationId();

    if (loaded && loaded.length > 0) {
      setConversations(loaded);
      const exists = loaded.some((c) => c.id === savedActiveId);
      setActiveId(exists ? savedActiveId : loaded[0].id);
    } else {
      const initialChat = createNewConversation();
      setConversations([initialChat]);
      setActiveId(initialChat.id);
      saveConversations([initialChat]);
      saveActiveConversationId(initialChat.id);
    }
  }, []);

  // Save active conversation whenever it changes
  useEffect(() => {
    if (activeId) {
      saveActiveConversationId(activeId);
    }
  }, [activeId]);

  // Get active conversation object
  const activeConversation =
    conversations.find((c) => c.id === activeId) ||
    conversations[0] ||
    null;

  // New Chat
  const handleNewChat = () => {
    // If current conversation is already fresh and empty, don't create duplicate
    if (activeConversation && activeConversation.messages.length === 0) {
      return;
    }
    const newChat = createNewConversation();
    const updated = [newChat, ...conversations];
    setConversations(updated);
    setActiveId(newChat.id);
    saveConversations(updated);
    setInput('');
    setErrorMessage(null);
  };

  // Delete Conversation
  const handleDeleteConversation = (id) => {
    const updated = conversations.filter((c) => c.id !== id);
    if (updated.length === 0) {
      const fresh = createNewConversation();
      setConversations([fresh]);
      setActiveId(fresh.id);
      saveConversations([fresh]);
    } else {
      setConversations(updated);
      saveConversations(updated);
      if (activeId === id) {
        setActiveId(updated[0].id);
      }
    }
  };

  // Rename Conversation
  const handleRenameConversation = (id, newTitle) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
    );
    setConversations(updated);
    saveConversations(updated);
  };

  // Clear All Conversations
  const handleClearAll = () => {
    const fresh = createNewConversation();
    setConversations([fresh]);
    setActiveId(fresh.id);
    saveConversations([fresh]);
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Send message
  const handleSendMessage = async (customPrompt) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isGenerating) return;

    // Clear input field right away
    if (!customPrompt) setInput('');
    setErrorMessage(null);

    const userMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const assistantPlaceholder = {
      id: `msg_ai_${Date.now()}`,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: Date.now(),
    };

    // Calculate current conversation state
    let targetConv = activeConversation;
    let isBrandNewChat = false;

    if (!targetConv) {
      targetConv = createNewConversation();
      isBrandNewChat = true;
    }

    const isFirstMessage = targetConv.messages.length === 0;
    const newTitle = isFirstMessage ? generateChatTitle(textToSend) : targetConv.title;

    const updatedMessages = [...targetConv.messages, userMessage, assistantPlaceholder];

    const updatedConv = {
      ...targetConv,
      title: newTitle,
      updatedAt: Date.now(),
      messages: updatedMessages,
    };

    const nextConversations = isBrandNewChat
      ? [updatedConv, ...conversations]
      : conversations.map((c) => (c.id === targetConv.id ? updatedConv : c));

    setConversations(nextConversations);
    if (isBrandNewChat) {
      setActiveId(updatedConv.id);
    }

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    // Prepare message history to preserve context across turns
    const historyForOllama = [...targetConv.messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      await streamChatMessage(historyForOllama, {
        signal: abortControllerRef.current.signal,
        onToken: (_token, accumulatedText) => {
          setConversations((prevList) =>
            prevList.map((c) => {
              if (c.id !== updatedConv.id) return c;
              const msgs = c.messages.map((m) =>
                m.id === assistantPlaceholder.id
                  ? { ...m, content: accumulatedText }
                  : m
              );
              return { ...c, messages: msgs };
            })
          );
        },
        onComplete: (finalText) => {
          setIsGenerating(false);
          abortControllerRef.current = null;
          setConversations((prevList) => {
            const finished = prevList.map((c) => {
              if (c.id !== updatedConv.id) return c;
              const msgs = c.messages.map((m) =>
                m.id === assistantPlaceholder.id
                  ? { ...m, content: finalText, isStreaming: false }
                  : m
              );
              return { ...c, messages: msgs, updatedAt: Date.now() };
            });
            saveConversations(finished);
            return finished;
          });
        },
        onError: (errMessage) => {
          setIsGenerating(false);
          abortControllerRef.current = null;
          setErrorMessage(errMessage);

          // Mark assistant placeholder with error notice or remove if empty
          setConversations((prevList) => {
            const finished = prevList.map((c) => {
              if (c.id !== updatedConv.id) return c;
              const msgs = c.messages
                .map((m) => {
                  if (m.id === assistantPlaceholder.id) {
                    return m.content
                      ? { ...m, isStreaming: false }
                      : null;
                  }
                  return m;
                })
                .filter(Boolean);
              return { ...c, messages: msgs };
            });
            saveConversations(finished);
            return finished;
          });
        },
      });
    } catch (e) {
      console.error('Chat error:', e);
      setIsGenerating(false);
    }
  };

  // Regenerate last AI response
  const handleRegenerate = async () => {
    if (!activeConversation || isGenerating) return;
    const msgs = activeConversation.messages;
    if (msgs.length < 2) return;

    // Find the last assistant message
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg.role !== 'assistant') return;

    // Pop the last assistant message
    const trimmedMsgs = msgs.slice(0, -1);
    const lastUserMsg = trimmedMsgs[trimmedMsgs.length - 1];
    if (!lastUserMsg || lastUserMsg.role !== 'user') return;

    const assistantPlaceholder = {
      id: `msg_ai_${Date.now()}`,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: Date.now(),
    };

    const updatedConv = {
      ...activeConversation,
      messages: [...trimmedMsgs, assistantPlaceholder],
      updatedAt: Date.now(),
    };

    const nextConversations = conversations.map((c) =>
      c.id === activeConversation.id ? updatedConv : c
    );
    setConversations(nextConversations);
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    const historyForOllama = trimmedMsgs.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      await streamChatMessage(historyForOllama, {
        signal: abortControllerRef.current.signal,
        onToken: (_token, accumulatedText) => {
          setConversations((prevList) =>
            prevList.map((c) => {
              if (c.id !== updatedConv.id) return c;
              const currentMsgs = c.messages.map((m) =>
                m.id === assistantPlaceholder.id
                  ? { ...m, content: accumulatedText }
                  : m
              );
              return { ...c, messages: currentMsgs };
            })
          );
        },
        onComplete: (finalText) => {
          setIsGenerating(false);
          abortControllerRef.current = null;
          setConversations((prevList) => {
            const finished = prevList.map((c) => {
              if (c.id !== updatedConv.id) return c;
              const currentMsgs = c.messages.map((m) =>
                m.id === assistantPlaceholder.id
                  ? { ...m, content: finalText, isStreaming: false }
                  : m
              );
              return { ...c, messages: currentMsgs, updatedAt: Date.now() };
            });
            saveConversations(finished);
            return finished;
          });
        },
        onError: (errMessage) => {
          setIsGenerating(false);
          abortControllerRef.current = null;
          setErrorMessage(errMessage);
        },
      });
    } catch (e) {
      console.error('Regenerate error:', e);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#212121] text-neutral-900 dark:text-neutral-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={setActiveId}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClearAll={handleClearAll}
        ollamaStatus={ollamaStatus}
        onRetryConnection={checkStatus}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <ChatArea
          conversation={activeConversation}
          isGenerating={isGenerating}
          errorMessage={errorMessage}
          onDismissError={() => setErrorMessage(null)}
          onRetryError={checkStatus}
          onSelectPrompt={(prompt) => handleSendMessage(prompt)}
          onRegenerate={handleRegenerate}
          onToggleSidebar={() => setSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
          onNewChat={handleNewChat}
        />

        {/* Floating Message Input at bottom */}
        <MessageInput
          input={input}
          setInput={setInput}
          onSend={() => handleSendMessage()}
          isGenerating={isGenerating}
          onStop={handleStopGeneration}
          disabled={!ollamaStatus.isConnected}
          onVoiceError={(err) => setErrorMessage(err)}
        />
      </div>
    </div>
  );
}
