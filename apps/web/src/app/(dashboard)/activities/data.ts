export type TrainingVideo = {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  views: number;
  status: "公開中" | "下書き";
  requiredMembership: "free" | "premium";
  uploadDate: string;
};

export type Training = {
  id: string;
  title: string;
  categoryId: string;
  date: string;
  location: string;
  capacity: number;
  enrolled: number;
  price: number;
  status: "公開中" | "下書き" | "終了";
  requiredMembership: "free" | "premium";
  videos: TrainingVideo[];
};

export type TrainingCourse = {
  id: string;
  name: string;
  branch: string;
  description: string;
  periodLabel: string;
  status: "受付中" | "準備中" | "終了";
  trainings: Training[];
};

export type TrainingCategory = {
  id: string;
  name: string;
  description: string;
  colorClass: string;
};

export const trainingCategories: TrainingCategory[] = [
  { id: "basic", name: "基礎研修", description: "入門者向け", colorClass: "bg-indigo-100 text-indigo-700" },
  { id: "instructor", name: "指導者向け", description: "指導スキル強化", colorClass: "bg-purple-100 text-purple-700" },
  { id: "certification", name: "資格対策", description: "資格取得サポート", colorClass: "bg-amber-100 text-amber-700" },
];

export const trainingCourses: TrainingCourse[] = [
  {
    id: "course-basic",
    name: "基礎指導者コース",
    branch: "東京本部",
    description: "未経験者から指導者デビューまでの導入研修セット",
    periodLabel: "2025年5月期",
    status: "受付中",
    trainings: [
      {
        id: "basic-1",
        title: "幼児指導法ワークショップ",
        categoryId: "basic",
        date: "2025-11-25 10:00",
        location: "東京本部",
        capacity: 30,
        enrolled: 22,
        price: 8800,
        status: "公開中",
        requiredMembership: "premium",
        videos: [
          {
            id: "vid-basic-1",
            title: "導入ステップ講義",
            duration: "12:45",
            thumbnail: "https://placehold.co/320x180/22c55e/ffffff?text=Video",
            views: 312,
            status: "公開中",
            requiredMembership: "premium",
            uploadDate: "2025-10-02",
          },
        ],
      },
      {
        id: "basic-2",
        title: "基礎スキル集中講座",
        categoryId: "basic",
        date: "2025-12-08 09:30",
        location: "大阪支部",
        capacity: 24,
        enrolled: 17,
        price: 6400,
        status: "公開中",
        requiredMembership: "free",
        videos: [],
      },
    ],
  },
  {
    id: "course-instructor",
    name: "指導者アップデートコース",
    branch: "大阪支部",
    description: "現役指導者のスキルアップ/資格維持",
    periodLabel: "2025年6月期",
    status: "受付中",
    trainings: [
      {
        id: "inst-1",
        title: "中級指導者認定研修",
        categoryId: "instructor",
        date: "2025-12-10 09:00",
        location: "大阪支部",
        capacity: 25,
        enrolled: 18,
        price: 15000,
        status: "下書き",
        requiredMembership: "premium",
        videos: [
          {
            id: "vid-inst-1",
            title: "ケーススタディ：上級指導",
            duration: "18:30",
            thumbnail: "https://placehold.co/320x180/0f172a/ffffff?text=Video",
            views: 88,
            status: "下書き",
            requiredMembership: "premium",
            uploadDate: "2025-10-10",
          },
        ],
      },
      {
        id: "inst-2",
        title: "オンライン指導スキル研修",
        categoryId: "instructor",
        date: "2025-12-18 13:00",
        location: "オンライン",
        capacity: 80,
        enrolled: 54,
        price: 0,
        status: "公開中",
        requiredMembership: "free",
        videos: [
          {
            id: "vid-inst-2",
            title: "Zoom運営マニュアル",
            duration: "09:55",
            thumbnail: "https://placehold.co/320x180/2563eb/ffffff?text=Video",
            views: 152,
            status: "公開中",
            requiredMembership: "free",
            uploadDate: "2025-09-28",
          },
        ],
      },
    ],
  },
  {
    id: "course-cert",
    name: "資格対策コース",
    branch: "名古屋支部",
    description: "資格試験に特化した短期集中プラン",
    periodLabel: "2025年7月期",
    status: "準備中",
    trainings: [
      {
        id: "cert-1",
        title: "初級資格試験模擬対策",
        categoryId: "certification",
        date: "2025-12-20 10:00",
        location: "名古屋支部",
        capacity: 40,
        enrolled: 0,
        price: 9800,
        status: "下書き",
        requiredMembership: "premium",
        videos: [],
      },
    ],
  },
];

export const flattenTrainings = trainingCourses.flatMap((course) => course.trainings);

export const getTrainingById = (trainingId: string) => {
  for (const course of trainingCourses) {
    const training = course.trainings.find((item) => item.id === trainingId);
    if (training) {
      return { training, course };
    }
  }
  return { training: undefined, course: undefined };
};
