import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import { cookies } from "next/headers";
import * as XLSX from "xlsx";

// SuperAdmin password for importing data (should be in env in production)
const IMPORT_DATA_PASSWORD = process.env.ADMIN_CLEAR_DATA_PASSWORD || "CLEAR_TEST_DATA_2025";

// Legacy single-sheet format
type OrderRow = {
  order_number?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: string;
  status?: string;
  payment_status?: string;
  price_type?: string;
  total_amount?: number;
  subtotal?: number;
  tax_amount?: number;
  shipping_fee?: number;
  notes?: string;
  created_at?: string;
  // Order items (comma-separated product codes and quantities)
  items?: string; // Format: "PROD001:2,PROD002:1"
};

// Customer's dual-sheet format - using generic record type for flexible key matching
type CustomerOrderRow = Record<string, unknown>;
type CustomerOrderItemRow = Record<string, unknown>;

// Helper to parse Excel date (can be number or string)
function parseExcelDate(value: unknown): Date {
  if (!value) return new Date();
  
  // If it's a number, it's an Excel serial date
  if (typeof value === "number") {
    // Excel serial date: days since 1900-01-01 (with a bug for 1900 leap year)
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  return new Date();
}

// Helper to find a value by partial key match (handles keys with trailing spaces/newlines)
function findValue(row: Record<string, unknown>, ...keyPatterns: string[]): unknown {
  for (const pattern of keyPatterns) {
    // Try exact match first
    if (row[pattern] !== undefined) return row[pattern];
    // Try finding key that starts with the pattern
    for (const key of Object.keys(row)) {
      if (key.trim().startsWith(pattern.trim())) {
        return row[key];
      }
    }
  }
  return undefined;
}

// Helper to get order ID from row (handles different column name formats)
function getOrderId(row: CustomerOrderRow | CustomerOrderItemRow): number | undefined {
  const value = findValue(row, "注文ID");
  return typeof value === "number" ? value : undefined;
}

// Helper to get string value
function getString(row: Record<string, unknown>, ...keys: string[]): string {
  const value = findValue(row, ...keys);
  return typeof value === "string" ? value : (value !== undefined ? String(value) : "");
}

// Helper to get number value
function getNumber(row: Record<string, unknown>, ...keys: string[]): number {
  const value = findValue(row, ...keys);
  return typeof value === "number" ? value : 0;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const password = formData.get("password") as string | null;
    const operatorName = formData.get("operator_name") as string | null;
    const targetYear = parseInt(formData.get("target_year") as string) || new Date().getFullYear();
    const targetMonth = parseInt(formData.get("target_month") as string) || (new Date().getMonth() + 1);
    
    // Calculate target date (first day of the specified month)
    const targetDate = new Date(targetYear, targetMonth - 1, 15, 12, 0, 0); // 15th of month at noon
    
    if (!file) {
      return NextResponse.json(
        { error: "ファイルが選択されていません" },
        { status: 400 }
      );
    }
    
    // Validate operator name
    if (!operatorName || operatorName.trim().length < 2) {
      return NextResponse.json(
        { error: "操作者の氏名を入力してください（2文字以上）" },
        { status: 400 }
      );
    }
    
    // Validate password
    if (password !== IMPORT_DATA_PASSWORD) {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 403 }
      );
    }
    
    // Get current user from session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    let adminAccountId: string | null = null;
    let adminName = "Unknown";
    let adminRole = "Unknown";
    
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(
          Buffer.from(sessionCookie.value, "base64").toString()
        );
        const payload = JSON.parse(sessionData.payload);
        adminAccountId = payload.admin_account_id;
        
        // Get admin details
        if (adminAccountId) {
          const { data: adminData } = await supabase
            .from("admin_accounts")
            .select(`
              display_name,
              roles:role_id (
                name,
                code
              )
            `)
            .eq("account_id", adminAccountId)
            .single();
          
          if (adminData) {
            adminName = adminData.display_name || adminAccountId;
            adminRole = (adminData.roles as { code?: string })?.code || "unknown";
          }
        }
      } catch {
        // Session parsing failed
      }
    }
    
    // Check if user is SuperAdmin
    if (adminRole !== "admin") {
      return NextResponse.json(
        { error: "この操作はスーパー管理者のみ実行できます" },
        { status: 403 }
      );
    }
    
    // Read file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
    
    // Get products for item lookup
    const { data: products } = await supabase
      .from("products")
      .select("id, code, name, price_hq, price_branch, price_classroom, price_retail");
    
    const productMap = new Map(products?.map((p) => [p.code, p]) || []);
    
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    let totalRows = 0;
    
    // Check if this is the customer's dual-sheet format
    const hasOrderSheet = workbook.SheetNames.includes("注文情報");
    const hasItemSheet = workbook.SheetNames.includes("注文関連商品リスト");
    const isCustomerFormat = hasOrderSheet && hasItemSheet;
    
    if (isCustomerFormat) {
      // ========== Customer's dual-sheet format ==========
      const orderSheet = workbook.Sheets["注文情報"];
      const itemSheet = workbook.Sheets["注文関連商品リスト"];
      
      const orderRows: CustomerOrderRow[] = XLSX.utils.sheet_to_json(orderSheet);
      const itemRows: CustomerOrderItemRow[] = XLSX.utils.sheet_to_json(itemSheet);
      
      // Filter out empty rows
      const validOrderRows = orderRows.filter(row => getOrderId(row));
      const validItemRows = itemRows.filter(row => getOrderId(row));
      
      if (validOrderRows.length === 0) {
        return NextResponse.json(
          { error: "注文情報シートにデータがありません" },
          { status: 400 }
        );
      }
      
      totalRows = validOrderRows.length;
      
      // Use a fixed system UUID for imported orders (no foreign key constraint on orders.user_id)
      const importUserId = "00000000-0000-0000-0000-000000000001";
      
      // Group items by order ID
      const itemsByOrderId = new Map<number, CustomerOrderItemRow[]>();
      for (const item of validItemRows) {
        const orderId = getOrderId(item);
        if (orderId) {
          if (!itemsByOrderId.has(orderId)) {
            itemsByOrderId.set(orderId, []);
          }
          itemsByOrderId.get(orderId)!.push(item);
        }
      }
      
      // Process each order
      for (let i = 0; i < validOrderRows.length; i++) {
        const row = validOrderRows[i];
        const rowNum = i + 2;
        const orderId = getOrderId(row);
        
        if (!orderId) {
          failedCount++;
          errors.push(`行 ${rowNum}: 注文IDがありません`);
          continue;
        }
        
        try {
          // Parse order data using helper functions
          const orderNumber = `ORD-${orderId}`;
          const customerName = getString(row, "購入者所属店名", "購入者名") || "不明";
          const storeCode = getString(row, "購入者所属店番");
          const subtotal = Math.round(getNumber(row, "注文金額（税抜）"));
          const totalAmount = Math.round(getNumber(row, "注文金額（税込）"));
          const taxAmount = Math.round(totalAmount - subtotal);
          const orderDate = parseExcelDate(findValue(row, "注文発生日"));
          
          // Determine price type based on store code or customer name
          // Store codes starting with certain patterns indicate different price types
          let priceType = "hq"; // Default to HQ price for B2B orders
          const customerNameLower = customerName.toLowerCase();
          const storeCodeStr = String(storeCode);
          
          // Check if this is a classroom order (教室)
          if (customerNameLower.includes("教室") || 
              customerNameLower.includes("classroom") ||
              storeCodeStr.startsWith("9") ||  // Classroom store codes often start with 9
              storeCodeStr.length === 7) {     // 7-digit codes are typically classrooms
            priceType = "classroom";
          } else if (customerNameLower.includes("支局") || customerNameLower.includes("branch")) {
            priceType = "branch";
          }
          
          // For classroom orders, default to invoice payment (請求書/未払い)
          // For other orders, use the payment method from CSV or default to 請求書
          const csvPaymentMethod = getString(row, "支払い方法");
          let paymentMethod = csvPaymentMethod || "請求書";
          
          // Classroom purchases always use invoice payment
          if (priceType === "classroom") {
            paymentMethod = "請求書";
          }
          
          // Create order (matching actual table structure)
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
              order_number: orderNumber,
              user_id: importUserId,
              shipping_address: {
                storeCode: storeCode,
                storeName: customerName,
                customerName: customerName,
                paymentMethod: paymentMethod,
                originalOrderId: orderId,
                priceType: priceType,
              },
              status: "completed",
              payment_status: paymentMethod === "請求書" ? "unpaid" : "paid",
              payment_method: paymentMethod,
              price_type: priceType,
              subtotal: subtotal,
              tax_amount: taxAmount,
              shipping_fee: 0,
              total_amount: totalAmount,
              created_at: targetDate.toISOString(), // Use target month instead of Excel date
            })
            .select("id")
            .single();
          
          if (orderError) {
            throw new Error(orderError.message);
          }
          
          // Create order items (batch insert for performance)
          const orderItems = itemsByOrderId.get(orderId) || [];
          let itemCount = 0;
          
          if (orderItems.length > 0) {
            const itemsToInsert = [];
            for (const item of orderItems) {
              const productCode = getString(item, "商品コード").trim();
              const quantity = Math.round(getNumber(item, "個数")) || 1;
              const unitPrice = Math.round(getNumber(item, "単価（税抜）"));
              const itemTotal = Math.round(getNumber(item, "小計（税抜）")) || unitPrice * quantity;
              const productName = getString(item, "商品名");
              const product = productCode ? productMap.get(productCode) : null;
              
              // Skip items without product_id since it's NOT NULL in the table
              // Or create a placeholder product if needed
              if (!product) {
                console.warn(`Product not found for code: ${productCode}, skipping item`);
                // Still count the quantity for display purposes
                itemCount += quantity;
                continue;
              }
              
              itemCount += quantity;
              
              itemsToInsert.push({
                order_id: order.id,
                product_id: product.id,
                product_name: productName || product.name,
                product_code: productCode,
                quantity: quantity,
                unit_price: unitPrice,
                subtotal: itemTotal,
              });
            }
            
            // Batch insert all items at once
            if (itemsToInsert.length > 0) {
              const { error: itemError } = await supabase.from("order_items").insert(itemsToInsert);
              if (itemError) {
                console.error(`Failed to insert order items for order ${orderId}:`, itemError);
              }
            }
          }
          
          // Update shipping_address with item_count (since orders table doesn't have item_count column)
          if (itemCount > 0) {
            await supabase
              .from("orders")
              .update({ 
                shipping_address: {
                  storeCode: storeCode,
                  storeName: customerName,
                  customerName: customerName,
                  paymentMethod: paymentMethod,
                  originalOrderId: orderId,
                  priceType: priceType,
                  itemCount: itemCount,
                }
              })
              .eq("id", order.id);
          }
          
          successCount++;
        } catch (err) {
          failedCount++;
          errors.push(`行 ${rowNum} (注文ID: ${orderId}): ${err instanceof Error ? err.message : "不明なエラー"}`);
        }
      }
    } else {
      // ========== Legacy single-sheet format ==========
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: OrderRow[] = XLSX.utils.sheet_to_json(worksheet);
      
      if (rows.length === 0) {
        return NextResponse.json(
          { error: "ファイルにデータがありません" },
          { status: 400 }
        );
      }
      
      totalRows = rows.length;
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;
        
        try {
          const orderNumber = row.order_number || `ORD-${Date.now()}-${i}`;
          
          let shippingAddress = null;
          if (row.shipping_address) {
            try {
              shippingAddress = JSON.parse(row.shipping_address);
            } catch {
              shippingAddress = {
                recipientName: row.customer_name || "",
                address: row.shipping_address,
              };
            }
          }
          
          const priceType = row.price_type || "retail";
          const subtotal = row.subtotal || row.total_amount || 0;
          const taxAmount = row.tax_amount || 0;
          const shippingFee = row.shipping_fee || 0;
          const totalAmount = row.total_amount || (subtotal + taxAmount + shippingFee);
          
          // Use target date for the specified month
          const createdAt = targetDate.toISOString();
          
          // Use a fixed system UUID for imported orders
          const importUserId = "00000000-0000-0000-0000-000000000001";
          
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
              order_number: orderNumber,
              user_id: importUserId,
              shipping_address: shippingAddress || {
                customerName: row.customer_name || "テスト顧客",
              },
              status: row.status || "pending",
              payment_status: row.payment_status || "unpaid",
              price_type: priceType,
              subtotal: subtotal,
              tax_amount: taxAmount,
              shipping_fee: shippingFee,
              total_amount: totalAmount,
              created_at: createdAt,
            })
            .select("id")
            .single();
          
          if (orderError) {
            throw new Error(orderError.message);
          }
          
          if (row.items && order) {
            const itemParts = row.items.split(",");
            let itemCount = 0;
            
            for (const part of itemParts) {
              const [productCode, quantityStr] = part.trim().split(":");
              const quantity = parseInt(quantityStr) || 1;
              const product = productMap.get(productCode.trim());
              
              if (product) {
                let unitPrice = product.price_retail || 0;
                if (priceType === "hq") unitPrice = product.price_hq || 0;
                else if (priceType === "branch") unitPrice = product.price_branch || 0;
                else if (priceType === "classroom") unitPrice = product.price_classroom || 0;
                
                await supabase.from("order_items").insert({
                  order_id: order.id,
                  product_id: product.id,
                  product_name: product.name,
                  product_code: product.code,
                  quantity: quantity,
                  unit_price: unitPrice,
                  total_price: unitPrice * quantity,
                });
                
                itemCount += quantity;
              }
            }
            
            // Update shipping_address with item_count
            if (itemCount > 0) {
              const currentShippingAddress = shippingAddress || { customerName: row.customer_name || "テスト顧客" };
              await supabase
                .from("orders")
                .update({ 
                  shipping_address: {
                    ...currentShippingAddress,
                    itemCount: itemCount,
                  }
                })
                .eq("id", order.id);
            }
          }
          
          successCount++;
        } catch (err) {
          failedCount++;
          errors.push(`行 ${rowNum}: ${err instanceof Error ? err.message : "不明なエラー"}`);
        }
      }
    }
    
    // Log the operation
    const userAgent = request.headers.get("user-agent") || "";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0] || "unknown";
    
    await supabase.from("system_audit_log").insert({
      action_type: "IMPORT_ORDERS_DATA",
      action_description: `注文データをインポートしました（成功: ${successCount}件, 失敗: ${failedCount}件）`,
      affected_table: "orders, order_items",
      affected_count: successCount,
      performed_by_name: adminName,
      performed_by_role: adminRole,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: {
        file_name: file.name,
        total_rows: totalRows,
        success_count: successCount,
        failed_count: failedCount,
        errors: errors.slice(0, 10),
        operator_name: operatorName.trim(),
        format: isCustomerFormat ? "customer_dual_sheet" : "legacy_single_sheet",
      },
    });
    
    return NextResponse.json({
      success: true,
      message: `インポート完了: ${successCount}件成功, ${failedCount}件失敗`,
      total: totalRows,
      successCount: successCount,
      failedCount: failedCount,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    console.error("Error in POST /api/admin/import-orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
