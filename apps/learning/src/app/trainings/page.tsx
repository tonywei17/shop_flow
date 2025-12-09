import Link from "next/link";
import { Calendar, MapPin, Users, Award, ChevronRight } from "lucide-react";

import { Header } from "@/components/header";
import { trainings } from "@/data/trainings";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TrainingsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <section className="bg-gradient-to-b from-primary/5 to-background py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">研修プログラム</Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">指導者として成長できる研修を選ぶ</h1>
            <p className="text-lg text-muted-foreground">
              指導力向上や資格取得に向けた集合研修・オンライン研修を提供しています。<br className="hidden sm:inline" />レベルや目的に応じて最適なプログラムをお選びください。
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-6 px-4 py-10">
        {trainings.map((training) => {
          const totalFee = training.entryFee + training.annualFee + training.tuitionFee + training.materialFee;
          return (
            <Card key={training.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start p-6 gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                      {training.category}
                    </Badge>
                    <Badge variant="outline">{training.areaLabel}</Badge>
                    <Badge variant="outline">{training.branch}</Badge>
                    {training.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="font-normal text-muted-foreground bg-muted/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      <Link href={`/trainings/${training.id}`} className="hover:text-primary transition-colors">
                        {training.title}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground">{training.summary}</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">{training.courseName}</p>
                  </div>

                  {training.requiredQualification && (
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 text-sm rounded-md border border-amber-100 font-medium">
                      <Award className="h-4 w-4 text-amber-600" />
                      必要資格: {training.requiredQualification}
                    </div>
                  )}

                  <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 pt-2">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {training.schedule}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {training.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      定員{training.capacity}名（残り{training.remainingSeats}席）
                    </span>
                    <span className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      {training.membership === "premium" ? "プレミアム会員" : "全会員"}
                    </span>
                  </div>
                </div>

                <div className="flex w-full flex-col justify-between gap-6 lg:w-72 lg:border-l lg:pl-6 lg:ml-2 pt-4 lg:pt-0 border-t lg:border-t-0">
                  <div className="lg:text-right">
                    <p className="text-sm text-muted-foreground mb-1">総額</p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">
                      {totalFee === 0 ? "無料" : `¥${totalFee.toLocaleString()}`}
                    </p>
                    {totalFee > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        入会金 {`¥${training.entryFee.toLocaleString()}`} / 受講料 {`¥${training.tuitionFee.toLocaleString()}`}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/trainings/${training.id}`}>
                        詳細を見る
                      </Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href={`/trainings/${training.id}/apply`}>
                        申し込む <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

