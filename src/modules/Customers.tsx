/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, User, Mail, Phone, MapPin, MoreVertical, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { PageHeader, Button, Card, Input, Table, THead, TBody, TH, TD, TR, Badge, Modal } from '../components/ui';
import { MOCK_CUSTOMERS } from '../data/mocks';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchCustomers, deleteCustomer } from '../lib/varejoflowRepository';
import { formatCurrency, formatDate } from '../lib/utils';
import { Customer } from '../types';

export const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;
    setIsLoading(true);

    fetchCustomers()
      .then((data) => {
        if (isMounted) setCustomers(data.length ? data : MOCK_CUSTOMERS);
      })
      .catch((error) => {
        console.error('Erro ao carregar clientes do Supabase:', error);
        if (isMounted) setSyncError('Usando dados locais. Verifique schema, RLS ou chave do Supabase.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      if (isSupabaseConfigured) {
        await deleteCustomer(customerToDelete.id);
      }
      setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
      setCustomerToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      alert('Erro ao excluir cliente. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.document.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Clientes" 
        subtitle={isLoading ? 'Sincronizando clientes com Supabase...' : syncError ?? 'Gestão da sua base de consumidores'} 
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={() => setCustomerToDelete(customer)}
                    >
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

      <Modal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        title="Confirmar Exclusão"
        footer={
          <>
            <Button variant="outline" onClick={() => setCustomerToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} isLoading={isDeleting}>
              Sim, Excluir
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-full shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-slate-800 dark:text-slate-200 font-semibold">
              Você tem certeza que deseja excluir o cliente <span className="font-bold text-red-600">"{customerToDelete?.name}"</span>?
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Esta ação não poderá ser desfeita e removerá o cliente permanentemente do sistema.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

