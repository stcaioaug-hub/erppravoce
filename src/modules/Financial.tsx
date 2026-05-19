/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  PageHeader, 
  Button, 
  Card, 
  StatCard, 
  Table, 
  THead, 
  TBody, 
  TH, 
  TD, 
  TR,
  Badge,
  Input 
} from '../components/ui';
import { MOCK_FINANCIAL } from '../data/mocks';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { FinancialType, FinancialStatus } from '../types';

export const Financial = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Financeiro" 
        subtitle="Controle seu fluxo de caixa e obrigações financeiras" 
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Fluxo de Caixa</Button>
            <Button className="bg-emerald-600 text-white" size="sm">
              <Plus size={16} className="mr-2" /> Novo Lançamento
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Saldo em Caixa" 
          value={formatCurrency(18450.40)} 
          icon={Wallet} 
          color="indigo" 
        />
        <StatCard 
          title="A Receber (Mês)" 
          value={formatCurrency(4200.00)} 
          icon={ArrowUpCircle} 
          color="emerald" 
        />
        <StatCard 
          title="A Pagar (Mês)" 
          value={formatCurrency(6150.00)} 
          icon={ArrowDownCircle} 
          color="red" 
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Buscar por descrição ou categoria..." className="pl-10" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            <Filter size={16} className="mr-2" /> Filtros
          </Button>
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            DRE Mensal
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Descrição</TH>
              <TH>Vencimento</TH>
              <TH>Tipo</TH>
              <TH>Valor</TH>
              <TH>Status</TH>
              <TH className="text-right">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {MOCK_FINANCIAL.map((entry) => (
              <TR key={entry.id} className="hover:bg-slate-50 transition-colors group">
                <TD>
                  <div>
                    <p className="font-bold text-slate-900">{entry.description}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{entry.category}</p>
                  </div>
                </TD>
                <TD>
                  <div className="text-sm font-medium text-slate-600">
                    {formatDate(entry.dueDate)}
                  </div>
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    {entry.type === FinancialType.REVENUE ? (
                      <ArrowUpCircle size={16} className="text-emerald-500" />
                    ) : (
                      <ArrowDownCircle size={16} className="text-red-500" />
                    )}
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-tight",
                      entry.type === FinancialType.REVENUE ? "text-emerald-600" : "text-red-600"
                    )}>
                      {entry.type}
                    </span>
                  </div>
                </TD>
                <TD>
                  <span className={cn(
                    "font-black",
                    entry.type === FinancialType.REVENUE ? "text-emerald-700" : "text-red-700"
                  )}>
                    {entry.type === FinancialType.REVENUE ? '+ ' : '- '}
                    {formatCurrency(entry.amount)}
                  </span>
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    {entry.status === FinancialStatus.PAID && <CheckCircle2 size={14} className="text-emerald-500" />}
                    {entry.status === FinancialStatus.PENDING && <Clock size={14} className="text-amber-500" />}
                    {entry.status === FinancialStatus.OVERDUE && <AlertCircle size={14} className="text-red-500" />}
                    <Badge variant={entry.status === FinancialStatus.PAID ? 'success' : entry.status === FinancialStatus.OVERDUE ? 'danger' : 'warning'}>
                      {entry.status}
                    </Badge>
                  </div>
                </TD>
                <TD className="text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold px-2 py-0 border-slate-200">
                      EDITAR
                    </Button>
                    {entry.status !== FinancialStatus.PAID && (
                      <Button className="h-8 text-[10px] font-bold px-2 py-0 bg-indigo-600 text-white">
                        BAIXAR
                      </Button>
                    )}
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
