'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Header } from "@/components/header";
import { Clock, Users, Star, Lock } from "lucide-react";
import { getCourses, type Course } from '@/lib/mock-data';
import { LoadingSpinner } from '@/components/loading/loading-spinner';
import { CourseCardSkeleton } from '@/components/loading/skeleton';
import { ErrorMessage } from '@/components/error/error-message';

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
      <div className="min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">コース一覧</h1>
          <p className="text-muted-foreground">
            あなたのレベルに合わせた学習コースを選択してください
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg border mb-8">
          <div className="flex flex-wrap gap-4">
            <select className="border rounded-md px-4 py-2">
              <option>全てのレベル</option>
              <option>初級</option>
              <option>中級</option>
              <option>上級</option>
            </select>
            <select className="border rounded-md px-4 py-2">
              <option>全ての価格</option>
              <option>無料</option>
              <option>有料</option>
            </select>
            <select className="border rounded-md px-4 py-2">
              <option>並び替え: 人気順</option>
              <option>並び替え: 新着順</option>
              <option>並び替え: 評価順</option>
            </select>
          </div>
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
    <Link href={`/courses/${course.id}`} className="group">
      <div className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
          />
          {isPremium && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
              プレミアム
            </div>
          )}
          {course.price === 0 && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              無料
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {course.level}
            </span>
            {hasQualificationRequirement && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded flex items-center gap-1">
                <Lock className="h-3 w-3" />
                資格必要
              </span>
            )}
          </div>
          
          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.description}
          </p>

          {hasQualificationRequirement && (
            <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              必要資格: {course.requiredQualification}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.students}人
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {course.rating}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {course.price === 0 ? "無料" : `¥${course.price.toLocaleString()}`}
            </span>
            <span className="text-primary font-medium group-hover:underline">
              詳細を見る →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
