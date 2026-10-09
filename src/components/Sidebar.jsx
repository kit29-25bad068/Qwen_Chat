import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Trash,
} from 'lucide-react';

export default function Sidebar({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onClearAll,
  ollamaStatus,
  onRetryConnection,
  theme,
  onToggleTheme,
  isOpen,
  onToggleSidebar,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (convId, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(convId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (convId, e) => {
    e.stopPropagation();
    onDeleteConversation(convId);
  };

  const handleClearAllConfirm = () => {
    if (conversations.length === 0) return;
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      onClearAll();
    }
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-[260px] bg-[#f9f9f9] dark:bg-[#171717] border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:hidden'
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              Q
            </div>
            <div>
              <h1 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100 leading-tight">
                Qwen Chat
              </h1>
              <p className="text-[10px] text-neutral-500 font-mono">
                qwen2.5:0.5b
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700/70 text-sm font-medium text-neutral-800 dark:text-neutral-200 shadow-xs transition-all duration-150"
          >
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Ollama Status Bar */}
        <div className="px-3 pb-2">
          <div
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border ${
              ollamaStatus.isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              {ollamaStatus.isConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              )}
              <span className="truncate font-medium">
                {ollamaStatus.isConnected ? 'Ollama Online' : 'Ollama Offline'}
              </span>
            </div>
            <button
              type="button"
              onClick={onRetryConnection}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Refresh connection status"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          <div className="px-2 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Recent Chats
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
              No conversations yet.<br />Start a new chat!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-neutral-200/80 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />

                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(conv.id, e);
                          if (e.key === 'Escape') handleCancelRename(e);
                        }}
                        autoFocus
                        className="w-full bg-white dark:bg-neutral-700 text-xs px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-600 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        className="p-1 hover:text-emerald-500"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRename}
                        className="p-1 hover:text-red-500"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="truncate flex-1 text-xs md:text-sm">
                        {conv.title || 'Untitled Chat'}
                      </span>

                      {/* Action buttons visible on hover or active */}
                      <div className="hidden group-hover:flex items-center gap-0.5 ml-auto">
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(conv, e)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded hover:bg-neutral-300/50 dark:hover:bg-neutral-700 transition-colors"
                          title="Rename chat"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="p-1 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-neutral-300/50 dark:hover:bg-neutral-700 transition-colors"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar: Clear All, Theme Toggle */}
        <div className="p-3 border-t border-neutral-200/60 dark:border-neutral-800/60 space-y-1">
          {conversations.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllConfirm}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Clear all conversations</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-neutral-300" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
            </div>
            <span className="text-[10px] text-neutral-400 uppercase font-mono">
              {theme}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
