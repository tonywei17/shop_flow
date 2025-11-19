export type Experience = {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: "体験" | "見学";
  schedule: string;
  duration: string;
  location: string;
  price: number;
  capacity: number;
  remainingSeats: number;
  tags: string[];
  heroImage: string;
  venueOptions: string[];
  instructor: string;
  highlights: string[];
  preparation: string[];
};

export const experiences: Experience[] = [
  {
    id: "exp-relax",
    title: "リトミック体験レッスン",
    summary: "初めての方向けにリトミックの楽しさを体感できる少人数レッスン",
    description:
      "楽器を使った表現遊びやリズムワークを通じて、リトミックの基礎を体感します。ご家族で参加できる温かいクラス構成です。",
    category: "体験",
    schedule: "2025年11月20日（木）14:00-15:30",
    duration: "90分",
    location: "東京本部スタジオ",
    price: 0,
    capacity: 18,
    remainingSeats: 4,
    tags: ["無料", "初心者歓迎", "親子参加"],
    heroImage: "https://images.unsplash.com/photo-1460058418905-d61a1b4a55fe?auto=format&fit=crop&w=1600&q=80",
    venueOptions: ["東京本部", "愛知県名古屋市", "大阪支部"],
    instructor: "佐藤 真由美",
    highlights: ["発達段階に合わせたカリキュラム", "ご家族で参加できるペアワーク", "受講後の個別相談"],
    preparation: ["動きやすい服装", "水分補給できるもの", "室内履きのシューズ"]
  },
  {
    id: "exp-online",
    title: "オンライン見学会",
    summary: "ご自宅から気軽に参加できるライブ配信型見学",
    description:
      "実際のクラスをライブ配信でご覧いただき、チャットで講師に質問できる見学会です。復習用アーカイブも視聴できます。",
    category: "見学",
    schedule: "2025年12月5日（金）13:00-14:00",
    duration: "60分",
    location: "オンライン（Zoom）",
    price: 0,
    capacity: 60,
    remainingSeats: 22,
    tags: ["オンライン", "ライブ視聴"],
    heroImage: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80",
    venueOptions: ["オンライン（Zoom）"],
    instructor: "松本 真紀",
    highlights: ["ライブQ&A", "録画アーカイブ付き", "オンライン相談"],
    preparation: ["インターネット環境", "Zoomアプリ", "メモできるノート"]
  },
  {
    id: "exp-osaka",
    title: "幼児クラス体験レッスン（大阪）",
    summary: "幼児向けクラスを大阪支部で体験できるコース",
    description:
      "幼児向けのステップアッププログラムを体験できます。保護者の方の参加も歓迎しています。",
    category: "体験",
    schedule: "2025年12月12日（金）10:00-11:30",
    duration: "90分",
    location: "大阪支部スタジオ",
    price: 2000,
    capacity: 20,
    remainingSeats: 7,
    tags: ["有料", "幼児向け"],
    heroImage: "https://images.unsplash.com/photo-1468338131760-a5fcbadc11e0?auto=format&fit=crop&w=1600&q=80",
    venueOptions: ["大阪支部", "京都教室", "神戸サテライト"],
    instructor: "田中 茜",
    highlights: ["教具の使い方紹介", "指導者との個別相談", "受講証明書発行"],
    preparation: ["動きやすい服装", "手拭きタオル", "筆記用具"]
  }
];
