"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { useState } from "react";
import { Save, Eye, Upload } from "lucide-react";

export default function NewVideoPage() {
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    chapter: "",
    description: "",
    duration: "",
    vimeoId: "",
    vimeoUrl: "",
    isPreview: false,
    requiredMembership: "free",
    requiredQualifications: [] as string[],
    thumbnail: "",
  });

  const [uploadMethod, setUploadMethod] = useState<"vimeo" | "direct">("vimeo");

  const handleSubmit = (status: "draft" | "published") => {
    console.log("Submit:", { ...formData, status });
    // 实际应该调用API保存数据
  };

  return (
    <div className="p-8">
      <DashboardHeader
        title="新規動画を追加"
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
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Upload */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">動画アップロード</h2>
            
            <div className="mb-4">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setUploadMethod("vimeo")}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                    uploadMethod === "vimeo"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  Vimeo連携
                </button>
                <button
                  onClick={() => setUploadMethod("direct")}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                    uploadMethod === "direct"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  直接アップロード
                </button>
              </div>

              {uploadMethod === "vimeo" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vimeo Video ID *</label>
                    <input
                      type="text"
                      value={formData.vimeoId}
                      onChange={(e) => setFormData({ ...formData, vimeoId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例：76979871"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      VimeoのVideo IDを入力してください（URLの数字部分）
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">または Vimeo URL</label>
                    <input
                      type="url"
                      value={formData.vimeoUrl}
                      onChange={(e) => setFormData({ ...formData, vimeoUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://vimeo.com/76979871"
                    />
                  </div>

                  {formData.vimeoId && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">プレビュー</label>
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe
                          src={`https://player.vimeo.com/video/${formData.vimeoId}?h=0&title=0&byline=0&portrait=0`}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">動画ファイルをドラッグ＆ドロップ</p>
                  <p className="text-sm text-gray-500 mb-4">または</p>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    ファイルを選択
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    対応形式: MP4, MOV, AVI（最大2GB）
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">基本情報</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">動画タイトル *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例：第1章：リトミックとは"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">所属コース *</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">選択してください</option>
                    <option value="1">リトミック基礎コース</option>
                    <option value="2">リトミック指導法 中級</option>
                    <option value="3">リトミック教育学</option>
                    <option value="4">リトミック上級指導者養成</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">チャプター</label>
                  <input
                    type="text"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：第1章"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">動画の長さ</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例：15:30"
                />
                <p className="text-sm text-gray-500 mt-1">形式：MM:SS</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="動画の内容を説明してください"
                />
              </div>
            </div>
          </div>

          {/* Access Control */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">視聴条件設定</h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.isPreview}
                    onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-gray-900">プレビュー動画として設定</span>
                </label>
                <p className="text-sm text-gray-500 ml-6">
                  未購入のユーザーでも視聴可能になります
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">必要な会員レベル *</label>
                <select
                  value={formData.requiredMembership}
                  onChange={(e) => setFormData({ ...formData, requiredMembership: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={formData.isPreview}
                >
                  <option value="free">無料会員以上</option>
                  <option value="premium">プレミアム会員のみ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">必要な資格（任意）</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" disabled={formData.isPreview} />
                    <span className="text-gray-700">初級指導者資格</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" disabled={formData.isPreview} />
                    <span className="text-gray-700">中級指導者資格</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" disabled={formData.isPreview} />
                    <span className="text-gray-700">上級指導者資格</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thumbnail */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-bold text-gray-900 mb-4">サムネイル</h3>
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
                推奨サイズ: 1280x720px
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ※ Vimeoから自動取得することも可能です
            </p>
          </div>

          {/* Settings Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-bold text-gray-900 mb-4">設定サマリー</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">アップロード方法:</span>
                <span className="font-medium text-gray-900">
                  {uploadMethod === "vimeo" ? "Vimeo" : "直接"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">プレビュー:</span>
                <span className="font-medium text-gray-900">
                  {formData.isPreview ? "はい" : "いいえ"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">会員レベル:</span>
                <span className="font-medium text-gray-900">
                  {formData.requiredMembership === "premium" ? "プレミアム" : "無料"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ステータス:</span>
                <span className="font-medium text-gray-500">下書き</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="font-bold text-blue-900 mb-2">💡 Vimeoの使い方</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>1. Vimeoに動画をアップロード</li>
              <li>2. 動画のIDまたはURLをコピー</li>
              <li>3. このフォームに貼り付け</li>
              <li>4. プレビューで確認して公開</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
