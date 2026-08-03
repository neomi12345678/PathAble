"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/types";
import { SkeletonList } from "@/components/ui/Skeleton";
import { IMAGES } from "@/lib/assets/images";
import { CHAT, COMMON } from "@/utils/texts";

const CHAT_SHORTCUTS = [
  "איזה מקצוע מתאים לי?",
  "איך להתכונן לראיון?",
  "מה הזכויות שלי?",
] as const;

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export interface ChatStats {
  completionPercent: number;
  matchingProfessions: number;
  matchingJobs: number;
}

export function ChatInterface({ stats }: { stats: ChatStats }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setMessages(json.data);
        else setError(CHAT.loadError);
      })
      .catch(() => setError(CHAT.loadError))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  const handleSend = async (text: string): Promise<void> => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      session_id: "pending",
      role: "user",
      message: text.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? COMMON.genericError);
        return;
      }

      setMessages((prev) => [...prev, json.data]);
    } catch {
      setError(COMMON.genericError);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <SkeletonList count={2} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:gap-8 lg:grid-cols-12" aria-label={CHAT.title}>
      {/* Mobile stats strip */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setStatsOpen((v) => !v)}
          aria-expanded={statsOpen}
          className="glass-v2 flex w-full items-center justify-between rounded-2xl border border-white/60 px-4 py-3 shadow-md"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full border-2 border-white bg-cover bg-center"
              style={{ backgroundImage: `url('${IMAGES.aiAvatar}')` }}
            />
            <div className="text-right">
              <p className="text-sm font-bold text-on-surface">{CHAT.title}</p>
              <p className="text-xs text-on-surface-variant">
                פרופיל {stats.completionPercent}% · {stats.matchingJobs} משרות
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-primary">
            {statsOpen ? "expand_less" : "expand_more"}
          </span>
        </button>
        {statsOpen && (
          <div className="mt-2 grid grid-cols-3 gap-2 rounded-2xl border border-white/60 bg-white/80 p-3 shadow-md">
            <div className="text-center">
              <p className="text-[10px] font-bold text-on-surface-variant">פרופיל</p>
              <p className="font-display text-lg font-black text-primary">
                {stats.completionPercent}%
              </p>
            </div>
            <a href="/dashboard/professions" className="text-center">
              <p className="text-[10px] font-bold text-on-surface-variant">מקצועות</p>
              <p className="font-display text-lg font-black text-secondary">
                {stats.matchingProfessions}
              </p>
            </a>
            <a href="/dashboard/jobs" className="text-center">
              <p className="text-[10px] font-bold text-on-surface-variant">משרות</p>
              <p className="font-display text-lg font-black text-primary">
                {stats.matchingJobs}
              </p>
            </a>
          </div>
        )}
      </div>

      <aside className="hidden lg:col-span-4 lg:flex">
        <div className="glass-v2 flex flex-1 flex-col items-center rounded-3xl border border-white/60 p-8 shadow-2xl">
          <div className="group relative mb-8">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 opacity-50 blur-2xl transition-opacity group-hover:opacity-80" />
            <div className="relative">
              <div
                className="h-28 w-28 rounded-full border-4 border-white bg-cover bg-center shadow-2xl"
                style={{ backgroundImage: `url('${IMAGES.aiAvatar}')` }}
              />
              <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-white bg-green-500" />
            </div>
          </div>
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-on-surface">
              {CHAT.title}
            </h2>
            <p className="mt-2 text-sm font-medium text-on-surface-variant/70">
              יועץ הקריירה החכם שלך
            </p>
          </div>
          <div className="w-full space-y-5">
            <div className="sidebar-item rounded-2xl border border-white/80 bg-white/60 p-6">
              <div className="mb-3 flex items-end justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                  השלמת פרופיל
                </p>
                <p className="text-sm font-bold text-on-surface">
                  {stats.completionPercent}%
                </p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container transition-all"
                  style={{ width: `${stats.completionPercent}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/dashboard/professions"
                className="sidebar-item flex flex-col items-center rounded-2xl border border-white/80 bg-white/60 p-5 text-center transition-all hover:border-secondary/40"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
                  <span className="material-symbols-outlined text-xl text-secondary">
                    auto_awesome
                  </span>
                </div>
                <p className="text-[11px] font-bold uppercase text-on-surface-variant/50">
                  מקצועות מתאימים
                </p>
                <p className="font-display text-2xl font-black text-secondary">
                  {stats.matchingProfessions}
                </p>
              </a>
              <a
                href="/dashboard/jobs"
                className="sidebar-item flex flex-col items-center rounded-2xl border border-white/80 bg-white/60 p-5 text-center transition-all hover:border-primary/40"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <span className="material-symbols-outlined text-xl text-primary">
                    work
                  </span>
                </div>
                <p className="text-[11px] font-bold uppercase text-on-surface-variant/50">
                  משרות מתאימות
                </p>
                <p className="font-display text-2xl font-black text-primary">
                  {stats.matchingJobs}
                </p>
              </a>
            </div>
          </div>
          <div className="mt-auto w-full pt-8">
            <a
              href="/dashboard/jobs"
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-haredi-primary py-4 font-bold text-white shadow-xl shadow-primary/10 transition-all hover:bg-primary"
            >
              <span className="material-symbols-outlined text-xl group-hover:animate-bounce">
                work
              </span>
              למשרות המותאמות לך
            </a>
          </div>
        </div>
      </aside>

      <section className="glass-v2 relative flex h-[calc(100dvh-14rem-4rem)] min-h-[420px] flex-col overflow-hidden rounded-3xl border border-white/60 shadow-2xl lg:col-span-8 lg:h-[calc(100vh-12rem)]">
        <header className="flex items-center justify-between border-b border-white/40 bg-white/30 px-4 py-4 md:px-8 md:py-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="h-11 w-11 rounded-full border-2 border-white bg-cover bg-center shadow-md"
                style={{ backgroundImage: `url('${IMAGES.aiAvatar}')` }}
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </div>
            <div>
              <h3 className="font-display text-xl font-extrabold tracking-tight text-on-surface">
                {CHAT.title}
              </h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
                  פעיל כעת
                </span>
              </div>
            </div>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="chat-scroll flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-8 md:px-10"
          role="log"
          aria-live="polite"
          aria-label="הודעות צאט"
        >
          {messages.map((msg) =>
            msg.role === "user" ? (
              <div
                key={msg.id}
                className="flex max-w-[80%] flex-col items-end gap-2 self-end"
              >
                <div className="message-user rounded-3xl rounded-tl-none px-6 py-4 text-white">
                  <p className="text-base font-medium leading-relaxed">
                    {msg.message}
                  </p>
                </div>
                <span className="ml-4 text-[11px] font-bold text-outline/40">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            ) : (
              <div
                key={msg.id}
                className="flex max-w-[80%] flex-col items-start gap-2"
              >
                <div className="message-ai rounded-3xl rounded-tr-none px-6 py-4 text-on-surface shadow-sm">
                  <p className="text-base font-medium leading-relaxed">
                    {msg.message}
                  </p>
                </div>
                <span className="mr-4 text-[11px] font-bold text-outline/40">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            )
          )}

          {!isSending && (
            <div className="flex flex-wrap gap-3">
              {CHAT_SHORTCUTS.map((shortcut) => (
                <button
                  key={shortcut}
                  type="button"
                  onClick={() => handleSend(shortcut)}
                  className="rounded-full border border-primary/10 bg-white/70 px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition-all hover:bg-primary hover:text-white active:scale-95"
                >
                  {shortcut}
                </button>
              ))}
            </div>
          )}

          {isSending && (
            <div className="flex items-center gap-3 px-2">
              <div className="flex gap-1.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:0s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:0.4s]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary/40">
                {CHAT.typing}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="border-t border-white/40 px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-error">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="rounded-full border border-outline px-4 py-1.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-variant"
              >
                {COMMON.retry}
              </button>
            </div>
          </div>
        )}

        <footer className="p-6 md:p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="input-wrapper flex items-center gap-1 rounded-full border border-white/60 p-2"
          >
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              aria-label={CHAT.placeholder}
              placeholder={CHAT.placeholder}
              className="flex-1 border-none bg-transparent px-4 text-base text-on-surface placeholder-outline/40 focus:ring-0"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              aria-label={COMMON.send}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-90 disabled:opacity-50"
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ transform: "scaleX(-1)" }}
              >
                send
              </span>
            </button>
          </form>
        </footer>
      </section>
    </div>
  );
}
