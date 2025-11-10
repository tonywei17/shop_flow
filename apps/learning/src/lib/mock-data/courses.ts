// Mock Course Data
// TODO: Replace with real API calls

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  level: string;
  requiredMembership: 'free' | 'premium';
  requiredQualification?: string;
}

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "リトミック基礎コース",
    description: "リトミックの基本理論と実践方法を学びます",
    thumbnail: "https://placehold.co/400x225/3b82f6/ffffff?text=Basic+Course",
    duration: "8時間",
    students: 245,
    rating: 4.8,
    price: 0,
    level: "初級",
    requiredMembership: "free",
  },
  {
    id: "2",
    title: "リトミック指導法 中級",
    description: "年齢別の指導テクニックと実践演習",
    thumbnail: "https://placehold.co/400x225/8b5cf6/ffffff?text=Intermediate",
    duration: "12時間",
    students: 189,
    rating: 4.9,
    price: 15800,
    level: "中級",
    requiredMembership: "premium",
  },
  {
    id: "3",
    title: "リトミック教育学",
    description: "教育心理学とリトミックの融合",
    thumbnail: "https://placehold.co/400x225/ec4899/ffffff?text=Education",
    duration: "10時間",
    students: 156,
    rating: 4.7,
    price: 12800,
    level: "中級",
    requiredMembership: "premium",
  },
  {
    id: "4",
    title: "リトミック上級指導者養成",
    description: "プロフェッショナル指導者を目指す",
    thumbnail: "https://placehold.co/400x225/f59e0b/ffffff?text=Advanced",
    duration: "15時間",
    students: 98,
    rating: 4.9,
    price: 28000,
    level: "上級",
    requiredMembership: "premium",
  },
];

// Simulated API functions
export const getCourses = async (): Promise<Course[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCourses;
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockCourses.find(c => c.id === id) || null;
};
