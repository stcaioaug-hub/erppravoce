import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Target, Briefcase, Search, Trash2, Eye, 
  RefreshCw, SlidersHorizontal, Sparkles, X, ChevronRight, 
  CheckCircle2, Building2, User, Calendar, Activity, 
  Award, Shield, FileText, ArrowRight, BarChart3, HelpCircle 
} from 'lucide-react';
import { Card, Button } from '../components/ui';
import { fetchClientOnboardings, deleteClientOnboarding } from '../lib/clientOnboardingRepository';
import { ClientOnboarding } from '../types';

export const OnboardingInsights: React.FC = () => {
  const [responses, setResponses] = useState<ClientOnboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [selectedResponse, setSelectedResponse] = useState<ClientOnboarding | null>(null);

  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const data = await fetchClientOnboardings();
      setResponses(data);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar respostas de onboarding do Supabase.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir esta resposta?')) return;
    
    try {
      await deleteClientOnboarding(id);
      setResponses(prev => prev.filter(r => r.id !== id));
      if (selectedResponse?.id === id) {
        setSelectedResponse(null);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir resposta.');
    }
  };

  // Helper mappings
  const businessTypeMap: Record<string, { label: string; color: string }> = {
    varejo: { label: 'Varejo (Moda & Lojas)', color: 'bg-pink-500' },
    mercadinho: { label: 'Mercadinho & Mercearia', color: 'bg-amber-500' },
    restaurante: { label: 'Restaurante & Delivery', color: 'bg-red-500' },
    servicos: { label: 'Prestação de Serviços', color: 'bg-blue-500' },
    industria: { label: 'Indústria & Confecção', color: 'bg-purple-500' },
    distribuidora: { label: 'Distribuidora & Atacado', color: 'bg-teal-500' },
    beleza: { label: 'Salão & Estética', color: 'bg-cyan-500' },
    ecommerce: { label: 'E-commerce & Digital', color: 'bg-indigo-500' },
    outro: { label: 'Outro Negócio', color: 'bg-slate-500' },
  };

  const getBusinessTypeLabel = (type: string) => {
    return businessTypeMap[type]?.label || type || 'Não especificado';
  };

  const getBusinessTypeColor = (type: string) => {
    return businessTypeMap[type]?.color || 'bg-slate-400';
  };

  const experienceMap: Record<string, string> = {
    iniciante: 'Iniciante (Nunca usou sistemas)',
    intermediario: 'Intermediário (Usa planilhas/outros)',
    avancado: 'Avançado (Já domina ERPs)',
  };

  const getExperienceLabel = (exp: string) => {
    return experienceMap[exp] || exp || 'Não informado';
  };

  // Metrics computation
  const totalCount = responses.length;
  
  const getMostCommon = (field: keyof ClientOnboarding) => {
    if (responses.length === 0) return 'Nenhum';
    const counts: Record<string, number> = {};
    responses.forEach(r => {
      const val = String(r[field]);
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const mostCommonType = getMostCommon('businessType');
  const mostCommonGoal = getMostCommon('goal');

  const advancedCount = responses.filter(r => r.experience === 'avancado').length;
  const advancedPercentage = totalCount > 0 ? Math.round((advancedCount / totalCount) * 100) : 0;

  // Filtered List
  const filteredResponses = responses.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      r.clientName.toLowerCase().includes(term) || 
      r.companyName.toLowerCase().includes(term) ||
      getBusinessTypeLabel(r.businessType).toLowerCase().includes(term);
      
    const matchesFilter = typeFilter === 'todos' || r.businessType === typeFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Business Type stats for chart
  const typeCounts = responses.reduce<Record<string, number>>((acc, r) => {
    acc[r.businessType] = (acc[r.businessType] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = (Object.entries(typeCounts) as Array<[string, number]>)
    .map(([type, count]) => ({
      type,
      label: getBusinessTypeLabel(type),
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      color: getBusinessTypeColor(type)
    }))
    .sort((a, b) => b.count - a.count);

  // Goal stats
  const goalLabels: Record<string, string> = {
    faturamento: 'Aumentar faturamento',
    tempo: 'Economizar tempo',
    organizacao: 'Organizar a casa',
    expansao: 'Expandir o negócio',
    skipped: 'Sem meta definida'
  };

  const goalCounts = responses.reduce<Record<string, number>>((acc, r) => {
    acc[r.goal] = (acc[r.goal] || 0) + 1;
    return acc;
  }, {});

  const goalChartData = (Object.entries(goalCounts) as Array<[string, number]>)
    .map(([goal, count]) => ({
      goal,
      label: goalLabels[goal] || goal,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Experience stats
  const expCounts = responses.reduce<Record<string, number>>((acc, r) => {
    acc[r.experience] = (acc[r.experience] || 0) + 1;
    return acc;
  }, {});

  const expChartData = ['iniciante', 'intermediario', 'avancado'].map(level => ({
    level,
    label: experienceMap[level] ? level.charAt(0).toUpperCase() + level.slice(1) : level,
    count: expCounts[level] || 0,
    percentage: totalCount > 0 ? Math.round(((expCounts[level] || 0) / totalCount) * 100) : 0
  }));

  // Custom setup recommendations depending on choices
  const getStrategicRecommendations = (resp: ClientOnboarding) => {
    const modules: { title: string; desc: string; priority: string }[] = [];
    
    // Business Type recommendations
    if (resp.businessType === 'varejo' || resp.businessType === 'mercadinho') {
      modules.push({
        title: 'Módulo de Vendas & PDV',
        desc: 'Habilitar tela de PDV Simplificado (Frente de Caixa Rápida) com atalhos de teclado e leitor de código de barras.',
        priority: 'Crítica'
      });
      modules.push({
        title: 'Controle de Grade de Estoque',
        desc: 'Ativar variação de produtos por grade de cores e tamanhos para facilitar o controle de inventário.',
        priority: 'Alta'
      });
    } else if (resp.businessType === 'restaurante') {
      modules.push({
        title: 'Módulo de Mesa & Comandas',
        desc: 'Configurar gestão visual de mesas, controle de comandas individuais e painel de pedidos para a cozinha.',
        priority: 'Crítica'
      });
    } else if (resp.businessType === 'servicos' || resp.businessType === 'beleza') {
      modules.push({
        title: 'Gestão de Serviços & Ordens',
        desc: 'Ativar emissão de Ordens de Serviço (OS), comissão automática de profissionais e controle de agenda integrada.',
        priority: 'Crítica'
      });
    } else if (resp.businessType === 'distribuidora') {
      modules.push({
        title: 'Faturamento de Carga & Rotas',
        desc: 'Configurar controle de pedidos externos, roteirização de entregas e tabela de preços atacado/varejo.',
        priority: 'Crítica'
      });
    } else if (resp.businessType === 'ecommerce') {
      modules.push({
        title: 'Integrações de E-commerce',
        desc: 'Ativar sincronização automática de estoque e pedidos com marketplaces externos e ERP.',
        priority: 'Alta'
      });
    } else if (resp.businessType === 'industria') {
      modules.push({
        title: 'Ordem de Produção (PCP)',
        desc: 'Habilitar ficha técnica de produtos (BOM - Bill of Materials), controle de insumos e etapas produtivas.',
        priority: 'Crítica'
      });
    }

    // Need recommendations
    if (resp.need.includes('grade') || resp.need === 'estoque') {
      modules.push({
        title: 'Alerta de Estoque Mínimo',
        desc: 'Ativar disparos automáticos quando o nível de estoque atingir o limite mínimo cadastrado.',
        priority: 'Alta'
      });
    } else if (resp.need.includes('financeiro') || resp.need === 'financeiro_simples') {
      modules.push({
        title: 'Contas a Pagar/Receber & PIX',
        desc: 'Configurar conciliação bancária por OFX e geração automática de QR Code PIX para recebimentos.',
        priority: 'Alta'
      });
    }

    // Goal recommendations
    if (resp.goal === 'faturamento') {
      modules.push({
        title: 'Indicadores de Desempenho (KPIs)',
        desc: 'Fixar widgets de faturamento mensal e ranking de produtos mais vendidos no topo do Dashboard.',
        priority: 'Média'
      });
    } else if (resp.goal === 'tempo') {
      modules.push({
        title: 'Automatização de Cobrança',
        desc: 'Configurar notificações automáticas de vencimento para clientes inadimplentes via WhatsApp.',
        priority: 'Média'
      });
    }

    // Experience adjustments
    let uiProfile = '';
    if (resp.experience === 'iniciante') {
      uiProfile = 'Modo Interface Clean (esconde recursos secundários e ativa popups explicativos).';
    } else if (resp.experience === 'intermediario') {
      uiProfile = 'Modo Padrão (dashboard financeiro e barra de pesquisa rápida ativados).';
    } else {
      uiProfile = 'Modo Power-User (habilita atalhos avançados, exportações em CSV e customização completa do menu).';
    }

    return { modules, uiProfile };
  };

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Respostas do Onboarding
            <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Painel Admin
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm mt-1">
            Analise os perfis de clientes que preencheram o onboarding e configure o ERP ideal.
          </p>
        </div>
        
        <Button 
          onClick={() => loadData(true)} 
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider px-5 h-11 rounded-xl shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
        </Button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white dark:bg-slate-900 border-none shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total de Leads</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</h3>
            <p className="text-[10px] text-emerald-500 font-bold mt-0.5">↑ Completos no Supabase</p>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border-none shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Segmento Líder</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
              <Briefcase size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize truncate">
              {getBusinessTypeLabel(mostCommonType).split(' ')[0]}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Perfil mais cadastrado</p>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border-none shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Meta Dominante</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Target size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
              {goalLabels[mostCommonGoal] || mostCommonGoal}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Foco estratégico principal</p>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border-none shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Nível Avançado</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{advancedPercentage}%</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Já usaram outros sistemas</p>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Business Type Distribution */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" />
              Distribuição por Ramo Comercial
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Divisão dos clientes respondentes por categoria comercial.</p>
          </div>

          <div className="space-y-4">
            {typeChartData.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-bold">Nenhum dado cadastrado ainda.</div>
            ) : (
              typeChartData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      {item.label}
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      {item.count} {item.count === 1 ? 'resposta' : 'respostas'} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Goals and Experience */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target size={18} className="text-amber-500" />
              Metas Trimestrais & Nível Técnico
            </h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Expectativas e nível de familiaridade técnica.</p>
          </div>

          <div className="space-y-6">
            {/* Goals Sub-section */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Metas Principais</h4>
              <div className="space-y-2">
                {goalChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs font-bold">
                    <span className="w-32 truncate text-slate-500">{item.label}</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-slate-900 dark:text-white">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Sub-section */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Nível de Familiaridade</h4>
              <div className="grid grid-cols-3 gap-3">
                {expChartData.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-center space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.label}</span>
                    <p className="text-base font-black text-slate-900 dark:text-white">{item.percentage}%</p>
                    <p className="text-[9px] text-slate-400 font-bold">{item.count} {item.count === 1 ? 'user' : 'users'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Responses List Table */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-sm space-y-4">
        {/* Table controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Lista de Clientes Cadastrados</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Respostas de onboarding completadas recentemente.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar cliente, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 pl-9 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="todos">Todos Ramos</option>
                {Object.keys(businessTypeMap).map(type => (
                  <option key={type} value={type}>{businessTypeMap[type].label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Responses Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="p-4">Cliente / Empresa</th>
                <th className="p-4">Ramo Comercial</th>
                <th className="p-4">Necessidade</th>
                <th className="p-4">Familiaridade</th>
                <th className="p-4">Data</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="animate-spin text-blue-500" size={24} />
                      <span className="font-bold">Carregando dados do onboarding...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400 font-bold">
                    Nenhuma resposta de onboarding encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredResponses.map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => setSelectedResponse(item)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors duration-150"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-extrabold text-sm">{item.clientName || 'Cliente Convidado'}</span>
                        <span className="text-slate-400 text-[10px] font-bold mt-0.5">{item.companyName || 'Sem Empresa'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] text-white font-black uppercase tracking-wider ${getBusinessTypeColor(item.businessType)}`}>
                        {getBusinessTypeLabel(item.businessType).split(' ')[0]}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-700 dark:text-slate-300 font-bold line-clamp-1 max-w-[200px]">
                        {item.need === 'grade' ? 'Vendas por Grade' : item.need === 'comandas' ? 'Mesa & Comandas' : item.need === 'vendedores' ? 'Vendedores Externos' : item.need === 'agenda' ? 'Agenda & Horários' : item.need}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-500 dark:text-slate-400 capitalize">{item.experience}</span>
                    </td>
                    <td className="p-4 text-slate-400 text-[10px] font-black">
                      {item.createdAt.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          onClick={() => setSelectedResponse(item)}
                          variant="ghost" 
                          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button 
                          onClick={(e) => handleDelete(item.id, e)}
                          variant="ghost" 
                          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details Slide-over Panel */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/20 backdrop-blur-sm flex justify-end">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setSelectedResponse(null)} />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Activity size={10} className="text-blue-500 animate-pulse" />
                  Detalhes do Onboarding
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedResponse.clientName || 'Cliente Convidado'}
                </h2>
              </div>
              <Button 
                onClick={() => setSelectedResponse(null)}
                variant="ghost" 
                className="h-9 w-9 p-0 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black">
                    {selectedResponse.clientName ? selectedResponse.clientName.charAt(0) : 'C'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white">{selectedResponse.companyName || 'Empresa não informada'}</h4>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Calendar size={10} />
                      Preenchido em {selectedResponse.createdAt.toLocaleDateString('pt-BR')} às {selectedResponse.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Answers Breakdown */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Perguntas & Respostas</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">1. Ramo Comercial</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                      {getBusinessTypeLabel(selectedResponse.businessType)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">2. Maior Dor / Necessidade</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                      {selectedResponse.need === 'grade' ? 'Visualizar e vender por grade de cores/tamanho' : selectedResponse.need === 'comandas' ? 'Mesa & Comandas rápidas' : selectedResponse.need === 'vendedores' ? 'Venda externa com catálogo de vendedores' : selectedResponse.need === 'agenda' ? 'Gestão de horários de atendimento' : selectedResponse.need}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">3. Processo Operacional</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                      {selectedResponse.process === 'revenda_simples' ? 'Revenda simples (Compra pronto e revende)' : selectedResponse.process === 'pedido_cozinha' ? 'Pedido cozinha (Prepara na hora sob demanda)' : selectedResponse.process === 'pedido_separo' ? 'Separação física (Vende, separa em estoque e despacha)' : selectedResponse.process === 'agenda_executa' ? 'Agendamento prévio com prestação de serviço local' : selectedResponse.process}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">4. Familiaridade Técnica</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                      {getExperienceLabel(selectedResponse.experience)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">5. Objetivo Trimestral</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                      {goalLabels[selectedResponse.goal] || selectedResponse.goal}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommended Setup (Strategic Recommendation) */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-900 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-500 text-white">
                    <Sparkles size={14} />
                  </div>
                  <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Setup Estratégico Recomendado</h3>
                </div>

                <div className="space-y-3">
                  {/* UI Mode */}
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-1">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Perfil de Interface Recomendado</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{getStrategicRecommendations(selectedResponse).uiProfile}</p>
                  </div>

                  {/* Modules suggestions */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Funcionalidades Sugeridas</span>
                    
                    {getStrategicRecommendations(selectedResponse).modules.map((mod, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">{mod.title}</h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">{mod.desc}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          mod.priority === 'Crítica' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {mod.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
              <Button 
                onClick={() => setSelectedResponse(null)}
                variant="outline"
                className="flex-1 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest text-xs h-11 rounded-xl"
              >
                Voltar
              </Button>
              <Button 
                onClick={(e) => {
                  setSelectedResponse(null);
                  alert(`ERP configurado com sucesso para ${selectedResponse.companyName}!`);
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs h-11 rounded-xl shadow-md shadow-emerald-500/10"
              >
                Ativar Customização
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
