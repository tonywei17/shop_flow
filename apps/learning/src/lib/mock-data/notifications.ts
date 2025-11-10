// Mock Notification Data
// TODO: Replace with real API calls

export interface Notification {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  read: boolean;
  type: 'info' | 'important' | 'warning' | 'success';
}

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "新コース公開のお知らせ",
    message: "リトミック上級指導者養成コースが公開されました。ぜひご確認ください。",
    sentAt: "2025-11-10 14:30",
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "中級資格試験のご案内",
    message: "12月の中級資格試験の申し込みを開始しました。締切は11月30日です。",
    sentAt: "2025-11-09 10:00",
    read: false,
    type: "important",
  },
  {
    id: "3",
    title: "システムメンテナンスのお知らせ",
    message: "11月15日 2:00-4:00にシステムメンテナンスを実施します。この間、サービスをご利用いただけません。",
    sentAt: "2025-11-08 16:00",
    read: true,
    type: "warning",
  },
  {
    id: "4",
    title: "コース完了おめでとうございます！",
    message: "「リトミック基礎コース」を完了しました。修了証明書をダウンロードできます。",
    sentAt: "2025-11-07 09:15",
    read: true,
    type: "success",
  },
  {
    id: "5",
    title: "活動申し込み受付完了",
    message: "「幼児指導法ワークショップ」の申し込みを受け付けました。開催日の3日前にリマインドメールをお送りします。",
    sentAt: "2025-11-06 18:20",
    read: true,
    type: "info",
  },
];

export const getNotifications = async (): Promise<Notification[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockNotifications;
};

export const getUnreadCount = async (): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockNotifications.filter(n => !n.read).length;
};
