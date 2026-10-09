import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, Square, Mic, MicOff, Volume2 } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export default function MessageInput({
  input,
  setInput,
  onSend,
  isGenerating,
  onStop,
  disabled = false,
  onVoiceError,
}) {
  const textareaRef = useRef(null);
  const [initialInputBeforeVoice, setInitialInputBeforeVoice] = useState('');

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  } = useSpeechRecognition({
    onTranscript: (spokenText) => {
      // If user had existing text before clicking mic, append to it
      const combined = initialInputBeforeVoice
        ? `${initialInputBeforeVoice.trim()} ${spokenText}`
        : spokenText;
      setInput(combined);
    },
    onError: (err) => {
      if (onVoiceError) onVoiceError(err);
    },
  });

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap maximum height at ~180px
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isListening) {
        stopListening();
      }
      if (!isGenerating && input.trim() && !disabled) {
        onSend();
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isListening) {
      stopListening();
    }
    if (isGenerating) {
      onStop();
    } else if (input.trim() && !disabled) {
      onSend();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setInitialInputBeforeVoice(input);
      startListening();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Listening status wave banner */}
      {isListening && (
        <div className="mb-2 px-4 py-2 rounded-xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 flex items-center justify-between text-xs text-red-600 dark:text-red-400 animate-fadeIn select-none">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="font-medium">Listening... Speak into your microphone</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio equalizer animation bars */}
            <div className="flex items-center gap-0.5 h-3 mr-2">
              <span className="w-0.5 h-2 bg-red-500 rounded-full animate-bounce"></span>
              <span className="w-0.5 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-0.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
              <span className="w-0.5 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-[11px] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleFormSubmit}
        className={`relative flex flex-col bg-white dark:bg-neutral-800/90 rounded-2xl border shadow-sm transition-all ${
          isListening
            ? 'border-red-500 ring-2 ring-red-500/20'
            : 'border-neutral-300 dark:border-neutral-700 focus-within:border-neutral-400 dark:focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-400 dark:focus-within:ring-neutral-500'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? 'Listening to your voice...'
              : isGenerating
              ? 'Generating response...'
              : 'Message Qwen (or click mic to speak)...'
          }
          rows={1}
          disabled={disabled}
          className="w-full resize-none py-3.5 pl-4 pr-20 text-sm md:text-[15px] bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none max-h-44 font-sans leading-relaxed"
        />

        {/* Action Controls: Mic + (Send or Stop) */}
        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          {/* Voice Input Button */}
          {isSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={disabled || isGenerating}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/60'
              } ${disabled || isGenerating ? 'opacity-40 cursor-not-allowed' : ''}`}
              title={isListening ? 'Stop listening' : 'Voice input (Dictate message)'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Send or Stop */}
          {isGenerating ? (
            <button
              type="button"
              onClick={onStop}
              className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
              title="Stop generating"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                input.trim() && !disabled
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 shadow-sm'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </form>

      {/* Micro footer disclaimer */}
      <p className="text-[11px] text-center text-neutral-400 dark:text-neutral-500 mt-2 select-none flex items-center justify-center gap-2">
        <span>qwen2.5:0.5b runs locally</span>
        <span>&bull;</span>
        <span>Voice input & keyboard supported</span>
        <span>&bull;</span>
        <span>Enter to send</span>
      </p>
    </div>
  );
}
