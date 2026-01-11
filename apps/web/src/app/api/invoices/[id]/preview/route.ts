import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import {
  transformInvoiceData,
  generateInvoiceNo,
} from "@/lib/pdf";
import { generateFullInvoiceHTML } from "@/lib/pdf/invoice-html-template";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const showZero = searchParams.get("showZero") === "true";
    const supabase = getSupabaseAdmin();

    // 获取请求书数据（包含责任者名称）
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        departments(
          id,
          name,
          store_code,
          postal_code,
          prefecture,
          city,
          address_line1,
          address_line2,
          manager_name
        )
      `)
      .eq("id", id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "請求書が見つかりません", details: invoiceError?.message },
        { status: 404 }
      );
    }

    // 获取department数据（可能是数组或对象）
    const deptData = Array.isArray(invoice.departments) 
      ? invoice.departments[0] 
      : invoice.departments;
    
    // 组合地址
    const department = deptData ? {
      ...deptData,
      address: [deptData.prefecture, deptData.city, deptData.address_line1, deptData.address_line2]
        .filter(Boolean)
        .join("")
    } : null;

    // 获取上月请求书的总额（前月ご請求額）
    const previousMonth = getPreviousMonth(invoice.billing_month);
    const { data: previousInvoice } = await supabase
      .from("invoices")
      .select("total_amount")
      .eq("department_id", invoice.department_id)
      .eq("billing_month", previousMonth)
      .eq("is_current", true)
      .single();
    
    const previousBalance = previousInvoice?.total_amount || 0;

    // 获取同月所有支局的store_code用于生成编号
    const { data: allInvoices } = await supabase
      .from("invoices")
      .select("department:departments(store_code)")
      .eq("billing_month", invoice.billing_month)
      .eq("is_current", true);

    const allStoreCodes = (allInvoices || [])
      .map((inv: Record<string, unknown>) => {
        const dept = inv.department as { store_code?: string } | { store_code?: string }[] | null;
        if (Array.isArray(dept)) {
          return dept[0]?.store_code;
        }
        return dept?.store_code;
      })
      .filter((code): code is string => Boolean(code));

    const invoiceNo = generateInvoiceNo(
      department?.store_code || "",
      allStoreCodes
    );

    // 获取CC会员数据（非口座振替）
    // 注意：支局自己的数据（classroom_code等于store_code）不应用is_excluded过滤
    const branchCode = department?.store_code?.substring(0, 4);
    const storeCode = department?.store_code || "";
    
    // 获取非排除的教室数据
    const { data: normalCcMembers } = await supabase
      .from("cc_members")
      .select("classroom_name, classroom_code, total_count, unit_price, amount, is_aigran, is_bank_transfer")
      .eq("billing_month", invoice.billing_month)
      .eq("branch_code", branchCode)
      .eq("is_excluded", false)
      .eq("is_bank_transfer", false);
    
    // 获取支局自己的数据（即使is_excluded为true也要显示）
    const { data: branchOwnCcMembers } = await supabase
      .from("cc_members")
      .select("classroom_name, classroom_code, total_count, unit_price, amount, is_aigran, is_bank_transfer")
      .eq("billing_month", invoice.billing_month)
      .eq("classroom_code", storeCode)
      .eq("is_bank_transfer", false);
    
    // 合并数据，去重（支局自己的数据可能已经在normalCcMembers中）
    const normalCcMembersMap = new Map<string, typeof normalCcMembers extends (infer T)[] | null ? T : never>();
    (normalCcMembers || []).forEach(m => normalCcMembersMap.set(m.classroom_code, m));
    (branchOwnCcMembers || []).forEach(m => {
      if (!normalCcMembersMap.has(m.classroom_code)) {
        normalCcMembersMap.set(m.classroom_code, m);
      }
    });
    const mergedNormalCcMembers = Array.from(normalCcMembersMap.values());

    // 获取口座振替教室数据（不受is_excluded影响，因为口座振替教室需要在请求书中显示）
    const { data: bankTransferCcMembers } = await supabase
      .from("cc_members")
      .select("classroom_name, classroom_code, total_count, unit_price, amount, is_aigran, is_bank_transfer")
      .eq("billing_month", invoice.billing_month)
      .eq("branch_code", branchCode)
      .eq("is_bank_transfer", true)
      .gt("total_count", 0);

    // 合并所有CC会员数据并按classroom_code排序（納入先从小到大）
    const ccMembers = [...mergedNormalCcMembers, ...(bankTransferCcMembers || [])].sort(
      (a, b) => (a.classroom_code || "").localeCompare(b.classroom_code || "")
    );

    // 筛选口座振替教室数据（用于その他お取引部分）
    const bankTransferMembers = bankTransferCcMembers || [];

    // 获取教材订单数据（只获取请求书支付方式的订单，排除Stripe已支付的订单）
    // 通过shipping_address.storeCode关联到支局
    const branchCodeForOrders = department?.store_code?.substring(0, 4);
    const startDate = `${invoice.billing_month}-01`;
    const endDate = getNextMonth(invoice.billing_month);
    
    // 先获取该月份的所有请求书支付订单
    const { data: orders } = await supabase
      .from("orders")
      .select("id, created_at, order_number, payment_method, payment_status, shipping_address")
      .gte("created_at", startDate)
      .lt("created_at", endDate)
      .eq("payment_method", "請求書");

    // 筛选属于该支局的订单（通过shipping_address.storeCode前4位匹配）
    const branchOrderIds = (orders || [])
      .filter((o) => {
        const orderStoreCode = (o.shipping_address as { storeCode?: string })?.storeCode;
        return orderStoreCode && orderStoreCode.startsWith(branchCodeForOrders || "");
      })
      .map((o) => o.id);

    // 获取订单明细 - 包含商品的一般価格用于计算マージン
    let materials: Array<{
      quantity: number;
      unit_price: number;
      subtotal: number;
      product_name: string;
      product_id: string;
      order_id: string;
      product: { price_retail: number } | { price_retail: number }[] | null;
    }> | null = null;
    
    if (branchOrderIds.length > 0) {
      // 先获取order_items基本数据
      const { data: orderItems } = await supabase
        .from("order_items")
        .select(`
          quantity,
          unit_price,
          subtotal,
          product_name,
          product_id,
          order_id
        `)
        .in("order_id", branchOrderIds);
      
      // 获取所有相关产品的price_retail
      const productIds = [...new Set((orderItems || []).map(item => item.product_id))];
      const { data: products } = await supabase
        .from("products")
        .select("id, price_retail")
        .in("id", productIds);
      
      // 创建产品ID到price_retail的映射
      const productPriceMap = new Map<string, number>();
      (products || []).forEach(p => {
        productPriceMap.set(p.id, p.price_retail);
      });
      
      // 合并数据
      materials = (orderItems || []).map(item => ({
        ...item,
        product: { price_retail: productPriceMap.get(item.product_id) || 0 }
      }));
    }
    
    // 创建订单ID到订单信息的映射（包含store_code用于判断是支局还是教室购买）
    const orderMap = new Map<string, { created_at: string; order_number: string; store_code: string }>();
    (orders || []).forEach((o) => {
      const orderStoreCode = (o.shipping_address as { storeCode?: string })?.storeCode || "";
      orderMap.set(o.id, { 
        created_at: o.created_at, 
        order_number: o.order_number,
        store_code: orderStoreCode
      });
    });
    
    // 支局的store_code（用于判断是否是支局本身购买）
    const branchStoreCode = department?.store_code || "";

    // 获取其他费用数据（按费用类型分类）
    // 支局请求书只计算支局本身的费用（精确匹配store_code），不包括底下教室的费用
    const { data: allExpenses } = await supabase
      .from("expenses")
      .select("id, description, amount, expense_type")
      .eq("store_code", department?.store_code)
      .eq("invoice_month", invoice.billing_month)
      .eq("review_status", "approved");

    // 按费用类型分类
    const taxableExpenses = (allExpenses || []).filter((e: { expense_type: string }) => e.expense_type === "課税分");
    const nonTaxableExpenses = (allExpenses || []).filter((e: { expense_type: string }) => e.expense_type === "非課税分");
    const adjustmentExpenses = (allExpenses || []).filter((e: { expense_type: string }) => e.expense_type === "調整・返金");

    // 计算各类费用总额
    const taxableTotal = taxableExpenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
    const nonTaxableTotal = nonTaxableExpenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
    const adjustmentTotal = adjustmentExpenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

    // 将口座振替教室数据转换为その他お取引格式
    // 格式：X月度チャイルドクラブ会費(口座振替分)(店番后三位)Y名分@600
    const billingMonthNum = invoice.billing_month.split("-")[1].replace(/^0/, ""); // 去掉前导0
    const bankTransferExpenses = (bankTransferMembers || []).map((m: { classroom_code: string; total_count: number; amount: number }) => {
      const storeCodeSuffix = m.classroom_code.slice(-3); // 店番后三位
      return {
        description: `${billingMonthNum}月度チャイルドクラブ会費(口座振替分)(${storeCodeSuffix})${m.total_count}名分@600`,
        amount: -(m.total_count * 600), // 口座振替单价600円（负数，因为是已收款项）
      };
    });

    // 合并所有费用用于明细显示（口座振替教室 + 課税分费用）
    const expenses = [...bankTransferExpenses, ...taxableExpenses];

    // 计算口座振替教室的负数总额
    const bankTransferTotal = bankTransferExpenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

    // 转换数据
    const pdfData = transformInvoiceData(
      {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        billing_month: invoice.billing_month,
        previous_balance: previousBalance, // 使用上月请求书总额
        material_amount: invoice.material_amount || 0,
        membership_amount: invoice.membership_amount || 0,
        other_expenses_amount: taxableTotal + bankTransferTotal, // 課税分总额 + 口座振替负数
        adjustment_amount: adjustmentTotal, // 調整・返金总额
        non_taxable_amount: nonTaxableTotal, // 非課税分总额
        material_return_amount: invoice.material_return_amount || 0, // 教材販売割戻し
        subtotal: invoice.subtotal || 0,
        tax_amount: invoice.tax_amount || 0,
        total_amount: invoice.total_amount || 0,
        department: {
          id: department?.id || "",
          name: department?.name || "",
          store_code: department?.store_code || "",
          postal_code: department?.postal_code,
          address: department?.address,
          // 细分地址字段
          prefecture: deptData?.prefecture || "",
          city: deptData?.city || "",
          address_line1: deptData?.address_line1 || "",
          address_line2: deptData?.address_line2 || "",
          manager_name: department?.manager_name || "",
        },
      },
      invoiceNo,
      (ccMembers || []).map((m: { classroom_name: string; classroom_code: string; total_count: number; unit_price: number; amount: number; is_aigran?: boolean; is_bank_transfer?: boolean }) => ({
        class_name: m.classroom_name,
        classroom_code: m.classroom_code,
        total_count: m.total_count,
        unit_price: m.unit_price || 480, // 所有教室使用正常单价480円
        total_amount: m.is_bank_transfer ? m.total_count * 480 : m.amount, // 口座振替教室使用480円计算
        is_aigran: m.is_aigran || false,
        is_bank_transfer: m.is_bank_transfer || false,
      })),
      (materials || []).map((m: Record<string, unknown>) => {
        const orderId = m.order_id as string;
        const orderInfo = orderMap.get(orderId);
        const orderStoreCode = orderInfo?.store_code || "";
        const isBranchOrder = orderStoreCode === branchStoreCode; // 是否是支局本身购买
        // 纳入先：支局购买显示"00"，教室购买显示店番后三位
        const deliveryTo = isBranchOrder ? "00" : orderStoreCode.slice(-3);
        // 日期格式：MM/DD
        const dateStr = orderInfo?.created_at?.split("T")[0] || "";
        const formattedDate = dateStr ? `${parseInt(dateStr.split("-")[1])}/${parseInt(dateStr.split("-")[2])}` : "";
        // 伝票番号：只显示数字部分
        const slipNumber = (orderInfo?.order_number || "").replace(/\D/g, "");
        // 获取商品的一般価格
        const productData = m.product as { price_retail: number } | { price_retail: number }[] | null;
        const priceRetail = Array.isArray(productData) ? productData[0]?.price_retail : productData?.price_retail;
        
        return {
          order_date: formattedDate,
          slip_number: slipNumber,
          product_name: m.product_name as string || "",
          unit_price: m.unit_price as number,
          quantity: m.quantity as number,
          amount: m.subtotal as number,
          delivery_to: deliveryTo, // 纳入先
          is_branch_order: isBranchOrder, // 是否计算请求额
          price_retail: priceRetail || 0, // 一般価格（用于计算マージン）
        };
      }),
      (expenses || []).map((e: { description: string; amount: number }) => ({
        item_name: e.description,
        amount: e.amount,
      })),
      invoice.previous_balance || 0
    );

    // 生成HTML (isPreview = true)
    const htmlContent = generateFullInvoiceHTML(pdfData, showZero, true);
    
    // 注入工具栏到HTML中
    const toolbarHTML = `
    <style>
      .preview-toolbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 56px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      
      .preview-toolbar-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .preview-toolbar-title {
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        font-family: 'Noto Sans JP', sans-serif;
      }
      
      .preview-toolbar-subtitle {
        color: rgba(255,255,255,0.7);
        font-size: 13px;
        font-family: 'Noto Sans JP', sans-serif;
      }
      
      .preview-toolbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .preview-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        font-family: 'Noto Sans JP', sans-serif;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        text-decoration: none;
      }
      
      .preview-btn-primary {
        background: linear-gradient(135deg, #00AC4D 0%, #00963F 100%);
        color: #fff;
      }
      
      .preview-btn-primary:hover {
        background: linear-gradient(135deg, #00C55A 0%, #00AC4D 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,172,77,0.3);
      }
      
      .preview-btn-secondary {
        background: rgba(255,255,255,0.1);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.2);
      }
      
      .preview-btn-secondary:hover {
        background: rgba(255,255,255,0.2);
      }
      
      .preview-btn svg {
        width: 18px;
        height: 18px;
      }
      
      .preview-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255,255,255,0.9);
        font-size: 13px;
        font-family: 'Noto Sans JP', sans-serif;
      }
      
      .preview-toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        background: rgba(255,255,255,0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      
      .preview-toggle-switch.active {
        background: #00AC4D;
      }
      
      .preview-toggle-switch::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: #fff;
        border-radius: 50%;
        transition: transform 0.2s ease;
      }
      
      .preview-toggle-switch.active::after {
        transform: translateX(20px);
      }
      
      body {
        padding-top: 76px !important;
      }
      
      /* Alert Toast */
      .alert-toast {
        position: fixed;
        top: 80px;
        right: 24px;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10001;
        animation: slideIn 0.3s ease;
      }
      
      .alert-toast.success {
        background: #00AC4D;
        color: #fff;
      }
      
      .alert-toast.error {
        background: #dc2626;
        color: #fff;
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      /* Dialog Overlay */
      .dialog-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      
      .dialog-content {
        background: #fff;
        border-radius: 12px;
        width: 90%;
        max-width: 700px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      }
      
      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #eee;
      }
      
      .dialog-header h2 {
        font-size: 18px;
        font-weight: 700;
        color: #111;
        margin: 0;
      }
      
      .dialog-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #666;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
      
      .dialog-close:hover {
        color: #111;
      }
      
      .dialog-body {
        padding: 20px 24px;
        overflow-y: auto;
        flex: 1;
      }
      
      .dialog-description {
        font-size: 14px;
        color: #666;
        margin-bottom: 16px;
        line-height: 1.6;
      }
      
      .duplicate-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .duplicate-group {
        border: 1px solid #e5e5e5;
        border-radius: 8px;
        overflow: hidden;
      }
      
      .group-header {
        background: #f9f9f9;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e5e5;
      }
      
      .group-code {
        font-size: 13px;
        color: #666;
      }
      
      .group-items {
        display: flex;
        flex-direction: column;
      }
      
      .duplicate-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .duplicate-item:last-child {
        border-bottom: none;
      }
      
      .duplicate-item:hover {
        background: #f9f9f9;
      }
      
      .duplicate-item.auto {
        background: #f0fdf4;
      }
      
      .duplicate-item.csv {
        background: #fef3c7;
      }
      
      .duplicate-item input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
      
      .duplicate-item input[type="checkbox"]:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
      
      .item-source {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
        white-space: nowrap;
      }
      
      .duplicate-item.auto .item-source {
        background: #00AC4D;
        color: #fff;
      }
      
      .duplicate-item.csv .item-source {
        background: #f59e0b;
        color: #fff;
      }
      
      .item-classroom {
        font-size: 12px;
        font-weight: 600;
        color: #555;
        white-space: nowrap;
        min-width: 120px;
      }
      
      .item-desc {
        flex: 1;
        font-size: 13px;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .item-amount {
        font-size: 14px;
        font-weight: 600;
        color: #111;
        white-space: nowrap;
      }
      
      .item-amount.negative {
        color: #dc2626;
      }
      
      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 24px;
        border-top: 1px solid #eee;
        background: #f9f9f9;
      }
      
      .dialog-btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }
      
      .dialog-btn.primary {
        background: #dc2626;
        color: #fff;
      }
      
      .dialog-btn.primary:hover {
        background: #b91c1c;
      }
      
      .dialog-btn.primary:disabled {
        background: #999;
        cursor: not-allowed;
      }
      
      .dialog-btn.secondary {
        background: #e5e5e5;
        color: #333;
      }
      
      .dialog-btn.secondary:hover {
        background: #d4d4d4;
      }
      
      .loading-spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      @media print {
        .preview-toolbar {
          display: none !important;
        }
        body {
          padding-top: 0 !important;
        }
      }
    </style>
    
    <div class="preview-toolbar">
      <div class="preview-toolbar-left">
        <div>
          <div class="preview-toolbar-title">請求書プレビュー</div>
          <div class="preview-toolbar-subtitle">${invoice.invoice_number} - ${department?.name || ""}</div>
        </div>
      </div>
      <div class="preview-toolbar-right">
        <div class="preview-toggle">
          <span>0人教室を表示</span>
          <div class="preview-toggle-switch ${showZero ? 'active' : ''}" id="zeroMemberToggle" onclick="toggleZeroMembers()"></div>
        </div>
        <button class="preview-btn preview-btn-secondary" onclick="checkDuplicates()" id="checkDuplicatesBtn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          重複チェック
        </button>
        <button class="preview-btn preview-btn-secondary" onclick="window.print()">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          印刷
        </button>
        <a href="/api/invoices/${id}/pdf" class="preview-btn preview-btn-primary" download="${invoice.invoice_number}.pdf">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          PDFダウンロード
        </a>
        <button class="preview-btn preview-btn-secondary" onclick="window.close()">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          閉じる
        </button>
      </div>
    </div>
    <script>
      function toggleZeroMembers() {
        const toggle = document.getElementById('zeroMemberToggle');
        const withZero = document.getElementById('container-with-zero');
        const withoutZero = document.getElementById('container-without-zero');
        const pdfLink = document.querySelector('a[href*="/api/invoices/"][href$="/pdf"]');
        
        const isActive = toggle.classList.toggle('active');
        
        if (isActive) {
          withZero.classList.add('preview-active');
          withoutZero.classList.remove('preview-active');
          if (pdfLink) {
            const url = new URL(pdfLink.href, window.location.origin);
            url.searchParams.set('showZero', 'true');
            pdfLink.href = url.pathname + url.search;
          }
        } else {
          withZero.classList.remove('preview-active');
          withoutZero.classList.add('preview-active');
          if (pdfLink) {
            const url = new URL(pdfLink.href, window.location.origin);
            url.searchParams.set('showZero', 'false');
            pdfLink.href = url.pathname + url.search;
          }
        }
      }
      
      async function checkDuplicates() {
        const btn = document.getElementById('checkDuplicatesBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> チェック中...';
        
        try {
          const response = await fetch('/api/invoices/${id}/check-duplicates');
          const data = await response.json();
          
          if (!data.has_duplicates) {
            showAlert('重複データはありません', 'success');
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:18px;height:18px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 重複チェック';
            btn.disabled = false;
            return;
          }
          
          showDuplicateDialog(data);
        } catch (error) {
          showAlert('エラーが発生しました: ' + error.message, 'error');
        }
        
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:18px;height:18px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 重複チェック';
        btn.disabled = false;
      }
      
      function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert-toast ' + type;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
      }
      
      function showDuplicateDialog(data) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.innerHTML = \`
          <div class="dialog-content">
            <div class="dialog-header">
              <h2>重複データが見つかりました</h2>
              <button class="dialog-close" onclick="this.closest('.dialog-overlay').remove()">&times;</button>
            </div>
            <div class="dialog-body">
              <p class="dialog-description">
                口座振替教室のデータが自動生成とCSVインポートで重複しています。<br>
                削除する項目を選択してください。（CSVインポート分を削除することを推奨）
              </p>
              <div class="duplicate-list">
                \${data.duplicates.map(group => \`
                  <div class="duplicate-group">
                    <div class="group-header">
                      <strong>\${group.classroom_name}</strong>
                      <span class="group-code">(\${group.classroom_code.slice(-3)}) \${group.member_count}名</span>
                    </div>
                    <div class="group-items">
                      \${group.items.map(item => \`
                        <label class="duplicate-item \${item.source}">
                          <input type="checkbox" 
                                 name="delete_items" 
                                 value="\${item.id}" 
                                 \${item.recommended_delete ? 'checked' : ''}
                                 \${item.source === 'auto' ? 'disabled' : ''}>
                          <span class="item-source">\${item.source === 'auto' ? '自動生成' : 'CSV'}</span>
                          <span class="item-desc">\${item.description}</span>
                          <span class="item-amount \${item.amount < 0 ? 'negative' : ''}">\${item.amount < 0 ? '(' : ''}¥\${Math.abs(item.amount).toLocaleString()}\${item.amount < 0 ? ')' : ''}</span>
                        </label>
                      \`).join('')}
                    </div>
                  </div>
                \`).join('')}
              </div>
            </div>
            <div class="dialog-footer">
              <button class="dialog-btn secondary" onclick="this.closest('.dialog-overlay').remove()">キャンセル</button>
              <button class="dialog-btn primary" onclick="deleteDuplicates(this)">選択した項目を削除</button>
            </div>
          </div>
        \`;
        document.body.appendChild(overlay);
      }
      
      async function deleteDuplicates(btn) {
        const checkboxes = document.querySelectorAll('input[name="delete_items"]:checked:not(:disabled)');
        const ids = Array.from(checkboxes).map(cb => cb.value);
        
        if (ids.length === 0) {
          showAlert('削除する項目を選択してください', 'error');
          return;
        }
        
        btn.disabled = true;
        btn.textContent = '削除中...';
        
        try {
          const response = await fetch('/api/invoices/${id}/check-duplicates', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expense_ids: ids })
          });
          
          const result = await response.json();
          
          if (result.success) {
            showAlert(result.message, 'success');
            document.querySelector('.dialog-overlay').remove();
            // ページをリロードして最新データを表示
            setTimeout(() => location.reload(), 1000);
          } else {
            showAlert(result.error || '削除に失敗しました', 'error');
          }
        } catch (error) {
          showAlert('エラーが発生しました: ' + error.message, 'error');
        }
        
        btn.disabled = false;
        btn.textContent = '選択した項目を削除';
      }
    </script>
    `;
    
    // 将工具栏注入到<body>标签后面
    const finalHTML = htmlContent.replace(/<body[^>]*>/, (match) => match + toolbarHTML);

    return new NextResponse(finalHTML, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating invoice preview:", error);
    return NextResponse.json(
      { error: "プレビュー生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

function getNextMonth(billingMonth: string): string {
  const [year, month] = billingMonth.split("-").map(Number);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
}

function getPreviousMonth(billingMonth: string): string {
  const [year, month] = billingMonth.split("-").map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
}
