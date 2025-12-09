import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, Users, ChevronRight } from "lucide-react";

import { Header } from "@/components/header";
import { experiences } from "@/data/experiences";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categoryFilters = [
  { value: "all", label: "すべて" },
  { value: "体験", label: "体験" },
  { value: "見学", label: "見学" },
];

export default function ExperiencesPage() {
  const filtered = experiences; // 追加の絞り込みが必要になったら state を追加

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <section className="bg-gradient-to-b from-primary/5 to-background py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">体験・見学</Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">まずは体験・見学からスタート</h1>
            <p className="text-lg text-muted-foreground mb-8">
              リトミックのクラスや講師陣の雰囲気を実際に体験し、最適なプログラムを見つけましょう。<br className="hidden sm:inline" />オンライン参加もご用意しています。
            </p>
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={filter.value === "all" ? "default" : "outline"}
                  size="sm"
                  className={filter.value === "all" ? "" : "hover:text-primary hover:bg-primary/5"}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 space-y-6">
        {filtered.map((experience) => (
          <Card key={experience.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row">
              <div className="relative h-56 w-full lg:h-auto lg:w-96 shrink-0">
                <Image
                  src={experience.heroImage}
                  alt={experience.title}
                  width={640}
                  height={360}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col flex-1 p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge 
                    className={experience.category === "体験" ? "bg-primary/10 text-primary hover:bg-primary/20 border-none" : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-none"}
                  >
                    {experience.category}
                  </Badge>
                  {experience.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <h2 className="text-2xl font-bold mb-3">
                  <Link href={`/experiences/${experience.id}`} className="hover:text-primary transition-colors">
                    {experience.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground mb-6 line-clamp-2">{experience.summary}</p>
                
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 mt-auto">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {experience.schedule}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {experience.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    {experience.duration}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    残り{experience.remainingSeats}席 / 定員{experience.capacity}名
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 border-t pt-6 mt-6">
                  <p className="text-2xl font-bold text-primary">
                    {experience.price === 0 ? "無料" : `¥${experience.price.toLocaleString()}`}
                  </p>
                  <div className="sm:ml-auto flex gap-3 w-full sm:w-auto">
                    <Button variant="outline" asChild className="flex-1 sm:flex-none">
                      <Link href={`/experiences/${experience.id}`}>
                        詳細を見る
                      </Link>
                    </Button>
                    <Button className="flex-1 sm:flex-none text-white" asChild>
                      <Link href={`/experiences/${experience.id}/apply`}>
                        申し込む <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

