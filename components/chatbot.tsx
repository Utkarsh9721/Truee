'use client';

import { useState, useRef, useEffect } from 'react';
import ChatSidebar, { Chat } from './chat-sidebar';

export interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    fileName?: string;
    timestamp: Date | null;
}

interface ChatbotProps {
    chats?: Chat[];
    activeChatId?: string | null;
    messages?: Message[];
    isLoading?: boolean;
    onNewChat?: () => void;
    onSelectChat?: (id: string) => void;
    onDeleteChat?: (id: string) => void;
    onSendMessage?: (payload: { text: string; file: File | null }) => Promise<void>;
}

export default function ChatbotPage({
    chats = [],
    activeChatId = null,
    messages = [],
    isLoading = false,
    onNewChat = () => { },
    onSelectChat = () => { },
    onDeleteChat = () => { },
    onSendMessage = async () => { },
}: ChatbotProps) {
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, isLoading]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [activeChatId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async () => {
        if (!input.trim() && !selectedFile) return;
        const text = input;
        const file = selectedFile;
        setInput('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await onSendMessage({ text, file });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date: Date | null) =>
        date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    const activeChat = chats.find((c) => c.id === activeChatId);
    const isEmpty = messages.length === 0 && !isLoading;

    const handleDeleteChat = () => {
        if (!activeChatId) return;
        if (!confirm('Delete this conversation? This cannot be undone.')) return;
        onDeleteChat(activeChatId);
    };

    // Composer — reused in the empty state and at the bottom
    const composer = (
        <>
            {selectedFile && (
                <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl text-sm bg-white border border-[#e5e5e5] text-[#6b6862] dark:bg-[#2f2f2f] dark:border-[#3f3f3f] dark:text-[#c4c4c4]">
                    <svg className="w-4 h-4 flex-shrink-0 text-[#c96442]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="truncate flex-1">{selectedFile.name}</span>
                    <button
                        onClick={removeFile}
                        className="text-[#8a877e] hover:text-[#c96442] transition"
                        aria-label="Remove file"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="relative rounded-[26px] transition-all duration-200 bg-white border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-within:border-[#c96442]/40 dark:bg-[#2f2f2f] dark:border-[#3f3f3f] dark:focus-within:border-[#c96442]/50">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message truee..."
                    rows={1}
                    disabled={isLoading}
                    className="w-full resize-none bg-transparent px-5 py-4 pr-24 text-[15px] focus:outline-none max-h-48 overflow-y-auto text-[#1f1e1d] placeholder-[#8e8e8e] dark:text-[#ececec] dark:placeholder-[#8e8e8e]"
                    style={{ minHeight: '56px' }}
                    onInput={(e) => {
                        const t = e.currentTarget;
                        t.style.height = 'auto';
                        t.style.height = Math.min(t.scrollHeight, 192) + 'px';
                    }}
                />

                <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file-upload" />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-full transition text-[#8e8e8e] hover:text-[#c96442] hover:bg-[#f0f0f0] dark:hover:text-[#e08364] dark:hover:bg-[#3f3f3f]"
                        aria-label="Upload file"
                        type="button"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isLoading || (!input.trim() && !selectedFile)}
                        className="p-2 rounded-full bg-[#c96442] text-white hover:bg-[#b5563a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Send message"
                        type="button"
                    >
                        {isLoading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white text-[#1f1e1d] dark:bg-[#212121] dark:text-[#ececec]">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div
                className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-out
          md:relative md:translate-x-0 md:z-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarCollapsed ? 'md:w-0 md:overflow-hidden' : ''}
        `}
            >
                <ChatSidebar
                    chats={chats}
                    activeChatId={activeChatId}
                    onSelectChat={(id) => {
                        onSelectChat(id);
                        setSidebarOpen(false);
                    }}
                    onNewChat={() => {
                        onNewChat();
                        setSidebarOpen(false);
                    }}
                    onDeleteChat={onDeleteChat}
                />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="border-b border-[#e5e5e5] bg-white/80 backdrop-blur-xl dark:border-[#2f2f2f] dark:bg-[#212121]/80 sticky top-0 z-20">
                    <div className="px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 -ml-1 rounded-lg text-[#6b6862] hover:bg-[#f0f0f0] dark:text-[#c4c4c4] dark:hover:bg-[#2f2f2f] transition"
                                aria-label="Open sidebar"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <button
                                onClick={() => setSidebarCollapsed((v) => !v)}
                                className="hidden md:flex p-2 -ml-1 rounded-lg text-[#6b6862] hover:bg-[#f0f0f0] dark:text-[#c4c4c4] dark:hover:bg-[#2f2f2f] transition"
                                aria-label="Toggle sidebar"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <h2 className="font-serif text-[15px] truncate text-[#1f1e1d] dark:text-[#ececec]">
                                {activeChat?.title ?? 'New conversation'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <span className="hidden sm:flex text-xs text-[#8a877e] dark:text-[#8e8e8e] items-center gap-1.5">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                </span>
                                truee
                            </span>
                            {activeChatId && (
                                <button
                                    onClick={handleDeleteChat}
                                    className="p-2 rounded-lg transition text-[#8a877e] hover:text-red-600 hover:bg-red-50 dark:text-[#8e8e8e] dark:hover:text-red-400 dark:hover:bg-red-950/40"
                                    aria-label="Delete chat"
                                    title="Delete chat"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* If empty: center greeting + composer vertically. If not: messages scroll, composer pinned bottom. */}
                {isEmpty ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
                        <div className="w-full max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#c96442] to-[#b5563a] flex items-center justify-center mb-4 shadow-lg shadow-[#c96442]/20">
                                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                                    </svg>
                                </div>
                                <h3 className="font-serif text-2xl sm:text-3xl text-[#1f1e1d] dark:text-[#ececec]">
                                    Hello sir, how can I help you?
                                </h3>
                            </div>

                            {composer}

                            <p className="text-center text-[11px] sm:text-xs mt-3 text-[#b8b5a9] dark:text-[#8e8e8e]">
                                truee can make mistakes. Please double-check responses.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <main className="flex-1 overflow-y-auto">
                            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
                                {messages.map((message) => (
                                    <div key={message.id} className="flex gap-3 sm:gap-4">
                                        <div className="flex-shrink-0 pt-0.5">
                                            {message.role === 'bot' ? (
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#c96442] to-[#b5563a] flex items-center justify-center shadow-sm shadow-[#c96442]/20">
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#e5e5e5] flex items-center justify-center text-[10px] sm:text-xs font-semibold text-[#6b6862] dark:bg-[#2f2f2f] dark:text-[#c4c4c4]">
                                                    You
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-semibold text-[13px] sm:text-sm text-[#1f1e1d] dark:text-[#ececec]">
                                                    {message.role === 'bot' ? 'truee' : 'You'}
                                                </span>
                                                <span className="text-[11px] sm:text-xs text-[#b8b5a9] dark:text-[#8e8e8e]">
                                                    {formatTime(message.timestamp)}
                                                </span>
                                            </div>

                                            {message.fileName && (
                                                <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg text-xs bg-white border border-[#e5e5e5] text-[#6b6862] dark:bg-[#2f2f2f] dark:border-[#3f3f3f] dark:text-[#c4c4c4]">
                                                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#c96442]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    <span className="truncate max-w-[200px] sm:max-w-[240px]">{message.fileName}</span>
                                                </div>
                                            )}

                                            <div
                                                className={
                                                    message.role === 'bot'
                                                        ? 'font-serif text-[14px] sm:text-[15px] leading-[1.75] whitespace-pre-wrap text-[#1f1e1d] dark:text-[#ececec]'
                                                        : 'text-[14px] sm:text-[15px] leading-[1.7] whitespace-pre-wrap text-[#1f1e1d] dark:text-[#ececec]'
                                                }
                                            >
                                                {message.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-3 sm:gap-4">
                                        <div className="flex-shrink-0 pt-0.5">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#c96442] to-[#b5563a] flex items-center justify-center shadow-sm shadow-[#c96442]/20">
                                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1 pt-2">
                                            <div className="flex gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-[#c96442]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 bg-[#c96442]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 bg-[#c96442]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </main>

                        <footer className="bg-white dark:bg-[#212121] px-3 sm:px-4 pb-4 sm:pb-5 pt-2">
                            <div className="max-w-3xl mx-auto">
                                {composer}
                                <p className="text-center text-[11px] sm:text-xs mt-2.5 text-[#b8b5a9] dark:text-[#8e8e8e]">
                                    truee can make mistakes. Please double-check responses.
                                </p>
                            </div>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
}