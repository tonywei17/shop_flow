import { Header } from "@/components/header";
import Link from "next/link";
import { Clock, Users, Star, Award, PlayCircle, Lock, CheckCircle } from "lucide-react";

// Mock course data - 实际应该从数据库获取
const getCourseData = (id: string) => {
  const courses: Record<string, any> = {
    "1": {
      id: "1",
      title: "リトミック基礎コース",
      description: "リトミックの基本理論と実践方法を学びます。音楽教育の基礎から、実際の指導テクニックまで、初心者でも分かりやすく解説します。",
      thumbnail: "https://placehold.co/1200x675/3b82f6/ffffff?text=Basic+Course",
      duration: "8時間",
      students: 245,
      rating: 4.8,
      price: 0,
      level: "初級",
      requiredMembership: "free",
      instructor: {
        name: "田中先生",
        title: "リトミック研究センター認定講師",
        avatar: "https://placehold.co/100x100/3b82f6/ffffff?text=T",
      },
      learningPoints: [
        "リトミックの基本理念と歴史",
        "音楽と動きの関係性",
        "年齢別の指導アプローチ",
        "実践的な教材の使い方",
      ],
      videos: [
        { id: "v1", title: "第1章：リトミックとは", duration: "15:30", isPreview: true, vimeoId: "123456789" },
        { id: "v2", title: "第2章：基本的な動き", duration: "20:15", isPreview: false, vimeoId: "123456790" },
        { id: "v3", title: "第3章：リズムの理解", duration: "18:45", isPreview: false, vimeoId: "123456791" },
        { id: "v4", title: "第4章：実践演習", duration: "25:00", isPreview: false, vimeoId: "123456792" },
      ],
    },
    "2": {
      id: "2",
      title: "リトミック指導法 中級",
      description: "年齢別の指導テクニックと実践演習を通じて、より高度な指導スキルを身につけます。",
      thumbnail: "https://placehold.co/1200x675/8b5cf6/ffffff?text=Intermediate",
      duration: "12時間",
      students: 189,
      rating: 4.9,
      price: 15800,
      level: "中級",
      requiredMembership: "premium",
      instructor: {
        name: "佐藤先生",
        title: "リトミック研究センター上級講師",
        avatar: "https://placehold.co/100x100/8b5cf6/ffffff?text=S",
      },
      learningPoints: [
        "3-5歳児への効果的な指導法",
        "グループレッスンの運営",
        "保護者とのコミュニケーション",
        "レッスンプランの作成",
      ],
      videos: [
        { id: "v1", title: "第1章：中級指導の基礎", duration: "22:30", isPreview: true, vimeoId: "223456789" },
        { id: "v2", title: "第2章：年齢別アプローチ", duration: "28:15", isPreview: false, vimeoId: "223456790" },
        { id: "v3", title: "第3章：グループ指導", duration: "25:45", isPreview: false, vimeoId: "223456791" },
        { id: "v4", title: "第4章：実践ケーススタディ", duration: "30:00", isPreview: false, vimeoId: "223456792" },
      ],
    },
  };
  
  return courses[id] || courses["1"];
};

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = getCourseData(params.id);
  const isPremium = course.requiredMembership === "premium";
  const isEnrolled = false; // 实际应该检查用户是否已购买

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {course.level}
                </span>
                {isPremium && (
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                    プレミアム
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl opacity-90 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{course.rating}</span>
                  <span className="opacity-75">({course.students}名が受講)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.students}名</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-medium">{course.instructor.name}</div>
                  <div className="text-sm opacity-75">{course.instructor.title}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-6 text-gray-900">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full rounded-lg mb-6"
              />
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2">
                  {course.price === 0 ? "無料" : `¥${course.price.toLocaleString()}`}
                </div>
                {course.price > 0 && (
                  <div className="text-sm text-gray-600">買い切り型</div>
                )}
              </div>

              {isEnrolled ? (
                <Link
                  href={`/courses/${course.id}/learn`}
                  className="block w-full bg-green-600 text-white text-center py-4 rounded-lg font-bold hover:bg-green-700 mb-3"
                >
                  学習を続ける
                </Link>
              ) : (
                <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 mb-3">
                  {course.price === 0 ? "無料で受講する" : "今すぐ購入"}
                </button>
              )}
              
              <div className="text-sm text-gray-600 text-center">
                30日間返金保証
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Points */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-2xl font-bold mb-4">このコースで学べること</h2>
              <ul className="space-y-3">
                {course.learningPoints.map((point: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-2xl font-bold mb-4">コース内容</h2>
              <div className="space-y-2">
                {course.videos.map((video: any, i: number) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-medium">{video.title}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {video.duration}
                          {video.isPreview && (
                            <span className="text-green-600 font-medium">プレビュー可能</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {video.isPreview ? (
                      <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <PlayCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">プレビュー</span>
                      </button>
                    ) : !isEnrolled ? (
                      <Lock className="h-5 w-5 text-gray-400" />
                    ) : (
                      <PlayCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-2xl font-bold mb-4">受講条件</h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  <span>
                    {isPremium ? "プレミアム会員" : "無料会員"}であること
                  </span>
                </li>
                {course.requiredQualification && (
                  <li className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-600" />
                    <span>必要資格: {course.requiredQualification}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-bold mb-4">講師について</h3>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <div className="font-bold">{course.instructor.name}</div>
                  <div className="text-sm text-gray-600">{course.instructor.title}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                リトミック教育歴15年。多くの指導者を育成してきた経験豊富な講師です。
              </p>
            </div>

            {/* Related Courses */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-bold mb-4">関連コース</h3>
              <div className="space-y-3">
                <Link href="/courses/2" className="block hover:bg-gray-50 p-3 rounded-lg border">
                  <div className="font-medium text-sm mb-1">リトミック指導法 中級</div>
                  <div className="text-xs text-gray-600">¥15,800</div>
                </Link>
                <Link href="/courses/3" className="block hover:bg-gray-50 p-3 rounded-lg border">
                  <div className="font-medium text-sm mb-1">リトミック教育学</div>
                  <div className="text-xs text-gray-600">¥12,800</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
