/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum SaleStatus {
  COMPLETED = 'Concluída',
  PENDING = 'Pendente',
  CANCELLED = 'Cancelada',
}

export enum PaymentMethod {
  CASH = 'Dinheiro',
  PIX = 'PIX',
  DEBIT = 'Débito',
  CREDIT = 'Crédito',
  BOLETO = 'Boleto',
}

export enum FinancialType {
  REVENUE = 'Receita',
  EXPENSE = 'Despesa',
}

export enum FinancialStatus {
  PAID = 'Pago',
  PENDING = 'Pendente',
  OVERDUE = 'Atrasado',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  avatar?: string;
}

export interface Company {
  name: string;
  cnpj: string;
  address: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  barcode: string;
  costPrice: number;
  salePrice: number;
  margin: number;
  currentStock: number;
  minStock: number;
  unit: string;
}

export interface Customer {
  id: string;
  name: string;
  document: string; // CPF/CNPJ
  email: string;
  phone: string;
  address: string;
  totalSpent: number;
  lastPurchase?: Date;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  category: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: string;
  date: Date;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  totalBeforeDiscount: number;
  totalDiscount: number;
  finalTotal: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  sellerId: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  date: Date;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reason: string;
  userId: string;
}

export interface Purchase {
  id: string;
  date: Date;
  supplierId: string;
  items: SaleItem[];
  total: number;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
}

export interface FinancialEntry {
  id: string;
  description: string;
  type: FinancialType;
  category: string;
  amount: number;
  dueDate: Date;
  paymentDate?: Date;
  status: FinancialStatus;
  referenceId?: string; // Link to Sale or Purchase
}

// === BUSINESS VISION TYPES ===

export interface BusinessPlanSection {
  id: string;
  companyId: string;
  title: string;
  body: string;
}

export interface NextStep {
  id: string;
  companyId: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface BusinessSimulation {
  id: string;
  companyId: string;
  scenarioName: string;
  isActive: boolean;
  clients: number;
  ticket: number;
  fixedCost: number;
  variableCost: number;
  initialInvestment: number;
  taxRate: number;
  churnRate: number;
  growthRate: number;
}

export interface BusinessFunnel {
  id: string;
  companyId: string;
  leads: number;
  meetingConversion: number;
  trialConversion: number;
  paidConversion: number;
  ticket: number;
}

export interface BusinessPartner {
  id: string;
  companyId: string;
  name: string;
  role: string;
  responsibilities: string;
  sharePercentage: number;
  area: string;
  notes: string;
}

export interface ClientOnboarding {
  id: string;
  clientName: string;
  companyName: string;
  businessType: string;
  need: string;
  process: string;
  experience: string;
  goal: string;
  createdAt: Date;
}

// === FEATURE CUSTOMIZATION TYPES ===

export type ClientTypeId =
  | 'varejo'
  | 'mercadinho'
  | 'restaurante'
  | 'servicos'
  | 'industria'
  | 'distribuidora'
  | 'beleza'
  | 'ecommerce';

export type ClientFeatureAccessMode = 'limited' | 'full' | 'locked';

export interface AppFeature {
  id: string;
  title: string;
  description: string;
  category: string;
  moduleId?: string;
  iconName: string;
  isCustomerVisible: boolean;
  isFuture: boolean;
}

export interface ClientTypeArchetype {
  id: ClientTypeId;
  label: string;
  shortLabel: string;
  subtitle: string;
  description: string;
  previewTitle: string;
  previewSubtitle: string;
  iconName: string;
}

export interface ClientTypeFeatureDefault {
  clientTypeId: ClientTypeId;
  featureId: string;
  enabled: boolean;
  optional: boolean;
}

export interface ClientAppProfile {
  id: string;
  onboardingId?: string;
  clientName: string;
  companyName: string;
  businessType: ClientTypeId;
  accessMode: ClientFeatureAccessMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientFeatureOverride {
  profileId: string;
  featureId: string;
  enabled: boolean;
  source: 'client' | 'admin';
  updatedAt: Date;
}

export interface ResolvedFeature {
  feature: AppFeature;
  enabled: boolean;
  defaultEnabled: boolean;
  optional: boolean;
  overridden: boolean;
  canClientToggle: boolean;
}
