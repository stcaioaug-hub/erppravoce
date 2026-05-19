/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, Truck, Mail, Phone, Tag, MoreVertical, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { PageHeader, Button, Card, Input, Table, THead, TBody, TH, TD, TR, Badge, Modal } from '../components/ui';
import { MOCK_SUPPLIERS } from '../data/mocks';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchSuppliers, deleteSupplier } from '../lib/varejoflowRepository';
import { Supplier } from '../types';

export const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;
    setIsLoading(true);

    fetchSuppliers()
      .then((data) => {
        if (isMounted) setSuppliers(data.length ? data : MOCK_SUPPLIERS);
      })
      .catch((error) => {
        console.error('Erro ao carregar fornecedores do Supabase:', error);
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
    if (!supplierToDelete) return;
    setIsDeleting(true);
    try {
      if (isSupabaseConfigured) {
        await deleteSupplier(supplierToDelete.id);
      }
      setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));
      setSupplierToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir fornecedor:', err);
      alert('Erro ao excluir fornecedor. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.cnpj.includes(searchTerm) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Fornecedores" 
        subtitle={isLoading ? 'Sincronizando fornecedores com Supabase...' : syncError ?? 'Gerencie seus parceiros de suprimentos'} 
        actions={
          <Button className="bg-blue-600 text-white" size="sm">
            <Plus size={16} className="mr-2" /> Novo Fornecedor
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Buscar por nome, CNPJ ou categoria..." 
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
              <TH>Fornecedor</TH>
              <TH>CNPJ</TH>
              <TH>Categoria</TH>
              <TH>Contato</TH>
              <TH className="text-right">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((supplier) => (
              <TR key={supplier.id} className="hover:bg-slate-50 transition-colors group">
                <TD>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{supplier.name}</p>
                    </div>
                  </div>
                </TD>
                <TD>
                  <Badge variant="default" className="bg-slate-100 text-slate-600 font-mono text-[10px]">{supplier.cnpj}</Badge>
                </TD>
                <TD>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest">
                    <Tag size={12} />
                    {supplier.category}
                  </div>
                </TD>
                <TD>
                  <div className="space-y-1">
                    <p className="text-xs flex items-center gap-1.5 text-slate-600"><Mail size={12} className="text-slate-400" /> {supplier.email}</p>
                    <p className="text-xs flex items-center gap-1.5 text-slate-600"><Phone size={12} className="text-slate-400" /> {supplier.phone}</p>
                  </div>
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
                      onClick={() => setSupplierToDelete(supplier)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>

      <Modal
        isOpen={!!supplierToDelete}
        onClose={() => setSupplierToDelete(null)}
        title="Confirmar Exclusão"
        footer={
          <>
            <Button variant="outline" onClick={() => setSupplierToDelete(null)} disabled={isDeleting}>
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
              Você tem certeza que deseja excluir o fornecedor <span className="font-bold text-red-600">"{supplierToDelete?.name}"</span>?
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Esta ação não poderá ser desfeita e removerá o fornecedor permanentemente do sistema.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

