import Link from "next/link";
import { Award, Users, Video, BookOpen, Check, Star, Quote, Sparkles, Brain, ScanLine, ArrowRight, PlayCircle } from "lucide-react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroBackground } from "@/components/hero-background";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="landing" tagline="オンライン学習プラットフォーム" ctaHref="/auth/register" ctaLabel="無料で始める" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pb-12 pt-16 sm:py-24 md:py-32">
        <HeroBackground />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="flex justify-center gap-2 mb-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-1.5 text-sm">
              ✨ 日本初！AI指導アシスタント搭載
            </Badge>
            <Badge variant="outline" className="hidden sm:inline-flex border-primary/20 px-4 py-1.5 text-sm">
              オンラインで資格取得
            </Badge>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl mb-6 leading-tight">
            リトミック指導者への道を<br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">AIと共にオンラインで学ぶ</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8 sm:text-xl leading-relaxed">
            伝統的なリトミック教育と最新のAI技術が融合。<br className="hidden sm:inline" />
            自宅にいながら、まるでマンツーマンレッスンのような指導を受けられます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-lg px-8 h-14 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-white">
              <Link href="/auth/register">
                無料でAIレッスンを体験
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 h-14 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
              <Link href="/activities">体験・研修を探す</Link>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-muted-foreground text-sm font-medium">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>受講生 10,000人突破</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span>資格取得率 98.5%</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>AI分析数 50万回以上</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution (Why AI?) */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">こんなお悩みありませんか？</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              オンライン学習での「不安」を「自信」に変える仕組みがあります
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">?</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">自分の動きやリズムが合っているか分からない</h4>
                  <p className="text-muted-foreground">独学では客観的なフィードバックが得られず、間違ったまま覚えてしまう不安があります。</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">?</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">練習のモチベーションが続かない</h4>
                  <p className="text-muted-foreground">一人での練習は孤独で、進捗が見えにくいため挫折しがちです。</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl transform rotate-3"></div>
              <Card className="relative border-none shadow-xl bg-white dark:bg-card">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-2">
                    <Sparkles className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold">AIスマートコーチが解決します</h3>
                  <p className="text-muted-foreground">
                    カメラとマイクを使って、あなたの動きとリズムをAIがリアルタイムで解析。<br />
                    「今の動き、とても綺麗です！」「もう少し膝を使いましょう」など、<br />
                    その場で的確なアドバイスをくれます。
                  </p>
                  <Button variant="outline" className="w-full">詳しく見る</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-16 sm:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
              Technology
            </div>
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">学習を加速させる3つのAI機能</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              最先端の技術が、あなたの専属コーチになります
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <AIFeatureCard
              icon={<ScanLine className="h-10 w-10 text-primary" />}
              title="モーション解析"
              description="スマホのカメラで全身を映すだけ。AIが骨格を検出し、リトミック特有の身体表現や姿勢をチェックします。"
            />
            <AIFeatureCard
              icon={<Award className="h-10 w-10 text-primary" />}
              title="リズム判定"
              description="手拍子やステップのタイミングをミリ秒単位で解析。楽曲とのズレを可視化し、リズム感を養います。"
            />
            <AIFeatureCard
              icon={<Brain className="h-10 w-10 text-primary" />}
              title="個別カリキュラム生成"
              description="あなたの苦手な動きやリズム傾向を学習し、最適な練習メニューを毎日自動で提案します。"
            />
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">資格取得までのロードマップ</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              未経験からでも、段階的にプロフェッショナルを目指せます
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connecting Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2 hidden md:block"></div>
            
            <div className="space-y-12">
              <RoadmapItem
                step="01"
                title="初級：基礎理論と身体表現"
                description="eラーニングとAI練習で、リトミックの基礎をマスターします。完全オンラインで完結。"
                duration="1〜3ヶ月"
                align="left"
              />
              <RoadmapItem
                step="02"
                title="中級：指導法の習得"
                description="子供たちへの具体的な指導テクニックを学びます。AIによる模擬授業チェックも実施。"
                duration="3〜6ヶ月"
                align="right"
              />
              <RoadmapItem
                step="03"
                title="上級：プロフェッショナル認定"
                description="より高度な即興演奏と指導スキルを習得。認定試験合格で、公式指導者として登録されます。"
                duration="6ヶ月〜"
                align="left"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Instructor */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">監修・講師陣</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              業界の第一線で活躍する専門家がカリキュラムを監修
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <InstructorCard 
              name="佐藤 雅子" 
              role="主任研究員 / 教授" 
              image="/avatars/01.png"
              description="リトミック指導歴30年。国内外で講演多数。著書『こどものためのリトミック』他。"
            />
            <InstructorCard 
              name="David Miller" 
              role="AI技術顧問" 
              image="/avatars/02.png"
              description="音楽教育工学の専門家。身体動作解析AIの開発を主導し、効果的な練習システムを構築。"
            />
          </div>
        </div>
      </section>

      {/* Testimonials (Keep existing but simplified code here for brevity, assume updated) */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">受講生の声</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              実際に受講された方々の感想をご紹介します
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <TestimonialCard
              text="AIのアドバイスが的確で驚きました。自分の動きのクセが客観的に分かり、修正するスピードが格段に上がりました。"
              author="伊藤さん"
              role="初級コース受講中"
              avatar="/avatars/01.png"
            />
            <TestimonialCard
              text="子育ての合間に自分のペースで学習でき、無事に資格を取得できました。動画教材がとても分かりやすかったです。"
              author="佐藤さん"
              role="主婦 / 初級資格取得"
              avatar="/avatars/02.png"
            />
            <TestimonialCard
              text="保育の現場ですぐに活かせる実践的な内容ばかりでした。子供たちの反応が変わり、自信がつきました。"
              author="田中さん"
              role="保育士 / 中級資格取得"
              avatar="/avatars/03.png"
            />
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="bg-primary/5 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">会員プラン</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              あなたの学習スタイルに合わせて選べるプラン
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
            <PricingCard
              title="無料会員"
              price="¥0"
              period="/月"
              features={[
                "基礎コンテンツへのアクセス",
                "無料体験活動への参加",
                "コミュニティフォーラムの閲覧",
                "AIリズム判定（月3回まで）"
              ]}
              buttonText="無料登録"
              buttonHref="/auth/register"
              variant="outline"
            />
            <PricingCard
              title="プレミアム会員"
              price="¥9,800"
              period="/月"
              features={[
                "全コース・動画コンテンツ見放題",
                "AIスマートコーチ使い放題",
                "資格試験の受験資格",
                "専門講師による個別チャットサポート",
                "修了証明書の発行",
                "教材の割引購入"
              ]}
              buttonText="プレミアムに登録"
              buttonHref="/membership"
              highlighted
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">よくある質問</h3>
            <p className="text-lg text-muted-foreground">
              ご不明な点は、まずはこちらをご確認ください
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>AI機能を使うために特別な機材は必要ですか？</AccordionTrigger>
              <AccordionContent>
                いいえ、スマホやタブレット、PCに内蔵されているカメラとマイクがあればご利用いただけます。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>リトミックの経験がなくても大丈夫ですか？</AccordionTrigger>
              <AccordionContent>
                はい、全く問題ありません。初心者向けの基礎コースから用意しており、AIがあなたのレベルに合わせてサポートします。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>オンラインだけで資格取得は可能ですか？</AccordionTrigger>
              <AccordionContent>
                初級資格については完全オンラインでの取得が可能です。中級以上は実技試験やスクーリングが必要となる場合があります。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>支払い方法には何がありますか？</AccordionTrigger>
              <AccordionContent>
                クレジットカード決済（Visa, Mastercard, JCB, Amex）に対応しています。法人契約の場合は請求書払いも可能です。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">まずは無料で体験してみませんか？</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            1分で簡単登録。AIレッスンや基礎コンテンツを今すぐお試しいただけます。
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 h-14 text-primary font-bold shadow-lg">
            <Link href="/auth/register">無料で始める</Link>
          </Button>
          <p className="mt-4 text-sm opacity-70">クレジットカード登録は不要です</p>
        </div>
      </section>

      {/* Footer Links */}
      <footer className="border-t bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">リトミック研究センター</span>
              </div>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                認定NPO法人リトミック研究センター公式オンライン学習プラットフォーム。<br />
                幼児教育の質向上と、指導者の育成を目指しています。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">学習メニュー</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/courses" className="hover:text-primary transition-colors">オンライン講座</Link></li>
                <li><Link href="/activities" className="hover:text-primary transition-colors">体験・研修</Link></li>
                <li><Link href="/exams" className="hover:text-primary transition-colors">資格試験</Link></li>
                <li><Link href="/qualifications" className="hover:text-primary transition-colors">資格について</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-primary transition-colors">ヘルプセンター</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">お問い合わせ</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">プライバシーポリシー</Link></li>
                <li><Link href="http://localhost:3000" className="hover:text-primary transition-colors">管理者ログイン</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} リトミック研究センター. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="mb-4 bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function AIFeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-background rounded-xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-all text-center group">
      <div className="inline-flex p-4 rounded-full bg-primary/5 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h4 className="text-xl font-bold mb-3">{title}</h4>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function RoadmapItem({ step, title, description, duration, align }: { step: string; title: string; description: string; duration: string; align: "left" | "right" }) {
  return (
    <div className={`flex flex-col md:flex-row items-center gap-8 ${align === "right" ? "md:flex-row-reverse" : ""}`}>
      <div className="flex-1 text-center md:text-left">
        <div className={`md:max-w-md ${align === "right" ? "ml-auto md:text-right" : ""}`}>
          <span className="text-primary font-bold text-sm tracking-wider uppercase mb-2 block">{duration}</span>
          <h4 className="text-2xl font-bold mb-3">
            <span className="text-primary mr-2">STEP {step}</span>
            {title}
          </h4>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      
      <div className="relative shrink-0 z-10">
        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg ring-4 ring-background">
          {step}
        </div>
      </div>
      
      <div className="flex-1"></div>
    </div>
  );
}

