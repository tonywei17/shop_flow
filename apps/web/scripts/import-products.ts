import { createClient } from "@supabase/supabase-js";

// Supabase configuration - read from environment or use defaults
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.log("SUPABASE_URL:", SUPABASE_URL ? "set" : "not set");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "set" : "not set");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Category code to UUID mapping
const categoryMapping: Record<string, string> = {
  "0002": "7cc40210-b9f3-4955-811f-6adaf781ca05", // 指導用教材
  "0003": "8521b708-6499-4ce6-b6f4-266a29948d24", // 教具セット
  "0004": "d22dc0a8-9202-4660-bf2e-8d8da8a4bad5", // 販促物
  "0005": "b47952b7-7e8e-4c39-9c77-cc7026b429a9", // その他
  "0007": "d1808f69-f6f8-40c3-85dd-b7ee245bb828", // 書籍／CD（指導書）
  "0010": "cdf75f13-5348-4ebf-8d77-5bbec0bc346c", // ピアノ教材
  "0001": "1f1dbc66-c69d-41f3-ba65-a592db5b308f", // 指導書
  "test0001": "cf67be21-4af7-4ca4-bacc-7bc7c3a09359", // 図書
};

// Products data from MySQL goods table
const productsData = [
  { id: 58, code: 'CCL-01', name: '修了証ステップ1', goods_type: '0002', unit_price: 0, headquarters_price: 36, substation_price: 0, class_price: 0, current_inventory: 214, stack_status: '0', is_delete: 0 },
  { id: 59, code: 'CCC-01', name: '出席カードステップ1', goods_type: 'test0001', unit_price: 0, headquarters_price: 50, substation_price: 0, class_price: 0, current_inventory: 1542, stack_status: '0', is_delete: 0 },
  { id: 60, code: 'CCS-01', name: '出席シールステップ1', goods_type: 'test0001', unit_price: 0, headquarters_price: 60, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 61, code: 'CCL-02', name: '修了証ステップ2', goods_type: 'test0001', unit_price: 0, headquarters_price: 36, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 62, code: 'CCC-02', name: '出席カードステップ2', goods_type: 'test0001', unit_price: 0, headquarters_price: 50, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 63, code: 'CCS-02', name: '出席シールステップ2', goods_type: 'test0001', unit_price: 0, headquarters_price: 60, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 64, code: 'CCL-03', name: '修了証ステップ3', goods_type: 'test0001', unit_price: 0, headquarters_price: 36, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 65, code: 'CCC-03', name: '出席カードステップ3', goods_type: 'test0001', unit_price: 0, headquarters_price: 50, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 66, code: 'CCS-03', name: '出席シールステップ3', goods_type: 'test0001', unit_price: 0, headquarters_price: 60, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 67, code: 'CCL-04', name: '修了証ステップ4', goods_type: 'test0001', unit_price: 0, headquarters_price: 36, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 68, code: 'CCC-04', name: '出席カードステップ4', goods_type: 'test0001', unit_price: 0, headquarters_price: 50, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 69, code: 'CCS-04', name: '出席シールステップ4', goods_type: 'test0001', unit_price: 0, headquarters_price: 60, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 70, code: 'CCL-05', name: '修了証ステップ5', goods_type: 'test0001', unit_price: 0, headquarters_price: 36, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 71, code: 'CCC-05', name: '出席カードステップ5', goods_type: 'test0001', unit_price: 0, headquarters_price: 50, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 72, code: 'CCS-05', name: '出席シールステップ5', goods_type: 'test0001', unit_price: 0, headquarters_price: 60, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 73, code: 'CCL-10', name: '修了証ベビー', goods_type: 'test0001', unit_price: 0, headquarters_price: 25, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 74, code: 'CCC-10E', name: '出席カードベビー前期', goods_type: 'test0001', unit_price: 0, headquarters_price: 60, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 75, code: 'CCC-10Ｌ', name: '出席カードベビー後期', goods_type: 'test0001', unit_price: 0, headquarters_price: 60, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 76, code: 'CCL-99', name: '修了証その他', goods_type: '0005', unit_price: 0, headquarters_price: 148, substation_price: 0, class_price: 0, current_inventory: 764, stack_status: '1', is_delete: 0 },
  { id: 77, code: 'DM-13', name: 'ご案内カード(50枚)', goods_type: '0004', unit_price: 300, headquarters_price: 158, substation_price: 300, class_price: 300, current_inventory: 277, stack_status: '1', is_delete: 0 },
  { id: 78, code: 'DM-14', name: 'ハガキサイズのご案内カード(30枚)', goods_type: '0004', unit_price: 330, headquarters_price: 240, substation_price: 330, class_price: 330, current_inventory: 597, stack_status: '1', is_delete: 0 },
  { id: 79, code: 'LP-1', name: '初級指導資格認定証', goods_type: 'test0001', unit_price: 0, headquarters_price: 57, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 80, code: 'LP-2', name: '中級指導資格認定証', goods_type: 'test0001', unit_price: 0, headquarters_price: 54, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 81, code: 'LP-3', name: '上級指導資格認定証', goods_type: 'test0001', unit_price: 0, headquarters_price: 54, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 82, code: 'LPC-01', name: 'ディプロマ認定証ケース', goods_type: 'test0001', unit_price: 0, headquarters_price: 862, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 83, code: 'LPD-01', name: 'ディプロマ認定証A', goods_type: 'test0001', unit_price: 0, headquarters_price: 243, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 84, code: 'LPD-02', name: 'ディプロマ認定証B', goods_type: 'test0001', unit_price: 0, headquarters_price: 134, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 85, code: 'LPY-01', name: '幼稚園･保育園のためのリトミック認定証', goods_type: 'test0001', unit_price: 0, headquarters_price: 74, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 86, code: 'MK-02', name: '認定教室運営マニュアル', goods_type: 'test0001', unit_price: 0, headquarters_price: 129, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 87, code: 'RCC-01A', name: 'Cクラブご案内(生徒保護者用)', goods_type: 'test0001', unit_price: 0, headquarters_price: 4, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 88, code: 'RCC-02', name: 'Cクラブ交通障害お見舞制度規約', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 89, code: 'RCC-03', name: 'Cクラブ交通傷害お見舞金申請書', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 90, code: 'RF-06', name: '封筒(角2)', goods_type: 'test0001', unit_price: 0, headquarters_price: 18, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 91, code: 'RF-07', name: '封筒(長3)', goods_type: 'test0001', unit_price: 0, headquarters_price: 8, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 92, code: 'RF-08', name: '封筒(長3窓付)', goods_type: 'test0001', unit_price: 0, headquarters_price: 11, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 93, code: 'RK-02', name: '教材のご注文方法と注文書サンプル', goods_type: 'test0001', unit_price: 0, headquarters_price: 10, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 94, code: 'RK-03', name: '教室用看板', goods_type: 'test0001', unit_price: 9000, headquarters_price: 4378, substation_price: 9000, class_price: 9000, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 95, code: 'RK-04', name: '認定幼保看板', goods_type: 'test0001', unit_price: 5000, headquarters_price: 3960, substation_price: 5000, class_price: 5000, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 96, code: 'RKB-1', name: 'リトミック研究センター支局証', goods_type: 'test0001', unit_price: 0, headquarters_price: 4180, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 97, code: 'RKN-02', name: 'リト研教室認定証 (証紙＋額)', goods_type: 'test0001', unit_price: 0, headquarters_price: 1210, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 98, code: 'RKN-02B', name: 'リト研教室認定証(半額分)', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 99, code: 'RKN-03', name: '幼保認定証額縁', goods_type: 'test0001', unit_price: 0, headquarters_price: 1210, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 100, code: 'RKP-01A', name: '広報パンフ(50)', goods_type: '0004', unit_price: 1500, headquarters_price: 2466, substation_price: 1200, class_price: -1350, current_inventory: 100, stack_status: '1', is_delete: 0 },
  { id: 101, code: 'RKP-08', name: '教室のご案内パンフレット(50)', goods_type: '0004', unit_price: 1500, headquarters_price: 1645, substation_price: 1200, class_price: 1350, current_inventory: 0, stack_status: '1', is_delete: 0 },
  { id: 102, code: 'RNB-01', name: 'のぼり', goods_type: '0004', unit_price: 900, headquarters_price: 586, substation_price: 720, class_price: 810, current_inventory: 98, stack_status: '1', is_delete: 0 },
  { id: 103, code: 'ROK-06', name: 'クラフト素材Step2～5セット', goods_type: 'test0001', unit_price: 0, headquarters_price: 110, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 104, code: 'ROK-10', name: '月例研修会受講のしおり（こども）', goods_type: '0007', unit_price: 0, headquarters_price: 51, substation_price: 0, class_price: -1, current_inventory: 163, stack_status: '1', is_delete: 0 },
  { id: 105, code: 'ROK-12', name: 'クラフト素材Step2', goods_type: 'test0001', unit_price: 0, headquarters_price: 91, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 106, code: 'ROK-13', name: 'クラフト素材Step3', goods_type: 'test0001', unit_price: 0, headquarters_price: 91, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 107, code: 'ROK-14', name: 'クラフト素材Step4', goods_type: 'test0001', unit_price: 0, headquarters_price: 91, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 108, code: 'ROK-15', name: 'クラフト素材Step5', goods_type: 'test0001', unit_price: 0, headquarters_price: 91, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 109, code: 'RRK-09', name: '貼ってはがせるおこさまランチシール', goods_type: '0004', unit_price: 220, headquarters_price: 130, substation_price: 176, class_price: 198, current_inventory: 100, stack_status: '1', is_delete: 0 },
  { id: 110, code: 'RRK-10', name: 'ジグソーパズル(12P)', goods_type: '0004', unit_price: 120, headquarters_price: 105, substation_price: 96, class_price: 120, current_inventory: 1110, stack_status: '1', is_delete: 0 },
  { id: 111, code: 'RRK-11', name: 'じゆうがちょう', goods_type: '0004', unit_price: 150, headquarters_price: 97, substation_price: 120, class_price: 135, current_inventory: 1615, stack_status: '1', is_delete: 0 },
  { id: 112, code: 'RRK-20', name: 'リトミック研究センターロゴ入りクリアファイル(25枚セット)', goods_type: '0004', unit_price: 750, headquarters_price: 483, substation_price: 600, class_price: 675, current_inventory: 351, stack_status: '1', is_delete: 0 },
  { id: 113, code: 'RRK-21', name: '【特価】オリジナルキャラクターファイルブルー(25枚セット)', goods_type: '0004', unit_price: 1000, headquarters_price: 714, substation_price: 800, class_price: 900, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 114, code: 'RRK-22', name: 'オリジナルキャラクターファイルブルー(25枚セット)', goods_type: '0004', unit_price: 1500, headquarters_price: 930, substation_price: 1200, class_price: 1350, current_inventory: 135, stack_status: '1', is_delete: 0 },
  { id: 115, code: 'RRK-23', name: 'オリジナルキャラクターファイルイエロー(25枚セット)', goods_type: 'test0001', unit_price: 1500, headquarters_price: 930, substation_price: 1200, class_price: 1350, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 116, code: 'RSC-07', name: '生徒募集チラシ(200枚)A4', goods_type: '0004', unit_price: 800, headquarters_price: 773, substation_price: 800, class_price: 800, current_inventory: 100, stack_status: '1', is_delete: 0 },
  { id: 117, code: 'RSC-07B', name: '生徒募集チラシ(1000枚)A4', goods_type: '0004', unit_price: 4000, headquarters_price: 3828, substation_price: 4000, class_price: 4000, current_inventory: 100, stack_status: '1', is_delete: 0 },
  { id: 118, code: 'BC', name: 'カラーボード', goods_type: '0002', unit_price: 900, headquarters_price: 510, substation_price: 720, class_price: -810, current_inventory: 169, stack_status: '1', is_delete: 0 },
  { id: 119, code: 'BC-L', name: 'カラーボード(大)', goods_type: '0002', unit_price: 900, headquarters_price: 478, substation_price: 720, class_price: 810, current_inventory: 635, stack_status: '1', is_delete: 0 },
  { id: 120, code: 'BC-M', name: '新カラーボード', goods_type: '0002', unit_price: 900, headquarters_price: 410, substation_price: 720, class_price: 810, current_inventory: 620, stack_status: '1', is_delete: 0 },
  { id: 121, code: 'FCD-22', name: '譜例演奏CD Step2', goods_type: '0007', unit_price: 800, headquarters_price: 291, substation_price: 640, class_price: -800, current_inventory: 243, stack_status: '1', is_delete: 0 },
  { id: 122, code: 'FCD-33', name: '譜例演奏CD Step3', goods_type: '0007', unit_price: 800, headquarters_price: 268, substation_price: 640, class_price: -800, current_inventory: 91, stack_status: '1', is_delete: 0 },
  { id: 123, code: 'FCD-45', name: '譜例演奏CD Step4・5', goods_type: '0007', unit_price: 900, headquarters_price: 346, substation_price: 720, class_price: -900, current_inventory: 33, stack_status: '1', is_delete: 0 },
  { id: 124, code: 'KB-01', name: 'くまさんのおくち', goods_type: '0002', unit_price: 600, headquarters_price: 439, substation_price: 480, class_price: 540, current_inventory: 945, stack_status: '1', is_delete: 0 },
  { id: 125, code: 'KBH-10', name: 'リトミックのためのピアノ演奏法', goods_type: '0007', unit_price: 1500, headquarters_price: 1085, substation_price: 1200, class_price: -1500, current_inventory: 426, stack_status: '1', is_delete: 0 },
  { id: 126, code: 'KR-105', name: 'リトミック105', goods_type: '0007', unit_price: 1200, headquarters_price: 929, substation_price: 960, class_price: -1200, current_inventory: 35, stack_status: '1', is_delete: 0 },
  { id: 127, code: 'KSR-1', name: '動物カード', goods_type: 'test0001', unit_price: 300, headquarters_price: 145, substation_price: 240, class_price: 270, current_inventory: 100, stack_status: '1', is_delete: 0 },
  { id: 128, code: 'KSR-2', name: '動物音符カード', goods_type: '0002', unit_price: 500, headquarters_price: 202, substation_price: 400, class_price: 450, current_inventory: 905, stack_status: '1', is_delete: 0 },
  { id: 129, code: 'LB-2', name: 'レッスンバッグ', goods_type: '0005', unit_price: 1000, headquarters_price: 733, substation_price: 800, class_price: 900, current_inventory: 2013, stack_status: '1', is_delete: 0 },
  { id: 130, code: 'MKG-10', name: '母親セミナーガイドブック', goods_type: 'test0001', unit_price: 1800, headquarters_price: 1184, substation_price: 1440, class_price: 1620, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 131, code: 'MKH-10', name: '指導書ひとりからのクラス作り', goods_type: '0007', unit_price: 1100, headquarters_price: 336, substation_price: 880, class_price: -1100, current_inventory: 1011, stack_status: '1', is_delete: 0 },
  { id: 132, code: 'MKL-01', name: '指導書ベビーのためのリトミック', goods_type: '0007', unit_price: 2400, headquarters_price: 834, substation_price: 1920, class_price: -2400, current_inventory: 192, stack_status: '1', is_delete: 0 },
  { id: 133, code: 'MKL-100', name: '指導書Step100', goods_type: '0001', unit_price: 1800, headquarters_price: 582, substation_price: 1440, class_price: -1800, current_inventory: 389, stack_status: '1', is_delete: 0 },
  { id: 134, code: 'MKL-11', name: '指導書1', goods_type: '0007', unit_price: 1800, headquarters_price: 650, substation_price: 1440, class_price: -1800, current_inventory: 429, stack_status: '1', is_delete: 0 },
  { id: 135, code: 'MKL-22', name: '指導書2', goods_type: '0007', unit_price: 1900, headquarters_price: 634, substation_price: 1520, class_price: -1900, current_inventory: 128, stack_status: '1', is_delete: 0 },
  { id: 136, code: 'MKL-30', name: '小学生のリトミック', goods_type: '0007', unit_price: 2700, headquarters_price: 1153, substation_price: 2160, class_price: -2700, current_inventory: 300, stack_status: '1', is_delete: 0 },
  { id: 137, code: 'MKL-33', name: '指導書3', goods_type: '0007', unit_price: 2400, headquarters_price: 678, substation_price: 1920, class_price: -2400, current_inventory: 17, stack_status: '1', is_delete: 0 },
  { id: 138, code: 'MKL-45', name: '指導書4・5', goods_type: '0007', unit_price: 3400, headquarters_price: 1532, substation_price: 2720, class_price: -3400, current_inventory: 178, stack_status: '1', is_delete: 0 },
  { id: 139, code: 'MKLC-45', name: '指導書4・5付属ＣＤ', goods_type: '0005', unit_price: 0, headquarters_price: 284, substation_price: -10, class_price: -10, current_inventory: 160, stack_status: '0', is_delete: 0 },
  { id: 140, code: 'RB-1', name: 'リトミックバイエル 上', goods_type: '0010', unit_price: 1200, headquarters_price: 763, substation_price: 960, class_price: 1080, current_inventory: 635, stack_status: '1', is_delete: 0 },
  { id: 141, code: 'RB-2', name: 'リトミックバイエル 下', goods_type: '0010', unit_price: 1200, headquarters_price: 882, substation_price: 960, class_price: 1080, current_inventory: 905, stack_status: '1', is_delete: 0 },
  { id: 142, code: 'RBC', name: '3色ボード', goods_type: '0002', unit_price: 700, headquarters_price: 416, substation_price: 560, class_price: 630, current_inventory: 1020, stack_status: '1', is_delete: 0 },
  { id: 143, code: 'RC-2', name: 'リズムカ－ド(2拍子)', goods_type: '0002', unit_price: 250, headquarters_price: 178, substation_price: 200, class_price: 225, current_inventory: 297, stack_status: '1', is_delete: 0 },
  { id: 144, code: 'RC-3', name: 'リズムカ－ド(3拍子)', goods_type: '0002', unit_price: 250, headquarters_price: 192, substation_price: 200, class_price: 225, current_inventory: 488, stack_status: '1', is_delete: 0 },
  { id: 145, code: 'RCD-1', name: '認定試験課題CD初級', goods_type: '0007', unit_price: 1400, headquarters_price: 295, substation_price: 1120, class_price: -1400, current_inventory: 452, stack_status: '1', is_delete: 0 },
  { id: 146, code: 'RCD-2', name: '認定試験課題CD中級', goods_type: '0007', unit_price: 1400, headquarters_price: 340, substation_price: 1120, class_price: -1400, current_inventory: 508, stack_status: '1', is_delete: 0 },
  { id: 147, code: 'RCD-3', name: '認定試験課題CD上級', goods_type: '0007', unit_price: 2500, headquarters_price: 555, substation_price: 2000, class_price: -2500, current_inventory: 296, stack_status: '1', is_delete: 0 },
  { id: 148, code: 'RCD-4', name: '認定試験課題CDディプロマB', goods_type: '0007', unit_price: 2500, headquarters_price: 674, substation_price: 2000, class_price: -2500, current_inventory: 39, stack_status: '1', is_delete: 0 },
  { id: 149, code: 'RCD-6', name: '幼保2級1級練習用CD', goods_type: '0007', unit_price: 1400, headquarters_price: 242, substation_price: 1120, class_price: -1400, current_inventory: 100, stack_status: '1', is_delete: 0 },
  { id: 150, code: 'RF-1B', name: 'フラフープ(青)', goods_type: '0002', unit_price: 1500, headquarters_price: 860, substation_price: 1200, class_price: 1350, current_inventory: 53, stack_status: '1', is_delete: 0 },
  { id: 151, code: 'RF-1R', name: 'フラフープ(赤)', goods_type: '0002', unit_price: 1500, headquarters_price: 860, substation_price: 1200, class_price: 1350, current_inventory: 63, stack_status: '1', is_delete: 0 },
  { id: 152, code: 'RF-1W', name: 'フラフープ(白)', goods_type: '0002', unit_price: 1500, headquarters_price: 860, substation_price: 1200, class_price: 1350, current_inventory: 71, stack_status: '1', is_delete: 0 },
  { id: 153, code: 'RF-1Y', name: 'フラフープ(黄)', goods_type: '0002', unit_price: 1500, headquarters_price: 860, substation_price: 1200, class_price: 1350, current_inventory: 60, stack_status: '1', is_delete: 0 },
  { id: 154, code: 'RO', name: 'おはじき', goods_type: '0002', unit_price: 160, headquarters_price: 115, substation_price: 128, class_price: 144, current_inventory: 213, stack_status: '1', is_delete: 0 },
  { id: 155, code: 'ROK-5', name: 'おとのかいだん', goods_type: '0002', unit_price: 500, headquarters_price: 360, substation_price: 400, class_price: 450, current_inventory: 0, stack_status: '1', is_delete: 0 },
  { id: 156, code: 'RS-1', name: 'ソルフェージュ1', goods_type: '0007', unit_price: 800, headquarters_price: 464, substation_price: 640, class_price: 720, current_inventory: 30, stack_status: '1', is_delete: 0 },
  { id: 157, code: 'RS-2', name: 'ソルフェージュ2', goods_type: '0007', unit_price: 800, headquarters_price: 464, substation_price: 640, class_price: 720, current_inventory: 134, stack_status: '1', is_delete: 0 },
  { id: 158, code: 'RS-3', name: 'ソルフェージュ3', goods_type: '0007', unit_price: 800, headquarters_price: 464, substation_price: 640, class_price: 720, current_inventory: 211, stack_status: '1', is_delete: 0 },
  { id: 159, code: 'RS-4', name: 'ソルフェージュ4', goods_type: '0007', unit_price: 800, headquarters_price: 464, substation_price: 640, class_price: 720, current_inventory: 94, stack_status: '1', is_delete: 0 },
  { id: 160, code: 'RS-5', name: 'ソルフェージュ5', goods_type: '0007', unit_price: 800, headquarters_price: 464, substation_price: 640, class_price: 720, current_inventory: 36, stack_status: '1', is_delete: 0 },
  { id: 161, code: 'RSK-01', name: 'ベビーのためのリトミック前期セット', goods_type: '0003', unit_price: 2400, headquarters_price: 1440, substation_price: 1920, class_price: 2160, current_inventory: 1227, stack_status: '1', is_delete: 0 },
  { id: 162, code: 'RSK-02', name: 'ベビーのためのリトミック後期セット', goods_type: '0003', unit_price: 2400, headquarters_price: 1395, substation_price: 1920, class_price: 2160, current_inventory: 2041, stack_status: '1', is_delete: 0 },
  { id: 163, code: 'RSK-11', name: 'リトミックセット1', goods_type: '0003', unit_price: 4500, headquarters_price: 2445, substation_price: 3600, class_price: 4050, current_inventory: 447, stack_status: '1', is_delete: 0 },
  { id: 164, code: 'RSK-22', name: 'リトミックセット2', goods_type: '0003', unit_price: 6500, headquarters_price: 3990, substation_price: 5200, class_price: 5850, current_inventory: 337, stack_status: '1', is_delete: 0 },
  { id: 165, code: 'RSK-33', name: 'リトミックセット3', goods_type: '0003', unit_price: 6500, headquarters_price: 3810, substation_price: 5200, class_price: 5850, current_inventory: 194, stack_status: '1', is_delete: 0 },
  { id: 166, code: 'RSK-44', name: 'リトミックセット4', goods_type: '0003', unit_price: 7500, headquarters_price: 4510, substation_price: 6000, class_price: 6750, current_inventory: 260, stack_status: '1', is_delete: 0 },
  { id: 167, code: 'RSK-55', name: 'リトミックセット5', goods_type: '0003', unit_price: 7500, headquarters_price: 4326, substation_price: 6000, class_price: 6750, current_inventory: 123, stack_status: '1', is_delete: 0 },
  { id: 168, code: 'RTN-3', name: '3色積み木', goods_type: '0002', unit_price: 2600, headquarters_price: 1520, substation_price: 2080, class_price: 2340, current_inventory: 6, stack_status: '1', is_delete: 0 },
  { id: 169, code: 'RTNA', name: 'リズム積み木Ａセット', goods_type: '0002', unit_price: 5500, headquarters_price: 3944, substation_price: 4400, class_price: 4950, current_inventory: 287, stack_status: '1', is_delete: 0 },
  { id: 170, code: 'RTNB', name: 'リズム積み木Ｂセット', goods_type: '0002', unit_price: 5500, headquarters_price: 3874, substation_price: 4400, class_price: 4950, current_inventory: 146, stack_status: '1', is_delete: 0 },
  { id: 171, code: 'RX-1', name: 'リトミックってなあに？', goods_type: '0007', unit_price: 1300, headquarters_price: 754, substation_price: 1040, class_price: 1170, current_inventory: 291, stack_status: '1', is_delete: 0 },
  { id: 172, code: 'RX-2', name: 'ダルクロ－ズのリトミック', goods_type: '0007', unit_price: 1800, headquarters_price: 936, substation_price: 1440, class_price: -1620, current_inventory: 18, stack_status: '1', is_delete: 0 },
  { id: 173, code: 'RX-3', name: 'こどもがぐんぐん伸びる音楽あそび', goods_type: '0007', unit_price: 1200, headquarters_price: 840, substation_price: 960, class_price: 1080, current_inventory: 170, stack_status: '1', is_delete: 0 },
  { id: 174, code: 'RXK-6', name: '1～5歳のたのしいリトミック(CD付き)', goods_type: '0007', unit_price: 2200, headquarters_price: 1430, substation_price: 1760, class_price: -2200, current_inventory: 281, stack_status: '1', is_delete: 0 },
  { id: 175, code: 'RXK-7', name: '保育ではじめてリトミック(DVD付き)', goods_type: '0007', unit_price: 2800, headquarters_price: 2240, substation_price: 2520, class_price: -2800, current_inventory: 1, stack_status: '1', is_delete: 0 },
  { id: 176, code: 'RXM-1', name: 'ママひとりでするの手伝ってね', goods_type: '0007', unit_price: 1400, headquarters_price: 1120, substation_price: 1190, class_price: -1400, current_inventory: 34, stack_status: '1', is_delete: 0 },
  { id: 177, code: 'RXR-1', name: 'リズムと音楽と教育', goods_type: '0007', unit_price: 3200, headquarters_price: 2255, substation_price: 2560, class_price: -3200, current_inventory: 61, stack_status: '1', is_delete: 0 },
  { id: 178, code: 'RXR-2', name: 'エミール・ジャック=ダルクローズ', goods_type: '0007', unit_price: 5000, headquarters_price: 3500, substation_price: 4000, class_price: -5000, current_inventory: 5, stack_status: '1', is_delete: 0 },
  { id: 179, code: 'RXR-3', name: '音楽教育メソードの比較', goods_type: '0007', unit_price: 5500, headquarters_price: 3850, substation_price: 4400, class_price: -5500, current_inventory: 15, stack_status: '1', is_delete: 0 },
  { id: 180, code: 'RXR-4', name: 'リズム･インサイド', goods_type: '0007', unit_price: 3200, headquarters_price: 2560, substation_price: 2720, class_price: -3200, current_inventory: 50, stack_status: '1', is_delete: 0 },
  { id: 181, code: 'RXR-5', name: '音楽のリズム', goods_type: '0007', unit_price: 2000, headquarters_price: 1400, substation_price: 1600, class_price: -2000, current_inventory: 50, stack_status: '1', is_delete: 0 },
  { id: 182, code: 'SF-5', name: 'スカーフ(5枚入)', goods_type: '0002', unit_price: 1500, headquarters_price: 770, substation_price: 1200, class_price: 1350, current_inventory: 2591, stack_status: '1', is_delete: 0 },
  { id: 183, code: 'ST', name: 'スティック', goods_type: '0002', unit_price: 600, headquarters_price: 350, substation_price: 480, class_price: 540, current_inventory: 116, stack_status: '1', is_delete: 0 },
  { id: 184, code: 'WB-1', name: 'ウッドブロック', goods_type: '0002', unit_price: 2500, headquarters_price: 1531, substation_price: 2000, class_price: 2250, current_inventory: 839, stack_status: '1', is_delete: 0 },
  { id: 185, code: 'YRL-012', name: '園児のためのリトミック0・1・2歳', goods_type: '0007', unit_price: 2400, headquarters_price: 953, substation_price: 1920, class_price: -2400, current_inventory: 609, stack_status: '1', is_delete: 0 },
  { id: 186, code: 'YRL-003', name: '園児のためのリトミック3歳', goods_type: '0007', unit_price: 2800, headquarters_price: 1378, substation_price: 2240, class_price: -2800, current_inventory: 1020, stack_status: '1', is_delete: 0 },
  { id: 187, code: 'YRL-045', name: '園児のためのリトミック4・5歳', goods_type: '0007', unit_price: 3200, headquarters_price: 1863, substation_price: 2560, class_price: -3200, current_inventory: 1020, stack_status: '1', is_delete: 0 },
  { id: 188, code: 'YRL-31', name: '幼保リトミック3歳児', goods_type: '0007', unit_price: 1500, headquarters_price: 546, substation_price: 1200, class_price: -1350, current_inventory: 279, stack_status: '1', is_delete: 0 },
  { id: 189, code: 'YRL-41', name: '幼保リトミック4歳児', goods_type: '0007', unit_price: 1800, headquarters_price: 742, substation_price: 1440, class_price: -1620, current_inventory: 4, stack_status: '1', is_delete: 0 },
  { id: 190, code: 'YRL-51', name: '幼保リトミック5歳児', goods_type: '0007', unit_price: 1800, headquarters_price: 748, substation_price: 1440, class_price: -1620, current_inventory: 120, stack_status: '1', is_delete: 0 },
  { id: 191, code: 'NSK-01', name: '認定指定校1級セット', goods_type: 'test0001', unit_price: 3500, headquarters_price: 1406, substation_price: 2800, class_price: 3500, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 192, code: 'NSK-02', name: '認定指定校2級セット', goods_type: 'test0001', unit_price: 6500, headquarters_price: 1860, substation_price: 5200, class_price: 6500, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 193, code: 'YP-2024', name: '教員養成校パンフレット', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 194, code: 'YG-2024', name: '教員養成校願書', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 195, code: 'YT-2024', name: '教員養成東京校要項', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 196, code: 'YO-2024', name: '教員養成大阪校要項', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 197, code: 'YN-2024', name: '教員養成名古屋校要項', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 198, code: 'SY-2024', name: '月例パンフレット', goods_type: 'test0001', unit_price: 20, headquarters_price: 15, substation_price: 20, class_price: 20, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 199, code: 'SZ-2024', name: '月例キャンペーンチラシ', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 200, code: 'SZ-2025', name: '月例キャンペーンチラシ2025', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 201, code: 'NKC-01', name: '口座振替チラシ（裏面 口座振替依頼書記入例）', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 202, code: 'NKC-02', name: '子育て親塾　チラシ', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 203, code: 'NKJ-01', name: '子育て親塾　受講確認用紙', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 204, code: 'NKF-01', name: '教室あて提出封筒', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 205, code: 'NKF-02', name: 'NKSあて返信封筒', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 206, code: 'NKR-01', name: '口座振替依頼書', goods_type: 'test0001', unit_price: 0, headquarters_price: 0, substation_price: 0, class_price: 0, current_inventory: 100, stack_status: '0', is_delete: 0 },
  { id: 212, code: 'ROK-11', name: '月例研修会受講のしおり（園児）', goods_type: '0005', unit_price: 0, headquarters_price: 51, substation_price: 0, class_price: -1, current_inventory: 92, stack_status: '1', is_delete: 0 },
];

