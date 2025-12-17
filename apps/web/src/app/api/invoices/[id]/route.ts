import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;
    
    // Get invoice with department info
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(`
        *,
        departments:department_id (
          id,
          name,
          store_code,
          type,
          manager_name,
          postal_code,
          prefecture,
          city,
          address_line1,
          address_line2
        )
      `)
      .eq("id", id)
      .single();
    
    if (error) {
      console.error("Error fetching invoice:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    
    // Get invoice items
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("sort_order", { ascending: true });
    
    if (itemsError) {
      console.error("Error fetching invoice items:", itemsError);
    }
    
    return NextResponse.json({
      data: {
        ...invoice,
        items: items || [],
      },
    });
  } catch (error) {
    console.error("Error in GET /api/invoices/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();
    
    const { data, error } = await supabase
      .from("invoices")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating invoice:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in PATCH /api/invoices/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;
    
    // Only allow deletion of draft invoices
    const { data: invoice } = await supabase
      .from("invoices")
      .select("status")
      .eq("id", id)
      .single();
    
    if (invoice?.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft invoices can be deleted" },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting invoice:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/invoices/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
