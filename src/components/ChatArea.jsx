import React, { useRef, useEffect } from 'react';
import { PanelLeft, Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import ChatMessage from './ChatMessage';
import WelcomeScreen from './WelcomeScreen';

export default function ChatArea({
  conversation,
  isGenerating,
  errorMessage,
  onDismissError,
  onRetryError,
  onSelectPrompt,
  onRegenerate,
  onToggleSidebar,
  sidebarOpen,
  onNewChat,
}) {
  const messagesEndRef = useRef(null);
  const messages = conversation?.messages || [];

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto-scroll when messages change or streaming updates
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isGenerating]);

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#212121] transition-colors">
      {/* Top Navigation Bar */}
      <header className="h-13 px-4 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60 shrink-0 select-none">
        <div className="flex items-center gap-2">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Open sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
              {conversation?.title && conversation.title !== 'New Chat'
                ? conversation.title
                : 'Qwen 2.5'}
            </span>
            <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono">
              qwen2.5:0.5b
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="New Chat"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Error notification banner if any */}
      {errorMessage && (
        <div className="mx-4 mt-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            {onRetryError && (
              <button
                type="button"
                onClick={onRetryError}
                className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-1 font-medium transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
            <button
              type="button"
              onClick={onDismissError}
              className="text-red-500 hover:text-red-700 font-bold px-1"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Message Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {messages.length === 0 ? (
          <WelcomeScreen onSelectPrompt={onSelectPrompt} />
        ) : (
          <div className="py-4 space-y-1">
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id || index}
                message={msg}
                isLast={index === messages.length - 1}
                isGenerating={isGenerating}
                onRegenerate={onRegenerate}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} className="h-4 shrink-0" />
      </div>
    </main>
  );
}
