/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, User, Mail, Phone, MapPin, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { PageHeader, Button, Card, Input, Table, THead, TBody, TH, TD, TR, Badge } from '../components/ui';
import { MOCK_CUSTOMERS } from '../data/mocks';
import { formatCurrency, formatDate } from '../lib/utils';

export const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.document.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Clientes" 
        subtitle="Gestão da sua base de consumidores" 
        actions={
          <Button className="bg-blue-600 text-white" size="sm">
            <Plus size={16} className="mr-2" /> Novo Cliente
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <Table>
          <THead>
            <TR>
              <TH>Cliente</TH>
              <TH>Documento</TH>
              <TH>Contato</TH>
              <TH>Total Consumido</TH>
              <TH>Última Compra</TH>
              <TH className="text-right">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((customer) => (
              <TR key={customer.id} className="hover:bg-slate-50 transition-colors group">
                <TD>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{customer.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={10} /> {customer.address}
                      </p>
                    </div>
                  </div>
                </TD>
                <TD>
                  <Badge variant="default" className="bg-slate-100 text-slate-600 font-mono text-[10px]">{customer.document}</Badge>
                </TD>
                <TD>
                  <div className="space-y-1">
                    <p className="text-xs flex items-center gap-1.5 text-slate-600"><Mail size={12} className="text-slate-400" /> {customer.email}</p>
                    <p className="text-xs flex items-center gap-1.5 text-slate-600"><Phone size={12} className="text-slate-400" /> {customer.phone}</p>
                  </div>
                </TD>
                <TD>
                  <span className="font-black text-slate-800">{formatCurrency(customer.totalSpent)}</span>
                </TD>
                <TD>
                  <p className="text-xs font-medium text-slate-500">{customer.lastPurchase ? formatDate(customer.lastPurchase) : 'Nunca'}</p>
                </TD>
                <TD className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                      <MoreVertical size={16} />
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
