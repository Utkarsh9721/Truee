'use client';

import { signOut } from 'next-auth/react';

export interface Chat {
    id: string;
    title: string;
    updatedAt: number;
}

interface ChatSidebarProps {
    chats: Chat[];
    activeChatId: string | null;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
    onDeleteChat: (id: string) => void;
}

export default function ChatSidebar({
    chats,
    activeChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat,
}: ChatSidebarProps) {
    return (
        <aside className="w-72 sm:w-80 md:w-72 flex-shrink-0 flex flex-col h-full bg-[#f9f9f9] border-r border-[#e5e5e5] dark:bg-[#171717] dark:border-[#2f2f2f]">
            <div className="p-4 border-b border-[#e5e5e5] dark:border-[#2f2f2f]">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c96442] to-[#b5563a] flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                    </div>
                    <span className="font-serif text-[17px] text-[#1f1e1d] dark:text-[#ececec]">truee</span>
                </div>

                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1f1e1d] bg-white border border-[#e5e5e5] hover:bg-[#f5f5f5] transition shadow-sm dark:bg-[#212121] dark:border-[#2f2f2f] dark:text-[#ececec] dark:hover:bg-[#2f2f2f]"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New chat
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2.5 py-3">
                {chats.length === 0 ? (
                    <p className="px-3 py-6 text-xs text-center text-[#8e8e8e]">
                        No conversations yet.
                    </p>
                ) : (
                    <ul className="space-y-0.5">
                        {chats.map((chat) => {
                            const isActive = chat.id === activeChatId;
                            return (
                                <li key={chat.id} className="group relative">
                                    <button
                                        onClick={() => onSelectChat(chat.id)}
                                        className={`w-full text-left px-3 py-2.5 pr-10 rounded-lg text-sm truncate transition ${isActive
                                                ? 'bg-[#ececec] text-[#1f1e1d] font-medium dark:bg-[#2f2f2f] dark:text-[#ececec]'
                                                : 'text-[#4a4844] hover:bg-[#f0f0f0] dark:text-[#c4c4c4] dark:hover:bg-[#212121]'
                                            }`}
                                    >
                                        {chat.title || 'Untitled'}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Delete this conversation?')) onDeleteChat(chat.id);
                                        }}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition text-[#8e8e8e] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                                        aria-label="Delete chat"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </nav>

            <div className="p-3 border-t border-[#e5e5e5] dark:border-[#2f2f2f]">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#6b6862] hover:bg-[#f0f0f0] hover:text-red-600 transition dark:text-[#c4c4c4] dark:hover:bg-[#212121] dark:hover:text-red-400"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                </button>
            </div>
        </aside>
    );
}