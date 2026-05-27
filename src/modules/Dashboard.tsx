/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  Layers,
  ClipboardList,
  Bike,
  Award,
  CircleDollarSign,
  Activity,
  GitCommit,
  ArrowRightLeft,
  Grid,
  Truck,
  Target,
  FileText,
  Barcode,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { PageHeader, StatCard, Card, Badge, Button, Table, THead, TBody, TR, TH, TD } from '../components/ui';
import { DASHBOARD_STATS, MOCK_SALES, MOCK_PRODUCTS } from '../data/mocks';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchProducts, fetchSales } from '../lib/easyoneRepository';
import { formatCurrency, formatDate } from '../lib/utils';
import { Product, Sale } from '../types';

interface DashboardProps {
  onNavigate?: (module: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    Promise.all([fetchProducts(), fetchSales(8)])
      .then(([syncedProducts, syncedSales]) => {
        if (!isMounted) return;
        if (syncedProducts.length) setProducts(syncedProducts);
        if (syncedSales.length) setSales(syncedSales);
      })
      .catch((error) => {
        console.error('Erro ao carregar dashboard do Supabase:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const dashboardStats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySales = sales.filter((sale) => sale.date.toDateString() === today);
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.finalTotal, 0);

    return {
      todaySales: todaySales.length ? todayRevenue : DASHBOARD_STATS.todaySales,
      todayOrders: todaySales.length || DASHBOARD_STATS.todayOrders,
      avgTicket: todaySales.length ? todayRevenue / todaySales.length : DASHBOARD_STATS.avgTicket,
      lowStockItems: products.filter((product) => product.currentStock <= product.minStock).length,
    };
  }, [products, sales]);

  // Carregar dados do Onboarding
  const onboardingData = (() => {
    try {
      const raw = localStorage.getItem('easyone_onboarding');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Erro ao processar dados de onboarding:', e);
      return null;
    }
  })();
  const businessType = onboardingData?.businessType || '';
  const need = onboardingData?.need || '';
  const process = onboardingData?.process || '';
  const goal = onboardingData?.goal || '';

  // Configuração adaptativa baseada no ramo
  const config = useMemo(() => {
    switch (businessType) {
      case 'varejo':
        return {
          title: 'Varejo & Moda',
          subtitle: 'Visão geral de vendas no balcão, giro de grade e canais de faturamento',
          stat1: { title: 'Faturamento Balcão', value: 'R$ 8.420,00', icon: TrendingUp, color: 'emerald' as const },
          stat2: { title: 'Giro de Grade', value: '180 peças', icon: Layers, color: 'blue' as const },
          stat3: { title: 'Ticket Médio Lojas', value: 'R$ 142,50', icon: ShoppingCart, color: 'indigo' as const },
          stat4: { title: 'Grade Crítica (Cores)', value: '3 cores/tam', icon: AlertCircle, color: 'amber' as const },
          chartTitle: 'Canais de Venda Ativos',
          chartSubtitle: 'Volume por canal de venda (Loja Física vs. Instagram vs. WhatsApp)',
          chartData: [
            { name: 'Seg', Loja: 1200, WhatsApp: 400, Instagram: 600 },
            { name: 'Ter', Loja: 1500, WhatsApp: 500, Instagram: 800 },
            { name: 'Qua', Loja: 1800, WhatsApp: 600, Instagram: 700 },
            { name: 'Qui', Loja: 1400, WhatsApp: 700, Instagram: 900 },
            { name: 'Sex', Loja: 2200, WhatsApp: 900, Instagram: 1200 },
            { name: 'Sáb', Loja: 3100, WhatsApp: 1100, Instagram: 1500 },
            { name: 'Dom', Loja: 1900, WhatsApp: 800, Instagram: 1000 },
          ],
          chartKeys: ['Loja', 'WhatsApp', 'Instagram'],
          widgetTitle: 'Giro de Grade de Estoque',
          widgetData: [
            { label: 'Calça Jeans Skinny - Azul - 38', val: '2 unid. rest.' },
            { label: 'Camisa Polo Confort - Verde - M', val: '0 unid. rest. (Zerar)' },
            { label: 'Tênis Running Air - Preto - 40', val: '1 unid. rest.' },
          ],
          tableTitle: 'Últimas Vendas Integradas',
          tableHeaders: ['ID', 'Cliente', 'Canal', 'Pagamento', 'Status', 'Total'],
          tableRows: [
            { id: '#1024', col1: 'Maria Clara', col2: 'Instagram', col3: 'PIX', col4: 'Concluída', col5: 'R$ 259,90' },
            { id: '#1023', col1: 'João Pedro', col2: 'Loja Física', col3: 'Crédito', col4: 'Concluída', col5: 'R$ 450,00' },
            { id: '#1022', col1: 'Ana Julia', col2: 'WhatsApp', col3: 'PIX', col4: 'Concluída', col5: 'R$ 189,00' },
          ]
        };
      case 'mercadinho':
        return {
          title: 'Mercadinho & Mercearia',
          subtitle: 'Frente de caixa, controle de datas de validade e reposição de fornecedores',
          stat1: { title: 'Faturamento PDV Hoje', value: 'R$ 4.290,50', icon: TrendingUp, color: 'emerald' as const },
          stat2: { title: 'Cupons Emitidos', value: '112 cupons', icon: ShoppingCart, color: 'blue' as const },
          stat3: { title: 'Itens no Estoque', value: '4.850 itens', icon: Package, color: 'indigo' as const },
          stat4: { title: 'Vencendo em 7 Dias', value: '14 produtos', icon: AlertCircle, color: 'red' as const },
          chartTitle: 'Fluxo de Clientes no Caixa',
          chartSubtitle: 'Controle de transações por período do dia',
          chartData: [
            { name: '08h-10h', Fluxo: 18 },
            { name: '10h-12h', Fluxo: 34 },
            { name: '12h-14h', Fluxo: 48 },
            { name: '14h-16h', Fluxo: 28 },
            { name: '16h-18h', Fluxo: 62 },
            { name: '18h-20h', Fluxo: 85 },
          ],
          chartKeys: ['Fluxo'],
          widgetTitle: 'Produtos Próximos do Vencimento',
          widgetData: [
            { label: 'Leite Integral UHT 1L (Lote B)', val: 'Vence amanhã (12 un)' },
            { label: 'Pão de Forma Integral (Fórmula)', val: 'Vence em 2 dias (5 un)' },
            { label: 'Iogurte Natural Frutas 500g', val: 'Vence em 3 dias (18 un)' },
          ],
          tableTitle: 'Últimos Cupons Emitidos',
          tableHeaders: ['ID Cupom', 'Operador', 'Hora', 'Itens', 'Status', 'Total'],
          tableRows: [
            { id: '#99812', col1: 'Caixa 01 (Ana)', col2: '18:42', col3: '14 itens', col4: 'Emitido', col5: 'R$ 143,20' },
            { id: '#99811', col1: 'Caixa 01 (Ana)', col2: '18:38', col3: '3 itens', col4: 'Emitido', col5: 'R$ 22,50' },
            { id: '#99810', col1: 'Caixa 02 (Luís)', col2: '18:32', col3: '22 itens', col4: 'Emitido', col5: 'R$ 310,90' },
          ]
        };
      case 'restaurante':
        return {
          title: 'Alimentação & Delivery',
          subtitle: 'Painel de controle de comandas, taxa de preparo de cozinha e despaches de delivery',
          stat1: { title: 'Faturamento Total', value: 'R$ 5.920,00', icon: TrendingUp, color: 'emerald' as const },
          stat2: { title: 'Mesas / Comandas', value: '8 ocupadas', icon: ClipboardList, color: 'amber' as const },
          stat3: { title: 'Pedidos Delivery', value: '37 pedidos', icon: Bike, color: 'blue' as const },
          stat4: { title: 'Insumos Críticos', value: '4 itens baixos', icon: AlertCircle, color: 'red' as const },
          chartTitle: 'Pico de Pedidos (Almoço vs Jantar)',
          chartSubtitle: 'Faturamento bruto por faixa horária de pico',
          chartData: [
            { name: '11h-12h', Almoço: 400, Jantar: 0 },
            { name: '12h-13h', Almoço: 1800, Jantar: 0 },
            { name: '13h-14h', Almoço: 1100, Jantar: 0 },
            { name: '18h-19h', Almoço: 0, Jantar: 600 },
            { name: '19h-20h', Almoço: 0, Jantar: 2100 },
            { name: '20h-21h', Almoço: 0, Jantar: 2900 },
            { name: '21h-22h', Almoço: 0, Jantar: 1500 },
          ],
          chartKeys: ['Almoço', 'Jantar'],
          widgetTitle: 'Ingredientes Críticos (Estoque)',
          widgetData: [
            { label: 'Queijo Mozarela Fatiado', val: 'Restam 1.2 kg (Crítico)' },
            { label: 'Hambúrguer Artesanal Bovino', val: 'Restam 10 un (Crítico)' },
            { label: 'Pão de Hambúrguer Gergelim', val: 'Restam 12 un (Alerta)' },
          ],
          tableTitle: 'Pedidos e Comandas em Andamento',
          tableHeaders: ['Ref/Mesa', 'Destino', 'Tempo Aberto', 'Itens Pedidos', 'Status', 'Total'],
          tableRows: [
            { id: 'Mesa 04', col1: 'Salão', col2: '42 min', col3: '2 Bebidas, 2 Hambúrgueres', col4: 'Em Preparo', col5: 'R$ 98,00' },
            { id: 'Pedido #48', col1: 'Delivery - Motoboy João', col2: '15 min', col3: '1 Pizza Família, 1 Refri', col4: 'Pronto / Rota', col5: 'R$ 72,00' },
            { id: 'Mesa 12', col1: 'Salão', col2: '5 min', col3: '1 Bebida, 1 Sobremesa', col4: 'Recebido', col5: 'R$ 32,00' },
          ]
        };
      case 'servicos':
      case 'beleza':
        return {
          title: 'Serviços & Bem-Estar',
          subtitle: 'Acompanhamento de agendas diárias, ordens de serviço emitidas e comissão de equipe',
          stat1: { title: 'Faturamento de Serviços', value: 'R$ 3.840,00', icon: TrendingUp, color: 'emerald' as const },
          stat2: { title: 'Agendamentos Hoje', value: '18 marcados', icon: Clock, color: 'blue' as const },
          stat3: { title: 'Comissões Acumuladas', value: 'R$ 768,00', icon: Award, color: 'amber' as const },
          stat4: { title: 'Contratos Mensais', value: '32 ativos', icon: Users, color: 'indigo' as const },
          chartTitle: 'Projeção de Recorrência Mensal',
          chartSubtitle: 'Receita previsível vs. avulsa nos últimos meses',
          chartData: [
            { name: 'Jan', Recorrente: 8000, Avulso: 4200 },
            { name: 'Fev', Recorrente: 8500, Avulso: 5100 },
            { name: 'Mar', Recorrente: 9200, Avulso: 4800 },
            { name: 'Abr', Recorrente: 9800, Avulso: 6000 },
            { name: 'Mai', Recorrente: 11000, Avulso: 7200 },
          ],
          chartKeys: ['Recorrente', 'Avulso'],
          widgetTitle: 'Profissionais & Comissões',
          widgetData: [
            { label: 'Marina Mendes (Design / Unhas)', val: 'R$ 310,00 comissão' },
            { label: 'Carlos Oliveira (Cortes / Estilo)', val: 'R$ 458,00 comissão' },
            { label: 'Ana Paula (Estética / Facial)', val: 'Sem atendimentos hoje' },
          ],
          tableTitle: 'Próximos Agendamentos / OS Abertas',
          tableHeaders: ['Hora/ID', 'Cliente', 'Profissional', 'Serviço Solicitado', 'Status', 'Valor'],
          tableRows: [
            { id: '14:00', col1: 'Viviane Rocha', col2: 'Marina Mendes', col3: 'Corte Feminino + Escova', col4: 'Agendado', col5: 'R$ 150,00' },
            { id: '15:30', col1: 'Renata Santos', col2: 'Marina Mendes', col3: 'Manicure + Pedicure Gel', col4: 'Confirmado', col5: 'R$ 120,00' },
            { id: 'OS #1092', col1: 'Guilherme Lima', col2: 'Carlos Oliveira', col3: 'Limpeza de Pele Profunda', col4: 'Executando', col5: 'R$ 180,00' },
          ]
        };
      case 'industria':
        return {
          title: 'Produção Industrial & Confecção',
          subtitle: 'Cálculo de custo de produção, ficha técnica do produto e lotes de produção ativos',
          stat1: { title: 'Custo Médio Fabril', value: 'R$ 12.450,00', icon: CircleDollarSign, color: 'indigo' as const },
          stat2: { title: 'Lotes em Produção', value: '6 lotes ativos', icon: GitCommit, color: 'blue' as const },
          stat3: { title: 'Eficiência de Produção', value: '94.2%', icon: Activity, color: 'emerald' as const },
          stat4: { title: 'Matéria-Prima Crítica', value: '2 insumos', icon: AlertCircle, color: 'red' as const },
          chartTitle: 'Custo de Insumo vs Valor de Venda',
          chartSubtitle: 'Análise de margem industrial por lote de produto',
          chartData: [
            { name: 'Lote 01', Custo: 320, Venda: 950 },
            { name: 'Lote 02', Custo: 410, Venda: 1200 },
            { name: 'Lote 03', Custo: 280, Venda: 880 },
            { name: 'Lote 04', Custo: 500, Venda: 1600 },
            { name: 'Lote 05', Custo: 440, Venda: 1350 },
          ],
          chartKeys: ['Custo', 'Venda'],
          widgetTitle: 'Status Ficha Técnica (Insumos)',
          widgetData: [
            { label: 'Linha Poliéster Azul Ref-48', val: 'Estoque zerado na fábrica!' },
            { label: 'Tecido Algodão Piquet Cinza', val: 'Restam apenas 12 metros' },
            { label: 'Embalagem Plástica Transp.', val: 'Estoque saudável (800 un)' },
          ],
          tableTitle: 'Ordens de Produção (OP) em Andamento',
          tableHeaders: ['OP N°', 'Lote de Referência', 'Operador Responsável', 'Etapa Atual', 'Progresso', 'Previsão'],
          tableRows: [
            { id: 'OP #208', col1: 'Camiseta Polo Piquet (Lote M)', col2: 'Gilberto Alves', col3: 'Corte e Costura', col4: '65%', col5: 'Hoje às 18h' },
            { id: 'OP #207', col1: 'Vestido Linho (Lote G)', col2: 'Marta Ribeiro', col3: 'Acabamento / Botão', col4: '90%', col5: 'Hoje às 14h' },
            { id: 'OP #206', col1: 'Bolsa Couro (Lote U)', col2: 'Roberto Dias', col3: 'Preparação do Couro', col4: '10%', col5: 'Amanhã' },
          ]
        };
      case 'distribuidora':
        return {
          title: 'Distribuidora & Atacado',
          subtitle: 'Pedidos de faturamento, comissões de vendedores externos e roteirização de cargas',
          stat1: { title: 'Faturamento Atacado', value: 'R$ 48.900,00', icon: TrendingUp, color: 'emerald' as const },
          stat2: { title: 'Pedidos a Separar', value: '9 pedidos', icon: Grid, color: 'blue' as const },
          stat3: { title: 'Carga Pronta / Rota', value: '3 carregamentos', icon: Truck, color: 'indigo' as const },
          stat4: { title: 'Comissões de Vendas', value: 'R$ 2.445,00', icon: Target, color: 'amber' as const },
          chartTitle: 'Vendas por Vendedor Externo',
          chartSubtitle: 'Faturamento consolidado por representante comercial',
          chartData: [
            { name: 'Marcos', Vendas: 18200 },
            { name: 'Sandra', Vendas: 24500 },
            { name: 'Roberto', Vendas: 16900 },
            { name: 'Luciana', Vendas: 12000 },
          ],
          chartKeys: ['Vendas'],
          widgetTitle: 'Carga e Rotas de Entrega',
          widgetData: [
            { label: 'Rota Zona Sul - Caminhão 01', val: 'Aguardando Liberação' },
            { label: 'Rota Centro - Fiorino 02', val: 'Em Trânsito / Entrega' },
            { label: 'Rota ABCD - Caminhão 03', val: 'Separando Carga' },
          ],
          tableTitle: 'Pedidos de Venda em Separação / Expedição',
          tableHeaders: ['Pedido', 'Cliente Atacado', 'Vendedor', 'Itens / Caixas', 'Status', 'Total'],
          tableRows: [
            { id: '#4492', col1: 'Supermercado Pão e Mel', col2: 'Sandra', col3: '45 caixas mistas', col4: 'Separando', col5: 'R$ 5.430,00' },
            { id: '#4491', col1: 'Mercearia do Português', col2: 'Marcos', col3: '12 fardos de refri', col4: 'Faturado (NF-e)', col5: 'R$ 1.820,00' },
            { id: '#4490', col1: 'Hortifruti Pomar Verde', col2: 'Roberto', col3: '88 itens fracionados', col4: 'Despachado', col5: 'R$ 12.900,00' },
          ]
        };
      default:
        return null;
    }
  }, [businessType]);

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const getGoalBadgeText = () => {
    switch (goal) {
      case 'faturamento': return 'Foco: Aumentar Faturamento';
      case 'organizacao': return 'Foco: Organizar Finanças';
      case 'tempo': return 'Foco: Economizar Tempo';
      case 'expansao': return 'Foco: Expandir Operação';
      default: return '';
    }
  };

  const getCardDestination = (cardIndex: number): string => {
    if (!businessType) {
      if (cardIndex === 1) return 'financeiro';
      if (cardIndex === 2) return 'vendas';
      if (cardIndex === 3) return 'vendas';
      return 'estoque';
    }

    switch (businessType) {
      case 'varejo':
        if (cardIndex === 1) return 'financeiro';
        if (cardIndex === 2) return 'estoque';
        if (cardIndex === 3) return 'vendas';
        return 'estoque';
      case 'mercadinho':
        if (cardIndex === 1) return 'financeiro';
        if (cardIndex === 2) return 'vendas';
        if (cardIndex === 3) return 'estoque';
        return 'estoque';
      case 'restaurante':
        if (cardIndex === 1) return 'financeiro';
        if (cardIndex === 2) return 'pdv';
        if (cardIndex === 3) return 'vendas';
        return 'estoque';
      case 'servicos':
      case 'beleza':
        if (cardIndex === 1) return 'financeiro';
        if (cardIndex === 2) return 'pdv';
        if (cardIndex === 3) return 'financeiro';
        return 'clientes';
      case 'industria':
        if (cardIndex === 1) return 'financeiro';
        if (cardIndex === 2) return 'estoque';
        if (cardIndex === 3) return 'relatorios';
        return 'estoque';
      case 'distribuidora':
        if (cardIndex === 1) return 'financeiro';
        if (cardIndex === 2) return 'vendas';
        if (cardIndex === 3) return 'estoque';
        return 'financeiro';
      default:
        if (cardIndex === 1) return 'financeiro';
        if (cardIndex === 2) return 'vendas';
        if (cardIndex === 3) return 'vendas';
        return 'estoque';
    }
  };

  const getWidgetDestination = (): string => {
    if (['varejo', 'mercadinho', 'restaurante', 'industria', 'distribuidora'].includes(businessType)) return 'estoque';
    if (['servicos', 'beleza'].includes(businessType)) return 'financeiro';
    return 'estoque';
  };

  // Se houver configuração adaptativa ativa
  if (config) {
    const StatIcon1 = config.stat1.icon;
    const StatIcon2 = config.stat2.icon;
    const StatIcon3 = config.stat3.icon;
    const StatIcon4 = config.stat4.icon;

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader 
            title={`Painel: ${config.title}`} 
            subtitle={config.subtitle} 
          />
          {goal && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/20 border border-violet-500/20 px-4 py-2 rounded-2xl shrink-0">
              <Sparkles size={16} className="text-violet-500 dark:text-violet-400" />
              <span className="text-xs font-black text-violet-700 dark:text-violet-300 uppercase tracking-widest">
                {getGoalBadgeText()}
              </span>
            </div>
          )}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
          {/* Stat Card 1 */}
          <StatCard 
            title={config.stat1.title} 
            value={config.stat1.value} 
            icon={StatIcon1}
            trend={{ value: 8, positive: true }}
            color={config.stat1.color}
            onClick={() => onNavigate?.(getCardDestination(1))}
          />

          {/* Stat Card 2 */}
          <StatCard 
            title={config.stat2.title} 
            value={config.stat2.value} 
            icon={StatIcon2}
            trend={{ value: 15, positive: true }}
            color={config.stat2.color}
            onClick={() => onNavigate?.(getCardDestination(2))}
          />

          {/* Stat Card 3 */}
          <StatCard 
            title={config.stat3.title} 
            value={config.stat3.value} 
            icon={StatIcon3}
            trend={{ value: 3, positive: true }}
            color={config.stat3.color}
            onClick={() => onNavigate?.(getCardDestination(3))}
          />

          {/* Stat Card 4 */}
          <StatCard 
            title={config.stat4.title} 
            value={config.stat4.value} 
            icon={StatIcon4}
            color={config.stat4.color}
            onClick={() => onNavigate?.(getCardDestination(4))}
          />

          {/* Main Chart Card (Large) */}
          <Card 
            interactive={true}
            onClick={() => onNavigate?.('relatorios')}
            className="lg:col-span-2 lg:row-span-2 bg-slate-900 rounded-3xl p-6 flex flex-col border-none shadow-xl shadow-slate-200"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-white font-bold tracking-tight">{config.chartTitle}</h3>
                <p className="text-slate-400 text-xs">{config.chartSubtitle}</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {config.chartKeys.map((key, index) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }}></div>
                    <span className="text-[10px] text-white uppercase font-bold tracking-wider">{key}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 h-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                {config.chartKeys.length > 1 ? (
                  <BarChart data={config.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#64748b', fontSize: '9px', marginBottom: '4px' }}
                    />
                    {config.chartKeys.map((key, index) => (
                      <Bar 
                        key={key}
                        dataKey={key} 
                        fill={chartColors[index % chartColors.length]} 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    ))}
                  </BarChart>
                ) : (
                  <AreaChart data={config.chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#64748b', fontSize: '9px', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={config.chartKeys[0]} 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-6 px-2 text-[10px] text-slate-500 uppercase font-black tracking-widest">
              {config.chartData.map(d => <span key={d.name}>{d.name}</span>)}
            </div>
          </Card>

          {/* Business Type Specific Widget 1 */}
          <Card 
            interactive={true}
            onClick={() => onNavigate?.(getWidgetDestination())}
            className="p-6 flex flex-col justify-between overflow-hidden relative"
          >
            <div className="relative z-10">
              <h3 className="text-slate-800 dark:text-slate-200 font-bold text-sm mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" />
                {config.widgetTitle}
              </h3>
              <div className="space-y-4">
                {config.widgetData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium group-hover:text-violet-600 transition-colors">{item.label}</span>
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md truncate max-w-[120px]">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onNavigate?.(getWidgetDestination());
              }}
              className="mt-auto text-xs font-bold text-blue-600 hover:underline text-left relative z-10 pt-4"
            >
              Gerenciar Detalhes
            </button>
            <div className="absolute -bottom-6 -right-6 text-slate-50 dark:text-slate-900/10 opacity-10 rotate-12">
              <Package size={120} />
            </div>
          </Card>

          {/* Goal tracker widget */}
          <Card 
            interactive={true}
            onClick={() => onNavigate?.('business_vision')}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-slate-800 dark:text-slate-200 font-bold text-sm mb-6">Progresso da Meta Trimestral</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    <span>Meta Executada</span>
                    <span className="text-emerald-500">42%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '42%' }}></div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    Você está no caminho! O módulo de inteligência estima conclusão desta meta em 72 dias baseado no ritmo atual.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-4 line-clamp-1">Atualizado a cada 24 horas</p>
          </Card>

          {/* Dynamic Table (Wide) */}
          <Card className="lg:col-span-4 overflow-hidden flex flex-col border-none shadow-md">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-center bg-white dark:bg-slate-900/60">
              <h3 className="text-slate-800 dark:text-slate-200 font-bold text-sm">{config.tableTitle}</h3>
              <button 
                onClick={() => onNavigate?.('vendas')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Ver completo
              </button>
            </div>
            <Table className="bg-white dark:bg-slate-900/30">
              <THead>
                <TR className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-850/50">
                  {config.tableHeaders.map((head) => (
                    <TH key={head} className="px-6 py-3">{head}</TH>
                  ))}
                </TR>
              </THead>
              <TBody>
                {config.tableRows.map((row, idx) => (
                  <TR key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <TD className="px-6 py-4 font-mono text-slate-400 uppercase font-bold text-[10px]">{row.id}</TD>
                    <TD className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{row.col1}</TD>
                    <TD className="px-6 py-4 text-slate-500">{row.col2}</TD>
                    <TD className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-350">{row.col3}</TD>
                    <TD className="px-6 py-4">
                      <Badge variant="success" className="text-[10px] font-black py-0.5 rounded-md uppercase">{row.col4}</Badge>
                    </TD>
                    <TD className="px-6 py-4 text-right font-black text-slate-900 dark:text-slate-100">{row.col5}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard padrão
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Visão geral do seu negócio em tempo real" 
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Hoje</Button>
            <Button variant="outline" size="sm">Últimos 7 dias</Button>
            <Button variant="secondary" size="sm">Baixar Relatório</Button>
          </div>
        }
      />

      {/* Dashboard Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
        {/* Stat Card 1 */}
        <StatCard 
          title="Faturamento Hoje" 
          value={formatCurrency(dashboardStats.todaySales)} 
          icon={TrendingUp}
          trend={{ value: 12, positive: true }}
          color="emerald"
          onClick={() => onNavigate?.('financeiro')}
        />

        {/* Stat Card 2 */}
        <StatCard 
          title="Vendas Realizadas" 
          value={dashboardStats.todayOrders} 
          icon={ShoppingCart}
          trend={{ value: 48, positive: true }} // Just using value as % for display
          color="blue"
          onClick={() => onNavigate?.('vendas')}
        />

        {/* Stat Card 3 */}
        <StatCard 
          title="Ticket Médio" 
          value={formatCurrency(dashboardStats.avgTicket)} 
          icon={Users}
          trend={{ value: 5, positive: false }}
          color="indigo"
          onClick={() => onNavigate?.('vendas')}
        />

        {/* Stat Card 4 */}
        <StatCard 
          title="Itens Estoque Baixo" 
          value={dashboardStats.lowStockItems} 
          icon={AlertCircle}
          color={dashboardStats.lowStockItems > 0 ? "red" : "indigo"}
          onClick={() => onNavigate?.('estoque')}
        />

        {/* Main Chart Card (Large) */}
        <Card 
          interactive={true}
          onClick={() => onNavigate?.('relatorios')}
          className="lg:col-span-2 lg:row-span-2 bg-slate-900 rounded-3xl p-6 flex flex-col border-none shadow-xl shadow-slate-200"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-white font-bold tracking-tight">Performance de Vendas</h3>
              <p className="text-slate-400 text-xs">Comparativo de vendas por dia</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-[10px] text-white uppercase font-bold tracking-wider">Vendas</span>
              </div>
            </div>
          </div>
          <div className="flex-1 h-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DASHBOARD_STATS.salesHistory}>
                <defs>
                  <linearGradient id="colorSalesDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis 
                  hide
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#64748b', fontSize: '9px', marginBottom: '4px' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSalesDark)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-6 px-2 text-[10px] text-slate-500 uppercase font-black tracking-widest">
            {DASHBOARD_STATS.salesHistory.map(d => <span key={d.date}>{d.date}</span>)}
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card 
          interactive={true}
          onClick={() => onNavigate?.('estoque')}
          className="p-6 flex flex-col justify-between overflow-hidden relative"
        >
          <div className="relative z-10">
            <h3 className="text-slate-800 font-bold text-sm mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              Estoque Crítico
            </h3>
            <div className="space-y-4">
              {products.filter(p => p.currentStock <= p.minStock).slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between group">
                  <span className="text-xs text-slate-600 font-medium group-hover:text-blue-600 transition-colors">{product.name}</span>
                  <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{product.currentStock} {product.unit}</span>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigate?.('estoque');
            }}
            className="mt-auto text-xs font-bold text-blue-600 hover:underline text-left relative z-10 pt-4"
          >
            Gerenciar estoque
          </button>
          <div className="absolute -bottom-6 -right-6 text-slate-50 opacity-10 rotate-12">
            <Package size={120} />
          </div>
        </Card>

        {/* Financial Summary */}
        <Card 
          interactive={true}
          onClick={() => onNavigate?.('financeiro')}
          className="p-6 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-slate-800 font-bold text-sm mb-6">Fluxo de Caixa</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  <span>A Receber</span>
                  <span className="text-emerald-500">{formatCurrency(DASHBOARD_STATS.receivables)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  <span>A Pagar</span>
                  <span className="text-red-500">{formatCurrency(DASHBOARD_STATS.payables)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-4 line-clamp-1">Projeção positiva para os próximos 30 dias</p>
        </Card>

        {/* Recent Sales Table (Wide) */}
        <Card className="lg:col-span-4 overflow-hidden flex flex-col border-none shadow-md">
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white">
            <h3 className="text-slate-800 font-bold text-sm">Últimas Vendas</h3>
            <button 
              onClick={() => onNavigate?.('vendas')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Ver relatório completo
            </button>
          </div>
          <Table className="bg-white">
            <THead>
              <TR className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <TH className="px-6">ID</TH>
                <TH className="px-6">Cliente</TH>
                <TH className="px-6">Data/Hora</TH>
                <TH className="px-6">Pagamento</TH>
                <TH className="px-6">Status</TH>
                <TH className="px-6 text-right">Total</TH>
              </TR>
            </THead>
            <TBody>
              {sales.map((sale) => (
                <TR key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <TD className="px-6 py-3 font-mono text-slate-400 uppercase font-bold text-[10px]">#{sale.id}</TD>
                  <TD className="px-6 py-3 font-bold text-slate-900">{sale.customerName}</TD>
                  <TD className="px-6 py-3 text-slate-500">{formatDate(sale.date)}</TD>
                  <TD className="px-6 py-3">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-[10px] font-bold uppercase">{sale.paymentMethod}</span>
                    </span>
                  </TD>
                  <TD className="px-6 py-3">
                    <Badge variant="success" className="text-[10px] font-black py-0.5 rounded-md uppercase">{sale.status}</Badge>
                  </TD>
                  <TD className="px-6 py-3 text-right font-black text-slate-900">{formatCurrency(sale.finalTotal)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
