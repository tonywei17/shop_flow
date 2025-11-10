"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { useState } from "react";
import { Save, Eye } from "lucide-react";

export default function NewActivityPage() {
  const [formData, setFormData] = useState({
    title: "",
    type: "体験",
    description: "",
    date: "",
    time: "",
    location: "",
    locationType: "対面",
    capacity: "",
    price: "",
    requiredMembership: "free",
    requiredQualifications: [] as string[],
    image: "",
  });

  const handleSubmit = (status: "draft" | "published") => {
    console.log("Submit:", { ...formData, status });
    // 实际应该调用API保存数据
  };

  return (
    <div className="p-8">
      <DashboardHeader
        title="新規活動を作成"
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit("draft")}
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
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
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">基本情報</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">活動名 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例：リトミック体験会"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">種類 *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="体験">体験</option>
                  <option value="見学">見学</option>
                  <option value="研修">研修</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">説明 *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="活動の詳細を入力してください"
                />
              </div>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">日時・場所</h2>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">開催日 *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">開始時刻 *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">開催形式 *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="対面"
                      checked={formData.locationType === "対面"}
                      onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span>対面</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="オンライン"
                      checked={formData.locationType === "オンライン"}
                      onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span>オンライン</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {formData.locationType === "対面" ? "開催場所" : "オンライン会議URL"} *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={formData.locationType === "対面" ? "例：東京本部" : "例：https://zoom.us/j/..."}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">定員 *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例：30"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Requirements */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">価格・参加条件</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">参加費 *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                  <span className="text-gray-600">円</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">0円の場合は無料活動として表示されます</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">必要な会員レベル *</label>
                <select
                  value={formData.requiredMembership}
                  onChange={(e) => setFormData({ ...formData, requiredMembership: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="free">無料会員以上</option>
                  <option value="premium">プレミアム会員のみ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">必要な資格（任意）</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>初級指導者資格</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>中級指導者資格</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>上級指導者資格</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-bold mb-4">サムネイル画像</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                画像をアップロード
              </button>
              <p className="text-xs text-gray-500 mt-2">
                推奨サイズ: 1200x675px
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-bold mb-4">プレビュー</h3>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-2">
                {formData.type || "種類未設定"}
              </div>
              <div className="font-bold mb-2">
                {formData.title || "活動名未設定"}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {formData.date && formData.time ? `${formData.date} ${formData.time}` : "日時未設定"}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {formData.location || "場所未設定"}
              </div>
              <div className="font-bold text-blue-600">
                {formData.price ? `¥${parseInt(formData.price).toLocaleString()}` : "無料"}
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="font-bold text-blue-900 mb-2">💡 ヒント</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• 魅力的なタイトルで参加者を引きつけましょう</li>
              <li>• 詳細な説明で活動内容を明確に伝えましょう</li>
              <li>• 適切な定員設定で質の高い体験を提供しましょう</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
