/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpDown, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Package, History, Search } from 'lucide-react';
import { PageHeader, Button, Card, StatCard, Table, THead, TBody, TH, TD, TR, Badge, Input } from '../components/ui';
import { MOCK_PRODUCTS } from '../data/mocks';
import { formatCurrency, cn } from '../lib/utils';

export const Stock = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Controle de Estoque" 
        subtitle="Movimentações, ajustes e inventário" 
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <History size={16} className="mr-2" /> Histórico
            </Button>
            <Button className="bg-blue-600 text-white" size="sm">
              <Plus size={16} className="mr-2 text-white" /> Novo Ajuste
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Itens" value={1132} icon={Package} color="blue" />
        <StatCard title="Valor em Estoque" value={formatCurrency(45200.50)} icon={ArrowUpDown} color="emerald" />
        <StatCard title="Entradas (Mês)" value={245} icon={ArrowUpCircle} color="sky" />
        <StatCard title="Saídas (Mês)" value={189} icon={ArrowDownCircle} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Últimas Movimentações</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input placeholder="Filtrar por produto..." className="pl-9 h-8 text-xs" />
            </div>
          </div>
          <Table>
            <THead>
              <TR className="bg-slate-50/50">
                <TH>Produto</TH>
                <TH>Tipo</TH>
                <TH>Qtd.</TH>
                <TH>Data</TH>
                <TH>Responsável</TH>
              </TR>
            </THead>
            <TBody>
              {MOCK_PRODUCTS.slice(0, 5).map((p, i) => (
                <TR key={p.id}>
                  <TD className="font-bold text-slate-900">{p.name}</TD>
                  <TD>
                    <Badge variant={i % 2 === 0 ? 'success' : 'warning'}>
                      {i % 2 === 0 ? 'Entrada' : 'Saída'}
                    </Badge>
                  </TD>
                  <TD className="font-black text-slate-700">{i % 2 === 0 ? '+' : '-'}{Math.floor(Math.random() * 10) + 1}</TD>
                  <TD className="text-xs text-slate-500">14/05/2026 10:30</TD>
                  <TD className="text-xs font-semibold text-slate-600">Carlos O.</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>

        <Card className="p-6 border-amber-100 bg-amber-50/20">
          <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} />
            Avisos Críticos
          </h3>
          <div className="space-y-4">
            {MOCK_PRODUCTS.filter(p => p.currentStock <= p.minStock).map(p => (
              <div key={p.id} className="p-3 bg-white rounded-xl border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{p.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">SKU: {p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-red-600">{p.currentStock} {p.unit}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">MIN: {p.minStock}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-6 bg-white border-amber-200 text-amber-700 hover:bg-amber-50">
            Gerar Ordem de Compra
          </Button>
        </Card>
      </div>
    </div>
  );
};

const Plus = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
