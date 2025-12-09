"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface ActivityAICompanionProps {
  activityTitle: string;
  videoTitle?: string;
  className?: string;
}

export function ActivityAICompanion({ activityTitle, videoTitle, className }: ActivityAICompanionProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "こんにちは！この動画や活動について、何か質問はありますか？要約も作成できますよ。" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse = { 
        role: "ai" as const, 
        content: `「${input}」についてですね。${videoTitle || activityTitle}の観点から解説します。\n\nリトミックでは、音楽を通じて身体的・感覚的・知的な能力を統合的に高めることを目指しています。このセッションでは特にその実践方法に焦点を当てています。` 
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  return (
    <Card className={`flex flex-col border-primary/20 shadow-lg ${className || "h-[600px]"}`}>
      <CardHeader className="pb-2 border-b bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI 学習アシスタント
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <Tabs defaultValue="summary" className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="summary">AI 要約</TabsTrigger>
              <TabsTrigger value="chat">AI Q&A</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="summary" className="flex-1 overflow-auto p-4">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <h3 className="font-bold mb-2 flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" />
                    ハイライト
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    このセッション「{videoTitle || activityTitle}」では、以下のポイントが重要です：
                  </p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-muted-foreground">
                    <li>リトミックの基礎的な身体表現とその効果</li>
                    <li>年齢別の指導アプローチの違いと実践例</li>
                    <li>グループ活動における講師の役割と立ち位置</li>
                    <li>子供たちの反応を引き出すための音楽の使い方</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-sm">詳細解説</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    動画の前半では、幼児期の発達段階に合わせたリズム遊びの導入方法が紹介されています。特に3歳児クラスでは、模倣遊びから入ることの重要性が強調されています。
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    後半の実技デモでは、実際の子供たちの反応を見ながら、どのようにテンポや強弱を変化させていくか、具体的なテクニックが実演されています。
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className={`h-8 w-8 ${msg.role === "ai" ? "bg-primary/10" : "bg-muted"}`}>
                      {msg.role === "ai" ? (
                        <div className="flex items-center justify-center w-full h-full text-primary">
                          <Bot className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </Avatar>
                    <div className={`rounded-lg p-3 max-w-[80%] text-sm ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted/50 border"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="bg-muted/50 border rounded-lg p-3 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input
                  placeholder="質問を入力してください..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
