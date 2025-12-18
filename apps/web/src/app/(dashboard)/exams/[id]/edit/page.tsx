"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

type ExamLevel = {
  id: string;
  name: string;
};

type EditExamFormData = {
  name: string;
  productName: string;
  qualification: string;
  description: string;
  examDate: string;
  examTime: string;
  applicationStart: string;
  applicationEnd: string;
  publishStartDate: string;
  publishEndDate: string;
  locationType: "対面" | "オンライン";
  location: string;
  capacity: string;
  fee: string;
  targetMembership: "free" | "premium";
  venueCode: string;
  requiredMaterials: string[];
  isActive: boolean;
};

const initialExamLevels: ExamLevel[] = [
  { id: "beginner", name: "初級" },
  { id: "intermediate", name: "中級" },
  { id: "advanced", name: "上級" },
];

const exams = [
  {
    id: "1",
    name: "初級指導者資格試験（2025年春期）",
    qualification: "初級指導者資格",
    date: "2025-03-15 10:00",
    location: "東京本部",
    mode: "対面",
    fee: 12000,
    capacity: 80,
    applied: 56,
    status: "募集受付中",
  },
  {
    id: "2",
    name: "中級指導者資格試験（2025年春期）",
    qualification: "中級指導者資格",
    date: "2025-03-22 13:00",
    location: "オンライン",
    mode: "オンライン",
    fee: 18000,
    capacity: 60,
    applied: 48,
    status: "募集受付中",
  },
  {
    id: "3",
    name: "上級指導者資格試験（2024年冬期）",
    qualification: "上級指導者資格",
    date: "2024-12-08 09:30",
    location: "大阪支部",
    mode: "対面",
    fee: 24000,
    capacity: 40,
    applied: 40,
    status: "締切済み",
  },
  {
    id: "4",
    name: "初級指導者資格追試（オンライン）",
    qualification: "初級指導者資格",
    date: "2025-01-12 19:00",
    location: "オンライン",
    mode: "オンライン",
    fee: 8000,
    capacity: 100,
    applied: 32,
    status: "下書き",
  },
];

function mapQualificationLabelToLevelId(label: string): string {
  if (label.includes("初級")) return "beginner";
  if (label.includes("中級")) return "intermediate";
  if (label.includes("上級")) return "advanced";
  return initialExamLevels[0]?.id ?? "beginner";
}

function getInitialFormData(examId: string): EditExamFormData {
  const exam = exams.find((e) => e.id === examId);
  const base: EditExamFormData = {
    name: "",
    productName: "",
    qualification: initialExamLevels[0]?.id ?? "beginner",
    description: "",
    examDate: "",
    examTime: "",
    applicationStart: "",
    applicationEnd: "",
    publishStartDate: "",
    publishEndDate: "",
    locationType: "対面",
    location: "",
    capacity: "",
    fee: "",
    targetMembership: "free",
    venueCode: "",
    requiredMaterials: [],
    isActive: true,
  };

  if (!exam) return base;

  const [examDate, examTime] = exam.date.split(" ");

  return {
    ...base,
    name: exam.name,
    qualification: mapQualificationLabelToLevelId(exam.qualification),
    examDate: examDate ?? "",
    examTime: examTime ?? "",
    locationType: exam.mode === "オンライン" ? "オンライン" : "対面",
    location: exam.location,
    capacity: String(exam.capacity),
    fee: String(exam.fee),
  };
}

