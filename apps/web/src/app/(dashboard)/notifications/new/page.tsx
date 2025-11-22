"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { useState } from "react";
import { Save, Send, Users, Award, User } from "lucide-react";

type NotificationCategory = {
  id: string;
  name: string;
  colorClass?: string;
};

type NewNotificationFormData = {
  title: string;
  message: string;
  targetType: "all" | "membership" | "qualification" | "individual";
  membershipType: "all" | "premium" | "free";
  qualificationType: string;
  individualMemberId: string;
  individualMemberName: string;
  sendImmediately: boolean;
  scheduledDate: string;
  scheduledTime: string;
  categoryId: string | null;
};

const initialCategories: NotificationCategory[] = [
  { id: "general", name: "お知らせ", colorClass: "bg-blue-100 text-blue-700" },
  { id: "exam", name: "資格試験", colorClass: "bg-purple-100 text-purple-700" },
  { id: "system", name: "システム", colorClass: "bg-amber-100 text-amber-700" },
  { id: "campaign", name: "キャンペーン", colorClass: "bg-emerald-100 text-emerald-700" },
];

export default function NewNotificationPage() {
  const [formData, setFormData] = useState<NewNotificationFormData>({
    title: "",
    message: "",
    targetType: "all",
    membershipType: "all",
    qualificationType: "",
    individualMemberId: "",
    individualMemberName: "",
    sendImmediately: true,
    scheduledDate: "",
    scheduledTime: "",
    categoryId: null,
  });

  const [recipientCount, setRecipientCount] = useState(1234);
  const [categories, setCategories] = useState<NotificationCategory[]>(initialCategories);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColorClass, setNewCategoryColorClass] = useState("bg-blue-100 text-blue-700");

  const handleTargetTypeChange = (type: typeof formData.targetType) => {
    setFormData({ ...formData, targetType: type });
    
    // Update recipient count based on target type
    switch (type) {
      case "all":
        setRecipientCount(1234);
        break;
      case "membership":
        setRecipientCount(formData.membershipType === "premium" ? 456 : 778);
        break;
      case "qualification":
        setRecipientCount(156);
        break;
      case "individual":
        setRecipientCount(1);
        break;
    }
  };

  const handleCreateCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;
    const newCategory: NotificationCategory = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      colorClass: newCategoryColorClass,
    };
    setCategories([...categories, newCategory]);
    setFormData({ ...formData, categoryId: newCategory.id });
    setIsCreatingCategory(false);
    setNewCategoryName("");
  };

  const handleSubmit = (action: "draft" | "send") => {
    console.log("Submit:", { ...formData, action });
    // 实际应该调用API保存/发送通知
  };

  const selectedCategory = categories.find((category) => category.id === formData.categoryId);

  return (
    <div className="p-8">
      <DashboardHeader
        title="新規通知を作成"
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
              onClick={() => handleSubmit("send")}
              className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              {formData.sendImmediately ? "今すぐ送信" : "送信予約"}
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Content */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">通知内容</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">タイトル *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例：新コース公開のお知らせ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メッセージ *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="通知の内容を入力してください"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.message.length}/500文字
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分類</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.categoryId ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value ? e.target.value : null })
                    }
                  >
                    <option value="">未分類</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:mt-0"
                    onClick={() => setIsCreatingCategory(true)}
                  >
                    新規カテゴリ
                  </button>
                </div>
                {isCreatingCategory && (
                  <div className="mt-3 space-y-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="カテゴリ名を入力"
                    />
                    <div className="flex flex-wrap gap-2">
                      {initialCategories.map((category) => (
                        <button
                          type="button"
                          key={category.id}
                          onClick={() => setNewCategoryColorClass(category.colorClass ?? "bg-gray-100 text-gray-700")}
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            newCategoryColorClass === (category.colorClass ?? "bg-gray-100 text-gray-700")
                              ? `${category.colorClass ?? "bg-gray-100 text-gray-700"} ring-2 ring-blue-400`
                              : category.colorClass ?? "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          setIsCreatingCategory(false);
                          setNewCategoryName("");
                        }}
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        onClick={handleCreateCategory}
                        disabled={!newCategoryName.trim()}
                      >
                        保存
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Target Selection */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">送信先設定</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleTargetTypeChange("all")}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    formData.targetType === "all"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Users className={`h-8 w-8 mx-auto mb-2 ${
                    formData.targetType === "all" ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <div className="font-medium text-gray-900">全会員</div>
                  <div className="text-sm text-gray-500">1,234名</div>
                </button>

                <button
                  onClick={() => handleTargetTypeChange("membership")}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    formData.targetType === "membership"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Users className={`h-8 w-8 mx-auto mb-2 ${
                    formData.targetType === "membership" ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <div className="font-medium text-gray-900">会員レベル別</div>
                  <div className="text-sm text-gray-500">選択可能</div>
                </button>

                <button
                  onClick={() => handleTargetTypeChange("qualification")}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    formData.targetType === "qualification"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Award className={`h-8 w-8 mx-auto mb-2 ${
                    formData.targetType === "qualification" ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <div className="font-medium text-gray-900">資格保持者</div>
                  <div className="text-sm text-gray-500">選択可能</div>
                </button>

                <button
                  onClick={() => handleTargetTypeChange("individual")}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    formData.targetType === "individual"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <User className={`h-8 w-8 mx-auto mb-2 ${
                    formData.targetType === "individual" ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <div className="font-medium text-gray-900">個別送信</div>
                  <div className="text-sm text-gray-500">1名</div>
                </button>
              </div>

              {/* Conditional Fields */}
              {formData.targetType === "membership" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">会員レベル *</label>
                  <select
                    value={formData.membershipType}
                    onChange={(e) => {
                      const value = e.target.value as NewNotificationFormData["membershipType"];
                      setFormData({ ...formData, membershipType: value });
                      setRecipientCount(value === "premium" ? 456 : value === "free" ? 778 : 1234);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">全ての会員（1,234名）</option>
                    <option value="premium">プレミアム会員のみ（456名）</option>
                    <option value="free">無料会員のみ（778名）</option>
                  </select>
                </div>
              )}

              {formData.targetType === "qualification" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">資格種類 *</label>
                  <select
                    value={formData.qualificationType}
                    onChange={(e) => {
                      setFormData({ ...formData, qualificationType: e.target.value });
                      // Update count based on qualification
                      const counts: Record<string, number> = {
                        "beginner": 156,
                        "intermediate": 58,
                        "advanced": 20,
                      };
                      setRecipientCount(counts[e.target.value] || 0);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">選択してください</option>
                    <option value="beginner">初級指導者資格（156名）</option>
                    <option value="intermediate">中級指導者資格（58名）</option>
                    <option value="advanced">上級指導者資格（20名）</option>
                  </select>
                </div>
              )}

              {formData.targetType === "individual" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">会員を選択 *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.individualMemberName}
                      onChange={(e) => setFormData({ ...formData, individualMemberName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="会員名またはメールアドレスで検索"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    会員を検索して選択してください
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">送信タイミング</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.sendImmediately}
                    onChange={() => setFormData({ ...formData, sendImmediately: true })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">今すぐ送信</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!formData.sendImmediately}
                    onChange={() => setFormData({ ...formData, sendImmediately: false })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">送信予約</span>
                </label>
              </div>

              {!formData.sendImmediately && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">送信日 *</label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">送信時刻 *</label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-bold text-gray-900 mb-4">プレビュー</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  R
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-900 mb-1">
                    リトミック研究センター
                  </div>
                  <div className="text-xs text-gray-500">
                    {formData.sendImmediately ? "今" : formData.scheduledDate || "未設定"}
                  </div>
                </div>
              </div>
              <div className="font-bold text-gray-900 mb-2">
                {formData.title || "タイトル未設定"}
              </div>
              <div className="text-sm text-gray-600">
                {formData.message || "メッセージ未設定"}
              </div>
            </div>
          </div>

          {/* Recipient Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-bold text-gray-900 mb-4">送信先サマリー</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">送信先:</span>
                <span className="font-medium text-gray-900">
                  {formData.targetType === "all" ? "全会員" :
                   formData.targetType === "membership" ? "会員レベル別" :
                   formData.targetType === "qualification" ? "資格保持者" :
                   "個別送信"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">受信者数:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {recipientCount.toLocaleString()}名
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">分類:</span>
                <span className="font-medium text-gray-900">
                  {selectedCategory?.name ?? "未分類"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">送信方法:</span>
                <span className="font-medium text-gray-900">
                  {formData.sendImmediately ? "即時送信" : "予約送信"}
                </span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="font-bold text-blue-900 mb-2">💡 通知のヒント</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• 簡潔で分かりやすいタイトルを付けましょう</li>
              <li>• 重要な情報は最初に記載しましょう</li>
              <li>• 適切な送信先を選択しましょう</li>
              <li>• 送信前にプレビューで確認しましょう</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
