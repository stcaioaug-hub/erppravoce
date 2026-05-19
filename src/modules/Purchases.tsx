/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, Search, Plus, Filter, Calendar } from 'lucide-react';
import { PageHeader, Button, Card, Table, THead, TBody, TH, TD, TR, Badge, Input } from '../components/ui';
import { formatCurrency } from '../lib/utils';

export const Purchases = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Compras" 
        subtitle="Gestão de pedidos aos fornecedores" 
        actions={
          <Button className="bg-blue-600 text-white" size="sm">
            <Plus size={16} className="mr-2" /> Novo Pedido
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Buscar por pedido ou fornecedor..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar size={16} className="mr-2" /> Período
          </Button>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" /> Status
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Cód.</TH>
              <TH>Fornecedor</TH>
              <TH>Data Pedido</TH>
              <TH>Total</TH>
              <TH>Status</TH>
              <TH className="text-right">Ações</TH>
            </TR>
          </THead>
          <TBody>
            <TR className="hover:bg-slate-50 transition-colors group">
              <TD><span className="font-mono text-xs font-bold text-slate-400">#ORD-9921</span></TD>
              <TD className="font-bold text-slate-900">Distribuidora ABC</TD>
              <TD className="text-xs text-slate-500">12/05/2026</TD>
              <TD className="font-black text-slate-900">{formatCurrency(4850.00)}</TD>
              <TD><Badge variant="info">AGUARDANDO</Badge></TD>
              <TD className="text-right">
                <Button variant="ghost" size="sm" className="text-blue-600 font-bold text-[10px]">VISUALIZAR</Button>
              </TD>
            </TR>
            <TR className="hover:bg-slate-50 transition-colors group">
              <TD><span className="font-mono text-xs font-bold text-slate-400">#ORD-9918</span></TD>
              <TD className="font-bold text-slate-900">Hortifruti Central</TD>
              <TD className="text-xs text-slate-500">10/05/2026</TD>
              <TD className="font-black text-slate-900">{formatCurrency(1240.20)}</TD>
              <TD><Badge variant="success">RECEBIDO</Badge></TD>
              <TD className="text-right">
                <Button variant="ghost" size="sm" className="text-blue-600 font-bold text-[10px]">VISUALIZAR</Button>
              </TD>
            </TR>
          </TBody>
        </Table>
        <div className="p-12 text-center text-slate-400">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
          <p className="text-sm font-medium">Exibindo compras recentes</p>
        </div>
      </Card>
    </div>
  );
};
