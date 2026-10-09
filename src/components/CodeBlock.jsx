import React, { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import Prism from 'prismjs';

// Common Prism language imports
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';

export default function CodeBlock({ language = 'text', value = '' }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [value, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const validLanguage = Prism.languages[language] ? language : 'text';
  let highlightedCode = value;
  try {
    if (Prism.languages[validLanguage]) {
      highlightedCode = Prism.highlight(value, Prism.languages[validLanguage], validLanguage);
    }
  } catch (e) {
    highlightedCode = value;
  }

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-neutral-700/60 bg-[#1e1e1e] text-neutral-200 text-sm shadow-md font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#2d2d2d] text-xs text-neutral-400 select-none">
        <span className="font-sans font-medium uppercase tracking-wider text-[11px] text-neutral-300">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-neutral-600/50 hover:text-neutral-100 transition-colors text-xs text-neutral-300"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code container */}
      <div className="p-4 overflow-x-auto text-[13px] leading-relaxed">
        <pre className="m-0 p-0 bg-transparent font-mono">
          <code
            className={`language-${validLanguage}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
}
