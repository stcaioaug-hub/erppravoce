/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Package, 
  Barcode,
  History
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
import { MOCK_PRODUCTS } from '../data/mocks';
import { formatCurrency, cn } from '../lib/utils';

export const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Produtos" 
        subtitle="Gerencie seu catálogo de mercadorias" 
        actions={
          <>
            <Button variant="outline" size="sm">
              <History size={16} className="mr-2" /> Histórico
            </Button>
            <Button className="bg-indigo-600 text-white" size="sm">
              <Plus size={16} className="mr-2" /> Novo Produto
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Itens em Estoque</p>
          <p className="text-2xl font-black text-slate-900 mt-1">113 <span className="text-sm font-medium text-slate-400 font-normal">unidades</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor em Estoque (Custo)</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(12450.00)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor Estimado (Venda)</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{formatCurrency(21800.50)}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Buscar por nome, SKU ou Código..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            <Filter size={16} className="mr-2" /> Filtros
          </Button>
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <THead>
            <TR>
              <TH className="w-12">{""}</TH>
              <TH>Produto</TH>
              <TH>SKU / Cód. Barras</TH>
              <TH>Preço Custo</TH>
              <TH>Preço Venda</TH>
              <TH>Estoque</TH>
              <TH>Status</TH>
              <TH className="text-right">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((product) => (
              <TR key={product.id} className="hover:bg-slate-50 transition-colors group">
                <TD>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors">
                    <Package size={20} />
                  </div>
                </TD>
                <TD>
                  <div>
                    <p className="font-bold text-slate-900 leading-none">{product.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{product.category}</p>
                  </div>
                </TD>
                <TD>
                  <div className="flex flex-col gap-1">
                    <Badge variant="default" className="w-fit text-[10px] uppercase font-bold tracking-tight bg-slate-50">{product.sku}</Badge>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Barcode size={10} />
                      {product.barcode}
                    </div>
                  </div>
                </TD>
                <TD>{formatCurrency(product.costPrice)}</TD>
                <TD>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{formatCurrency(product.salePrice)}</span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{product.margin}% margem</span>
                  </div>
                </TD>
                <TD>
                  <div className="flex flex-col">
                    <span className={cn(
                      "font-bold",
                      product.currentStock <= product.minStock ? "text-red-500" : "text-slate-900"
                    )}>
                      {product.currentStock} {product.unit}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Mín: {product.minStock}</span>
                  </div>
                </TD>
                <TD>
                  <Badge variant={product.currentStock <= product.minStock ? 'danger' : 'success'}>
                    {product.currentStock <= product.minStock ? 'Reposição' : 'Ativo'}
                  </Badge>
                </TD>
                <TD className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
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
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Package size={48} className="mx-auto mb-4 text-slate-200" />
            <p className="font-medium text-slate-600 tracking-tight">Nenhum produto encontrado</p>
            <p className="text-sm">Tente reajustar sua busca ou filtros</p>
          </div>
        )}
      </Card>
    </div>
  );
};
