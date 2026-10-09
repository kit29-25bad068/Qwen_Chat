import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  RotateCw,
  Bot,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import CodeBlock from './CodeBlock';

export default function ChatMessage({
  message,
  isLast,
  isGenerating,
  onRegenerate,
}) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isUser = message.role === 'user';

  // Stop speaking if unmounted or message changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy message:', e);
    }
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean up code blocks and markdown symbols for natural reading
    const cleanSpeech = message.content
      .replace(/```[\s\S]*?```/g, ' [Code block omitted] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={`w-full py-4 px-4 md:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-neutral-50/50 dark:bg-neutral-900/40 border-y border-neutral-200/40 dark:border-neutral-800/40'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 flex items-center justify-center font-medium shadow-sm">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm ring-2 ring-emerald-500/20">
              <Bot className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content Body */}
        <div className="flex-1 min-w-0">
          {/* Sender label and timestamp */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
              {isUser ? 'You' : 'Qwen 2.5'}
            </span>
            {!isUser && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                0.5b local
              </span>
            )}
            {message.timestamp && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-auto">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          {/* Render content */}
          {isUser ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-900 dark:text-neutral-100 font-sans">
              {message.content}
            </div>
          ) : (
            <div
              className={`prose-chat text-neutral-900 dark:text-neutral-100 ${
                message.isStreaming ? 'typing-cursor' : ''
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    if (!inline && (match || codeString.includes('\n'))) {
                      return (
                        <CodeBlock
                          language={match ? match[1] : 'text'}
                          value={codeString}
                        />
                      );
                    }
                    return (
                      <code
                        className="bg-neutral-200/70 dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 font-mono text-[13px] px-1.5 py-0.5 rounded"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content || (message.isStreaming ? '' : '_Thinking..._')}
              </ReactMarkdown>
            </div>
          )}

          {/* Action toolbar for AI messages */}
          {!isUser && !message.isStreaming && message.content && (
            <div className="flex items-center gap-1.5 mt-3 pt-1 border-t border-neutral-200/50 dark:border-neutral-800/50">
              {/* Copy message */}
              <button
                type="button"
                onClick={handleCopyMessage}
                className="flex items-center gap-1.5 px-2 py-1 text-xs rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Read Aloud / Voice Output */}
              {typeof window !== 'undefined' && 'speechSynthesis' in window && (
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
                    isSpeaking
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                  }`}
                  title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Read aloud</span>
                    </>
                  )}
                </button>
              )}

              {/* Regenerate */}
              {isLast && onRegenerate && !isGenerating && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
