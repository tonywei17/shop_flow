import Link from "next/link";
import { BookOpen, Award, Users, Video } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">リトミック研究センター</h1>
              <p className="text-sm text-muted-foreground">オンライン学習プラットフォーム</p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/courses" className="text-sm hover:text-primary">
              コース一覧
            </Link>
            <Link href="/activities" className="text-sm hover:text-primary">
              活動・研修
            </Link>
            <Link href="/auth/login" className="text-sm hover:text-primary">
              ログイン
            </Link>
            <Link
              href="/auth/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
            >
              無料登録
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            リトミック指導者への道を<br />オンラインで学ぶ
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            体験活動から資格取得まで、あなたの学びをサポートします
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-medium hover:opacity-90"
            >
              無料で始める
            </Link>
            <Link
              href="/courses"
              className="border border-primary text-primary px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary/5"
            >
              コースを見る
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">プラットフォームの特徴</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Video className="h-12 w-12 text-primary" />}
              title="オンライン講座"
              description="いつでもどこでも学べる高品質な動画コンテンツ"
            />
            <FeatureCard
              icon={<Users className="h-12 w-12 text-primary" />}
              title="体験・見学活動"
              description="実践的な体験活動で理解を深める"
            />
            <FeatureCard
              icon={<Award className="h-12 w-12 text-primary" />}
              title="資格取得サポート"
              description="段階的な資格取得プログラム"
            />
            <FeatureCard
              icon={<BookOpen className="h-12 w-12 text-primary" />}
              title="充実した教材"
              description="実践に役立つ豊富な学習リソース"
            />
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">会員プラン</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              title="無料会員"
              price="¥0"
              period="/月"
              features={[
                "基礎コンテンツへのアクセス",
                "無料体験活動への参加",
                "コミュニティフォーラム",
              ]}
              buttonText="無料登録"
              buttonHref="/auth/register"
            />
            <PricingCard
              title="プレミアム会員"
              price="¥9,800"
              period="/月"
              features={[
                "全コースへのアクセス",
                "全活動への参加資格",
                "資格試験の受験資格",
                "個別サポート",
                "修了証明書の発行",
              ]}
              buttonText="プレミアムに登録"
              buttonHref="/membership"
              highlighted
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">リトミック研究センター</h4>
              <p className="text-sm text-muted-foreground">
                認定NPO法人リトミック研究センター公式オンライン学習プラットフォーム
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">学習</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/courses" className="hover:text-primary">コース一覧</Link></li>
                <li><Link href="/activities" className="hover:text-primary">活動・研修</Link></li>
                <li><Link href="/qualifications" className="hover:text-primary">資格について</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">サポート</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-primary">ヘルプセンター</Link></li>
                <li><Link href="/contact" className="hover:text-primary">お問い合わせ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">管理者</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="http://localhost:3000" className="hover:text-primary">管理画面</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 リトミック研究センター. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
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
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  highlighted?: boolean;
}) {
  return (
    <div className={`bg-white p-8 rounded-lg border-2 ${highlighted ? "border-primary shadow-xl scale-105" : "border-gray-200"}`}>
      <h4 className="text-2xl font-bold mb-2">{title}</h4>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <svg className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={buttonHref}
        className={`block text-center px-6 py-3 rounded-lg font-medium ${
          highlighted
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "border border-primary text-primary hover:bg-primary/5"
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
}
