import React from 'react';
import { Lightbulb, Code2, BookOpen, Sparkles, Cpu } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: 'Explain a concept',
    prompt: 'Explain what an API is in simple everyday terms.',
    subtitle: 'Understand complex ideas simply',
  },
  {
    icon: Code2,
    title: 'Write some code',
    prompt: 'Write a Python function to reverse a string and check if it is a palindrome.',
    subtitle: 'Get clean, working code snippets',
  },
  {
    icon: BookOpen,
    title: 'Help me study',
    prompt: 'Give me 4 quick study questions on how DNS works with brief answers.',
    subtitle: 'Flashcards and quiz yourself',
  },
  {
    icon: Sparkles,
    title: 'Brainstorm an idea',
    prompt: 'Brainstorm 4 creative productivity app concepts that run 100% offline.',
    subtitle: 'Generate fresh thoughts and ideas',
  },
];

export default function WelcomeScreen({ onSelectPrompt }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto w-full">
      {/* Brand Icon & Model Tag */}
      <div className="mb-6 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-sm ring-1 ring-emerald-500/30">
          <Cpu className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-mono mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          qwen2.5:0.5b &bull; Local Ollama
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-800 dark:text-neutral-100 tracking-tight">
          How can I help you today?
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-md">
          Your private, local AI assistant running directly on your laptop. No data leaves your machine.
        </p>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-4 text-left">
        {SUGGESTIONS.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-150 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-colors">
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm text-neutral-800 dark:text-neutral-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                &ldquo;{item.prompt}&rdquo;
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
