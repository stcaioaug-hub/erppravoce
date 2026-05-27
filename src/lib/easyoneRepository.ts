import { supabase } from './supabase';
import {
  Customer,
  FinancialEntry,
  FinancialStatus,
  FinancialType,
  PaymentMethod,
  Product,
  Sale,
  SaleItem,
  SaleStatus,
  Supplier,
} from '../types';

const toNumber = (value: unknown) => Number(value ?? 0);
const toDate = (value: unknown) => value ? new Date(String(value)) : undefined;

const mapProduct = (row: any): Product => ({
  id: row.id,
  sku: row.sku,
  name: row.name,
  description: row.description ?? '',
  category: row.category ?? '',
  barcode: row.barcode ?? '',
  costPrice: toNumber(row.cost_price),
  salePrice: toNumber(row.sale_price),
  margin: toNumber(row.margin),
  currentStock: toNumber(row.current_stock),
  minStock: toNumber(row.min_stock),
  unit: row.unit ?? 'UN',
});

const mapCustomer = (row: any): Customer => ({
  id: row.id,
  name: row.name,
  document: row.document ?? '',
  email: row.email ?? '',
  phone: row.phone ?? '',
  address: row.address ?? '',
  totalSpent: toNumber(row.total_spent),
  lastPurchase: toDate(row.last_purchase),
});

const mapSupplier = (row: any): Supplier => ({
  id: row.id,
  name: row.name,
  cnpj: row.cnpj ?? '',
  email: row.email ?? '',
  phone: row.phone ?? '',
  category: row.category ?? '',
});

const mapSale = (row: any): Sale => ({
  id: row.id,
  date: new Date(row.sale_date),
  customerId: row.customer_id ?? undefined,
  customerName: row.customer_name ?? undefined,
  items: (row.sale_items ?? []).map((item: any): SaleItem => ({
    productId: item.product_id,
    name: item.product_name,
    quantity: toNumber(item.quantity),
    price: toNumber(item.price),
    discount: toNumber(item.discount),
    total: toNumber(item.total),
  })),
  totalBeforeDiscount: toNumber(row.total_before_discount),
  totalDiscount: toNumber(row.total_discount),
  finalTotal: toNumber(row.final_total),
  paymentMethod: row.payment_method as PaymentMethod,
  status: row.status as SaleStatus,
  sellerId: row.seller_id,
});

const mapFinancialEntry = (row: any): FinancialEntry => ({
  id: row.id,
  description: row.description,
  type: row.type as FinancialType,
  category: row.category,
  amount: toNumber(row.amount),
  dueDate: new Date(row.due_date),
  paymentDate: toDate(row.payment_date),
  status: row.status as FinancialStatus,
  referenceId: row.reference_id ?? undefined,
});

const requireClient = () => {
  if (!supabase) {
    throw new Error('Supabase ainda nao esta configurado. Preencha VITE_SUPABASE_ANON_KEY em .env.local.');
  }

  return supabase;
};

export async function fetchProducts() {
  const client = requireClient();
  const { data, error } = await client
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchCustomers() {
  const client = requireClient();
  const { data, error } = await client
    .from('customers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCustomer);
}

export async function fetchSuppliers() {
  const client = requireClient();
  const { data, error } = await client
    .from('suppliers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapSupplier);
}

export async function fetchSales(limit = 20) {
  const client = requireClient();
  const { data, error } = await client
    .from('sales')
    .select('*, sale_items(*)')
    .order('sale_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapSale);
}

export async function fetchFinancialEntries() {
  const client = requireClient();
  const { data, error } = await client
    .from('financial_entries')
    .select('*')
    .order('due_date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapFinancialEntry);
}

export async function createSale(input: {
  customerId?: string;
  customerName: string;
  items: SaleItem[];
  paymentMethod: PaymentMethod;
  sellerId: string;
}) {
  const client = requireClient();
  const totalBeforeDiscount = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = input.items.reduce((sum, item) => sum + item.discount, 0);
  const finalTotal = input.items.reduce((sum, item) => sum + item.total, 0);

  const { data: sale, error: saleError } = await client
    .from('sales')
    .insert({
      customer_id: input.customerId ?? null,
      customer_name: input.customerName,
      total_before_discount: totalBeforeDiscount,
      total_discount: totalDiscount,
      final_total: finalTotal,
      payment_method: input.paymentMethod,
      status: SaleStatus.COMPLETED,
      seller_id: input.sellerId,
    })
    .select()
    .single();

  if (saleError) throw saleError;

  const saleItems = input.items.map((item) => ({
    sale_id: sale.id,
    product_id: item.productId,
    product_name: item.name,
    quantity: item.quantity,
    price: item.price,
    discount: item.discount,
    total: item.total,
  }));

  const { error: itemsError } = await client.from('sale_items').insert(saleItems);
  if (itemsError) throw itemsError;

  const stockMovements = input.items.map((item) => ({
    product_id: item.productId,
    type: 'OUT',
    quantity: item.quantity,
    reason: `Venda #${sale.id}`,
    user_id: input.sellerId,
  }));

  const { error: stockError } = await client.from('stock_movements').insert(stockMovements);
  if (stockError) throw stockError;

  await Promise.all(input.items.map(async (item) => {
    const { data: product, error: productError } = await client
      .from('products')
      .select('current_stock')
      .eq('id', item.productId)
      .single();

    if (productError) throw productError;

    const nextStock = Math.max(0, toNumber(product.current_stock) - item.quantity);
    const { error: updateError } = await client
      .from('products')
      .update({ current_stock: nextStock })
      .eq('id', item.productId);

    if (updateError) throw updateError;
  }));

  await client.from('financial_entries').insert({
    description: `Venda #${sale.id}`,
    type: FinancialType.REVENUE,
    category: 'Vendas',
    amount: finalTotal,
    due_date: new Date().toISOString(),
    payment_date: new Date().toISOString(),
    status: FinancialStatus.PAID,
    reference_id: sale.id,
  });

  return sale.id as string;
}

export async function deleteProduct(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteCustomer(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
}

export async function createCustomer(input: Omit<Customer, 'id' | 'totalSpent' | 'lastPurchase'>): Promise<Customer> {
  const client = requireClient();
  const { data, error } = await client
    .from('customers')
    .insert({
      name: input.name,
      document: input.document,
      email: input.email,
      phone: input.phone,
      address: input.address,
      total_spent: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return mapCustomer(data);
}

export async function updateCustomer(id: string, input: Partial<Omit<Customer, 'id'>>): Promise<Customer> {
  const client = requireClient();
  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.document !== undefined) updateData.document = input.document;
  if (input.email !== undefined) updateData.email = input.email;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.totalSpent !== undefined) updateData.total_spent = input.totalSpent;
  if (input.lastPurchase !== undefined) updateData.last_purchase = input.lastPurchase?.toISOString() ?? null;

  const { data, error } = await client
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapCustomer(data);
}

export async function deleteSupplier(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('suppliers').delete().eq('id', id);
  if (error) throw error;
}
