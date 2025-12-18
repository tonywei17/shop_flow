"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { useState } from "react";
import { Save, Eye } from "lucide-react";

type Venue = {
  id: string;
  name: string;
  code: string;
  type: "対面" | "オンライン";
  address: string;
};

type ExamLevel = {
  id: string;
  name: string;
};

type NewExamFormData = {
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
  venueId: string | null;
};

const initialExamLevels: ExamLevel[] = [
  { id: "beginner", name: "初級" },
  { id: "intermediate", name: "中級" },
  { id: "advanced", name: "上級" },
];

const mockVenues: Venue[] = [
  {
    id: "tokyo-hq",
    name: "東京本部",
    code: "1001",
    type: "対面",
    address: "東京都千代田区丸の内1-1-1",
  },
  {
    id: "aomori-hall",
    name: "青森市民ホール",
    code: "2111",
    type: "対面",
    address: "青森県青森市中央1-2-3",
  },
  {
    id: "online-zoom",
    name: "オンライン（Zoom会場）",
    code: "9001",
    type: "オンライン",
    address: "ZoomミーティングURL",
  },
];

export default function NewExamPage() {
  const [examLevels, setExamLevels] = useState<ExamLevel[]>(initialExamLevels);
  const [isCreatingLevel, setIsCreatingLevel] = useState(false);
  const [newLevelName, setNewLevelName] = useState("");
  const [formData, setFormData] = useState<NewExamFormData>({
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
    venueId: null,
  });

  const handleSubmit = (_status: "draft" | "published") => {
    // TODO: 调用API保存考试数据
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

  const handleSelectVenue = (venueId: string) => {
    const selected = mockVenues.find((v) => v.id === venueId) || null;
    setFormData((prev) => ({
      ...prev,
      venueId,
      locationType: selected?.type ?? prev.locationType,
      location: selected?.name ?? prev.location,
      venueCode: selected?.code ?? prev.venueCode,
    }));
  };

  return (
    <div className="p-8">
      <DashboardHeader
        title="新規試験を作成"
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit("draft")}
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <Save className="h-4 w-4" />
              下書き保存
            </button>
            <button
              onClick={() => handleSubmit("published")}
              className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              <Eye className="h-4 w-4" />
              公開する
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-8">
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
                    placeholder="例：2024年 指導資格認定試験 中級"
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
                    placeholder="例：青森市民ホール"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">会場コード *</label>
                  <input
                    type="text"
                    value={formData.venueCode}
                    onChange={(e) => setFormData({ ...formData, venueCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
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
                      placeholder="例：8800"
                      min={0}
                    />
                    <span className="text-gray-600">円</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">試験概要 *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">申込開始日 *</label>
                  <input
                    type="date"
                    value={formData.applicationStart}
                    onChange={(e) => setFormData({ ...formData, applicationStart: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">申込終了日 *</label>
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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">会場を選択</label>
                  <select
                    value={formData.venueId ?? ""}
                    onChange={(e) => handleSelectVenue(e.target.value || "")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">会場を選択してください</option>
                    {mockVenues.map((venue) => (
                      <option key={venue.id} value={venue.id}>{`${venue.name}（${venue.type}/${venue.code}）`}</option>
                    ))}
                  </select>
                  {formData.venueId && (
                    <p className="mt-1 text-xs text-gray-500">
                      選択中: {mockVenues.find((v) => v.id === formData.venueId)?.address ?? ""}
                    </p>
                  )}
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
                  <div className="mt-2 text-right">
                    <Link
                      href="/venues"
                      className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700"
                    >
                      会場を管理する
                    </Link>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.locationType === "対面" ? "会場名" : "オンライン会議URL"} *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={formData.locationType === "対面" ? "例：東京本部" : "例：https://zoom.us/j/..."}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">定員 *</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：60"
                    min={1}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">受験対象</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">必要な会員レベル *</label>
                <select
                  value={formData.targetMembership}
                  onChange={(e) => setFormData({ ...formData, targetMembership: e.target.value as "free" | "premium" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="free">無料会員以上</option>
                  <option value="premium">プレミアム会員のみ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">必要資料</label>
                <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="mb-2 text-xs text-gray-500">受験に必要な教材・資料を選択してください</p>
                  {[
                    "1.5歳児指導",
                    "リトミックバイエル",
                    "Step1",
                    "ひとりからのR",
                  ].map((material) => {
                    const checked = formData.requiredMaterials.includes(material);
                    return (
                      <label key={material} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...formData.requiredMaterials, material]
                              : formData.requiredMaterials.filter((m) => m !== material);
                            setFormData({ ...formData, requiredMaterials: next });
                          }}
                          className="h-4 w-4"
                        />
                        <span>{material}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isActive ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        formData.isActive ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.isActive ? "公開" : "非公開"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-bold text-gray-900 mb-4">試験概要プレビュー</h3>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-2">{formData.qualification || "資格種別未設定"}</div>
              <div className="font-bold text-gray-900 mb-2">{formData.name || "試験名未設定"}</div>
              <div className="text-sm text-gray-600 mb-2">
                {formData.examDate && formData.examTime
                  ? `${formData.examDate} ${formData.examTime}`
                  : "試験日未設定"}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {formData.location || "会場未設定"}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                申込期間:
                {formData.applicationStart && formData.applicationEnd
                  ? ` ${formData.applicationStart} 〜 ${formData.applicationEnd}`
                  : " 未設定"}
              </div>
              <div className="font-bold text-blue-600">
                {formData.fee ? `¥${parseInt(formData.fee, 10).toLocaleString()}` : "受験料未設定"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-bold text-gray-900 mb-4">設定サマリー</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">資格種別:</span>
                <span className="font-medium text-gray-900">{formData.qualification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">実施形式:</span>
                <span className="font-medium text-gray-900">{formData.locationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">会員レベル:</span>
                <span className="font-medium text-gray-900">
                  {formData.targetMembership === "premium" ? "プレミアム" : "無料会員以上"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ステータス:</span>
                <span className="font-medium text-gray-500">下書き</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="font-bold text-blue-900 mb-2">💡 試験運営のヒント</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• 申込締切日は試験日の1〜2週間前に設定しましょう</li>
              <li>• 会場情報やオンラインURLは早めに確定しておきましょう</li>
              <li>• 試験概要には出題範囲と持ち物を明記しましょう</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
