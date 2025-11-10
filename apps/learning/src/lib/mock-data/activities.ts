// Mock Activity Data
// TODO: Replace with real API calls

export interface Activity {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  capacity: number;
  enrolled: number;
  price: number;
  requiredMembership: 'free' | 'premium';
}

export const mockActivities: Activity[] = [
  {
    id: "1",
    title: "リトミック体験会（無料）",
    type: "体験",
    date: "2025-11-20 14:00-16:00",
    location: "東京本部",
    capacity: 20,
    enrolled: 15,
    price: 0,
    requiredMembership: "free",
  },
  {
    id: "2",
    title: "幼児指導法ワークショップ",
    type: "研修",
    date: "2025-11-25 10:00-17:00",
    location: "大阪支部",
    capacity: 30,
    enrolled: 22,
    price: 8000,
    requiredMembership: "premium",
  },
  {
    id: "3",
    title: "リトミック見学会",
    type: "見学",
    date: "2025-12-05 13:00-15:00",
    location: "オンライン",
    capacity: 50,
    enrolled: 35,
    price: 0,
    requiredMembership: "free",
  },
  {
    id: "4",
    title: "中級指導者認定研修",
    type: "研修",
    date: "2025-12-10 09:00-18:00",
    location: "東京本部",
    capacity: 25,
    enrolled: 18,
    price: 15000,
    requiredMembership: "premium",
  },
];

export const getActivities = async (): Promise<Activity[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockActivities;
};

export const getActivityById = async (id: string): Promise<Activity | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockActivities.find(a => a.id === id) || null;
};
