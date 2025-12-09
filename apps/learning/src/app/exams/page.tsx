'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Calendar, MapPin, Users, DollarSign, Award, CheckCircle } from 'lucide-react';
import { getExams, type Exam } from '@/lib/mock-data';
import { LoadingSpinner } from '@/components/loading/loading-spinner';
import { ErrorMessage } from '@/components/error/error-message';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const data = await getExams();
        // C端では公開中の試験のみ表示
        setExams(data.filter((exam) => exam.isActive));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner text="試験情報を読み込み中です..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">資格試験一覧</h1>
          <p className="text-muted-foreground">
            指導者資格試験の中から受験したい試験を選択してください
          </p>
        </div>

        {/* Filters */}
        <div className="bg-background p-4 rounded-lg border mb-8 flex flex-col sm:flex-row gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="全ての資格種別" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全ての資格種別</SelectItem>
              <SelectItem value="beginner">初級指導者資格</SelectItem>
              <SelectItem value="intermediate">中級指導者資格</SelectItem>
              <SelectItem value="advanced">上級指導者資格</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="全ての実施形式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全ての実施形式</SelectItem>
              <SelectItem value="offline">対面</SelectItem>
              <SelectItem value="online">オンライン</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="全ての価格" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全ての価格</SelectItem>
              <SelectItem value="free">無料</SelectItem>
              <SelectItem value="paid">有料</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Exams List */}
        <div className="space-y-4">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
          {exams.length === 0 && (
            <div className="bg-background rounded-lg border p-12 text-center text-muted-foreground">
              現在、公開中の試験はありません。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExamCard({ exam }: { exam: Exam }) {
  const isOnline = exam.locationType === 'オンライン';
  const isPremiumOnly = exam.targetMembership === 'premium';
  const isOpen = exam.status === '募集受付中';
  const isFull = exam.applied >= exam.capacity;
  const remaining = Math.max(exam.capacity - exam.applied, 0);

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <CardContent className="flex-1 p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              {exam.qualification}
            </Badge>
            {isPremiumOnly && (
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                プレミアム会員のみ
              </Badge>
            )}
            {isOnline && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                オンライン
              </Badge>
            )}
            <Badge 
              variant={isOpen ? "default" : "secondary"}
              className={`${
                exam.status === '募集受付中' ? "bg-green-600 hover:bg-green-700" : 
                exam.status === '締切済み' ? "bg-muted text-muted-foreground" : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {exam.status}
            </Badge>
          </div>

          <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            <Link href={`/exams/${exam.id}`} className="hover:underline">
              {exam.name}
            </Link>
          </h2>
          <p className="text-muted-foreground mb-4 line-clamp-2">{exam.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary/70" />
              <span>
                {exam.examDate}
                {exam.examTime && ` ${exam.examTime}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary/70" />
              <span>
                {exam.location}
                <span className="text-xs text-muted-foreground/70 ml-1">({exam.locationType})</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary/70" />
              <span>
                {exam.applied}/{exam.capacity}名
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded ml-2">残り {remaining}席</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary/70" />
              <span>{exam.fee === 0 ? '無料' : `¥${exam.fee.toLocaleString()}`}</span>
            </div>
          </div>
        </CardContent>

        <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l bg-muted/5 p-6 md:w-64 shrink-0">
          <div className="text-center md:text-right mb-4">
            <div className="text-3xl font-bold text-foreground">
              {exam.fee === 0 ? '無料' : `¥${exam.fee.toLocaleString()}`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              申込期間:<br/>{exam.applicationStart} 〜 {exam.applicationEnd}
            </div>
          </div>

          <Button 
            asChild 
            className="w-full" 
            size="lg"
            variant={!isOpen || isFull ? "secondary" : "default"}
            disabled={!isOpen || isFull}
          >
            <Link href={`/exams/${exam.id}`}>
              {!isOpen
                ? '募集は終了しました'
                : isFull
                ? '満席'
                : '詳細・申し込み'}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

