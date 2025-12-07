"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  Loader2,
  Copy,
  Check,
  X,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const suggestedQuestions = [
  "商品を作成する方法は？",
  "会員情報の管理方法は？",
  "ロール権限の設定方法は？",
  "注文管理の流れは？",
];

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSend = React.useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const now = Date.now();
    const userMessage: Message = {
      id: now.toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(now),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response - will be replaced with Langflow API
    const delay = 1000 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF) * 1000;
    setTimeout(() => {
      const responseTime = Date.now();
      const assistantMessage: Message = {
        id: responseTime.toString(),
        role: "assistant",
        content: generateMockResponse(userMessage.content),
        timestamp: new Date(responseTime),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, delay);
  }, [input, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = React.useCallback((question: string) => {
    if (isLoading) return;
    
    const now = Date.now();
    const userMessage: Message = {
      id: now.toString(),
      role: "user",
      content: question,
      timestamp: new Date(now),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response - will be replaced with Langflow API
    const delay = 1000 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF) * 1000;
    setTimeout(() => {
      const responseTime = Date.now();
      const assistantMessage: Message = {
        id: responseTime.toString(),
        role: "assistant",
        content: generateMockResponse(question),
        timestamp: new Date(responseTime),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, delay);
  }, [isLoading]);

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  // Minimized state - just show a small bar
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        >
          <Bot className="h-5 w-5" />
          <span className="text-sm font-medium">AIアシスタント</span>
          {messages.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 text-xs">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col w-96 h-[600px] max-h-[calc(100vh-6rem)] rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AIアシスタント</h3>
            <p className="text-xs text-muted-foreground">システムサポート</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-semibold mb-1">
              AIアシスタントへようこそ
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              システムについて質問してください
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-2.5 py-1 text-xs rounded-full border border-border bg-background hover:bg-muted transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={handleCopy}
                isCopied={copiedId === message.id}
              />
            ))}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-muted text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-muted-foreground">考え中...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-3 bg-background">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="質問を入力..."
            className="min-h-[40px] max-h-24 resize-none text-sm"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-10 w-10 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onCopy,
  isCopied,
}: {
  message: Message;
  onCopy: (content: string, id: string) => void;
  isCopied: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex items-start gap-2", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary" : "bg-primary/10"
        )}
      >
        {isUser ? (
          <User className="h-3 w-3 text-primary-foreground" />
        ) : (
          <Bot className="h-3 w-3 text-primary" />
        )}
      </div>
      <div
        className={cn(
          "group relative max-w-[85%] px-3 py-2 rounded-2xl text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p className="whitespace-pre-wrap text-xs leading-relaxed">
          {message.content}
        </p>
        <button
          onClick={() => onCopy(message.content, message.id)}
          className={cn(
            "absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground",
            isUser ? "right-0" : "left-0"
          )}
        >
          {isCopied ? (
            <>
              <Check className="h-2.5 w-2.5" />
              コピー済み
            </>
          ) : (
            <>
              <Copy className="h-2.5 w-2.5" />
              コピー
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Mock response generator - will be replaced with Langflow API
function generateMockResponse(question: string): string {
  const responses: Record<string, string> = {
    商品: `商品の作成方法：

1. サイドバーから「商品管理」をクリック
2. 「新規商品を追加」ボタンをクリック
3. 商品情報を入力：
   - 商品コード・商品名
   - 各価格レベル（本部、支局、教室、一般）
   - 在庫数
4. 「保存」をクリックして完了`,
    会員: `会員管理について：

「会員管理」ページで確認・編集できます。

主な機能：
- 会員一覧の表示と検索
- 会員詳細情報の確認
- 会員ステータスの変更
- 資格情報の管理`,
    権限: `ロール権限の設定方法：

1. 「ロール管理」ページにアクセス
2. 既存ロールを編集または新規作成
3. 各機能へのアクセス権限を設定
4. 変更を保存

ロールは階層構造で、上位は下位の権限を含みます。`,
    注文: `注文管理の流れ：

1. 顧客がストアで注文を作成
2. 「注文管理」に新規注文が表示
3. 注文内容を確認しステータス更新
4. 発送処理後、完了ステータスに変更

ステータス：新規→確認済み→発送準備中→発送済み→完了`,
    通知: `通知の送信方法：

1. 「通知管理」ページにアクセス
2. 「新規通知を作成」をクリック
3. 送信先を選択（全会員、特定グループ、個別）
4. タイトルと本文を入力
5. 送信または下書き保存`,
    支払: `対応している支払い方法：

- クレジットカード（Stripe経由）
- 銀行振込
- コンビニ決済

支払い設定は「商店設定」ページで管理できます。`,
  };

  for (const [keyword, response] of Object.entries(responses)) {
    if (question.includes(keyword)) {
      return response;
    }
  }

  return `ご質問ありがとうございます。

「${question}」についてですね。

現在デモモードで動作しています。Langflow API接続後、より詳細な回答を提供できます。

他にご質問があればお気軽にどうぞ。`;
}
