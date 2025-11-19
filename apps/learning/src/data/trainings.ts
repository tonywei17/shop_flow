export type Training = {
  id: string;
  title: string;
  summary: string;
  category: string;
  courseName: string;
  courseShortName: string;
  productName: string;
  areaLabel: string;
  branch: string;
  schedule: string;
  duration: string;
  location: string;
  capacity: number;
  remainingSeats: number;
  membership: "free" | "premium";
  requiredQualification?: string;
  entryFee: number;
  annualFee: number;
  tuitionFee: number;
  materialFee: number;
  venues: string[];
  instructor: string;
  highlights: string[];
  preparation: string[];
  tags: string[];
  heroImage: string;
};

export const trainings: Training[] = [
  {
    id: "training-basic",
    title: "幼児指導法ワークショップ",
    summary: "3-5歳児に向けた基礎指導法を1日で学ぶ集中研修",
    category: "基礎研修",
    courseName: "【月例研修会】園児のためのリトミック 初級",
    courseShortName: "園児初級",
    productName: "【月例】園児 初級 受講料",
    areaLabel: "関西エリア（大阪・京都・兵庫）",
    branch: "大阪第一支局",
    schedule: "2025年11月25日（火）10:00-17:00",
    duration: "6時間（休憩含む）",
    location: "大阪支部ホール",
    capacity: 32,
    remainingSeats: 8,
    membership: "premium",
    entryFee: 110000,
    annualFee: 7700,
    tuitionFee: 38500,
    materialFee: 5720,
    venues: ["大阪支部ホール", "京都サテライト", "オンライン(Zoom)"],
    instructor: "佐藤 真由美",
    highlights: ["指導デモとワークショップ", "教材の使い方レクチャー", "受講後の個別面談"],
    preparation: ["動きやすい服装", "筆記用具", "室内履き"],
    tags: ["集合研修", "1日集中"],
    heroImage: "https://images.unsplash.com/photo-1454922915609-78549ad709bb?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "training-advanced",
    title: "中級指導者認定研修",
    summary: "ケーススタディと実技で中級認定を目指す必修研修",
    category: "資格対策",
    courseName: "【資格研修】指導者アップデート 中級",
    courseShortName: "中級資格",
    productName: "【資格】中級認定 受講料",
    areaLabel: "首都圏エリア（東京・神奈川・千葉）",
    branch: "宮城第一支局",
    schedule: "2025年12月10日（水）09:00-18:00",
    duration: "8時間",
    location: "東京本部ホールA",
    capacity: 28,
    remainingSeats: 5,
    membership: "premium",
    requiredQualification: "初級指導者資格",
    entryFee: 132000,
    annualFee: 8800,
    tuitionFee: 57200,
    materialFee: 9680,
    venues: ["東京本部ホールA", "横浜サテライト", "仙台会場"],
    instructor: "田中 茜",
    highlights: ["ケーススタディ演習", "個別フィードバック", "資格試験ガイダンス"],
    preparation: ["上級教材セット", "筆記用具", "軽食"],
    tags: ["資格対策", "ケーススタディ"],
    heroImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "training-online",
    title: "オンライン指導スキル研修",
    summary: "ライブ配信で学ぶオンライン指導テクニック",
    category: "指導者アップデート",
    courseName: "【オンライン研修】オンライン指導スキル",
    courseShortName: "オンライン",
    productName: "【オンライン】指導スキル 受講料",
    areaLabel: "オンライン",
    branch: "リモート統括",
    schedule: "2025年12月18日（木）13:00-16:00",
    duration: "3時間",
    location: "オンライン (Zoom)",
    capacity: 100,
    remainingSeats: 40,
    membership: "free",
    entryFee: 0,
    annualFee: 0,
    tuitionFee: 0,
    materialFee: 0,
    venues: ["オンライン (Zoom)", "オンデマンド録画"],
    instructor: "松本 真紀",
    highlights: ["Zoom運営ノウハウ", "配信ツールの実践", "録画アーカイブ付き"],
    preparation: ["PCまたはタブレット", "安定したネット回線", "ヘッドセット"],
    tags: ["オンライン", "無料"],
    heroImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  },
];
