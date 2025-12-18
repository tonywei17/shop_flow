"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, RefreshCcw, Users, Building2, Banknote, Loader2, ChevronRight, ChevronDown, Trash2, AlertTriangle } from "lucide-react";
import { MonthPicker, getCurrentMonth, formatMonthDisplay } from "@/components/billing/month-picker";
import { ClientSortableTableHead, useClientSort } from "@/components/ui/client-sortable-table-head";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { CcImportWizard } from "@/components/billing/cc-import-wizard";

interface BranchSummary {
  branch_code: string;
  branch_name: string;
  classroom_count: number;
  total_members: number;
  aigran_members: number;
  regular_members: number;
  bank_transfer_classrooms: number;
  total_amount: number;
}

interface Classroom {
  id: string;
  classroom_code: string;
  classroom_name: string;
  baby_count: number;
  step1_count: number;
  step2_count: number;
  step3_count: number;
  step4_count: number;
  step5_count: number;
  other_count: number;
  total_count: number;
  amount: number;
  is_aigran: boolean;
  is_bank_transfer: boolean;
}

interface SummaryData {
  total_members: number;
  total_amount: number;
  total_classrooms: number;
  branch_count: number;
  aigran_members: number;
  bank_transfer_classrooms: number;
  bank_transfer_members: number;
  bank_transfer_amount: number;
}

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function CcFeesClient() {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getCurrentMonth());
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [summary, setSummary] = React.useState<SummaryData | null>(null);
  const [branches, setBranches] = React.useState<BranchSummary[]>([]);
  const [expandedBranches, setExpandedBranches] = React.useState<Set<string>>(new Set());
  const [classroomsData, setClassroomsData] = React.useState<Record<string, Classroom[]>>({});
  const [loadingClassrooms, setLoadingClassrooms] = React.useState<Set<string>>(new Set());

  // Clear data dialog state
  const [clearDialogOpen, setClearDialogOpen] = React.useState(false);
  const [clearPassword, setClearPassword] = React.useState("");
  const [clearOperatorName, setClearOperatorName] = React.useState("");
  const [clearing, setClearing] = React.useState(false);
  const [clearResult, setClearResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [hasClearPermission, setHasClearPermission] = React.useState(false);

  // Check if user has permission to clear data
  React.useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await fetch("/api/admin/clear-cc-members");
        if (response.ok) {
          const data = await response.json();
          setHasClearPermission(data.hasPermission);
        }
      } catch {
        setHasClearPermission(false);
      }
    };
    checkPermission();
  }, []);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cc-members/summary?billing_month=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setBranches(data.branches || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  // Fetch data when month changes
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImportComplete = () => {
    setImportDialogOpen(false);
    fetchData();
  };

  // Handle clear data
  const handleClearData = async (clearAll: boolean) => {
    setClearing(true);
    setClearResult(null);

    try {
      const response = await fetch("/api/admin/clear-cc-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: clearPassword,
          billing_month: clearAll ? null : selectedMonth,
          clear_all: clearAll,
          operator_name: clearOperatorName,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setClearResult({
          success: true,
          message: result.message,
        });
        setClearPassword("");
        fetchData();
      } else {
        setClearResult({
          success: false,
          message: result.error || "削除に失敗しました",
        });
      }
    } catch {
      setClearResult({
        success: false,
        message: "削除中にエラーが発生しました",
      });
    } finally {
      setClearing(false);
    }
  };

  // Toggle branch expansion
  const toggleBranch = async (branchCode: string) => {
    const newExpanded = new Set(expandedBranches);
    
    if (newExpanded.has(branchCode)) {
      newExpanded.delete(branchCode);
      setExpandedBranches(newExpanded);
    } else {
      newExpanded.add(branchCode);
      setExpandedBranches(newExpanded);
      
      // Fetch classrooms if not already loaded
      if (!classroomsData[branchCode]) {
        setLoadingClassrooms((prev) => new Set(prev).add(branchCode));
        try {
          const response = await fetch(
            `/api/cc-members/classrooms?billing_month=${selectedMonth}&branch_code=${branchCode}`
          );
          if (response.ok) {
            const data = await response.json();
            setClassroomsData((prev) => ({
              ...prev,
              [branchCode]: data.classrooms || [],
            }));
          }
        } catch (error) {
          console.error("Error fetching classrooms:", error);
        } finally {
          setLoadingClassrooms((prev) => {
            const newSet = new Set(prev);
            newSet.delete(branchCode);
            return newSet;
          });
        }
      }
    }
  };

  // Sorting
  const { sortConfig, handleSort, sortedData: sortedBranches } = useClientSort(branches, "branch_code", "asc");

  // Selection handlers
  const isAllSelected = sortedBranches.length > 0 && sortedBranches.every((b) => selectedIds.has(b.branch_code));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(branches.map((b) => b.branch_code)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  return (
    <div className="space-y-4">
      {/* Month Picker & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">対象月分:</span>
            <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          </div>
          <p className="text-xs text-muted-foreground ml-1">
            ※「月分」は該当月内に発生したデータの請求期間を指します
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Clear Data Dialog - SuperAdmin Only */}
          {hasClearPermission && (
            <Dialog open={clearDialogOpen} onOpenChange={(open) => {
              setClearDialogOpen(open);
              if (!open) {
                setClearPassword("");
                setClearOperatorName("");
                setClearResult(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                  データ削除
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    CC会員データ削除（テスト用）
                  </DialogTitle>
                  <DialogDescription>
                    この操作は取り消せません。削除されたデータは復元できません。
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>警告:</strong> この機能はシステムテスト期間中のみ使用してください。
                      本番運用開始後は使用しないでください。
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clear-operator-name">操作者氏名（実名） <span className="text-red-500">*</span></Label>
                    <Input
                      id="clear-operator-name"
                      type="text"
                      placeholder="山田 太郎"
                      value={clearOperatorName}
                      onChange={(e) => setClearOperatorName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clear-password">管理者パスワード <span className="text-red-500">*</span></Label>
                    <Input
                      id="clear-password"
                      type="password"
                      placeholder="パスワードを入力"
                      value={clearPassword}
                      onChange={(e) => setClearPassword(e.target.value)}
                    />
                  </div>
                  {clearResult && (
                    <div
                      className={`p-3 rounded-md text-sm ${
                        clearResult.success
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {clearResult.message}
                    </div>
                  )}
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleClearData(false)}
                    disabled={clearing || !clearPassword || !clearOperatorName || clearOperatorName.trim().length < 2}
                  >
                    {clearing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        削除中...
                      </>
                    ) : (
                      `${formatMonthDisplay(selectedMonth)} のみ削除`
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleClearData(true)}
                    disabled={clearing || !clearPassword || !clearOperatorName || clearOperatorName.trim().length < 2}
                    className="bg-red-700 hover:bg-red-800"
                  >
                    {clearing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        削除中...
                      </>
                    ) : (
                      "全データ削除"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                CSV インポート
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <VisuallyHidden>
                <DialogTitle>CC会員データ インポート</DialogTitle>
                <DialogDescription>月次の会員データをインポートします</DialogDescription>
              </VisuallyHidden>
              <CcImportWizard
                billingMonth={selectedMonth}
                onComplete={handleImportComplete}
                onClose={() => setImportDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="h-4 w-4" />
              <p className="text-sm">支局数</p>
            </div>
            <p className="text-2xl font-bold">{summary?.branch_count || 0}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <p className="text-sm">総会員数</p>
            </div>
            <p className="text-2xl font-bold">{summary?.total_members || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              アイグラン: {summary?.aigran_members || 0}名
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Banknote className="h-4 w-4" />
              <p className="text-sm">合計請求額</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(summary?.total_amount || 0)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">収納代行済み分</p>
            <p className="text-2xl font-bold text-green-600">
              {summary?.bank_transfer_members || 0}
              <span className="text-sm font-normal text-muted-foreground ml-1">名</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(summary?.bank_transfer_amount || 0)}（{summary?.bank_transfer_classrooms || 0}教室）
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-6 py-3 text-sm text-foreground">
            <label htmlFor="cc-select-all" className="flex items-center gap-3">
              <Checkbox
                id="cc-select-all"
                aria-label="全て選択"
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <span>全て選択</span>
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-primary text-primary bg-white hover:text-green-600 hover:font-bold"
              >
                <Download className="h-4 w-4" />
                CSV エクスポート
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={fetchData}>
                <RefreshCcw className="h-4 w-4" />
                更新
              </Button>
            </div>
          </div>
          <Table className="[&_th]:py-3 [&_td]:py-3 text-sm">
            <TableHeader>
              <TableRow className="border-b border-border text-foreground">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" checked={isAllSelected} onCheckedChange={handleSelectAll} />
                </TableHead>
                <ClientSortableTableHead sortKey="branch_code" sortConfig={sortConfig} onSort={handleSort} className="w-[100px]">
                  支局コード
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="branch_name" sortConfig={sortConfig} onSort={handleSort} className="w-[200px]">
                  支局名
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="classroom_count" sortConfig={sortConfig} onSort={handleSort} className="w-[100px]">
                  教室数
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="total_members" sortConfig={sortConfig} onSort={handleSort} className="w-[120px]">
                  会員数
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="aigran_members" sortConfig={sortConfig} onSort={handleSort} className="w-[120px]">
                  アイグラン
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="total_amount" sortConfig={sortConfig} onSort={handleSort} className="w-[140px]">
                  請求額
                </ClientSortableTableHead>
                <TableHead className="w-[100px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : sortedBranches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    {formatMonthDisplay(selectedMonth)} のデータがありません。
                    <br />
                    <span className="text-xs">CSVインポートでデータを追加してください。</span>
                  </TableCell>
                </TableRow>
              ) : (
                sortedBranches.map((branch) => (
                  <React.Fragment key={branch.branch_code}>
                    {/* Branch Row */}
                    <TableRow 
                      className="border-b border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleBranch(branch.branch_code)}
                    >
                      <TableCell className="pl-6 pr-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          aria-label={`${branch.branch_code} を選択`}
                          checked={selectedIds.has(branch.branch_code)}
                          onCheckedChange={(checked) => handleSelectOne(branch.branch_code, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {expandedBranches.has(branch.branch_code) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          {branch.branch_code}000
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-medium">{branch.branch_name || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{branch.classroom_count}</TableCell>
                      <TableCell>
                        <span className="font-medium">{branch.total_members}</span>
                        <span className="text-muted-foreground text-xs ml-1">名</span>
                      </TableCell>
                      <TableCell>
                        {branch.aigran_members > 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            {branch.aigran_members}名
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(branch.total_amount)}</TableCell>
                      <TableCell className="pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                          詳細
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Classrooms */}
                    {expandedBranches.has(branch.branch_code) && (
                      <>
                        {loadingClassrooms.has(branch.branch_code) ? (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={8} className="py-4 text-center">
                              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                              教室データを読み込み中...
                            </TableCell>
                          </TableRow>
                        ) : classroomsData[branch.branch_code]?.length === 0 ? (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={8} className="py-4 text-center text-muted-foreground text-xs">
                              教室データがありません
                            </TableCell>
                          </TableRow>
                        ) : (
                          classroomsData[branch.branch_code]?.map((classroom) => (
                            <TableRow 
                              key={classroom.id} 
                              className="bg-muted/30 border-b border-border/50 text-sm"
                            >
                              <TableCell className="pl-6 pr-3"></TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground pl-8">
                                {classroom.classroom_code}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {classroom.classroom_name || "-"}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {classroom.is_aigran && (
                                  <Badge variant="outline" className="text-xs">アイグラン</Badge>
                                )}
                                {classroom.is_bank_transfer && (
                                  <Badge variant="outline" className="text-xs text-green-600">振替済</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-muted-foreground">{classroom.total_count}</span>
                                <span className="text-muted-foreground text-xs ml-1">名</span>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                <span title="ベビー/Step1/Step2/Step3/Step4/Step5/その他">
                                  {classroom.baby_count}/{classroom.step1_count}/{classroom.step2_count}/
                                  {classroom.step3_count}/{classroom.step4_count}/{classroom.step5_count}/
                                  {classroom.other_count}
                                </span>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatCurrency(classroom.amount)}
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          ))
                        )}
                      </>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>

          {/* Footer */}
          <div className="border-t border-border px-6 py-3 text-sm text-muted-foreground">
            全 {branches.length} 支局
            {selectedIds.size > 0 && ` (${selectedIds.size} 件選択中)`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
