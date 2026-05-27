/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  Calendar,
  User,
  CreditCard,
  LayoutGrid,
  List,
  Table as TableIcon,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  Percent,
  X,
  Download,
  Printer
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
  Badge,
  Modal,
  StatCard
} from '../components/ui';
import { MOCK_SALES, MOCK_CUSTOMERS, currentUser } from '../data/mocks';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchSales } from '../lib/easyoneRepository';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { Sale, SaleStatus, PaymentMethod } from '../types';

export const Sales = () => {
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  // New UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'list' | 'cards'>('list'); // Default to list for mobile-first behavior
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Filter States
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<SaleStatus | ''>('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<PaymentMethod | ''>('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Print State
  const [receiptToPrint, setReceiptToPrint] = useState<Sale | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;
    setIsLoading(true);

    fetchSales(50)
      .then((data) => {
        if (isMounted) setSales(data.length ? data : MOCK_SALES);
      })
      .catch((error) => {
        console.error('Erro ao carregar vendas do Supabase:', error);
        if (isMounted) setSyncError('Usando vendas locais. Verifique schema, RLS ou chave do Supabase.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleAfterPrint = () => {
      setReceiptToPrint(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Filter logic
  const filteredSales = sales.filter((sale) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      sale.id.toLowerCase().includes(term) ||
      (sale.customerName && sale.customerName.toLowerCase().includes(term)) ||
      sale.paymentMethod.toLowerCase().includes(term) ||
      sale.items.some((item) => item.name.toLowerCase().includes(term))
    );
    
    const matchesStatus = filterStatus ? sale.status === filterStatus : true;
    const matchesPaymentMethod = filterPaymentMethod ? sale.paymentMethod === filterPaymentMethod : true;
    
    let matchesDate = true;
    if (filterStartDate || filterEndDate) {
      const saleDate = new Date(sale.date);
      if (filterStartDate) {
        const start = new Date(filterStartDate + 'T00:00:00');
        if (saleDate < start) matchesDate = false;
      }
      if (filterEndDate) {
        const end = new Date(filterEndDate + 'T23:59:59');
        if (saleDate > end) matchesDate = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDate;
  });

  const handleExportCSV = () => {
    const headers = ['ID Venda', 'Cliente', 'Data e Hora', 'Forma Pagamento', 'Total', 'Status', 'Itens'];
    
    const rows = filteredSales.map(sale => [
      sale.id,
      sale.customerName || 'Consumidor Final',
      new Date(sale.date).toLocaleString('pt-BR'),
      sale.paymentMethod,
      sale.finalTotal.toFixed(2),
      sale.status,
      sale.items.map(item => `${item.name} (${item.quantity}x)`).join(', ')
    ]);
    
    const csvContent = "\uFEFF" + [
      headers.join(';'),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReceipt = (sale: Sale) => {
    setReceiptToPrint(sale);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // KPI Calculations
  const totalSalesSum = sales.reduce((acc, s) => acc + (s.finalTotal || 0), 0);
  const totalSalesCount = sales.length;
  const avgTicket = totalSalesCount ? totalSalesSum / totalSalesCount : 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Vendas" 
        subtitle={isLoading ? 'Sincronizando vendas com Supabase...' : syncError ?? 'Gerencie todas as transações da sua empresa'} 
        actions={
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" size="sm">
            Falar com Suporte
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Faturamento Total" 
          value={formatCurrency(totalSalesSum)} 
          icon={DollarSign} 
          color="emerald"
        />
        <StatCard 
          title="Total de Vendas" 
          value={totalSalesCount} 
          icon={ShoppingCart} 
          color="blue"
        />
        <StatCard 
          title="Ticket Médio" 
          value={formatCurrency(avgTicket)} 
          icon={TrendingUp} 
          color="indigo"
        />
      </div>

      {/* Filter and View Toggles Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <Input 
            placeholder="Buscar por venda, cliente ou item..." 
            className="pl-10 h-10 w-full rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto items-center justify-end">
          {/* View Switcher Button Group */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto justify-center">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
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
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Visualização em Lista (Otimizada para Celular)"
            >
              <List size={14} />
              <span className="hidden md:inline">Lista</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                viewMode === 'cards' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid size={14} />
              <span className="hidden md:inline">Cards</span>
            </button>
          </div>

          <Button 
            variant={filterStatus || filterPaymentMethod || filterStartDate || filterEndDate ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Filter size={16} /> 
            <span>Filtros</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5"
          >
            <Download size={16} /> 
            <span>Exportar CSV</span>
          </Button>
        </div>
      </div>

      {/* Active filters badges */}
      {(filterStatus || filterPaymentMethod || filterStartDate || filterEndDate) && (
        <div className="flex flex-wrap gap-2 items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-xs transition-colors duration-300 animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Filtros ativos:</span>
          {filterStatus && (
            <Badge variant="info" className="gap-1 flex items-center pr-1.5">
              Status: {filterStatus}
              <button onClick={() => setFilterStatus('')} className="hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded p-0.5"><X size={10} /></button>
            </Badge>
          )}
          {filterPaymentMethod && (
            <Badge variant="info" className="gap-1 flex items-center pr-1.5">
              Pagamento: {filterPaymentMethod}
              <button onClick={() => setFilterPaymentMethod('')} className="hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded p-0.5"><X size={10} /></button>
            </Badge>
          )}
          {(filterStartDate || filterEndDate) && (
            <Badge variant="info" className="gap-1 flex items-center pr-1.5">
              Período: {filterStartDate ? new Date(filterStartDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Início'} - {filterEndDate ? new Date(filterEndDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Fim'}
              <button onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }} className="hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded p-0.5"><X size={10} /></button>
            </Badge>
          )}
          <button 
            onClick={() => {
              setFilterStatus('');
              setFilterPaymentMethod('');
              setFilterStartDate('');
              setFilterEndDate('');
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold ml-2"
          >
            Limpar Todos
          </button>
        </div>
      )}

      {filteredSales.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-450 flex items-center justify-center mb-4 transition-colors">
            <ShoppingCart size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white transition-colors">Nenhuma venda encontrada</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm transition-colors">
            Não encontramos nenhuma venda com os termos buscados. Tente ajustar o filtro ou realize novas vendas.
          </p>
        </Card>
      ) : (
        <>
          {/* 1. TABLE VIEW (Desktop default or toggled) */}
          {viewMode === 'table' && (
            <Card className="overflow-hidden">
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
                  {filteredSales.map((sale) => (
                    <TR 
                      key={sale.id} 
                      onClick={() => setSelectedSale(sale)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    >
                      <TD>
                        <span className="font-mono text-xs font-bold text-slate-400">#{sale.id.toUpperCase()}</span>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <User size={14} />
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{sale.customerName || 'Consumidor Final'}</span>
                        </div>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <Calendar size={14} className="text-slate-400" />
                          {formatDateTime(sale.date)}
                        </div>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-slate-400" />
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-tight">{sale.paymentMethod}</span>
                        </div>
                      </TD>
                      <TD>
                        <span className="font-black text-slate-900 dark:text-white">{formatCurrency(sale.finalTotal)}</span>
                      </TD>
                      <TD>
                        <Badge variant={sale.status === SaleStatus.COMPLETED ? 'success' : 'warning'}>
                          {sale.status}
                        </Badge>
                      </TD>
                      <TD className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" 
                            onClick={() => setSelectedSale(sale)}
                            title="Ver Detalhes"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" 
                            onClick={() => handlePrintReceipt(sale)}
                            title="Imprimir Recibo"
                          >
                            <Printer size={16} />
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Card>
          )}

          {/* 2. LIST VIEW (Mobile-optimized list) */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {filteredSales.map((sale) => (
                <div 
                  key={sale.id}
                  onClick={() => setSelectedSale(sale)}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 flex items-center justify-between hover:shadow-md dark:hover:shadow-none hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                      <ShoppingCart size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">#{sale.id.toUpperCase()}</span>
                        <Badge variant={sale.status === SaleStatus.COMPLETED ? 'success' : 'warning'}>
                          {sale.status}
                        </Badge>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-0.5 truncate">
                        {sale.customerName || 'Consumidor Final'}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" /> 
                          {formatDateTime(sale.date)}
                        </span>
                        <span className="flex items-center gap-1 uppercase">
                          <CreditCard size={12} className="text-slate-400" /> 
                          {sale.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="text-right mr-1">
                      <p className="font-black text-slate-800 dark:text-slate-100 text-sm">{formatCurrency(sale.finalTotal)}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Total</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full"
                        onClick={() => setSelectedSale(sale)}
                        title="Ver Detalhes"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full"
                        onClick={() => handlePrintReceipt(sale)}
                        title="Imprimir Recibo"
                      >
                        <Printer size={14} />
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
              {filteredSales.map((sale) => (
                <Card 
                  key={sale.id} 
                  interactive={true} 
                  onClick={() => setSelectedSale(sale)}
                  className="p-5 flex flex-col justify-between h-full border border-slate-100 dark:border-slate-800/80 group hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                        <ShoppingCart size={18} />
                      </div>
                      <Badge variant={sale.status === SaleStatus.COMPLETED ? 'success' : 'warning'}>
                        {sale.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-4">
                      <span className="font-mono text-xs font-bold text-slate-400">#{sale.id.toUpperCase()}</span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-1 truncate">
                        {sale.customerName || 'Consumidor Final'}
                      </h4>
                      
                      <div className="mt-4 space-y-2 border-t border-slate-50 dark:border-slate-800/50 pt-3">
                        <p className="text-xs text-slate-600 dark:text-slate-350 flex items-center gap-2">
                          <Calendar size={12} className="text-slate-400" />
                          {formatDateTime(sale.date)}
                        </p>
                        <p className="text-xs text-slate-650 dark:text-slate-300 flex items-center gap-2 uppercase">
                          <CreditCard size={12} className="text-slate-400" />
                          {sale.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Itens</p>
                      <p className="font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                        {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Valor Total</p>
                      <p className="font-black text-slate-800 dark:text-slate-100 text-sm mt-0.5">
                        {formatCurrency(sale.finalTotal)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de Detalhes */}
      <Modal
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        title={selectedSale ? `Detalhes da Venda #${selectedSale.id.toUpperCase()}` : ''}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={() => selectedSale && handlePrintReceipt(selectedSale)}
              className="flex items-center gap-1.5"
            >
              <Printer size={16} />
              Imprimir Recibo
            </Button>
            <Button variant="secondary" onClick={() => setSelectedSale(null)}>
              Fechar
            </Button>
          </div>
        }
      >
        {selectedSale && (() => {
          const customerDetails = MOCK_CUSTOMERS.find(c => 
            (selectedSale.customerId && c.id === selectedSale.customerId) || 
            (selectedSale.customerName && c.name.toLowerCase() === selectedSale.customerName.toLowerCase())
          );
          
          const sellerName = selectedSale.sellerId === currentUser.id 
            ? currentUser.name 
            : selectedSale.sellerId;

          return (
            <div className="space-y-6 text-slate-700 dark:text-slate-350">
              {/* 1. Header Metadata info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Informações Gerais</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={15} className="text-indigo-500 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDateTime(selectedSale.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-450">
                    <span className="text-xs">Vendedor:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{sellerName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status & Pagamento</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={selectedSale.status === SaleStatus.COMPLETED ? 'success' : 'warning'}>
                      {selectedSale.status}
                    </Badge>
                    <Badge variant="info" className="uppercase font-mono flex items-center gap-1">
                      <CreditCard size={12} />
                      {selectedSale.paymentMethod}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 2. Customer Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cliente</h4>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <User size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-base">
                        {selectedSale.customerName || 'Consumidor Final'}
                      </p>
                      
                      {customerDetails ? (
                        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 border-t border-slate-50 dark:border-slate-800/60 pt-2.5 text-xs text-slate-650 dark:text-slate-400">
                          {customerDetails.document && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-450">CPF/CNPJ:</span>
                              <span className="font-mono">{customerDetails.document}</span>
                            </div>
                          )}
                          {customerDetails.phone && (
                            <div className="flex items-center gap-1.5 font-medium">
                              <Phone size={12} className="text-slate-450 shrink-0" />
                              <span>{customerDetails.phone}</span>
                            </div>
                          )}
                          {customerDetails.email && (
                            <div className="flex items-center gap-1.5 sm:col-span-2">
                              <Mail size={12} className="text-slate-450 shrink-0" />
                              <span className="truncate">{customerDetails.email}</span>
                            </div>
                          )}
                          {customerDetails.address && (
                            <div className="flex items-start gap-1.5 sm:col-span-2 mt-0.5">
                              <MapPin size={12} className="text-slate-450 shrink-0 mt-0.5" />
                              <span className="break-words">{customerDetails.address}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic mt-1">
                          Venda realizada para Consumidor Final (sem cadastro identificado).
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Items Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Itens da Venda</h4>
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <Table>
                    <THead>
                      <TR>
                        <TH className="py-2.5 px-3 text-xs">Produto</TH>
                        <TH className="py-2.5 px-3 text-xs text-center">Qtd</TH>
                        <TH className="py-2.5 px-3 text-xs text-right">Preço Un.</TH>
                        <TH className="py-2.5 px-3 text-xs text-right">Desc.</TH>
                        <TH className="py-2.5 px-3 text-xs text-right">Subtotal</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {selectedSale.items.map((item, index) => (
                        <TR key={index}>
                          <TD className="py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white">
                            {item.name}
                          </TD>
                          <TD className="py-2.5 px-3 text-xs text-center font-mono font-medium">
                            {item.quantity}
                          </TD>
                          <TD className="py-2.5 px-3 text-xs text-right font-mono">
                            {formatCurrency(item.price)}
                          </TD>
                          <TD className="py-2.5 px-3 text-xs text-right font-mono text-amber-600 dark:text-amber-400 font-medium">
                            {item.discount > 0 ? `-${formatCurrency(item.discount)}` : 'R$ 0,00'}
                          </TD>
                          <TD className="py-2.5 px-3 text-xs text-right font-black font-mono text-slate-900 dark:text-white">
                            {formatCurrency(item.total)}
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>
              </div>

              {/* 4. Financial Totals */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold">{formatCurrency(selectedSale.totalBeforeDiscount)}</span>
                </div>
                
                {selectedSale.totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Percent size={12} className="text-slate-400" /> Descontos Aplicados
                    </span>
                    <span className="font-mono">-{formatCurrency(selectedSale.totalDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Total da Venda</span>
                  <span className="text-xl font-black text-indigo-650 dark:text-indigo-400 font-mono font-semibold">
                    {formatCurrency(selectedSale.finalTotal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Modal de Filtros */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar Vendas"
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-between w-full">
            <Button 
              variant="ghost" 
              onClick={() => {
                setFilterStatus('');
                setFilterPaymentMethod('');
                setFilterStartDate('');
                setFilterEndDate('');
                setIsFilterModalOpen(false);
              }}
            >
              Limpar Filtros
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setIsFilterModalOpen(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5"
            >
              Aplicar Filtros
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Status da Venda
            </label>
            <select
              className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as SaleStatus | '')}
            >
              <option value="">Todos os Status</option>
              <option value={SaleStatus.COMPLETED}>Concluída</option>
              <option value={SaleStatus.PENDING}>Pendente</option>
              <option value={SaleStatus.CANCELLED}>Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Forma de Pagamento
            </label>
            <select
              className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value as PaymentMethod | '')}
            >
              <option value="">Todas as Formas</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="Débito">Débito</option>
              <option value="Crédito">Crédito</option>
              <option value="Boleto">Boleto</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Data Final
              </label>
              <input
                type="date"
                className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Elemento oculto usado apenas para a impressão do recibo */}
      {receiptToPrint && (
        <>
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-receipt, #printable-receipt * {
                visibility: visible !important;
              }
              #printable-receipt {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                display: block !important;
                background: white !important;
                color: black !important;
              }
            }
          `}</style>
          <div id="printable-receipt" className="hidden print:block p-6 max-w-sm mx-auto font-mono text-xs text-slate-900 bg-white">
            <div className="text-center border-b border-dashed border-slate-400 pb-4 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider">VarejoFlow ERP</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">CUPOM NÃO FISCAL</p>
              <p className="text-[10px] text-slate-500">Rua Principal, 123 - Centro</p>
              <p className="text-[10px] text-slate-500">CNPJ: 12.345.678/0001-99</p>
            </div>

            <div className="space-y-1 mb-4 text-[10px] border-b border-dashed border-slate-400 pb-4">
              <p><span className="font-bold">ID VENDA:</span> #{receiptToPrint.id.toUpperCase()}</p>
              <p><span className="font-bold">DATA:</span> {new Date(receiptToPrint.date).toLocaleString('pt-BR')}</p>
              <p><span className="font-bold">CLIENTE:</span> {receiptToPrint.customerName || 'Consumidor Final'}</p>
              <p><span className="font-bold">VENDEDOR:</span> {receiptToPrint.sellerId}</p>
            </div>

            <div className="border-b border-dashed border-slate-400 pb-4 mb-4">
              <p className="font-bold mb-2 text-[10px]">ITENS</p>
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="border-b border-dashed border-slate-300">
                    <th className="pb-1 font-bold">DESCR.</th>
                    <th className="pb-1 text-center font-bold">QTD</th>
                    <th className="pb-1 text-right font-bold">VL. UN</th>
                    <th className="pb-1 text-right font-bold">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptToPrint.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-1 max-w-[120px] truncate">{item.name}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right">{formatCurrency(item.price)}</td>
                      <td className="py-1 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 text-right text-[10px] border-b border-dashed border-slate-400 pb-4 mb-4">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>{formatCurrency(receiptToPrint.totalBeforeDiscount)}</span>
              </div>
              {receiptToPrint.totalDiscount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>DESCONTO:</span>
                  <span>-{formatCurrency(receiptToPrint.totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-dotted border-slate-300">
                <span>VALOR TOTAL:</span>
                <span>{formatCurrency(receiptToPrint.finalTotal)}</span>
              </div>
            </div>

            <div className="text-[10px] mb-4">
              <p><span className="font-bold">FORMA DE PAGAMENTO:</span> {receiptToPrint.paymentMethod.toUpperCase()}</p>
              <p><span className="font-bold">STATUS DA TRANSACAO:</span> {receiptToPrint.status.toUpperCase()}</p>
            </div>

            <div className="text-center pt-2 border-t border-dashed border-slate-400 text-[10px] text-slate-500">
              <p>Obrigado pela preferência!</p>
              <p className="mt-1 font-bold text-[8px] text-slate-400">www.erppravoce.com.br</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
