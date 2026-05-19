/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  Calculator,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Flag,
  Landmark,
  LineChart as LineChartIcon,
  ListChecks,
  Megaphone,
  PackageCheck,
  PieChart,
  Rocket,
  Scale,
  Store,
  Target,
  Users,
  Wallet,
  Printer,
  Maximize2,
  Minimize2,
  Sparkles,
  Sliders,
  Download,
  TrendingUp,
  FileSpreadsheet,
  Minus,
  Plus,
  HelpCircle,
  Info,
  Trash2,
  Edit2,
  Check,
  X,
  CheckSquare,
  Square,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Badge, Button, Card, Input, PageHeader, StatCard, Table, TBody, TD, TH, THead, TR, Modal } from '../components/ui';
import { formatCurrency, cn } from '../lib/utils';
import {
  fetchBusinessPlanSections,
  saveBusinessPlanSection,
  fetchNextSteps,
  addNextStep as repoAddNextStep,
  updateNextStep as repoUpdateNextStep,
  deleteNextStep as repoDeleteNextStep,
  fetchBusinessSimulations,
  saveBusinessSimulation,
  fetchBusinessFunnel,
  saveBusinessFunnel,
} from '../lib/businessVisionRepository';
import { NextStep } from '../types';
import {
  businessPlan,
  implementationPhases,
  infrastructureCosts,
  overviewKpis,
  partners,
  pricingPlans,
  productModules,
  revenueEvolution,
  salesFunnelSteps,
  scenarioPresets,
  swot,
} from '../data/businessVisionMock';

type ScenarioName = keyof typeof scenarioPresets;
type CostScenario = 'lean' | 'professional' | 'scalable';

const tabs = [
  { id: 'presentation', label: 'Apresentação Imersiva', icon: Sparkles },
  { id: 'overview', label: 'Visão Geral', icon: PieChart },
  { id: 'business-plan', label: 'Plano de Negócio', icon: BriefcaseBusiness },
  { id: 'product', label: 'Produto/App', icon: PackageCheck },
  { id: 'funnel', label: 'Funil de Vendas', icon: Target },
  { id: 'implementation', label: 'Implementação', icon: Rocket },
  { id: 'costs', label: 'Gastos e Infraestrutura', icon: Wallet },
  { id: 'finance', label: 'Projeção Financeira', icon: LineChartIcon },
  { id: 'progressive', label: 'Investimento Progressivo', icon: Flag },
  { id: 'market', label: 'Mercado', icon: Store },
  { id: 'taxes', label: 'Tributação', icon: Scale },
  { id: 'partners', label: 'Sociedade', icon: Users },
  { id: 'simulator', label: 'Simulador', icon: Calculator },
  { id: 'sales-page', label: 'Página de Vendas', icon: Megaphone },
  { id: 'studies', label: 'Estudos do Negócio', icon: FileText },
];

const scenarioLabels: Record<CostScenario, string> = {
  lean: 'Enxuto',
  professional: 'Profissional',
  scalable: 'Escalável',
};

const badgeVariant = (value: string) => {
  if (['Atual', 'Em uso', 'Alta'].includes(value)) return 'success';
  if (['Próximo', 'Parcial', 'Média'].includes(value)) return 'warning';
  if (['Futuro', 'Planejado'].includes(value)) return 'info';
  return 'default';
};

const percent = (value: number) => value / 100;

const safeBreakEven = (fixedCost: number, ticket: number, variableCost: number) => {
  const margin = ticket - variableCost;
  return margin > 0 ? Math.ceil(fixedCost / margin) : 0;
};

const financialProjection = (
  clients: number,
  ticket: number,
  fixedCost: number,
  variableCost: number,
  initialInvestment: number,
  tax: number,
) => {
  const mrr = clients * ticket;
  const arr = mrr * 12;
  const variableTotal = clients * variableCost;
  const taxes = mrr * percent(tax);
  const profit = mrr - fixedCost - variableTotal - taxes;
  const breakEven = safeBreakEven(fixedCost, ticket, variableCost);
  const payback = profit > 0 ? initialInvestment / profit : 0;
  const margin = mrr > 0 ? (profit / mrr) * 100 : 0;

  return { mrr, arr, variableTotal, taxes, profit, breakEven, payback, margin };
};

const metricDefinitions: Record<string, { meaning: string; tooltip: string }> = {
  'MRR': {
    meaning: 'Receita Recorrente Mensal',
    tooltip: 'O faturamento mensal garantido pelas assinaturas ativas dos seus clientes. É a principal métrica de previsibilidade e valorização de um negócio SaaS/ERP.',
  },
  'ARR': {
    meaning: 'Receita Recorrente Anual',
    tooltip: 'A projeção anualizada do seu MRR atual (MRR multiplicado por 12 meses). Mostra o potencial de faturamento do negócio no ano inteiro.',
  },
  'Custo variável total': {
    meaning: 'Custos diretos da operação',
    tooltip: 'Soma dos custos que aumentam diretamente a cada novo cliente atendido (ex: servidores, emissão de notas, atendimento direto, comissões).',
  },
  'Lucro estimado': {
    meaning: 'Ganho líquido mensal',
    tooltip: 'O valor que sobra limpo em caixa todos os meses após pagar os custos fixos, os custos variáveis totais e os impostos calculados.',
  },
  'Break-even': {
    meaning: 'Ponto de equilíbrio',
    tooltip: 'O número exato de clientes pagantes necessários para que as receitas empatem com todos os custos fixos e variáveis, saindo do prejuízo.',
  },
  'Payback': {
    meaning: 'Retorno do investimento',
    tooltip: 'O tempo estimado (em meses) para que o lucro líquido acumulado pague integralmente o investimento inicial colocado no negócio.',
  },
  'Margem': {
    meaning: 'Margem de lucro líquida',
    tooltip: 'A porcentagem da receita total que efetivamente se converte em lucro limpo para a empresa após todas as deduções operacionais e fiscais.',
  },
  'Clientes p/ custos': {
    meaning: 'Cobertura de custo fixo',
    tooltip: 'Quantidade mínima de clientes necessária para pagar exclusivamente a estrutura fixa mensal da empresa (sem contar o investimento inicial).',
  },
  'Reuniões estimadas': {
    meaning: 'Agendamentos de vendas',
    tooltip: 'Projeção de reuniões comerciais geradas a partir da lista de leads iniciais, aplicando a taxa de conversão configurada no funil.',
  },
  'Testes estimados': {
    meaning: 'Período de trial/teste',
    tooltip: 'Potenciais clientes que aceitam testar o sistema na prática após a reunião de apresentação comercial.',
  },
  'Clientes pagos': {
    meaning: 'Assinantes ativos',
    tooltip: 'Total de clientes que concluíram o período de teste e pagam a mensalidade recorrente do ERP Pra Você.',
  },
  'Próxima meta': {
    meaning: 'Objetivo de tração',
    tooltip: 'O próximo marco estratégico focado na validação comercial e no crescimento sustentável da base de clientes.',
  },
  'Clientes': {
    meaning: 'Meta da base',
    tooltip: 'Número de clientes ativos planejados ou simulados para esta etapa do projeto.',
  },
  'Stack': {
    meaning: 'Tecnologia utilizada',
    tooltip: 'Conjunto de ferramentas, infraestrutura e arquitetura recomendadas para suportar o momento atual do negócio.',
  },
  'Marco de decisão': {
    meaning: 'Critério de avanço',
    tooltip: 'O gatilho ou resultado chave necessário para justificar e liberar o investimento na próxima fase do projeto.',
  },
  'Risco principal': {
    meaning: 'Ponto de atenção',
    tooltip: 'O maior desafio, gargalo operacional ou risco comercial previsto para esta etapa de implementação.',
  },
  'Imposto estimado': {
    meaning: 'Previsão tributária',
    tooltip: 'Cálculo aproximado dos impostos devidos com base na alíquota informada sobre o faturamento mensal.',
  },
  'Pró-labore': {
    meaning: 'Remuneração dos sócios',
    tooltip: 'Valor mensal fixo retirado pelos sócios pelo trabalho de gestão e operação diária na empresa.',
  },
  'Resultado após custos': {
    meaning: 'Saldo líquido fiscal',
    tooltip: 'O valor restante em caixa após deduzir a estimativa de impostos, o pró-labore dos sócios e os custos operacionais informados.',
  },
  'Área principal': {
    meaning: 'Foco de atuação',
    tooltip: 'Setor ou departamento sob responsabilidade direta e liderança deste sócio no dia a dia da empresa.',
  },
  'Observações': {
    meaning: 'Notas societárias',
    tooltip: 'Condições, acordos de dedicação ou observações específicas sobre a participação e o papel do sócio.',
  },
};

const NumberField = ({
  label,
  value,
  onChange,
  suffix,
  step = 1,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
}) => {
  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    onChange(value + step);
  };

  return (
    <div className="block bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 transition-all hover:border-slate-200 dark:hover:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        {suffix && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
            {suffix}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all shadow-sm"
          title={`Diminuir ${step}`}
        >
          <Minus size={18} className="stroke-[2.5]" />
        </button>
        <div className="relative flex-1">
          <Input
            type="number"
            value={value}
            onChange={(event) => onChange(Math.max(min, Number(event.target.value)))}
            className="h-10 text-center font-bold text-base rounded-xl pr-3 pl-3 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]"
          />
        </div>
        <button
          type="button"
          onClick={handleIncrement}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all shadow-sm"
          title={`Aumentar ${step}`}
        >
          <Plus size={18} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

const SliderField = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  suffix = '',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) => (
  <div className="block space-y-2">
    <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
      <span>{label}</span>
      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{value}{suffix}</span>
    </div>
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 h-9 text-center rounded-lg text-xs font-bold"
      />
    </div>
  </div>
);

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div>
    <h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2>
    {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
  </div>
);

const MetricCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => {
  const def = metricDefinitions[label] || {
    meaning: 'Indicador estratégico',
    tooltip: 'Métrica ou valor chave utilizado nas simulações e acompanhamento de metas do ERP Pra Você.',
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-4.5 transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 group flex flex-col justify-between hover:z-50">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {label}
          </p>
          <div className="relative flex items-center">
            <HelpCircle size={15} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors cursor-help" />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3.5 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-slate-700/80">
              <p className="font-bold text-blue-400 mb-1 text-[13px]">{label} • {def.meaning}</p>
              <p className="text-slate-200 leading-relaxed font-normal">{def.tooltip}</p>
              {/* Seta do tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
            </div>
          </div>
        </div>

        {/* Significado / Subtítulo */}
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
          {def.meaning}
        </p>
      </div>

      <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        {value}
      </p>
    </div>
  );
};

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="p-5">
    <h3 className="font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
    <div className="h-72">{children}</div>
  </Card>
);

const CompactMetricCard: React.FC<{ label: string; value: string | number; icon?: any; color?: 'emerald' | 'blue' | 'indigo' | 'amber' | 'violet' | 'rose' }> = ({ label, value, icon: Icon, color = 'blue' }) => {
  const def = metricDefinitions[label] || {
    meaning: 'Indicador estratégico',
    tooltip: 'Métrica ou valor chave utilizado nas simulações e acompanhamento de metas do ERP Pra Você.',
  };

  const colorStyles = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:border-emerald-500/40',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:border-blue-500/40',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:border-indigo-500/40',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:border-amber-500/40',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400 group-hover:border-violet-500/40',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 group-hover:border-rose-500/40',
  }[color];

  return (
    <div className="relative bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group flex flex-col justify-between hover:z-50">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border transition-colors", colorStyles)}>
                <Icon size={14} />
              </div>
            )}
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
              {label}
            </p>
          </div>
          <div className="relative flex items-center shrink-0">
            <HelpCircle size={14} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors cursor-help" />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-slate-700/80">
              <p className="font-bold text-blue-400 mb-1 text-[13px]">{label} • {def.meaning}</p>
              <p className="text-slate-200 leading-relaxed font-normal">{def.tooltip}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
            </div>
          </div>
        </div>

        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 line-clamp-1">
          {def.meaning}
        </p>
      </div>

      <p className="mt-2.5 text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
        {value}
      </p>
    </div>
  );
};

const wizardSuggestions: Record<string, { explanation: string; suggestions: string[] }> = {
  'Problema': {
    explanation: 'Qual é a dor real, ineficiência ou perda financeira que seu público enfrenta diariamente? Um problema claro e doloroso é o verdadeiro motor de vendas do seu produto.',
    suggestions: [
      'Pequenos comerciantes perdem dinheiro e tempo controlando estoque e caixa em planilhas manuais ou cadernos de papel.',
      'Sistemas tradicionais são caros, lentos e exigem treinamento complexo para funcionários do varejo local.',
      'Falta de clareza financeira e relatórios confusos impedem o dono do negócio de saber se está tendo lucro ou prejuízo real.'
    ]
  },
  'Solução': {
    explanation: 'Como o seu produto resolve o problema de forma direta e elegante? Explique o que o sistema faz sem usar jargões técnicos excessivos.',
    suggestions: [
      'Um ERP simples, acessível e assistido para centralizar toda a operação comercial em uma experiência rápida e intuitiva.',
      'Plataforma de gestão integrada com PDV ágil, controle automático de estoque e fluxo de caixa visual em tempo real.',
      'Sistema em nuvem focado em usabilidade móvel, permitindo que o comerciante gerencie sua loja de qualquer lugar.'
    ]
  },
  'Público-alvo': {
    explanation: 'Quem é o cliente ideal que vai comprar seu sistema hoje? Seja específico sobre o nicho, porte e momento de maturidade da empresa.',
    suggestions: [
      'Mercadinhos, lojas de roupas, prestadores de serviços locais e comércios familiares em fase de profissionalização.',
      'Micro e pequenas empresas do varejo que faturam até R$ 100k/mês e buscam substituir processos manuais.',
      'Empreendedores locais e distribuidores regionais que precisam de agilidade no balcão e controle de crediário/fiado.'
    ]
  },
  'Proposta de valor': {
    explanation: 'Qual é o grande benefício ou transformação que o cliente ganha ao usar seu sistema? Focar no ganho de tempo, redução de custos ou paz mental.',
    suggestions: [
      'Menos retrabalho operacional, clareza absoluta de caixa, estoque sempre confiável e decisões rápidas no dia a dia.',
      'Economia de até 10 horas semanais no fechamento de caixa e eliminação total de perdas por produtos vencidos ou furtados.',
      'Paz mental para o dono do comércio, que passa a ter controle total do negócio na palma da mão com dados precisos.'
    ]
  },
  'Diferenciais': {
    explanation: 'Por que o cliente escolheria o ERP Pra Você em vez da concorrência? O que torna seu atendimento ou tecnologia únicos no mercado?',
    suggestions: [
      'Implantação próxima e assistida, linguagem simples sem termos contábeis complexos e precificação progressiva justa.',
      'Suporte humanizado via WhatsApp com resposta rápida e interface desenhada especificamente para telas de toque e celulares.',
      'Evolução contínua baseada no feedback direto dos clientes fundadores, moldando o sistema para a realidade do comércio local.'
    ]
  },
  'Modelo de receita': {
    explanation: 'Como a sua empresa ganha dinheiro? Descreva os planos de assinatura, taxas de adesão ou serviços adicionais cobrados.',
    suggestions: [
      'Assinatura mensal recorrente (SaaS) dividida em planos acessíveis, com opção de taxa de implantação assistida premium.',
      'Cobrança por faixas de faturamento ou número de usuários, incentivando o crescimento conjunto com o cliente.',
      'Planos anuais com desconto para garantir previsibilidade de caixa (ARR) e fidelização de longo prazo da base.'
    ]
  },
  'Estratégia inicial': {
    explanation: 'Como você vai conquistar os primeiros 10 a 25 clientes pagantes? Focar em canais de tração diretos e validação rápida.',
    suggestions: [
      'Abordagem direta de comércios na região, fechamento de clientes fundadores com desconto vitalício e indicação boca a boca.',
      'Parcerias estratégicas com contadores locais que indicam o sistema para seus clientes em troca de facilidade na exportação fiscal.',
      'Campanhas segmentadas em redes sociais focadas em dores específicas do varejo local e demonstrações rápidas de 15 minutos.'
    ]
  },
  'Riscos': {
    explanation: 'Quais são os principais obstáculos ou ameaças ao sucesso do negócio e como você pretende mitigá-los?',
    suggestions: [
      'Baixa disposição de pagamento inicial do comerciante tradicional; mitigado por demonstrações claras de ROI e economia de tempo.',
      'Custo elevado de suporte em clientes com baixa literacia digital; mitigado por um onboarding em vídeo muito didático e simplificado.',
      'Concorrência agressiva de sistemas gratuitos ou de grandes players; mitigado pelo foco absoluto no relacionamento e proximidade local.'
    ]
  },
  'Próximos passos': {
    explanation: 'Quais são as ações imediatas e prioritárias para as próximas semanas? O que precisa ser feito para avançar para a próxima fase?',
    suggestions: [
      'Validar o sistema com 10 comerciantes locais, fechar os primeiros pilotos pagos e medir a frequência de uso semanal do PDV.',
      'Aperfeiçoar o módulo de relatórios com base no feedback inicial e estruturar o processo de vendas escalável.',
      'Contratar o primeiro estagiário de suporte/sucesso do cliente para liberar os sócios para focar em produto e prospecção ativa.'
    ]
  }
};

