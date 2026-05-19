/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { PageHeader, StatCard, Card, Badge, Button, Table, THead, TBody, TR, TH, TD } from '../components/ui';
import { DASHBOARD_STATS, MOCK_SALES, MOCK_PRODUCTS } from '../data/mocks';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchProducts, fetchSales } from '../lib/varejoflowRepository';
import { formatCurrency, formatDate } from '../lib/utils';
import { Product, Sale } from '../types';

export const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    Promise.all([fetchProducts(), fetchSales(8)])
      .then(([syncedProducts, syncedSales]) => {
        if (!isMounted) return;
        if (syncedProducts.length) setProducts(syncedProducts);
        if (syncedSales.length) setSales(syncedSales);
      })
      .catch((error) => {
        console.error('Erro ao carregar dashboard do Supabase:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const dashboardStats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySales = sales.filter((sale) => sale.date.toDateString() === today);
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.finalTotal, 0);

    return {
      todaySales: todaySales.length ? todayRevenue : DASHBOARD_STATS.todaySales,
      todayOrders: todaySales.length || DASHBOARD_STATS.todayOrders,
      avgTicket: todaySales.length ? todayRevenue / todaySales.length : DASHBOARD_STATS.avgTicket,
      lowStockItems: products.filter((product) => product.currentStock <= product.minStock).length,
    };
  }, [products, sales]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Visão geral do seu negócio em tempo real" 
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Hoje</Button>
            <Button variant="outline" size="sm">Últimos 7 dias</Button>
            <Button variant="secondary" size="sm">Baixar Relatório</Button>
          </div>
        }
      />

      {/* Dashboard Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
        {/* Stat Card 1 */}
        <StatCard 
          title="Faturamento Hoje" 
          value={formatCurrency(dashboardStats.todaySales)} 
          icon={TrendingUp}
          trend={{ value: 12, positive: true }}
          color="emerald"
        />

        {/* Stat Card 2 */}
        <StatCard 
          title="Vendas Realizadas" 
          value={dashboardStats.todayOrders} 
          icon={ShoppingCart}
          trend={{ value: 48, positive: true }} // Just using value as % for display
          color="blue"
        />

        {/* Main Chart Card (Large) */}
        <Card className="lg:col-span-2 lg:row-span-2 bg-slate-900 rounded-3xl p-6 flex flex-col border-none shadow-xl shadow-slate-200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-white font-bold tracking-tight">Performance de Vendas</h3>
              <p className="text-slate-400 text-xs">Comparativo de vendas por dia</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] text-white uppercase font-bold tracking-wider">Vendas</span>
              </div>
            </div>
          </div>
          <div className="flex-1 h-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DASHBOARD_STATS.salesHistory}>
                <defs>
                  <linearGradient id="colorSalesDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis 
                  hide
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSalesDark)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-6 px-2 text-[10px] text-slate-500 uppercase font-black tracking-widest">
            {DASHBOARD_STATS.salesHistory.map(d => <span key={d.date}>{d.date}</span>)}
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card className="p-6 flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-slate-800 font-bold text-sm mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              Estoque Crítico
            </h3>
            <div className="space-y-4">
              {products.filter(p => p.currentStock <= p.minStock).slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between group">
                  <span className="text-xs text-slate-600 font-medium group-hover:text-blue-600 transition-colors">{product.name}</span>
                  <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{product.currentStock} {product.unit}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-auto text-xs font-bold text-blue-600 hover:underline text-left relative z-10 pt-4">
            Gerenciar estoque
          </button>
          <div className="absolute -bottom-6 -right-6 text-slate-50 opacity-10 rotate-12">
            <Package size={120} />
          </div>
        </Card>

        {/* Financial Summary */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-800 font-bold text-sm mb-6">Fluxo de Caixa</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  <span>A Receber</span>
                  <span className="text-emerald-500">{formatCurrency(DASHBOARD_STATS.receivables)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  <span>A Pagar</span>
                  <span className="text-red-500">{formatCurrency(DASHBOARD_STATS.payables)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-4 line-clamp-1">Projeção positiva para os próximos 30 dias</p>
        </Card>

        {/* Recent Sales Table (Wide) */}
        <Card className="lg:col-span-4 overflow-hidden flex flex-col border-none shadow-md">
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white">
            <h3 className="text-slate-800 font-bold text-sm">Últimas Vendas</h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">Ver relatório completo</button>
          </div>
          <Table className="bg-white">
            <THead>
              <TR className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <TH className="px-6">ID</TH>
                <TH className="px-6">Cliente</TH>
                <TH className="px-6">Data/Hora</TH>
                <TH className="px-6">Pagamento</TH>
                <TH className="px-6">Status</TH>
                <TH className="px-6 text-right">Total</TH>
              </TR>
            </THead>
            <TBody>
              {sales.map((sale) => (
                <TR key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <TD className="px-6 py-3 font-mono text-slate-400 uppercase font-bold text-[10px]">#{sale.id}</TD>
                  <TD className="px-6 py-3 font-bold text-slate-900">{sale.customerName}</TD>
                  <TD className="px-6 py-3 text-slate-500">{formatDate(sale.date)}</TD>
                  <TD className="px-6 py-3">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-[10px] font-bold uppercase">{sale.paymentMethod}</span>
                    </span>
                  </TD>
                  <TD className="px-6 py-3">
                    <Badge variant="success" className="text-[10px] font-black py-0.5 rounded-md uppercase">{sale.status}</Badge>
                  </TD>
                  <TD className="px-6 py-3 text-right font-black text-slate-900">{formatCurrency(sale.finalTotal)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
