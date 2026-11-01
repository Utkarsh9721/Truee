'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatbotPage, { Message } from '@/components/chatbot';
import type { Chat } from '@/components/chat-sidebar';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    (async () => {
      try {
        const res = await fetch('/api/chats');
        if (!res.ok) return;
        const data: Chat[] = await res.json();
        setChats(data);
        if (data[0]) setActiveChatId(data[0].id);
      } catch (err) {
        console.error('[load chats]', err);
      }
    })();
  }, [status]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/chats/${activeChatId}/messages`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(
          data.map((m: {
            id: string;
            role: 'user' | 'bot';
            content: string;
            fileName?: string;
            createdAt: string;
          }) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            fileName: m.fileName,
            timestamp: m.createdAt ? new Date(m.createdAt) : null,
          }))
        );
      } catch (err) {
        console.error('[load messages]', err);
      }
    })();
  }, [activeChatId]);

  const handleNewChat = useCallback(async () => {
    const res = await fetch('/api/chats', { method: 'POST' });
    if (!res.ok) return;
    const chat: Chat = await res.json();
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
    setMessages([]);
  }, []);

  const handleDeleteChat = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/chats/${id}`, { method: 'DELETE' });
      if (!res.ok) return;
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) {
        const remaining = chats.filter((c) => c.id !== id);
        setActiveChatId(remaining[0]?.id ?? null);
        setMessages([]);
      }
    },
    [activeChatId, chats]
  );

  const handleSelectChat = useCallback((id: string) => setActiveChatId(id), []);

  const handleSendMessage = useCallback(
    async ({ text, file }: { text: string; file: File | null }) => {
      let chatId = activeChatId;
      if (!chatId) {
        const res = await fetch('/api/chats', { method: 'POST' });
        if (!res.ok) return;
        const chat: Chat = await res.json();
        setChats((prev) => [chat, ...prev]);
        setActiveChatId(chat.id);
        chatId = chat.id;
      }

      const optimisticId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          role: 'user',
          content: text || (file ? `Uploaded file: ${file.name}` : ''),
          fileName: file?.name,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(true);

      try {
        const form = new FormData();
        form.append('content', text);
        if (file) form.append('file', file);

        const res = await fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          body: form,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticId),
          {
            id: data.userMessage.id,
            role: 'user',
            content: data.userMessage.content,
            fileName: data.userMessage.fileName,
            timestamp: new Date(data.userMessage.createdAt),
          },
          {
            id: data.botMessage.id,
            role: 'bot',
            content: data.botMessage.content,
            timestamp: new Date(data.botMessage.createdAt),
          },
        ]);

        const listRes = await fetch('/api/chats');
        if (listRes.ok) setChats(await listRes.json());
      } catch (err) {
        console.error('[send message]', err);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      } finally {
        setIsLoading(false);
      }
    },
    [activeChatId]
  );

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-white dark:bg-[#212121]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c96442]">
          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
        </div>
        <div className="font-serif text-xl text-[#1f1e1d] dark:text-[#ececec]">truee</div>
        <div className="text-sm text-[#8a877e]">Loading…</div>
      </div>
    );
  }

  return (
    <ChatbotPage
      chats={chats}
      activeChatId={activeChatId}
      messages={messages}
      isLoading={isLoading}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
      onDeleteChat={handleDeleteChat}
      onSendMessage={handleSendMessage}
    />
  );
}