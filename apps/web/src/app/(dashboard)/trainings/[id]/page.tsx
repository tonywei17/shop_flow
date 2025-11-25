"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  UserCheck,
  UserX,
  Users,
  Video,
  XCircle,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";
import { getTrainingById, Training, trainingCategories } from "../../activities/data";

const mockParticipants: Record<string, Participant[]> = {
  "basic-1": [
    { id: "u-1", name: "山田太郎", email: "yamada@example.com", memberType: "premium", checkedIn: true, checkInTime: "2025-11-25 09:45" },
    { id: "u-2", name: "佐藤花子", email: "sato@example.com", memberType: "free", checkedIn: true, checkInTime: "2025-11-25 09:55" },
    { id: "u-3", name: "鈴木一郎", email: "suzuki@example.com", memberType: "premium", checkedIn: false, checkInTime: null },
  ],
  "basic-2": [
    { id: "u-4", name: "田中美咲", email: "tanaka@example.com", memberType: "free", checkedIn: false, checkInTime: null },
  ],
  "inst-1": [
    { id: "u-5", name: "伊藤真理", email: "ito@example.com", memberType: "premium", checkedIn: false, checkInTime: null },
  ],
  "inst-2": [
    { id: "u-6", name: "渡辺直樹", email: "watanabe@example.com", memberType: "premium", checkedIn: true, checkInTime: "2025-12-18 12:40" },
    { id: "u-7", name: "小林綾", email: "kobayashi@example.com", memberType: "free", checkedIn: true, checkInTime: "2025-12-18 12:50" },
  ],
};

export default function TrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trainingId = params.id as string;

  const { training, course } = useMemo(() => getTrainingById(trainingId), [trainingId]);
  const [participants, setParticipants] = useState<Participant[]>(
    mockParticipants[trainingId] ?? [
      {
        id: "placeholder",
        name: "参加者A",
        email: "member@example.com",
        memberType: "free",
        checkedIn: false,
        checkInTime: null,
      },
    ],
  );

  if (!training || !course) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">研修が見つかりません</h2>
          <button onClick={() => router.push("/trainings")} className="mt-4 text-blue-600 hover:text-blue-700">
            研修一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const category = trainingCategories.find((item) => item.id === training.categoryId);
  const checkedInCount = participants.filter((p) => p.checkedIn).length;
  const checkInRate = participants.length > 0 ? Math.round((checkedInCount / participants.length) * 100) : 0;

  const handleCheckIn = (participantId: string) => {
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.id === participantId
          ? { ...participant, checkedIn: true, checkInTime: new Date().toLocaleString("ja-JP") }
          : participant,
      ),
    );
  };

  const handleCheckOut = (participantId: string) => {
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.id === participantId ? { ...participant, checkedIn: false, checkInTime: null } : participant,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={training.title}
        actions={
          <button
            onClick={() => router.push("/trainings")}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </button>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{course.name}</span>
            {category && (
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${category.colorClass}`}>{category.name}</span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                training.status === "公開中" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {training.status}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {training.requiredMembership === "premium" ? "プレミアム会員限定" : "全会員"}
            </span>
          </div>
          <p className="mt-4 text-muted-foreground">コース: {course.description}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoRow icon={<Calendar className="h-5 w-5 text-muted-foreground" />} label="実施日時" value={training.date} />
            <InfoRow icon={<Clock className="h-5 w-5 text-muted-foreground" />} label="所要時間" value="90分想定" />
            <InfoRow icon={<MapPin className="h-5 w-5 text-muted-foreground" />} label="場所" value={training.location} />
            <InfoRow
              icon={<Users className="h-5 w-5 text-muted-foreground" />}
              label="定員"
              value={`${training.enrolled}/${training.capacity}名`}
            />
          </div>

          {training.videos.length > 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-border p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Video className="h-4 w-4 text-primary" />
                付属動画 ({training.videos.length})
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {training.videos.map((video) => (
                  <div key={video.id} className="rounded-lg border border-border bg-muted/50">
                    <div className="relative h-32 overflow-hidden rounded-t-lg">
                      <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
                      <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">{video.duration}</span>
                    </div>
                    <div className="space-y-1 p-3 text-sm">
                      <p className="font-semibold text-foreground">{video.title}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{video.views}回再生</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            video.status === "公開中" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {video.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground">出席状況</h3>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">出席率</span>
              <span className="text-3xl font-bold text-foreground">{checkInRate}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${checkInRate}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-primary">
                  <UserCheck className="h-4 w-4" />
                  <span className="text-2xl font-bold">{checkedInCount}</span>
                </div>
                <p className="text-xs text-primary">出席</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <UserX className="h-4 w-4" />
                  <span className="text-2xl font-bold">{participants.length - checkedInCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">未出席</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">参加者リスト</h3>
          <p className="text-sm text-muted-foreground">チェックイン操作で出席状況を更新できます</p>
        </div>
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="p-4 text-left text-xs font-medium text-muted-foreground">名前</th>
              <th className="p-4 text-left text-xs font-medium text-muted-foreground">メール</th>
              <th className="p-4 text-left text-xs font-medium text-muted-foreground">会員タイプ</th>
              <th className="p-4 text-left text-xs font-medium text-muted-foreground">出席状況</th>
              <th className="p-4 text-left text-xs font-medium text-muted-foreground">チェックイン時刻</th>
              <th className="p-4 text-left text-xs font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr key={participant.id} className="border-b border-border last:border-b-0 hover:bg-muted/60">
                <td className="p-4 text-sm font-semibold text-foreground">{participant.name}</td>
                <td className="p-4 text-sm text-muted-foreground">{participant.email}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      participant.memberType === "premium" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {participant.memberType === "premium" ? "プレミアム" : "無料"}
                  </span>
                </td>
                <td className="p-4">
                  {participant.checkedIn ? (
                    <div className="flex items-center gap-2 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">出席</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">未出席</span>
                    </div>
                  )}
                </td>
                <td className="p-4 text-sm text-muted-foreground">{participant.checkInTime ?? "-"}</td>
                <td className="p-4">
                  {participant.checkedIn ? (
                    <button
                      onClick={() => handleCheckOut(participant.id)}
                      className="flex items-center gap-2 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4" />
                      取消
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(participant.id)}
                      className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      チェックイン
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type Participant = {
  id: string;
  name: string;
  email: string;
  memberType: "free" | "premium";
  checkedIn: boolean;
  checkInTime: string | null;
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
    <div className="rounded-full bg-muted p-2">{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  </div>
);
