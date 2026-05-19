/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  Calendar,
  User,
  CreditCard
} from 'lucide-react';
import { 
  PageHeader, 
  Button, 
  Card, 
  Input, 
  Table, 
  THead, 
  TBody, 
  TH, 
  TD, 
  TR,
  Badge 
} from '../components/ui';
import { MOCK_SALES } from '../data/mocks';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { SaleStatus } from '../types';

export const Sales = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Vendas" 
        subtitle="Gerencie todas as transações da sua empresa" 
        actions={
          <Button className="bg-indigo-600 text-white" size="sm">
            Falar com Suporte
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Buscar por venda, cliente ou SKU..." className="pl-10" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            <Filter size={16} className="mr-2" /> Filtros
          </Button>
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            Relatório de Vendas
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <THead>
            <TR>
              <TH>ID Venda</TH>
              <TH>Cliente</TH>
              <TH>Data e Hora</TH>
              <TH>Pagamento</TH>
              <TH>Total</TH>
              <TH>Status</TH>
              <TH className="text-right">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {MOCK_SALES.map((sale) => (
              <TR key={sale.id} className="hover:bg-slate-50 transition-colors group">
                <TD>
                  <span className="font-mono text-xs font-bold text-slate-400">#{sale.id.toUpperCase()}</span>
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <User size={14} />
                    </div>
                    <span className="font-semibold text-slate-900">{sale.customerName}</span>
                  </div>
                </TD>
                <TD>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Calendar size={14} className="text-slate-400" />
                    {formatDateTime(sale.date)}
                  </div>
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-tight">{sale.paymentMethod}</span>
                  </div>
                </TD>
                <TD>
                  <span className="font-black text-slate-900">{formatCurrency(sale.finalTotal)}</span>
                </TD>
                <TD>
                  <Badge variant={sale.status === SaleStatus.COMPLETED ? 'success' : 'warning'}>
                    {sale.status}
                  </Badge>
                </TD>
                <TD className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" title="Ver Detalhes">
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" title="Imprimir Recibo">
                      <FileText size={16} />
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
};