async function importProducts() {
  
  console.log("Starting product import...");
  console.log(`Total products to import: ${productsData.length}`);
  
  // First, delete all existing products
  console.log("Deleting existing products...");
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .gte("id", "00000000-0000-0000-0000-000000000000");
  
  if (deleteError) {
    console.error("Error deleting existing products:", deleteError);
    return;
  }
  console.log("Existing products deleted.");
  
  // Transform and insert products
  const transformedProducts = productsData
    .filter(p => p.is_delete === 0) // Only non-deleted products
    .map((p, index) => ({
      code: p.code.trim(),
      name: p.name.trim(),
      description: null,
      category_id: categoryMapping[p.goods_type] || null,
      price_hq: Math.max(0, p.headquarters_price),
      price_branch: Math.max(0, p.substation_price),
      price_classroom: Math.max(0, p.class_price),
      price_retail: Math.max(0, p.unit_price),
      stock: Math.max(0, p.current_inventory),
      stock_alert_threshold: 10,
      is_active: p.stack_status === '1',
      is_taxable: true,
      tax_rate: 10.00,
      min_order_quantity: 1,
      max_order_quantity: null,
      order_unit: '個',
      external_id: String(p.id),
      display_order: index,
    }));
  
  console.log(`Inserting ${transformedProducts.length} products...`);
  
  // Insert in batches of 50
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < transformedProducts.length; i += batchSize) {
    const batch = transformedProducts.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from("products")
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      errorCount += batch.length;
    } else {
      successCount += data?.length || 0;
      console.log(`Batch ${i / batchSize + 1} inserted: ${data?.length || 0} products`);
    }
  }
  
  console.log("\n=== Import Complete ===");
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

importProducts().catch(console.error);
