/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Plus, Search, User, Mail, Phone, MapPin, MoreVertical, Edit2, 
  Trash2, AlertTriangle, LayoutGrid, List, Table as TableIcon, 
  DollarSign, Calendar, TrendingUp, UserPlus
} from 'lucide-react';
import { 
  PageHeader, Button, Card, Input, Table, THead, TBody, TH, TD, TR, 
  Badge, Modal, StatCard 
} from '../components/ui';
import { MOCK_CUSTOMERS } from '../data/mocks';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchCustomers, deleteCustomer, createCustomer, updateCustomer } from '../lib/easyoneRepository';
import { formatCurrency, formatDate } from '../lib/utils';
import { Customer } from '../types';

export const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // New States
  const [viewMode, setViewMode] = useState<'table' | 'list' | 'cards'>('table');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [formName, setFormName] = useState('');
  const [formDocument, setFormDocument] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');

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
      if (selectedCustomer?.id === customerToDelete.id) {
        setSelectedCustomer(null);
      }
      setCustomerToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      alert('Erro ao excluir cliente. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormDocument('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
  };

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    resetForm();
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCustomer(customer);
    setFormName(customer.name);
    setFormDocument(customer.document || '');
    setFormEmail(customer.email || '');
    setFormPhone(customer.phone || '');
    setFormAddress(customer.address || '');
    setIsAddEditModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSaving(true);
    try {
      const customerData = {
        name: formName.trim(),
        document: formDocument.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
      };

      if (editingCustomer) {
        if (isSupabaseConfigured) {
          const updated = await updateCustomer(editingCustomer.id, customerData);
          setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...updated } : c));
        } else {
          setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...customerData } : c));
        }
      } else {
        if (isSupabaseConfigured) {
          const created = await createCustomer(customerData);
          setCustomers(prev => [created, ...prev]);
        } else {
          const newCustomer: Customer = {
            id: `c_${Date.now()}`,
            name: customerData.name,
            document: customerData.document,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address,
            totalSpent: 0,
            lastPurchase: undefined,
          };
          setCustomers(prev => [newCustomer, ...prev]);
        }
      }
      setIsAddEditModalOpen(false);
      setEditingCustomer(null);
      resetForm();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      alert('Erro ao salvar cliente. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.document && c.document.includes(searchTerm)) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // KPI Calculations
  const totalSpentSum = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const avgSpent = customers.length ? totalSpentSum / customers.length : 0;

  // Helper for generating deterministic premium gradients for customer avatars
  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-violet-500 to-purple-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-red-600',
      'from-sky-500 to-cyan-600'
    ];
    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[charCodeSum % gradients.length];
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Clientes" 
        subtitle={isLoading ? 'Sincronizando clientes com Supabase...' : syncError ?? 'Gestão da sua base de consumidores'} 
        actions={
          <Button onClick={handleOpenAddModal} className="bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm" size="sm">
            <Plus size={16} className="mr-2" /> Novo Cliente
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total de Clientes" 
          value={customers.length} 
          icon={UserPlus} 
          color="blue"
        />
        <StatCard 
          title="Volume de Compras" 
          value={formatCurrency(totalSpentSum)} 
          icon={DollarSign} 
          color="emerald"
        />
        <StatCard 
          title="Ticket Médio p/ Cliente" 
          value={formatCurrency(avgSpent)} 
          icon={TrendingUp} 
          color="indigo"
        />
      </div>

      {/* Filter and View Toggles Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <Input 
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail..." 
            className="pl-10 h-10 w-full rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* View Switcher Button Group */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto justify-center">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              viewMode === 'table' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Visualização em Tabela"
          >
            <TableIcon size={14} />
            <span className="hidden md:inline">Tabela</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              viewMode === 'list' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Visualização em Lista (Otimizada para Mobile)"
          >
            <List size={14} />
            <span className="hidden md:inline">Lista</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              viewMode === 'cards' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Visualização em Cards"
          >
            <LayoutGrid size={14} />
            <span className="hidden md:inline">Cards</span>
          </button>
        </div>
      </div>

      {/* Main View Container */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4 transition-colors">
            <User size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white transition-colors">Nenhum cliente encontrado</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm transition-colors">
            Não encontramos nenhum cliente com os termos buscados. Tente ajustar o filtro ou crie um novo cliente.
          </p>
        </Card>
      ) : (
        <>
          {/* 1. TABLE VIEW */}
          {viewMode === 'table' && (
            <Card className="overflow-hidden">
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
                    <TR 
                      key={customer.id} 
                      onClick={() => setSelectedCustomer(customer)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    >
                      <TD>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarGradient(customer.name)} text-white flex items-center justify-center font-bold shadow-sm shrink-0`}>
                            {customer.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-405 transition-colors truncate">{customer.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin size={10} /> {customer.address || 'Sem endereço'}
                            </p>
                          </div>
                        </div>
                      </TD>
                      <TD>
                        <Badge variant="default" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none font-mono text-[10px] py-1 px-2.5">
                          {customer.document || 'N/D'}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="space-y-1">
                          {customer.email && (
                            <p className="text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                              <Mail size={12} className="text-slate-400" /> {customer.email}
                            </p>
                          )}
                          {customer.phone && (
                            <p className="text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                              <Phone size={12} className="text-slate-400" /> {customer.phone}
                            </p>
                          )}
                          {!customer.email && !customer.phone && (
                            <span className="text-xs text-slate-400 italic">Sem contato</span>
                          )}
                        </div>
                      </TD>
                      <TD>
                        <span className="font-black text-slate-800 dark:text-slate-100">{formatCurrency(customer.totalSpent)}</span>
                      </TD>
                      <TD>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{customer.lastPurchase ? formatDate(customer.lastPurchase) : 'Nunca'}</p>
                      </TD>
                      <TD className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={(e) => handleOpenEditModal(customer, e)}
                          >
                            <Edit2 size={15} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomerToDelete(customer);
                            }}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Card>
          )}

          {/* 2. LIST VIEW */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {filtered.map((customer) => (
                <div 
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 flex items-center justify-between hover:shadow-md dark:hover:shadow-none hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${getAvatarGradient(customer.name)} text-white flex items-center justify-center font-bold shadow-sm shrink-0`}>
                      {customer.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{customer.name}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-0.5 mt-0.5">
                        {customer.document && (
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {customer.document}
                          </span>
                        )}
                        {customer.phone && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Phone size={10} className="shrink-0 text-slate-450" /> {customer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="text-right">
                      <p className="font-black text-slate-800 dark:text-slate-100 text-sm">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Total gasto</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full"
                        onClick={(e) => handleOpenEditModal(customer, e)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomerToDelete(customer);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. CARD VIEW */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((customer) => (
                <Card 
                  key={customer.id} 
                  interactive={true} 
                  onClick={() => setSelectedCustomer(customer)}
                  className="p-5 flex flex-col justify-between h-full border border-slate-100 dark:border-slate-800/80 group hover:shadow-md"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${getAvatarGradient(customer.name)} text-white flex items-center justify-center font-black shadow-md shrink-0 text-lg`}>
                        {customer.name.charAt(0)}
                      </div>
                      
                      {/* Quick Action Button Overlays */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md"
                          onClick={(e) => handleOpenEditModal(customer, e)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-slate-400 hover:text-red-500 rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomerToDelete(customer);
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="mt-4">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{customer.name}</h4>
                      {customer.document && (
                        <Badge variant="default" className="mt-1 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-none font-mono text-[9px] py-0.5 px-2">
                          {customer.document}
                        </Badge>
                      )}
                      
                      <div className="mt-4 space-y-2 border-t border-slate-50 dark:border-slate-800/50 pt-3">
                        {customer.email && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 truncate">
                            <Mail size={12} className="text-slate-400 shrink-0" />
                            {customer.email}
                          </p>
                        )}
                        {customer.phone && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 truncate">
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            {customer.phone}
                          </p>
                        )}
                        {customer.address && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 truncate">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            {customer.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Última compra</p>
                      <p className="font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                        {customer.lastPurchase ? formatDate(customer.lastPurchase) : 'Nunca'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Consumido</p>
                      <p className="font-black text-slate-800 dark:text-slate-100 text-sm mt-0.5">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* A. CLIENT DETAIL MODAL */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Ficha do Cliente"
        maxWidth="max-w-xl"
        footer={
          <div className="flex justify-between items-center w-full">
            <Button 
              variant="danger" 
              onClick={() => {
                if (selectedCustomer) {
                  setCustomerToDelete(selectedCustomer);
                }
              }}
            >
              <Trash2 size={16} className="mr-2" /> Excluir Cliente
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Fechar
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  if (selectedCustomer) {
                    handleOpenEditModal(selectedCustomer);
                    setSelectedCustomer(null);
                  }
                }}
              >
                <Edit2 size={16} className="mr-2" /> Editar Cadastro
              </Button>
            </div>
          </div>
        }
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Header section with avatar */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl transition-colors">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${getAvatarGradient(selectedCustomer.name)} text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0`}>
                {selectedCustomer.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{selectedCustomer.name}</h3>
                {selectedCustomer.document && (
                  <span className="inline-block mt-1 font-mono text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    {selectedCustomer.document}
                  </span>
                )}
              </div>
            </div>

            {/* Financial indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Consumido</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(selectedCustomer.totalSpent)}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Última Compra</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
                  {selectedCustomer.lastPurchase ? formatDate(selectedCustomer.lastPurchase) : 'Nenhuma compra registrada'}
                </p>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dados de Contato</h4>
              <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 transition-colors">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">E-mail</p>
                    {selectedCustomer.email ? (
                      <a href={`mailto:${selectedCustomer.email}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline break-all">
                        {selectedCustomer.email}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Não informado</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-slate-50 dark:border-slate-800 pt-3">
                  <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Telefone</p>
                    {selectedCustomer.phone ? (
                      <a href={`tel:${selectedCustomer.phone.replace(/[^\d+]/g, '')}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        {selectedCustomer.phone}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Não informado</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-slate-50 dark:border-slate-800 pt-3">
                  <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Endereço</p>
                    {selectedCustomer.address ? (
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(selectedCustomer.address)}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline break-words"
                      >
                        {selectedCustomer.address}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Não informado</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* B. ADD / EDIT CLIENT MODAL */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddEditModalOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" form="customer-form" isLoading={isSaving}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="customer-form" onSubmit={handleSaveCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Nome Completo / Razão Social *
            </label>
            <Input 
              required
              placeholder="Ex: Maria Silva ou Silva ME"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              CPF ou CNPJ
            </label>
            <Input 
              placeholder="Ex: 123.456.789-00 ou 12.345.678/0001-99"
              value={formDocument}
              onChange={(e) => setFormDocument(e.target.value)}
              className="w-full font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                E-mail
              </label>
              <Input 
                type="email"
                placeholder="cliente@exemplo.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Telefone
              </label>
              <Input 
                type="tel"
                placeholder="Ex: (11) 99999-9999"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Endereço Completo
            </label>
            <Input 
              placeholder="Ex: Av. Paulista, 1000, Apto 50 - São Paulo, SP"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              className="w-full text-sm"
            />
          </div>
        </form>
      </Modal>

      {/* C. DELETE CONFIRMATION MODAL */}
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


