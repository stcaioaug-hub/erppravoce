/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from 'lucide-react';
import { PageHeader, Button, Card } from '../components/ui';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const CATEGORY_DATA = [
  { name: 'Alimentos', value: 45, color: '#3b82f6' },
  { name: 'Bebidas', value: 30, color: '#10b981' },
  { name: 'Limpeza', value: 15, color: '#f59e0b' },
  { name: 'Outros', value: 10, color: '#64748b' },
];

export const Reports = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Relatórios & BI" 
        subtitle="Analise o desempenho estratégico do seu negócio" 
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar size={16} className="mr-2" /> Personalizar Data
            </Button>
            <Button className="bg-blue-600 text-white" size="sm">
              <Download size={16} className="mr-2" /> Exportar PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChart size={18} className="text-blue-500" />
            Vendas por Categoria
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 'bold' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            Crescimento Mensal
          </h3>
          <div className="space-y-6">
            {[
              { label: 'Faturamento Bruto', value: '+14.5%', positive: true },
              { label: 'Ticket Médio', value: '+2.1%', positive: true },
              { label: 'Novos Clientes', value: '+8%', positive: true },
              { label: 'Margem Líquida', value: '-0.5%', positive: false },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-medium text-slate-600">{metric.label}</span>
                <span className={`text-sm font-black ${metric.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
          <BarChart3 size={32} className="mb-4 opacity-50" />
          <h4 className="text-2xl font-black mb-2">Ponto de Equilíbrio</h4>
          <p className="text-blue-100 text-sm leading-relaxed">Seu lucro operacional cobre todos os custos fixos a partir do dia 18 de cada mês.</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-200 col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-2xl font-black mb-2">Desempenho Comercial</h4>
              <p className="text-slate-400 text-sm">Você atingiu 85% da meta mensal de vendas.</p>
            </div>
            <span className="text-4xl font-black text-blue-500">85%</span>
          </div>
          <div className="w-full bg-slate-800 h-4 rounded-full mt-6 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
