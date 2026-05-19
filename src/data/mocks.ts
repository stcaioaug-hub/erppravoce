import { 
  Product, Customer, Supplier, Sale, SaleStatus, PaymentMethod, 
  FinancialEntry, FinancialType, FinancialStatus, User 
} from '../types';
import { subDays, subHours } from 'date-fns';

export const currentUser: User = {
  id: 'u1',
  name: 'Carlos Oliveira',
  email: 'carlos@varejoflow.com.br',
  role: 'admin',
  avatar: 'https://i.pravatar.cc/150?u=carlos'
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'BEB-001',
    name: 'Coca-Cola 2L',
    description: 'Refrigerante de cola 2 litros',
    category: 'Bebidas',
    barcode: '7891234560012',
    costPrice: 6.50,
    salePrice: 12.00,
    margin: 45.8,
    currentStock: 48,
    minStock: 20,
    unit: 'UN'
  },
  {
    id: 'p2',
    sku: 'LIM-002',
    name: 'Detergente Ypê 500ml',
    description: 'Detergente líquido neutro',
    category: 'Limpeza',
    barcode: '7891234560029',
    costPrice: 1.80,
    salePrice: 3.50,
    margin: 48.5,
    currentStock: 12,
    minStock: 24,
    unit: 'UN'
  },
  {
    id: 'p3',
    sku: 'ALI-003',
    name: 'Arroz Tio João 5kg',
    description: 'Arroz agulhinha tipo 1',
    category: 'Alimentos',
    barcode: '7891234560036',
    costPrice: 22.00,
    salePrice: 32.90,
    margin: 33.1,
    currentStock: 15,
    minStock: 10,
    unit: 'PCT'
  },
  {
    id: 'p4',
    sku: 'ALI-004',
    name: 'Feijão Carioca 1kg',
    description: 'Feijão carioca tipo 1',
    category: 'Alimentos',
    barcode: '7891234560043',
    costPrice: 5.40,
    salePrice: 8.90,
    margin: 39.3,
    currentStock: 30,
    minStock: 15,
    unit: 'KG'
  },
  {
    id: 'p5',
    sku: 'PAD-005',
    name: 'Leite Integral 1L',
    description: 'Leite UHT integral caixa',
    category: 'Padaria',
    barcode: '7891234560050',
    costPrice: 3.80,
    salePrice: 5.50,
    margin: 30.9,
    currentStock: 8,
    minStock: 20,
    unit: 'CX'
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Maria Silva',
    document: '123.456.789-00',
    email: 'maria@gmail.com',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123 - SP',
    totalSpent: 1250.40,
    lastPurchase: subDays(new Date(), 2)
  },
  {
    id: 'c2',
    name: 'João Pereira',
    document: '987.654.321-11',
    email: 'joao.p@outlook.com',
    phone: '(11) 91234-5678',
    address: 'Av. Paulista, 1000 - SP',
    totalSpent: 450.20,
    lastPurchase: subDays(new Date(), 15)
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 's1',
    name: 'Distribuidora ABC',
    cnpj: '12.345.678/0001-99',
    email: 'contato@abc.com',
    phone: '(11) 4004-0000',
    category: 'Geral'
  }
];

export const MOCK_SALES: Sale[] = [
  {
    id: 'v1',
    date: subHours(new Date(), 2),
    customerName: 'Maria Silva',
    items: [
      { productId: 'p1', name: 'Coca-Cola 2L', quantity: 2, price: 12.00, discount: 0, total: 24.00 }
    ],
    totalBeforeDiscount: 24.00,
    totalDiscount: 0,
    finalTotal: 24.00,
    paymentMethod: PaymentMethod.PIX,
    status: SaleStatus.COMPLETED,
    sellerId: 'u1'
  },
  {
    id: 'v2',
    date: subDays(new Date(), 1),
    customerName: 'Consumidor Final',
    items: [
      { productId: 'p3', name: 'Arroz Tio João 5kg', quantity: 1, price: 32.90, discount: 2.90, total: 30.00 }
    ],
    totalBeforeDiscount: 32.90,
    totalDiscount: 2.90,
    finalTotal: 30.00,
    paymentMethod: PaymentMethod.CASH,
    status: SaleStatus.COMPLETED,
    sellerId: 'u1'
  }
];

export const MOCK_FINANCIAL: FinancialEntry[] = [
  {
    id: 'f1',
    description: 'Venda #v1',
    type: FinancialType.REVENUE,
    category: 'Vendas',
    amount: 24.00,
    dueDate: new Date(),
    paymentDate: new Date(),
    status: FinancialStatus.PAID,
    referenceId: 'v1'
  },
  {
    id: 'f2',
    description: 'Aluguel Loja',
    type: FinancialType.EXPENSE,
    category: 'Infraestrutura',
    amount: 2500.00,
    dueDate: subDays(new Date(), 5),
    status: FinancialStatus.OVERDUE
  },
  {
    id: 'f3',
    description: 'Compra de Mercadorias',
    type: FinancialType.EXPENSE,
    category: 'Produtos',
    amount: 1200.00,
    dueDate: subDays(new Date(), -10),
    status: FinancialStatus.PENDING
  }
];

export const DASHBOARD_STATS = {
  todaySales: 1240.50,
  todayOrders: 14,
  avgTicket: 88.60,
  lowStockItems: 3,
  monthlyRevenue: 34500.20,
  receivables: 4200.00,
  payables: 6150.00,
  salesHistory: [
    { date: '07/05', value: 2100 },
    { date: '08/05', value: 1800 },
    { date: '09/05', value: 2400 },
    { date: '10/05', value: 1950 },
    { date: '11/05', value: 2800 },
    { date: '12/05', value: 2200 },
    { date: '13/05', value: 1240 },
  ]
};