export const BusinessVision = () => {
  const [activeTab, setActiveTab] = useState('presentation');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [businessPlanItems, setBusinessPlanItems] = useState(businessPlan);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [presentationStep, setPresentationStep] = useState(0);

  const updateWizardItemBody = async (text: string) => {
    setBusinessPlanItems(prev => prev.map((item, index) => index === wizardStep ? { ...item, body: text } : item));
    const title = businessPlanItems[wizardStep]?.title;
    if (title) {
       try {
         await saveBusinessPlanSection(title, text);
       } catch (err) {
         console.error("Error saving business plan section:", err);
       }
    }
  };
  const [costScenario, setCostScenario] = useState<CostScenario>('professional');
  const [funnel, setFunnel] = useState({ leads: 80, meeting: 35, trial: 55, paid: 45, ticket: 197 });
  const [finance, setFinance] = useState({
    clients: 25,
    ticket: 197,
    fixedCost: 3000,
    variableCost: 18,
    initialInvestment: 6000,
    tax: 8,
    churn: 3,
    growth: 8,
  });
  const [taxes, setTaxes] = useState({ revenue: 4925, taxRate: 8, proLabore: 1500, costs: 3000 });
  const [shares, setShares] = useState(partners.map((partner) => partner.share));
  const [reinvested, setReinvested] = useState(40);
  const [scenarioName, setScenarioName] = useState<ScenarioName>('Realista');
  const [scenario, setScenario] = useState(scenarioPresets.Realista);

  // Next Steps State
  const [nextSteps, setNextSteps] = useState<NextStep[]>([]);
  const [newStepText, setNewStepText] = useState('');
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStepText, setEditingStepText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);
  const [isDeletingStep, setIsDeletingStep] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedPlan, loadedNextSteps, loadedSims, loadedFunnel] = await Promise.all([
          fetchBusinessPlanSections(),
          fetchNextSteps(),
          fetchBusinessSimulations(),
          fetchBusinessFunnel(),
        ]);
        
        if (loadedPlan.length > 0) {
           setBusinessPlanItems(prev => prev.map(item => {
              const loaded = loadedPlan.find(p => p.title === item.title);
              return loaded ? { ...item, body: loaded.body } : item;
           }));
        }

        if (loadedNextSteps.length > 0) {
          setNextSteps(loadedNextSteps);
        } else {
          // Fallback if empty database
          setNextSteps([
            { id: '1', companyId: '', text: 'Encontrar 2 clientes para fase de testes sem compromisso', completed: false, order: 0 },
            { id: '2', companyId: '', text: 'Validar o fluxo de caixa e emissão simples com o primeiro cliente piloto', completed: false, order: 1 },
            { id: '3', companyId: '', text: 'Coletar feedback sobre usabilidade do PDV e ajustar a interface', completed: false, order: 2 },
            { id: '4', companyId: '', text: 'Estruturar o modelo de contrato de adesão simplificado', completed: false, order: 3 },
          ]);
        }
        
        if (loadedFunnel) {
           setFunnel({
             leads: loadedFunnel.leads,
             meeting: loadedFunnel.meetingConversion,
             trial: loadedFunnel.trialConversion,
             paid: loadedFunnel.paidConversion,
             ticket: loadedFunnel.ticket
           });
        }

        const realismSim = loadedSims.find(s => s.scenarioName === 'Realista');
        if (realismSim) {
           const simData = {
             clients: realismSim.clients,
             ticket: realismSim.ticket,
             fixedCost: realismSim.fixedCost,
             variableCost: realismSim.variableCost,
             initialInvestment: realismSim.initialInvestment,
             growth: realismSim.growthRate,
             churn: realismSim.churnRate,
             tax: realismSim.taxRate,
           };
           setScenario(simData);
           // Também sincronizar a simulação geral baseada na Realista se for a primeira vez
           setFinance(simData);
        }

      } catch (err) {
        console.error("Error loading business vision data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const addNextStep = async () => {
    if (!newStepText.trim()) return;
    try {
      const added = await repoAddNextStep(newStepText.trim());
      setNextSteps([...nextSteps, added]);
      setNewStepText('');
    } catch (err) {
      console.error(err);
      // Fallback local caso dê erro de supabase config
      setNextSteps([...nextSteps, { id: Date.now().toString(), companyId: '', text: newStepText.trim(), completed: false, order: 0 }]);
      setNewStepText('');
    }
  };

  const toggleNextStep = async (id: string) => {
    const step = nextSteps.find(s => s.id === id);
    if (!step) return;
    try {
      if (id.length > 5) await repoUpdateNextStep(id, { completed: !step.completed });
      setNextSteps(nextSteps.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    } catch (err) {
      console.error(err);
      setNextSteps(nextSteps.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    }
  };

  const deleteNextStep = (id: string) => {
    setStepToDelete(id);
  };

  const handleConfirmDeleteStep = async () => {
    if (!stepToDelete) return;
    setIsDeletingStep(true);
    try {
      if (stepToDelete.length > 5) await repoDeleteNextStep(stepToDelete);
      setNextSteps(nextSteps.filter(step => step.id !== stepToDelete));
      setStepToDelete(null);
    } catch (err) {
      console.error(err);
      setNextSteps(nextSteps.filter(step => step.id !== stepToDelete));
      setStepToDelete(null);
    } finally {
      setIsDeletingStep(false);
    }
  };

  const startEditNextStep = (step: NextStep) => {
    setEditingStepId(step.id);
    setEditingStepText(step.text);
  };

  const saveEditNextStep = async (id: string) => {
    if (!editingStepText.trim()) return;
    try {
      if (id.length > 5) await repoUpdateNextStep(id, { text: editingStepText.trim() });
      setNextSteps(nextSteps.map(step => step.id === id ? { ...step, text: editingStepText.trim() } : step));
      setEditingStepId(null);
      setEditingStepText('');
    } catch (err) {
      console.error(err);
      setNextSteps(nextSteps.map(step => step.id === id ? { ...step, text: editingStepText.trim() } : step));
      setEditingStepId(null);
      setEditingStepText('');
    }
  };

  const cancelEditNextStep = () => {
    setEditingStepId(null);
    setEditingStepText('');
  };

  const costTotal = useMemo(
    () => infrastructureCosts.reduce((total, item) => total + item[costScenario], 0),
    [costScenario],
  );

  const funnelResults = useMemo(() => {
    const meetings = funnel.leads * percent(funnel.meeting);
    const trials = meetings * percent(funnel.trial);
    const paidClients = trials * percent(funnel.paid);
    const mrr = paidClients * funnel.ticket;
    return {
      meetings: Math.round(meetings),
      trials: Math.round(trials),
      clients: Math.round(paidClients),
      mrr,
      arr: mrr * 12,
    };
  }, [funnel]);

  const financeResults = useMemo(
    () => financialProjection(finance.clients, finance.ticket, finance.fixedCost, finance.variableCost, finance.initialInvestment, finance.tax),
    [finance],
  );

  const scenarioResults = useMemo(
    () => financialProjection(
      scenario.clients,
      scenario.ticket,
      scenario.fixedCost,
      scenario.variableCost,
      scenario.initialInvestment,
      scenario.tax,
    ),
    [scenario],
  );

  const taxResults = useMemo(() => {
    const estimatedTax = taxes.revenue * percent(taxes.taxRate);
    const net = taxes.revenue - estimatedTax - taxes.proLabore - taxes.costs;
    return { estimatedTax, net };
  }, [taxes]);

  const distributionBase = Math.max(scenarioResults.profit, 0) * (1 - percent(reinvested));

  const projectionData = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const clients = Math.max(0, Math.round(finance.clients * Math.pow(1 + percent(finance.growth - finance.churn), index)));
      const result = financialProjection(clients, finance.ticket, finance.fixedCost, finance.variableCost, finance.initialInvestment, finance.tax);
      return { month: `M${month}`, clientes: clients, receita: result.mrr, lucro: result.profit };
    });
  }, [finance]);

  const progressiveData = implementationPhases.map((phase, index) => ({
    phase: phase.phase,
    mensal: phase.monthlyCostValue,
    acumulado: implementationPhases.slice(0, index + 1).reduce((total, item) => total + item.monthlyCostValue, 0),
  }));

  const updateScenario = async (name: ScenarioName) => {
    setScenarioName(name);
    setScenario(scenarioPresets[name]);
    try {
      await saveBusinessSimulation(name, {
        clients: scenarioPresets[name].clients,
        ticket: scenarioPresets[name].ticket,
        fixedCost: scenarioPresets[name].fixedCost,
        variableCost: scenarioPresets[name].variableCost,
        initialInvestment: scenarioPresets[name].initialInvestment,
        taxRate: scenarioPresets[name].tax,
        churnRate: scenarioPresets[name].churn,
        growthRate: scenarioPresets[name].growth,
        isActive: true
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Add auto-save for funnel changes with debounce (using simple effect)
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load
    const timer = setTimeout(() => {
       saveBusinessFunnel({
         leads: funnel.leads,
         meetingConversion: funnel.meeting,
         trialConversion: funnel.trial,
         paidConversion: funnel.paid,
         ticket: funnel.ticket
       }).catch(console.error);
    }, 1500);
    return () => clearTimeout(timer);
  }, [funnel, isLoading]);

  // Add auto-save for finance/scenario changes
  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
       saveBusinessSimulation('Personalizado', {
         clients: finance.clients,
         ticket: finance.ticket,
         fixedCost: finance.fixedCost,
         variableCost: finance.variableCost,
         initialInvestment: finance.initialInvestment,
         taxRate: finance.tax,
         churnRate: finance.churn,
         growthRate: finance.growth,
         isActive: true
       }).catch(console.error);
    }, 1500);
    return () => clearTimeout(timer);
  }, [finance, isLoading]);

  const renderSalesPage = (inFullscreen = false) => (
    <div className="space-y-6">
      {!inFullscreen && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Sparkles className="text-blue-600 dark:text-blue-400" size={24} />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Modo Apresentação Impecável</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">Visualize a página de vendas exatamente como seu cliente final verá, sem os menus do ERP.</p>
            </div>
          </div>
          <Button variant="primary" onClick={() => setIsFullscreen(true)}>
            <Maximize2 size={16} className="mr-2" /> Pré-visualizar em Tela Cheia
          </Button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="bg-slate-900 px-6 py-12 lg:px-12 text-white">
          <Badge variant="blue" className="mb-5">ERP Pra Você</Badge>
          <h2 className="max-w-3xl text-3xl lg:text-5xl font-black tracking-tight">Controle seu comércio de forma simples, rápida e sem complicação.</h2>
          <p className="max-w-2xl mt-5 text-slate-300 leading-7">
            O ERP Pra Você ajuda pequenos e médios comerciantes a controlar estoque, vendas, clientes e financeiro em um só lugar.
          </p>
          <Button className="mt-7" size="lg" onClick={() => { if(inFullscreen) setIsFullscreen(false); setActiveTab('overview'); }}>Quero conhecer</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[
          ['Dores do cliente', 'Estoque desatualizado, caixa confuso, falta de histórico e decisões no escuro.'],
          ['Solução', 'Um ERP direto, com módulos essenciais e implantação próxima.'],
          ['Benefícios', 'Mais controle, menos perda, vendas organizadas e financeiro visível.'],
          ['Como funciona', 'Cadastro, configuração, treinamento rápido, acompanhamento e evolução por feedback.'],
          ['CTA final', 'Comece como cliente fundador e ajude a moldar o produto.'],
        ].map(([title, body]) => (
          <Card key={title} className="p-5">
            <h3 className="font-black text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className="p-5">
            <h3 className="font-black text-slate-900 dark:text-white">{plan.name}</h3>
            <p className="mt-3 text-2xl font-black text-blue-600 dark:text-blue-400">{plan.price}</p>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{plan.focus}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="print:hidden flex flex-col min-w-0 w-full">
      {isFullscreen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
          <div className="fixed top-6 right-6 z-[60] flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-all cursor-pointer border border-slate-700 dark:border-slate-200 font-bold text-sm" onClick={() => setIsFullscreen(false)}>
            <Minimize2 size={18} />
            <span>Sair da Tela Cheia</span>
          </div>
          <div className="max-w-7xl mx-auto p-4 lg:p-12 space-y-8 mt-12">
            {renderSalesPage(true)}
          </div>
        </div>,
        document.body
      )}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm min-w-0 w-full">
        {/* Desktop Tabs */}
        <div className="hidden lg:flex gap-6 overflow-x-auto custom-scrollbar px-4 lg:px-8 min-w-0 w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  active 
                    ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Icon size={16} className={cn(active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400")} />
                {tab.label}
              </button>
            );
          })}
        </div>
        {/* Mobile Dropdown Navigation */}
        <div className="lg:hidden p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">Página:</span>
          <select 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 lg:p-8 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Visão do meu Negócio</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Painel estratégico para acompanhar, simular e estruturar o crescimento do ERP Pra Você.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="success" onClick={() => setIsReportModalOpen(true)}>
              <Printer size={16} className="mr-2" /> Gerar Relatório Estratégico
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {activeTab === 'presentation' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-blue-500/20">
                  <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                    <Sparkles size={300} />
                  </div>
                  <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide uppercase">
                      <Sparkles size={14} className="animate-spin" /> Apresentação Executiva em Tela Cheia
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                      Visão Geral Imersiva do Negócio
                    </h2>
                    <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
                      Apresente ou explore a estratégia completa do ERP Pra Você em uma experiência guiada, passo a passo e sem distrações. Ideal para reuniões com sócios, investidores ou para alinhamento estratégico da operação.
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => { setPresentationStep(0); setIsPresentationOpen(true); }}
                        className="py-4 px-8 font-black text-lg shadow-xl shadow-blue-500/30 animate-pulse bg-blue-600 hover:bg-blue-500 text-white"
                      >
                        <Sparkles size={20} className="mr-3" /> Iniciar Apresentação Imersiva
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setActiveTab('overview')}
                        className="py-4 px-8 font-bold text-lg border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        Ver Dados em Painel
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
                      <Target size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Estrutura e Custos</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Visão transparente do investimento inicial, custos fixos e variáveis necessários para manter a operação saudável.
                    </p>
                  </Card>

                  <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                      <TrendingUp size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Metas e Break-even</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Análise do ponto de equilíbrio e o faturamento recorrente (MRR/ARR) projetado para o crescimento.
                    </p>
                  </Card>

                  <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 mb-4">
                      <Calculator size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Payback e Valor Final</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      O tempo exato de retorno do investimento e o impacto de valor gerado para o cliente final.
                    </p>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400 shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Relatório Executivo Consolidado</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">Gere um documento completo com projeções, metas de tração e análise estratégica para impressão ou PDF.</p>
                    </div>
                  </div>
                  <Button variant="success" onClick={() => setIsReportModalOpen(true)} className="shrink-0">
                    <Printer size={16} className="mr-2" /> Exportar / Imprimir Relatório
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard title="Investimento Inicial" value={overviewKpis.initialInvestment} icon={CircleDollarSign} color="emerald" />
                  <StatCard title="Custo Mensal Estimado" value={overviewKpis.monthlyCost} icon={Wallet} color="amber" />
                  <StatCard title="Break-even" value={overviewKpis.breakEvenClients} icon={Target} color="blue" />
                  <StatCard title="Ticket Médio Sugerido" value={overviewKpis.suggestedTicket} icon={BadgeCheck} color="indigo" />
                  <StatCard title="MRR Projetado" value={overviewKpis.projectedMrr} icon={LineChartIcon} color="emerald" />
                  <StatCard title="Fase Atual" value={overviewKpis.currentPhase} icon={Rocket} color="sky" />
                  <StatCard title="Meta de Validação" value={overviewKpis.validationGoal} icon={CheckCircle2} color="blue" />
                  <StatCard title="Meta de Tração" value={overviewKpis.tractionGoal} icon={Flag} color="indigo" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <ChartCard title="Evolução de Receita">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueEvolution}>
                        <defs>
                          <linearGradient id="businessRevenue" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: number) => [formatCurrency(value), 'Receita']} />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#businessRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Custo por Fase">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={implementationPhases}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="phase" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={62} />
                        <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: number) => [formatCurrency(value), 'Custo teto']} />
                        <Bar dataKey="monthlyCostValue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                <Card className="p-6">
                  <SectionTitle title="Resumo Executivo" subtitle="Leitura rápida para alinhar produto, caixa e validação comercial." />
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    O ERP Pra Você deve crescer por validação progressiva: começar com protótipo local e clientes fundadores, evoluir para beta pago
                    com suporte próximo e só então ampliar infraestrutura, marketing e operação. A primeira meta crítica é provar que 10 clientes pagam
                    pelo menos R$ 97/mês. A meta de tração mira 25 clientes com ticket médio de R$ 197, gerando cerca de R$ 4.925/mês de MRR.
                  </p>
                </Card>
              </div>
            )}

            {activeTab === 'business-plan' && (
              <div className="space-y-8">
                {/* Seção de Next Steps (Próximos Passos) */}
                <Card className="p-6 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 via-white to-transparent dark:from-blue-950/20 dark:via-slate-900 dark:to-transparent">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="text-blue-600 dark:text-blue-400" size={24} />
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Próximos Passos (Next Steps)</h2>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Ações táticas e imediatas para validação e crescimento. Marque, edite ou adicione novas metas.
                      </p>
                    </div>
                    <Badge variant="blue" className="self-start sm:self-center py-1.5 px-3 text-sm font-bold">
                      {nextSteps.filter(s => s.completed).length} / {nextSteps.length} Concluídos
                    </Badge>
                  </div>

                  {/* Input para adicionar novo passo */}
                  <div className="flex gap-3 mb-6">
                    <Input
                      placeholder="Digite um novo próximo passo (ex: Agendar reunião com comerciante local)..."
                      value={newStepText}
                      onChange={(e) => setNewStepText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addNextStep(); }}
                      className="max-w-2xl bg-white dark:bg-slate-900 shadow-sm"
                    />
                    <Button variant="primary" onClick={addNextStep} className="shrink-0 font-bold shadow-sm">
                      <Plus size={18} className="mr-1.5" /> Adicionar
                    </Button>
                  </div>

                  {/* Lista de Next Steps */}
                  <div className="space-y-3">
                    {nextSteps.length === 0 ? (
                      <p className="text-sm text-slate-400 dark:text-slate-500 italic py-4 text-center">Nenhum próximo passo cadastrado. Adicione um acima!</p>
                    ) : (
                      nextSteps.map((step) => (
                        <div
                          key={step.id}
                          className={cn(
                            "flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md",
                            step.completed 
                              ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10" 
                              : "border-slate-100 dark:border-slate-800"
                          )}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => toggleNextStep(step.id)}
                              className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                              title={step.completed ? "Desmarcar" : "Marcar como concluído"}
                            >
                              {step.completed ? (
                                <CheckSquare size={22} className="text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Square size={22} className="text-slate-400 dark:text-slate-600" />
                              )}
                            </button>

                            {editingStepId === step.id ? (
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Input
                                  value={editingStepText}
                                  onChange={(e) => setEditingStepText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditNextStep(step.id);
                                    if (e.key === 'Escape') cancelEditNextStep();
                                  }}
                                  className="h-9 text-sm"
                                  autoFocus
                                />
                                <Button variant="success" size="sm" onClick={() => saveEditNextStep(step.id)} title="Salvar">
                                  <Check size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={cancelEditNextStep} title="Cancelar">
                                  <X size={16} />
                                </Button>
                              </div>
                            ) : (
                              <span
                                className={cn(
                                  "text-sm font-medium transition-all break-words truncate flex-1",
                                  step.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-200"
                                )}
                              >
                                {step.text}
                              </span>
                            )}
                          </div>

                          {editingStepId !== step.id && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditNextStep(step)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                                title="Editar"
                              >
                                <Edit2 size={15} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNextStep(step.id)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                                title="Excluir"
                              >
                                <Trash2 size={15} />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Seção dos Cards do Plano de Negócio */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <SectionTitle title="Estrutura do Plano de Negócio" subtitle="Pilares estratégicos e operacionais do ERP Pra Você." />
                    <Button variant="primary" onClick={() => { setWizardStep(0); setIsWizardOpen(true); }} className="shrink-0 font-bold shadow-md">
                      <Sparkles size={18} className="mr-2 text-amber-400 animate-pulse" /> Assistente Imersivo em Tela Cheia
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
                    {businessPlanItems.map((item) => (
                      <Card key={item.title} className="p-5">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <h3 className="font-black text-slate-900 dark:text-white">{item.title}</h3>
                          <Badge variant="blue">Plano</Badge>
                        </div>
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item.body}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'product' && (
              <Card>
                <Table className="overflow-x-auto">
                  <THead>
                    <TR>
                      <TH>Módulo</TH>
                      <TH>Descrição</TH>
                      <TH>Status</TH>
                      <TH>Prioridade</TH>
                      <TH>Benefício</TH>
                      <TH>Fase</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {productModules.map((module) => (
                      <TR key={module.name}>
                        <TD className="font-bold text-slate-900 dark:text-white">{module.name}</TD>
                        <TD>{module.description}</TD>
                        <TD><Badge variant={badgeVariant(module.status)}>{module.status}</Badge></TD>
                        <TD><Badge variant={badgeVariant(module.priority)}>{module.priority}</Badge></TD>
                        <TD>{module.benefit}</TD>
                        <TD>{module.deliveryPhase}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </Card>
            )}

            {activeTab === 'funnel' && (() => {
              const funnelChartData = [
                { etapa: '1. Leads', quantidade: funnel.leads },
                { etapa: '2. Reuniões', quantidade: funnelResults.meetings },
                { etapa: '3. Testes', quantidade: funnelResults.trials },
                { etapa: '4. Clientes', quantidade: funnelResults.clients },
              ];

              const funnelValueData = [
                { etapa: '1. Leads', valor: funnel.leads * funnel.ticket },
                { etapa: '2. Reuniões', valor: funnelResults.meetings * funnel.ticket },
                { etapa: '3. Testes', valor: funnelResults.trials * funnel.ticket },
                { etapa: '4. MRR', valor: funnelResults.mrr },
              ];

              return (
                <div className="space-y-6 animate-in fade-in duration-500">
                  {/* Topo: Cards Indicadores Menores e Mais Bonitos */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                    <CompactMetricCard label="Reuniões estimadas" value={funnelResults.meetings} icon={Users} color="blue" />
                    <CompactMetricCard label="Testes estimados" value={funnelResults.trials} icon={Rocket} color="amber" />
                    <CompactMetricCard label="Clientes pagos" value={funnelResults.clients} icon={CheckCircle2} color="emerald" />
                    <CompactMetricCard label="MRR" value={formatCurrency(funnelResults.mrr)} icon={TrendingUp} color="emerald" />
                    <CompactMetricCard label="ARR" value={formatCurrency(funnelResults.arr)} icon={LineChartIcon} data-testid="funnel-arr-card" color="indigo" />
                    <CompactMetricCard label="Próxima meta" value="10 clientes pagantes" icon={Flag} color="violet" />
                  </div>

                  {/* Corpo Principal: Sliders na Esquerda, Gráficos na Direita */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* Esquerda: Sliders (4 colunas no desktop) */}
                    <Card className="p-5 xl:col-span-4 border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                      <SectionTitle title="Simulador do Funil" subtitle="Ajuste as conversões e veja o impacto instantâneo nos gráficos e KPIs." />
                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 divide-y divide-slate-100 dark:divide-slate-800/50">
                        <div className="pt-3 first:pt-0">
                          <SliderField label="Leads iniciais" value={funnel.leads} onChange={(value) => setFunnel({ ...funnel, leads: value })} min={50} max={5000} step={10} />
                        </div>
                        <div className="pt-3 first:pt-0">
                          <SliderField label="Conversão para reunião" value={funnel.meeting} onChange={(value) => setFunnel({ ...funnel, meeting: value })} min={1} max={100} step={1} suffix="%" />
                        </div>
                        <div className="pt-3 first:pt-0">
                          <SliderField label="Conversão para teste" value={funnel.trial} onChange={(value) => setFunnel({ ...funnel, trial: value })} min={1} max={100} step={1} suffix="%" />
                        </div>
                        <div className="pt-3 first:pt-0">
                          <SliderField label="Conversão para cliente pago" value={funnel.paid} onChange={(value) => setFunnel({ ...funnel, paid: value })} min={1} max={100} step={1} suffix="%" />
                        </div>
                        <div className="pt-3 first:pt-0">
                          <SliderField label="Ticket médio" value={funnel.ticket} onChange={(value) => setFunnel({ ...funnel, ticket: value })} min={50} max={1000} step={10} />
                        </div>
                      </div>
                    </Card>

                    {/* Direita: Gráficos (8 colunas no desktop) */}
                    <div className="xl:col-span-8 space-y-6">
                      <ChartCard title="Conversão do Funil (Qtd. de Pessoas)">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={funnelChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis type="category" dataKey="etapa" tick={{ fontSize: 12 }} width={85} />
                            <Tooltip formatter={(value: number) => [value, 'Quantidade']} />
                            <Bar dataKey="quantidade" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={28} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartCard>

                      <ChartCard title="Receita Potencial vs Realizada (R$)">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={funnelValueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="etapa" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Valor Potencial']} />
                            <Bar dataKey="valor" fill="#10b981" radius={[8, 8, 0, 0]} barSize={36} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartCard>
                    </div>
                  </div>
                </div>
              );
            })()}

      {activeTab === 'implementation' && (
        <div className="space-y-5">
          {implementationPhases.map((phase) => (
            <Card key={phase.phase} className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{phase.phase}</h3>
                    <Badge variant={badgeVariant(phase.status)}>{phase.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{phase.objective}</p>
                </div>
                <Badge variant="blue">{phase.monthlyCost}</Badge>
              </div>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
                <MetricCard label="Clientes" value={phase.clients} />
                <MetricCard label="Stack" value={phase.stack} />
                <MetricCard label="Marco de decisão" value={phase.decision} />
                <MetricCard label="Risco principal" value={phase.risk} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'costs' && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <SectionTitle title="Cenário de Infraestrutura" subtitle="Stack recomendado: Vercel Pro ou Render, Supabase/PostgreSQL, GitHub, domínio, e-mail, backups e monitoramento." />
              <div className="flex gap-2 overflow-x-auto">
                {(Object.keys(scenarioLabels) as CostScenario[]).map((scenarioKey) => (
                  <Button
                    key={scenarioKey}
                    variant={costScenario === scenarioKey ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setCostScenario(scenarioKey)}
                    className="shrink-0"
                  >
                    {scenarioLabels[scenarioKey]}
                  </Button>
                ))}
              </div>
            </div>
            <p className="mt-5 text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(costTotal)}<span className="text-sm text-slate-400">/mês</span></p>
          </Card>

          <Card>
            <Table className="overflow-x-auto">
              <THead>
                <TR>
                  <TH>Categoria</TH>
                  <TH>Enxuto</TH>
                  <TH>Profissional</TH>
                  <TH>Escalável</TH>
                </TR>
              </THead>
              <TBody>
                {infrastructureCosts.map((item) => (
                  <TR key={item.item}>
                    <TD className="font-bold text-slate-900 dark:text-white">{item.item}</TD>
                    <TD>{formatCurrency(item.lean)}</TD>
                    <TD>{formatCurrency(item.professional)}</TD>
                    <TD>{formatCurrency(item.scalable)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Topo: Cards Indicadores Menores e Mais Bonitos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            <CompactMetricCard label="MRR" value={formatCurrency(financeResults.mrr)} icon={TrendingUp} color="emerald" />
            <CompactMetricCard label="ARR" value={formatCurrency(financeResults.arr)} icon={LineChartIcon} color="blue" />
            <CompactMetricCard label="Custo variável total" value={formatCurrency(financeResults.variableTotal)} icon={Wallet} color="amber" />
            <CompactMetricCard label="Lucro estimado" value={formatCurrency(financeResults.profit)} icon={CircleDollarSign} color="emerald" />
            <CompactMetricCard label="Break-even" value={`${financeResults.breakEven} clientes`} icon={Target} color="indigo" />
            <CompactMetricCard label="Payback" value={financeResults.payback > 0 ? `${financeResults.payback.toFixed(1)} meses` : 'Sem lucro'} icon={Calculator} color="violet" />
          </div>

          {/* Corpo Principal: Sliders na Esquerda, Gráficos na Direita */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Esquerda: Sliders (4 colunas no desktop) */}
            <Card className="p-5 xl:col-span-4 border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <SectionTitle title="Controles de Simulação" subtitle="Ajuste as variáveis e veja o impacto instantâneo nos gráficos e KPIs." />
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 divide-y divide-slate-100 dark:divide-slate-800/50">
                <div className="pt-3 first:pt-0">
                  <SliderField label="Número de clientes" value={finance.clients} onChange={(value) => setFinance({ ...finance, clients: value })} min={1} max={500} step={1} />
                </div>
                <div className="pt-3 first:pt-0">
                  <SliderField label="Mensalidade média" value={finance.ticket} onChange={(value) => setFinance({ ...finance, ticket: value })} min={50} max={1000} step={10} />
                </div>
                <div className="pt-3 first:pt-0">
                  <SliderField label="Custo fixo mensal" value={finance.fixedCost} onChange={(value) => setFinance({ ...finance, fixedCost: value })} min={500} max={20000} step={500} />
                </div>
                <div className="pt-3 first:pt-0">
                  <SliderField label="Custo variável por cliente" value={finance.variableCost} onChange={(value) => setFinance({ ...finance, variableCost: value })} min={5} max={200} step={5} />
                </div>
                <div className="pt-3 first:pt-0">
                  <SliderField label="Investimento inicial" value={finance.initialInvestment} onChange={(value) => setFinance({ ...finance, initialInvestment: value })} min={1000} max={50000} step={1000} />
                </div>
                <div className="pt-3 first:pt-0">
                  <SliderField label="Imposto estimado" value={finance.tax} onChange={(value) => setFinance({ ...finance, tax: value })} min={0} max={30} step={1} suffix="%" />
                </div>
                <div className="pt-3 first:pt-0">
                  <SliderField label="Churn" value={finance.churn} onChange={(value) => setFinance({ ...finance, churn: value })} min={0} max={20} step={1} suffix="%" />
                </div>
                <div className="pt-3 first:pt-0">
                  <SliderField label="Crescimento mensal" value={finance.growth} onChange={(value) => setFinance({ ...finance, growth: value })} min={0} max={50} step={1} suffix="%" />
                </div>
              </div>
            </Card>

            {/* Direita: Gráficos (8 colunas no desktop) */}
            <div className="xl:col-span-8 space-y-6">
              <ChartCard title="Projeção de Receita e Lucro (12 Meses)">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                    <Line type="monotone" dataKey="receita" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Clientes Projetados (12 Meses)">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="clientes" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progressive' && (
        <div className="space-y-6">
          <Card>
            <Table className="overflow-x-auto">
              <THead>
                <TR>
                  <TH>Fase</TH>
                  <TH>Clientes</TH>
                  <TH>Custo mensal</TH>
                  <TH>Objetivo</TH>
                  <TH>Decisão para avançar</TH>
                </TR>
              </THead>
              <TBody>
                {implementationPhases.map((phase) => (
                  <TR key={phase.phase}>
                    <TD className="font-bold text-slate-900 dark:text-white">{phase.phase}</TD>
                    <TD>{phase.clients}</TD>
                    <TD>{phase.monthlyCost}</TD>
                    <TD>{phase.objective}</TD>
                    <TD>{phase.decision}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
          <ChartCard title="Investimento Acumulado por Fase">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressiveData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="phase" tick={{ fontSize: 10 }} interval={0} angle={-10} textAnchor="end" height={58} />
                <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                <Area type="monotone" dataKey="acumulado" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.18} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[
              ['Público-alvo', 'Pequenos e médios comerciantes que precisam controlar operação sem complexidade técnica.'],
              ['Dores do comerciante', 'Estoque errado, falta de caixa claro, vendas sem histórico, retrabalho e pouca previsibilidade.'],
              ['Concorrentes diretos', 'ERPs de varejo, sistemas de PDV e plataformas de gestão para pequenas empresas.'],
              ['Concorrentes indiretos', 'Planilhas, cadernos, maquininhas, apps financeiros e controles manuais.'],
              ['Oportunidades', 'Venda consultiva local, implantação assistida e precificação progressiva.'],
              ['Ameaças', 'Preço baixo de concorrentes, resistência à mudança e exigências fiscais.'],
              ['Posicionamento', 'ERP simples e próximo para o comércio local sair do improviso sem perder agilidade.'],
            ].map(([title, body]) => (
              <Card key={title} className="p-5">
                <h3 className="font-black text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {swot.map((block) => (
              <Card key={block.type} className="p-5">
                <h3 className="font-black text-slate-900 dark:text-white mb-4">{block.type}</h3>
                <div className="space-y-3">
                  {block.items.map((item) => (
                    <div key={item} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'taxes' && (
        <div className="space-y-6">
          <Card className="p-5 border-amber-200 dark:border-amber-500/30">
            <div className="flex gap-3">
              <AlertTriangle className="text-amber-500 shrink-0" size={22} />
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                Simulação educacional. Validar com contador antes de tomar decisões fiscais, societárias ou tributárias.
              </p>
            </div>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['MEI, se aplicável', 'ME', 'Simples Nacional', 'LTDA', 'DAS', 'ISS', 'Pró-labore', 'Emissão fiscal', 'Contrato', 'LGPD'].map((topic) => (
              <Badge key={topic} variant="info" className="justify-center py-2 rounded-lg">{topic}</Badge>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="p-5">
              <SectionTitle title="Simulador Tributário" subtitle="Estimativa simples para conversa com contador." />
              <div className="mt-5 grid grid-cols-1 gap-4">
                <NumberField label="Receita mensal" value={taxes.revenue} onChange={(value) => setTaxes({ ...taxes, revenue: value })} step={100} />
                <NumberField label="Alíquota estimada" value={taxes.taxRate} onChange={(value) => setTaxes({ ...taxes, taxRate: value })} suffix="%" step={1} />
                <NumberField label="Pró-labore" value={taxes.proLabore} onChange={(value) => setTaxes({ ...taxes, proLabore: value })} step={100} />
                <NumberField label="Custos" value={taxes.costs} onChange={(value) => setTaxes({ ...taxes, costs: value })} step={100} />
              </div>
            </Card>
            <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard label="Imposto estimado" value={formatCurrency(taxResults.estimatedTax)} />
              <MetricCard label="Pró-labore" value={formatCurrency(taxes.proLabore)} />
              <MetricCard label="Resultado após custos" value={formatCurrency(taxResults.net)} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {partners.map((partner, index) => (
              <Card key={partner.name} className="p-5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{partner.name}</h3>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">{partner.role}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-4">{partner.responsibilities}</p>
                <div className="mt-5 grid grid-cols-1 gap-4">
                  <NumberField
                    label="Participação"
                    value={shares[index]}
                    onChange={(value) => setShares(shares.map((share, shareIndex) => (shareIndex === index ? value : share)))}
                    suffix="%"
                    step={5}
                  />
                  <MetricCard label="Área principal" value={partner.area} />
                  <MetricCard label="Observações" value={partner.notes} />
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="p-5">
              <SectionTitle title="Distribuição de Lucro" subtitle="Usa o lucro estimado do cenário selecionado." />
              <div className="mt-5">
                <NumberField label="Percentual reinvestido" value={reinvested} onChange={setReinvested} suffix="%" step={5} />
              </div>
            </Card>
            <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {partners.map((partner, index) => (
                <MetricCard key={partner.name} label={partner.name} value={formatCurrency(distributionBase * percent(shares[index]))} />
              ))}
            </div>
          </div>

          <Card className="p-5">
            <SectionTitle title="Acordos Importantes" subtitle="Pontos que devem virar contrato antes de escalar." />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Vesting e saída de sócio', 'Critério de reinvestimento', 'Funções e metas individuais', 'Direito de decisão técnica e comercial', 'Uso de caixa e pró-labore', 'Propriedade intelectual e LGPD'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <ListChecks size={16} className="text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl gap-4 mb-6">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Relatório Executivo Consolidado</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Gere um documento completo com projeções, metas de tração e análise estratégica para impressão ou PDF.</p>
              </div>
            </div>
            <Button variant="success" onClick={() => setIsReportModalOpen(true)} className="shrink-0">
              <Printer size={16} className="mr-2" /> Exportar / Imprimir Relatório
            </Button>
          </div>

          <Card className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <SectionTitle title="Simulador de Cenários" subtitle="Compare conservador, realista, agressivo ou personalize os números." />
              <div className="flex gap-2 overflow-x-auto">
                {(Object.keys(scenarioPresets) as ScenarioName[]).map((name) => (
                  <Button key={name} variant={scenarioName === name ? 'primary' : 'outline'} size="sm" onClick={() => updateScenario(name)} className="shrink-0">
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="p-5">
              <div className="grid grid-cols-1 gap-4">
                <SliderField label="Clientes" value={scenario.clients} onChange={(value) => setScenario({ ...scenario, clients: value })} min={1} max={500} step={1} />
                <SliderField label="Ticket médio" value={scenario.ticket} onChange={(value) => setScenario({ ...scenario, ticket: value })} min={50} max={1000} step={10} />
                <SliderField label="Custo fixo" value={scenario.fixedCost} onChange={(value) => setScenario({ ...scenario, fixedCost: value })} min={500} max={20000} step={500} />
                <SliderField label="Investimento inicial" value={scenario.initialInvestment} onChange={(value) => setScenario({ ...scenario, initialInvestment: value })} min={1000} max={50000} step={1000} />
                <SliderField label="Crescimento" value={scenario.growth} onChange={(value) => setScenario({ ...scenario, growth: value })} min={0} max={50} step={1} suffix="%" />
                <SliderField label="Churn" value={scenario.churn} onChange={(value) => setScenario({ ...scenario, churn: value })} min={0} max={20} step={1} suffix="%" />
                <SliderField label="Imposto" value={scenario.tax} onChange={(value) => setScenario({ ...scenario, tax: value })} min={0} max={30} step={1} suffix="%" />
              </div>
            </Card>
            <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard label="MRR" value={formatCurrency(scenarioResults.mrr)} />
              <MetricCard label="ARR" value={formatCurrency(scenarioResults.arr)} />
              <MetricCard label="Lucro estimado" value={formatCurrency(scenarioResults.profit)} />
              <MetricCard label="Break-even" value={`${scenarioResults.breakEven} clientes`} />
              <MetricCard label="Payback" value={scenarioResults.payback > 0 ? `${scenarioResults.payback.toFixed(1)} meses` : 'Sem lucro'} />
              <MetricCard label="Margem" value={`${scenarioResults.margin.toFixed(1)}%`} />
              <MetricCard label="Clientes p/ custos" value={`${safeBreakEven(scenario.fixedCost, scenario.ticket, scenario.variableCost)} clientes`} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales-page' && renderSalesPage(false)}

      {activeTab === 'studies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[
              ['Hipóteses a validar', ['Comerciantes pagam para reduzir controle manual', 'Estoque e financeiro são as dores principais', 'Implantação assistida aumenta conversão']],
              ['Perguntas para entrevistas', ['Como controla estoque hoje?', 'Quanto tempo perde com fechamento?', 'O que faria pagar por um ERP novo?']],
              ['Riscos', ['Produto complexo demais', 'Baixa recorrência de uso', 'Preço desalinhado com valor percebido']],
              ['Métricas importantes', ['MRR', 'Churn', 'Ativação semanal', 'CAC', 'Tempo de implantação']],
              ['Aprendizados dos clientes', ['Registrar objeções', 'Medir módulos mais usados', 'Priorizar melhorias por impacto']],
            ].map(([title, items]) => (
              <Card key={title as string} className="p-5">
                <h3 className="font-black text-slate-900 dark:text-white mb-4">{title as string}</h3>
                <div className="space-y-3">
                  {(items as string[]).map((item) => (
                    <div key={item} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <Card className="p-5">
            <SectionTitle title="Checklist de Validação" subtitle="Sequência prática antes de acelerar investimento." />
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Entrevistar 10 comerciantes', 'Mapear dores reais', 'Validar disposição de pagamento', 'Criar protótipo navegável', 'Finalizar MVP', 'Fechar 3 a 5 clientes piloto', 'Coletar feedback semanal', 'Ajustar produto', 'Criar onboarding', 'Montar primeira página de vendas'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <CheckCircle2 size={17} className="text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      
            {(() => {
              const currentIndex = tabs.findIndex(t => t.id === activeTab);
              const prevTab = currentIndex > 0 ? tabs[currentIndex - 1] : null;
              const nextTab = currentIndex < tabs.length - 1 ? tabs[currentIndex + 1] : null;
              return (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 mt-8">
                  {prevTab ? (
                    <Button variant="outline" onClick={() => setActiveTab(prevTab.id)} className="w-full sm:w-auto justify-center font-bold">
                      <ArrowLeft size={16} className="mr-2" /> Anterior: {prevTab.label}
                    </Button>
                  ) : <div className="hidden sm:block" />}
                  {nextTab ? (
                    <Button variant="primary" onClick={() => setActiveTab(nextTab.id)} className="w-full sm:w-auto justify-center font-bold shadow-md">
                      Próxima: {nextTab.label} <ArrowRight size={16} className="ml-2" />
                    </Button>
                  ) : <div className="hidden sm:block" />}
                </div>
              );
            })()}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Assistente Imersivo do Plano de Negócio em Tela Cheia */}
      {createPortal(
        <AnimatePresence>
          {isWizardOpen && (
            <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999] bg-slate-950 text-white flex flex-col justify-between overflow-y-auto"
          >
            {/* Top Bar / Progress */}
            <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 sm:px-12 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                  <Sparkles size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl tracking-tight text-white">Assistente Estratégico</h3>
                  <p className="text-xs text-slate-400">Construindo seu plano de negócio passo a passo</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-3 text-xs font-bold text-slate-400">
                  <span>Etapa {wizardStep + 1} de {businessPlanItems.length}</span>
                  <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((wizardStep + 1) / businessPlanItems.length) * 100}%` }} />
                  </div>
                </div>
                <button
                  onClick={() => setIsWizardOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  title="Fechar Assistente"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto w-full px-6 sm:px-12 py-8 sm:py-12 flex-1 flex flex-col justify-center">
              {(() => {
                const currentItem = businessPlanItems[wizardStep];
                const suggestionData = wizardSuggestions[currentItem.title] || { explanation: 'Defina este pilar estratégico para o seu negócio.', suggestions: [] };

                return (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                        Pilar {wizardStep + 1} • {currentItem.title}
                      </span>
                      <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mt-4">
                        {currentItem.title}
                      </h1>
                      <p className="text-base sm:text-xl text-slate-300 leading-relaxed mt-4 max-w-3xl font-medium">
                        {suggestionData.explanation}
                      </p>
                    </div>

                    {/* Área de Edição */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Edit2 size={14} className="text-blue-400" /> Sua Definição (Edite livremente abaixo):
                      </label>
                      <textarea
                        value={currentItem.body}
                        onChange={(e) => updateWizardItemBody(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 text-lg sm:text-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner font-medium resize-y"
                        placeholder="Escreva a definição aqui..."
                      />
                    </div>

                    {/* Respostas Prontas Sugeridas */}
                    {suggestionData.suggestions.length > 0 && (
                      <div className="space-y-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                          <Sparkles size={16} /> Ideias e Respostas Prontas (Clique para aplicar):
                        </div>
                        <div className="grid grid-cols-1 gap-3 mt-3">
                          {suggestionData.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => updateWizardItemBody(sug)}
                              className="text-left bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-blue-500/50 p-4 rounded-xl text-sm sm:text-base text-slate-200 hover:text-white transition-all flex items-start gap-3 group"
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all text-xs font-bold mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed flex-1">{sug}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Bottom Bar / Navigation */}
            <div className="sticky bottom-0 z-10 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 px-6 sm:px-12 py-6 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setWizardStep(prev => Math.max(0, prev - 1))}
                disabled={wizardStep === 0}
                className="px-6 py-3 font-bold border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
              >
                Anterior
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-6 py-3 font-bold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Salvar e Fechar
                </Button>

                {wizardStep < businessPlanItems.length - 1 ? (
                  <Button
                    variant="primary"
                    onClick={() => setWizardStep(prev => Math.min(businessPlanItems.length - 1, prev + 1))}
                    className="px-8 py-3 font-bold shadow-lg"
                  >
                    Próxima Etapa <ArrowRight size={18} className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={() => setIsWizardOpen(false)}
                    className="px-8 py-3 font-bold shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Check size={18} className="mr-2" /> Concluir Plano
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Apresentação Imersiva da Visão Geral em Tela Cheia */}
      {createPortal(
        <AnimatePresence>
          {isPresentationOpen && (
            <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999] bg-slate-950 text-white flex flex-col justify-between overflow-y-auto"
          >
            {/* Top Bar / Progress */}
            <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 sm:px-12 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                  <Sparkles size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl tracking-tight text-white">Apresentação Executiva</h3>
                  <p className="text-xs text-slate-400">Visão Geral Imersiva do ERP Pra Você</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-3 text-xs font-bold text-slate-400">
                  <span>Etapa {presentationStep + 1} de 7</span>
                  <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${((presentationStep + 1) / 7) * 100}%` }} />
                  </div>
                </div>
                <button
                  onClick={() => setIsPresentationOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  title="Fechar Apresentação"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto w-full px-6 sm:px-12 py-8 sm:py-12 flex-1 flex flex-col justify-center">
              {(() => {
                const stepsData = [
                  {
                    title: 'O Propósito & O Problema',
                    subtitle: 'Por que o ERP Pra Você existe e qual dor resolvemos no mercado local.',
                    tag: 'Pilar 1 • Missão',
                    content: (
                      <div className="space-y-6 text-slate-300 text-lg sm:text-xl leading-relaxed font-medium">
                        <p>
                          Pequenos comerciantes, mercadinhos e lojas locais perdem horas preciosas e dinheiro controlando estoque, fiado e fluxo de caixa em planilhas confusas ou cadernos de papel.
                        </p>
                        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                          <h4 className="font-bold text-blue-400 text-base sm:text-lg flex items-center gap-2">
                            <CheckCircle2 size={20} /> Nossa Solução Direta
                          </h4>
                          <p className="text-base sm:text-lg text-slate-200">
                            Um ERP simples, acessível e focado na usabilidade de balcão e celular. Entregamos clareza de caixa, controle automático de estoque e emissão rápida sem jargões contábeis complexos.
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Valor para o Cliente Final',
                    subtitle: 'O impacto prático na rotina do lojista e a nossa estratégia de precificação.',
                    tag: 'Pilar 2 • Proposta de Valor',
                    content: (
                      <div className="space-y-6">
                        <p className="text-slate-300 text-lg sm:text-xl leading-relaxed font-medium">
                          Oferecemos planos acessíveis que cabem no orçamento de qualquer pequeno comércio, entregando um valor percebido infinitamente superior ao custo mensal.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Mensalidade Média Simulada</span>
                            <p className="text-4xl sm:text-5xl font-black text-white mt-3">R$ {finance.ticket}/mês</p>
                            <p className="text-xs text-slate-400 mt-2">Valor altamente competitivo para o varejo local.</p>
                          </div>
                          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Economia Estimada de Tempo</span>
                            <p className="text-4xl sm:text-5xl font-black text-white mt-3">+10h/semana</p>
                            <p className="text-xs text-slate-400 mt-2">Tempo economizado em fechamento de caixa e inventário.</p>
                          </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 mt-4">
                          <h4 className="font-bold text-slate-200 text-sm sm:text-base mb-3 uppercase tracking-wider text-indigo-400">
                            Planos Disponíveis no Modelo
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {pricingPlans.map(plan => (
                              <div key={plan.name} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex justify-between items-center">
                                <span className="font-bold text-white">{plan.name}</span>
                                <span className="text-blue-400 font-semibold">{plan.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Estrutura de Custos & Operação',
                    subtitle: 'Transparência total sobre os custos fixos e variáveis para manter a plataforma rodando.',
                    tag: 'Pilar 3 • Custos',
                    content: (
                      <div className="space-y-6">
                        <p className="text-slate-300 text-lg sm:text-xl leading-relaxed font-medium">
                          Para garantir alta disponibilidade, segurança de dados e suporte humanizado, estruturamos nossos custos operacionais com máxima eficiência.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Custo Fixo Mensal</span>
                            <p className="text-3xl sm:text-4xl font-black text-white mt-3">R$ {finance.fixedCost}</p>
                            <p className="text-xs text-slate-400 mt-2">Estrutura básica, contabilidade e ferramentas.</p>
                          </div>
                          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Custo Variável / Cliente</span>
                            <p className="text-3xl sm:text-4xl font-black text-white mt-3">R$ {finance.variableCost}</p>
                            <p className="text-xs text-slate-400 mt-2">Servidores, emissão fiscal e atendimento direto.</p>
                          </div>
                          <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Imposto Estimado</span>
                            <p className="text-3xl sm:text-4xl font-black text-white mt-3">{finance.tax}%</p>
                            <p className="text-xs text-slate-400 mt-2">Alíquota média aplicada sobre o faturamento.</p>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Ponto de Equilíbrio (Break-even)',
                    subtitle: 'O marco exato em que a empresa empata os custos e começa a gerar lucro limpo.',
                    tag: 'Pilar 4 • Viabilidade',
                    content: (
                      <div className="space-y-6">
                        <p className="text-slate-300 text-lg sm:text-xl leading-relaxed font-medium">
                          O Ponto de Equilíbrio (Break-even) indica o número de clientes pagantes necessários para cobrir todos os custos fixos e variáveis da operação.
                        </p>
                        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/50 to-blue-900/50 border border-indigo-500/30 text-center space-y-4">
                          <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/20 px-4 py-1.5 rounded-full">
                            Meta de Empate Operacional
                          </span>
                          <p className="text-6xl sm:text-8xl font-black text-white tracking-tight">
                            {financeResults.breakEven} <span className="text-2xl sm:text-4xl text-slate-300 font-bold">clientes</span>
                          </p>
                          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
                            Atingindo {financeResults.breakEven} clientes com ticket de R$ {finance.ticket}, a receita cobre integralmente os R$ {finance.fixedCost} de custo fixo mais os custos variáveis e impostos.
                          </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-white text-base">Clientes Simulados Atualmente</h4>
                            <p className="text-sm text-slate-400">Comparação com a meta de break-even</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-blue-400">{finance.clients} clientes</span>
                            <p className="text-xs text-slate-400">{finance.clients >= financeResults.breakEven ? '🎉 Operação com Lucro' : '⚠️ Abaixo do Break-even'}</p>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Projeção de Faturamento & Lucro',
                    subtitle: 'O potencial financeiro do negócio com base nos clientes simulados.',
                    tag: 'Pilar 5 • Receita',
                    content: (
                      <div className="space-y-6">
                        <p className="text-slate-300 text-lg sm:text-xl leading-relaxed font-medium">
                          Com a base atual simulada em {finance.clients} clientes pagando uma mensalidade média de R$ {finance.ticket}, este é o cenário financeiro projetado para o negócio:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">MRR (Faturamento Mensal)</span>
                            <p className="text-3xl sm:text-4xl font-black text-white mt-3">{formatCurrency(financeResults.mrr)}</p>
                            <p className="text-xs text-slate-400 mt-2">Receita Recorrente Mensal garantida.</p>
                          </div>
                          <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">ARR (Faturamento Anual)</span>
                            <p className="text-3xl sm:text-4xl font-black text-white mt-3">{formatCurrency(financeResults.arr)}</p>
                            <p className="text-xs text-slate-400 mt-2">Projeção de receita recorrente no ano.</p>
                          </div>
                          <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 shadow-lg">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Lucro Líquido Estimado</span>
                            <p className="text-3xl sm:text-4xl font-black text-emerald-400 mt-3">{formatCurrency(financeResults.profit)}</p>
                            <p className="text-xs text-slate-300 mt-2">Valor limpo após custos e impostos.</p>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Payback & Retorno do Investimento',
                    subtitle: 'O tempo estimado para recuperar o capital investido na criação do ERP.',
                    tag: 'Pilar 6 • Investimento',
                    content: (
                      <div className="space-y-6">
                        <p className="text-slate-300 text-lg sm:text-xl leading-relaxed font-medium">
                          O Payback representa o tempo necessário para que o lucro líquido acumulado pague integralmente o investimento inicial alocado no projeto.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Investimento Inicial Informado</span>
                            <p className="text-5xl sm:text-6xl font-black text-white mt-4">R$ {finance.initialInvestment}</p>
                            <p className="text-sm text-slate-400 mt-3">Capital para setup de infraestrutura, marca, jurídico e contábil inicial.</p>
                          </div>
                          <div className="p-8 rounded-3xl bg-gradient-to-br from-violet-900/50 to-indigo-900/50 border border-violet-500/30 flex flex-col justify-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Tempo de Payback Estimado</span>
                            <p className="text-5xl sm:text-6xl font-black text-white mt-4">
                              {financeResults.payback > 0 ? `${financeResults.payback.toFixed(1)} meses` : 'Sem lucro'}
                            </p>
                            <p className="text-sm text-slate-300 mt-3">
                              {financeResults.payback > 0 ? `Em aproximadamente ${Math.ceil(financeResults.payback)} meses o negócio se paga integralmente.` : 'Ajuste os clientes no simulador para obter lucro.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Visão de Futuro & Próximos Passos',
                    subtitle: 'Resumo executivo final e chamada para ação para acelerar o crescimento.',
                    tag: 'Pilar 7 • Execução',
                    content: (
                      <div className="space-y-6">
                        <p className="text-slate-300 text-lg sm:text-xl leading-relaxed font-medium">
                          A estratégia está definida, os unit economics estão validados no modelo e a plataforma está pronta para escalar. O sucesso agora depende da execução focada.
                        </p>
                        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                          <h4 className="font-bold text-white text-base sm:text-lg flex items-center gap-2 text-emerald-400">
                            <CheckSquare size={20} /> Ações Prioritárias Imediatas
                          </h4>
                          <div className="space-y-3 pt-1">
                            {nextSteps.map(step => (
                              <div key={step.id} className="flex items-start gap-3 text-base text-slate-200 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
                                <Check size={18} className="text-blue-400 mt-0.5 shrink-0" />
                                <span className="leading-relaxed">{step.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ];

                const currentStepData = stepsData[presentationStep];

                return (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                        {currentStepData.tag}
                      </span>
                      <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mt-4">
                        {currentStepData.title}
                      </h1>
                      <p className="text-base sm:text-xl text-slate-300 leading-relaxed mt-4 max-w-3xl font-medium">
                        {currentStepData.subtitle}
                      </p>
                    </div>

                    {/* Conteúdo Específico da Etapa */}
                    <div className="pt-4">
                      {currentStepData.content}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Bottom Bar / Navigation */}
            <div className="sticky bottom-0 z-10 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 px-6 sm:px-12 py-6 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setPresentationStep(prev => Math.max(0, prev - 1))}
                disabled={presentationStep === 0}
                className="px-6 py-3 font-bold border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
              >
                Anterior
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsPresentationOpen(false)}
                  className="px-6 py-3 font-bold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Fechar Apresentação
                </Button>

                {presentationStep < 6 ? (
                  <Button
                    variant="primary"
                    onClick={() => setPresentationStep(prev => Math.min(6, prev + 1))}
                    className="px-8 py-3 font-bold shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Próxima Etapa <ArrowRight size={18} className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={() => setIsPresentationOpen(false)}
                    className="px-8 py-3 font-bold shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Check size={18} className="mr-2" /> Concluir Apresentação
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Relatório de Visão de Negócio" maxWidth="max-w-4xl">
        <div className="space-y-8 p-2 print:p-0">
          <div className="print:hidden flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
              Dica: Utilize o atalho de impressão do navegador ou clique no botão abaixo para gerar o PDF ou imprimir.
            </p>
            <Button variant="primary" onClick={() => window.print()}>
              <Printer size={16} className="mr-2" /> Imprimir / Salvar PDF
            </Button>
          </div>

          <div className="border-b pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">ERP Pra Você</h1>
                <p className="text-sm font-bold text-slate-500 mt-1">Relatório Estratégico & Projeções de Crescimento</p>
              </div>
              <div className="text-right">
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full font-bold text-slate-600 dark:text-slate-300">
                  Cenário: {scenarioName}
                </span>
                <p className="text-xs text-slate-400 mt-2">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">1. Metas e Indicadores de Tração</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                <MetricCard label="Invest. Inicial" value={overviewKpis.initialInvestment} />
                <MetricCard label="Custo Mensal" value={overviewKpis.monthlyCost} />
                <MetricCard label="Break-even" value={overviewKpis.breakEvenClients} />
                <MetricCard label="MRR Projetado" value={overviewKpis.projectedMrr} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">2. Projeção Financeira (12 Meses)</h3>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 print:bg-transparent print:border print:p-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                  <MetricCard label="Clientes Iniciais" value={finance.clients} />
                  <MetricCard label="Ticket Médio" value={formatCurrency(finance.ticket)} />
                  <MetricCard label="Crescimento M." value={`${finance.growth}%`} />
                  <MetricCard label="Lucro Estimado" value={formatCurrency(financeResults.profit)} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">3. Cenário Selecionado: {scenarioName}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                <MetricCard label="Clientes" value={scenario.clients} />
                <MetricCard label="Ticket Médio" value={formatCurrency(scenario.ticket)} />
                <MetricCard label="MRR Estimado" value={formatCurrency(scenarioResults.mrr)} />
                <MetricCard label="Lucro" value={formatCurrency(scenarioResults.profit)} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">4. Resumo Executivo</h3>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 print:text-xs print:leading-5">
                O ERP Pra Você deve crescer por validação progressiva: começar com protótipo local e clientes fundadores, evoluir para beta pago com suporte próximo e só então ampliar infraestrutura, marketing e operação. A primeira meta crítica é provar que 10 clientes pagam pelo menos R$ 97/mês. A meta de tração mira 25 clientes com ticket médio de R$ 197, gerando cerca de R$ 4.925/mês de MRR.
              </p>
            </div>
          </div>

          <div className="print:block hidden pt-8 border-t text-center text-xs text-slate-400">
            Documento confidencial gerado pelo sistema ERP Pra Você. Uso restrito para planejamento estratégico.
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!stepToDelete}
        onClose={() => setStepToDelete(null)}
        title="Confirmar Exclusão"
        footer={
          <>
            <Button variant="outline" onClick={() => setStepToDelete(null)} disabled={isDeletingStep}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDeleteStep} isLoading={isDeletingStep}>
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
              Você tem certeza que deseja excluir este próximo passo?
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Esta ação removerá o item permanentemente da sua lista de planejamento.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
