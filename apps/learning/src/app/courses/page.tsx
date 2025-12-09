"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/header";
import { Clock, Users, Star, Lock } from "lucide-react";
import { getCourses, type Course } from '@/lib/mock-data';
import { LoadingSpinner } from '@/components/loading/loading-spinner';
import { CourseCardSkeleton } from '@/components/loading/skeleton';
import { ErrorMessage } from '@/components/error/error-message';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
          <LoadingSpinner />
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">コース一覧</h1>
          <p className="text-muted-foreground">
            あなたのレベルに合わせた学習コースを選択してください
          </p>
        </div>

        {/* Filters */}
        <div className="bg-background p-4 rounded-lg border mb-8 flex flex-col sm:flex-row gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="全てのレベル" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全てのレベル</SelectItem>
              <SelectItem value="beginner">初級</SelectItem>
              <SelectItem value="intermediate">中級</SelectItem>
              <SelectItem value="advanced">上級</SelectItem>
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
          
          <Select defaultValue="popular">
            <SelectTrigger className="w-full sm:w-[180px] ml-auto">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">人気順</SelectItem>
              <SelectItem value="newest">新着順</SelectItem>
              <SelectItem value="rating">評価順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const isPremium = course.requiredMembership === "premium";
  const hasQualificationRequirement = !!course.requiredQualification;

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 h-full group">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          width={640}
          height={360}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {isPremium && (
            <Badge variant="default" className="bg-primary/90 hover:bg-primary">プレミアム</Badge>
          )}
          {course.price === 0 && (
            <Badge variant="secondary" className="bg-green-500/90 text-white hover:bg-green-500">無料</Badge>
          )}
        </div>
      </div>
      
      <CardContent className="flex-1 p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            {course.level}
          </Badge>
          {hasQualificationRequirement && (
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              資格必要
            </Badge>
          )}
        </div>
        
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/courses/${course.id}`}>
            {course.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {course.description}
        </p>

        {hasQualificationRequirement && (
          <p className="text-xs text-amber-600 mb-4 flex items-center gap-1 bg-amber-50/50 p-2 rounded">
            <Lock className="h-3 w-3" />
            必要資格: {course.requiredQualification}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.students}人
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {course.rating}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex items-center justify-between border-t bg-muted/10 mt-auto">
        <div className="pt-4">
          <span className="text-xl font-bold">
            {course.price === 0 ? "無料" : `¥${course.price.toLocaleString()}`}
          </span>
        </div>
        <div className="pt-4">
          <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
            <Link href={`/courses/${course.id}`}>
              詳細を見る <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Add ChevronRight icon component just in case it's not imported globally
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}

