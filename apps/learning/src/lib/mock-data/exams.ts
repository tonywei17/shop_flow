// Mock Exam Data
// TODO: Replace with real API calls

export interface Exam {
  id: string;
  name: string;
  productName?: string;
  qualification: string;
  description: string;
  examDate: string; // e.g. "2025-03-15"
  examTime?: string; // e.g. "10:00"
  applicationStart: string; // e.g. "2025-01-01"
  applicationEnd: string; // e.g. "2025-02-28"
  publishStartDate?: string;
  publishEndDate?: string;
  locationType: "対面" | "オンライン";
  location: string;
  capacity: number;
  fee: number;
  targetMembership: "free" | "premium";
  venueCode?: string;
  venueId?: string | null;
  requiredMaterials: string[];
  status: "募集受付中" | "締切済み" | "下書き";
  isActive: boolean;
  applied: number;
}

export const mockExams: Exam[] = [
  {
    id: "1",
    name: "初級指導者資格試験（2025年春期）",
    productName: "初級指導者資格試験 受験料",
    qualification: "初級指導者資格",
    description:
      "リトミック初級指導者資格を取得するための公式試験です。基礎理論と実技を総合的に評価します。",
    examDate: "2025-03-15",
    examTime: "10:00",
    applicationStart: "2024-12-01",
    applicationEnd: "2025-02-28",
    publishStartDate: "2024-11-15",
    publishEndDate: "2025-03-15",
    locationType: "対面",
    location: "東京本部",
    capacity: 80,
    fee: 12000,
    targetMembership: "free",
    venueCode: "1001",
    venueId: "tokyo-hq",
    requiredMaterials: ["リトミック基礎テキスト", "筆記用具"],
    status: "募集受付中",
    isActive: true,
    applied: 56,
  },
  {
    id: "2",
    name: "中級指導者資格試験（2025年春期）",
    productName: "中級指導者資格試験 受験料",
    qualification: "中級指導者資格",
    description:
      "幼児への実践的な指導力を測る中級レベルの資格試験です。実技試験と筆記試験を含みます。",
    examDate: "2025-03-22",
    examTime: "13:00",
    applicationStart: "2024-12-15",
    applicationEnd: "2025-03-05",
    publishStartDate: "2024-11-20",
    publishEndDate: "2025-03-22",
    locationType: "オンライン",
    location: "オンライン（Zoom）",
    capacity: 60,
    fee: 18000,
    targetMembership: "premium",
    venueCode: "9001",
    venueId: "online-zoom",
    requiredMaterials: ["中級テキスト", "受験票", "静かな受験環境"],
    status: "募集受付中",
    isActive: true,
    applied: 48,
  },
  {
    id: "3",
    name: "上級指導者資格試験（2024年冬期）",
    productName: "上級指導者資格試験 受験料",
    qualification: "上級指導者資格",
    description:
      "指導歴と高度な実践力を評価する上級レベルの資格試験です。ケーススタディと実技が中心となります。",
    examDate: "2024-12-08",
    examTime: "09:30",
    applicationStart: "2024-09-01",
    applicationEnd: "2024-11-10",
    publishStartDate: "2024-08-15",
    publishEndDate: "2024-12-08",
    locationType: "対面",
    location: "大阪支部",
    capacity: 40,
    fee: 24000,
    targetMembership: "premium",
    venueCode: "3001",
    venueId: "osaka-branch",
    requiredMaterials: ["上級テキスト", "指導記録", "受験票"],
    status: "締切済み",
    isActive: true,
    applied: 40,
  },
  {
    id: "4",
    name: "初級指導者資格追試（オンライン）",
    productName: "初級指導者資格追試 受験料",
    qualification: "初級指導者資格",
    description:
      "初級指導者資格試験の追試です。本試験を欠席または不合格となった方が対象です。",
    examDate: "2025-01-12",
    examTime: "19:00",
    applicationStart: "2024-11-20",
    applicationEnd: "2025-01-05",
    publishStartDate: "2024-11-10",
    publishEndDate: "2025-01-12",
    locationType: "オンライン",
    location: "オンライン（Zoom）",
    capacity: 100,
    fee: 8000,
    targetMembership: "free",
    venueCode: "9002",
    venueId: "online-zoom",
    requiredMaterials: ["初級テキスト", "受験票"],
    status: "下書き",
    isActive: false,
    applied: 32,
  },
];

export const getExams = async (): Promise<Exam[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockExams;
};

export const getExamById = async (id: string): Promise<Exam | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockExams.find((e) => e.id === id) || null;
};
