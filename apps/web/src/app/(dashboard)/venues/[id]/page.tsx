import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { notFound } from "next/navigation";

 type Venue = {
  id: string;
  name: string;
  code: string;
  type: "対面" | "オンライン";
  address: string;
  capacity: number;
  isActive: boolean;
};

 const venues: Venue[] = [
  {
    id: "tokyo-hq",
    name: "東京本部",
    code: "1001",
    type: "対面",
    address: "東京都千代田区丸の内1-1-1",
    capacity: 80,
    isActive: true,
  },
  {
    id: "aomori-hall",
    name: "青森市民ホール",
    code: "2111",
    type: "対面",
    address: "青森県青森市中央1-2-3",
    capacity: 120,
    isActive: true,
  },
  {
    id: "online-zoom",
    name: "オンライン（Zoom会場）",
    code: "9001",
    type: "オンライン",
    address: "ZoomミーティングURL",
    capacity: 500,
    isActive: true,
  },
];

 type VenueDetailPageProps = {
  params: {
    id: string;
  };
};

 export default function VenueDetailPage({ params }: VenueDetailPageProps) {
  const venue = venues.find((v) => v.id === params.id);

  if (!venue) {
    return notFound();
  }

  const isOnline = venue.type === "オンライン";
  const mapQuery = encodeURIComponent(venue.address);
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <div className="p-8">
      <DashboardHeader title="会場詳細" />

      <div className="mb-4 text-sm text-gray-600">
        <Link href="/venues" className="text-blue-600 hover:underline">
          会場一覧に戻る
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{venue.name}</h2>
            <dl className="space-y-3 text-sm text-gray-900">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">会場コード</dt>
                <dd>{venue.code}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">種別</dt>
                <dd>{venue.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">定員</dt>
                <dd>{venue.capacity || "-"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600 mb-1">
                  {venue.type === "対面" ? "住所" : "オンラインURL"}
                </dt>
                <dd className="break-words">{venue.address}</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="font-medium text-gray-600">ステータス</dt>
                <dd>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      venue.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {venue.isActive ? "有効" : "無効"}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              {isOnline ? "オンライン会場" : "Googleマップ"}
            </h3>
            {isOnline ? (
              <p className="text-sm text-gray-700">
                この会場はオンライン会場のため、地図は表示されません。
                上記のURLからミーティングに参加してください。
              </p>
            ) : (
              <div className="aspect-video w-full overflow-hidden rounded-lg border">
                <iframe
                  title={`${venue.name} の地図`}
                  src={mapSrc}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}
            {!isOnline && (
              <p className="mt-3 text-xs text-gray-500">
                表示される地図は Google マップの検索結果を埋め込んだものです。
                正確な位置は住所に基づきますが、目安としてご利用ください。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
