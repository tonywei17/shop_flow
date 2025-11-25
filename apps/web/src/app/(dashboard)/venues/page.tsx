"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { useState } from "react";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";

type Venue = {
  id: string;
  name: string;
  code: string;
  type: "対面" | "オンライン";
  address: string;
  capacity: number;
  isActive: boolean;
};

const initialVenues: Venue[] = [
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

export default function VenuesManagementPage() {
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"対面" | "オンライン">("対面");
  const [newAddress, setNewAddress] = useState("");
  const [newCapacity, setNewCapacity] = useState("");

  const sortedVenues = [...venues].sort((a, b) => a.name.localeCompare(b.name, "ja"));

  const handleAdd = () => {
    const name = newName.trim();
    const code = newCode.trim();
    const address = newAddress.trim();
    const capacity = Number(newCapacity || "0");

    if (!name || !code || !address) return;

    const venue: Venue = {
      id: `venue-${Date.now()}`,
      name,
      code,
      type: newType,
      address,
      capacity: Number.isNaN(capacity) ? 0 : capacity,
      isActive: true,
    };

    setVenues((prev) => [...prev, venue]);
    setNewName("");
    setNewCode("");
    setNewAddress("");
    setNewCapacity("");
    setNewType("対面");
  };

  const handleToggleActive = (id: string) => {
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v)));
  };

  const handleDelete = (id: string) => {
    setVenues((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="会場管理" />

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">会場一覧</h2>

            <div className="mb-6 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">会場名 *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="例：青森市民ホール"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">会場コード *</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="例：2111"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">種別 *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as "対面" | "オンライン")}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="対面">対面</option>
                    <option value="オンライン">オンライン</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    {newType === "対面" ? "住所 *" : "オンラインURL *"}
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={newType === "対面" ? "例：東京都千代田区..." : "例：https://zoom.us/j/..."}
                  />
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="w-40">
                  <label className="mb-1 block text-sm font-medium text-foreground">定員</label>
                  <input
                    type="number"
                    min={0}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="例：80"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!newName.trim() || !newCode.trim() || !newAddress.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  会場を追加
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">会場名</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">コード</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">種別</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">住所 / URL</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">定員</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">ステータス</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedVenues.map((venue) => (
                    <tr key={venue.id} className="border-t border-border hover:bg-muted/60">
                      <td className="px-4 py-2 align-top">
                        <div className="font-medium text-foreground">
                          <Link
                            href={`/venues/${venue.id}`}
                            className="text-primary hover:underline"
                          >
                            {venue.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <span className="text-foreground">{venue.code}</span>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <span className="text-foreground">{venue.type}</span>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div className="flex items-start gap-1 text-foreground">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                          <span>{venue.address}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 align-top text-foreground">
                        <span>{venue.capacity || "-"}</span>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            venue.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {venue.isActive ? "有効" : "無効"}
                        </span>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Link
                            href={`/venues/${venue.id}/edit`}
                            className="inline-flex items-center justify-center rounded-lg border border-border px-2.5 py-1.5 font-medium text-foreground hover:bg-muted"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(venue.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-border px-2.5 py-1.5 font-medium text-foreground hover:bg-muted"
                          >
                            {venue.isActive ? "無効にする" : "有効にする"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(venue.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-destructive/40 px-2.5 py-1.5 font-medium text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-bold text-foreground">使い方</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>・ここで登録した会場情報は、試験や活動の作成画面で利用する想定です。</li>
              <li>・オンライン会場の場合は、Zoom等のURLを登録してください。</li>
              <li>・無効にした会場は新規作成画面では選択できない設計にする想定です。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