function InstructorCard({ name, role, description, image }: { name: string; role: string; description: string; image: string }) {
  return (
    <div className="flex items-start gap-4 p-6 bg-white dark:bg-card rounded-xl border shadow-sm max-w-md hover:shadow-md transition-shadow">
      <Avatar className="h-16 w-16 border-2 border-primary/10">
        <AvatarImage src={image} alt={name} />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <h4 className="font-bold text-lg">{name}</h4>
        <p className="text-primary text-sm font-medium mb-2">{role}</p>
        <p className="text-sm text-muted-foreground leading-snug">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  period,
  features,
  buttonText,
  buttonHref,
  highlighted = false,
  variant = "default",
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  highlighted?: boolean;
  variant?: "default" | "outline";
}) {
  return (
    <Card className={`flex flex-col h-full ${highlighted ? "border-primary shadow-xl scale-105 relative z-10" : "shadow-sm border-border/50"}`}>
      <CardHeader>
        {highlighted && (
          <Badge className="w-fit mb-4 bg-primary hover:bg-primary/90" variant="default">人気のプラン</Badge>
        )}
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="mb-8">
          <span className="text-4xl font-bold tracking-tight">{price}</span>
          <span className="text-muted-foreground ml-1 font-medium">{period}</span>
        </div>
        <ul className="space-y-4 mb-8 flex-1">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <div className={`mt-0.5 rounded-full p-1 ${highlighted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Check className="h-3 w-3" />
              </div>
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button asChild className="w-full text-white" size="lg" variant={highlighted ? "default" : "outline"}>
          <Link href={buttonHref}>{buttonText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ text, author, role, avatar }: { text: string; author: string; role: string; avatar: string }) {
  return (
    <Card className="border-none shadow-sm h-full flex flex-col">
      <CardContent className="pt-6 flex-1 flex flex-col">
        <Quote className="h-8 w-8 text-primary/20 mb-4" />
        <p className="text-muted-foreground mb-6 flex-1 italic relative z-10">{text}</p>
        <div className="flex items-center gap-4 mt-auto">
          <Avatar>
            <AvatarImage src={avatar} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-sm">{author}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