export default function EditExamPage({ params }: { params: { id: string } }) {
  const [examLevels, setExamLevels] = useState<ExamLevel[]>(initialExamLevels);
  const [isCreatingLevel, setIsCreatingLevel] = useState(false);
  const [newLevelName, setNewLevelName] = useState("");
  const [formData, setFormData] = useState<EditExamFormData>(() => getInitialFormData(params.id));

  const handleSubmit = () => {
    // TODO: 调用API更新考试数据
  };

  const handleCreateLevel = () => {
    const trimmed = newLevelName.trim();
    if (!trimmed) return;
    const newLevel: ExamLevel = {
      id: `custom-${Date.now()}`,
      name: trimmed,
    };
    setExamLevels([...examLevels, newLevel]);
    setFormData({ ...formData, qualification: newLevel.id });
    setNewLevelName("");
    setIsCreatingLevel(false);
  };

  return (
    <div className="p-8">
      <DashboardHeader
        title="試験を編集"
        actions={
          <div className="flex gap-3">
            <Link
              href={`/exams/${params.id}`}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              詳細に戻る
            </Link>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              変更を保存
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">基本情報</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">試験名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">商品名</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：認定試験受験料"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">会場名 *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">会場コード</label>
                  <input
                    type="text"
                    value={formData.venueCode}
                    onChange={(e) => setFormData({ ...formData, venueCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    placeholder="例：2111"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">受験級 *</label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {examLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:mt-0"
                      onClick={() => setIsCreatingLevel(true)}
                    >
                      新規級を追加
                    </button>
                  </div>
                  {isCreatingLevel && (
                    <div className="mt-3 space-y-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                      <input
                        type="text"
                        value={newLevelName}
                        onChange={(e) => setNewLevelName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例：特別級"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => {
                            setIsCreatingLevel(false);
                            setNewLevelName("");
                          }}
                        >
                          キャンセル
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          onClick={handleCreateLevel}
                          disabled={!newLevelName.trim()}
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">受験料（税込み） *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={0}
                    />
                    <span className="text-gray-600">円</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">試験概要</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="試験の内容や出題範囲などを入力してください"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">日程・会場</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">受験日 *</label>
                  <input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">受験日（時刻）</label>
                  <input
                    type="time"
                    value={formData.examTime}
                    onChange={(e) => setFormData({ ...formData, examTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">申込開始日</label>
                  <input
                    type="date"
                    value={formData.applicationStart}
                    onChange={(e) => setFormData({ ...formData, applicationStart: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">申込終了日</label>
                  <input
                    type="date"
                    value={formData.applicationEnd}
                    onChange={(e) => setFormData({ ...formData, applicationEnd: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">公開日</label>
                  <input
                    type="date"
                    value={formData.publishStartDate}
                    onChange={(e) => setFormData({ ...formData, publishStartDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">公開終了日</label>
                  <input
                    type="date"
                    value={formData.publishEndDate}
                    onChange={(e) => setFormData({ ...formData, publishEndDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">実施形式 *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="対面"
                      checked={formData.locationType === "対面"}
                      onChange={(e) => setFormData({ ...formData, locationType: e.target.value as "対面" | "オンライン" })}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">対面</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="オンライン"
                      checked={formData.locationType === "オンライン"}
                      onChange={(e) => setFormData({ ...formData, locationType: e.target.value as "対面" | "オンライン" })}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">オンライン</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.locationType === "対面" ? "会場名" : "オンライン会議URL"}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">定員</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={1}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-bold text-gray-900 mb-4">設定サマリー</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">試験名</span>
                <span className="font-medium text-gray-900 max-w-[180px] truncate">{formData.name || "未設定"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">受験級</span>
                <span className="font-medium text-gray-900">{formData.qualification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">受験日</span>
                <span className="font-medium text-gray-900">
                  {formData.examDate || "未設定"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">会場</span>
                <span className="font-medium text-gray-900 max-w-[180px] truncate">{formData.location || "未設定"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">受験料</span>
                <span className="font-medium text-gray-900">
                  {formData.fee ? `¥${Number(formData.fee).toLocaleString()}` : "未設定"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="font-bold text-blue-900 mb-2">編集の注意点</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>・編集内容はまだバックエンドには保存されません（コンソールに出力のみ）。</li>
              <li>・後続で API を接続することで、この画面から本番データを更新できます。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
