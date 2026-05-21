import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Utensils, 
  Wrench, 
  Factory, 
  Truck, 
  Sparkles, 
  Globe, 
  HelpCircle, 
  ArrowRight, 
  ChevronLeft, 
  Check, 
  Layers, 
  Zap, 
  Users, 
  DollarSign, 
  Barcode, 
  Calendar, 
  Percent, 
  RefreshCw, 
  ClipboardList, 
  PackageOpen, 
  Bike, 
  Calculator, 
  FileText, 
  Clock, 
  Repeat, 
  Award, 
  CircleDollarSign, 
  Activity, 
  GitCommit, 
  ArrowRightLeft, 
  Grid, 
  Target, 
  FileCheck, 
  MapPin, 
  TrendingUp, 
  Database, 
  BarChart3, 
  Flame, 
  Network, 
  Hammer, 
  RefreshCcw, 
  HeartHandshake, 
  CheckSquare, 
  CheckCircle, 
  ShieldAlert, 
  GitBranch, 
  Smile, 
  Eye, 
  FlameKindling
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Button } from '../components/ui';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onCancel: () => void;
}

export interface OnboardingData {
  businessType: string;
  need: string;
  process: string;
  experience: string;
  goal: string;
}

// Predefined business types
const BUSINESS_TYPES = [
  { id: 'varejo', label: 'Varejo (Moda & Lojas)', desc: 'Roupas, calçados, acessórios e presentes', icon: ShoppingBag, color: 'from-pink-500 to-rose-500' },
  { id: 'mercadinho', label: 'Mercadinho & Mercearia', desc: 'Alimentos, hortifruti, padaria e uso diário', icon: ShoppingCart, color: 'from-amber-500 to-orange-500' },
  { id: 'restaurante', label: 'Restaurante & Delivery', desc: 'Lanchonetes, cafés, bares e entrega de comida', icon: Utensils, color: 'from-red-500 to-orange-600' },
  { id: 'servicos', label: 'Prestação de Serviços', desc: 'Assistência técnica, consultoria e reparos', icon: Wrench, color: 'from-blue-500 to-indigo-500' },
  { id: 'industria', label: 'Indústria & Confecção', desc: 'Produção de produtos e fabricação própria', icon: Factory, color: 'from-purple-500 to-violet-500' },
  { id: 'distribuidora', label: 'Distribuidora & Atacado', desc: 'Venda em volumes, logística e revenda', icon: Truck, color: 'from-teal-500 to-emerald-500' },
  { id: 'beleza', label: 'Salão & Estética', desc: 'Cabeleireiros, manicures, SPA e bem-estar', icon: Sparkles, color: 'from-cyan-500 to-blue-500' },
  { id: 'ecommerce', label: 'E-commerce & Digital', desc: 'Lojas virtuais e vendas online', icon: Globe, color: 'from-violet-500 to-fuchsia-500' },
  { id: 'outro', label: 'Outro Negócio', desc: 'Qualquer outro nicho ou segmento de negócio', icon: HelpCircle, color: 'from-slate-500 to-slate-700' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<OnboardingData>({
    businessType: '',
    need: '',
    process: '',
    experience: '',
    goal: '',
  });

  const [customBusinessName, setCustomBusinessName] = useState('');
  const [customNeedName, setCustomNeedName] = useState('');
  const [customProcessName, setCustomProcessName] = useState('');
  const [customExperienceName, setCustomExperienceName] = useState('');
  const [customGoalName, setCustomGoalName] = useState('');

  const [isFinishing, setIsFinishing] = useState(false);
  const [finishingTicks, setFinishingTicks] = useState<string[]>([]);
  const [currentTickIndex, setCurrentTickIndex] = useState(0);

  // Setup simulation ticks
  const ticksList = [
    'Analisando suas respostas estratégicas...',
    `Moldando a interface para o segmento de ${BUSINESS_TYPES.find(b => b.id === selections.businessType)?.label || selections.businessType || 'Negócios'}...`,
    'Otimizando widgets do painel financeiro e de vendas...',
    'Ajustando menus e atalhos rápidos do PDV...',
    'Criando rotas personalizadas e guias práticos...',
    'Pronto! Seu ERP sob medida está preparado.'
  ];

  // Dynamically branch needs based on business type selection
  const getNeedsOptions = () => {
    const type = selections.businessType;
    switch (type) {
      case 'varejo':
      case 'ecommerce':
        return [
          { id: 'grade', label: 'Controlar estoque por tamanho/cor', desc: 'Gerencie grades de produtos detalhadas', icon: Layers },
          { id: 'pdv_rapido', label: 'Vender rápido no balcão/PDV', desc: 'Fechamento de caixa ágil e sem filas', icon: Zap },
          { id: 'crm', label: 'Fidelizar clientes e histórico', desc: 'Saiba quem compra e com qual frequência', icon: Users },
          { id: 'financeiro', label: 'Organizar contas a pagar e receber', desc: 'Fluxo de caixa claro e sem surpresas', icon: DollarSign },
        ];
      case 'mercadinho':
        return [
          { id: 'barcode', label: 'Leitura rápida de código de barras', desc: 'Agilidade máxima no registro de itens', icon: Barcode },
          { id: 'validade', label: 'Controlar validade de lotes', desc: 'Evite prejuízos com produtos vencidos', icon: Calendar },
          { id: 'margem', label: 'Cálculo de margens e precificação', desc: 'Defina preços corretos e controle o lucro', icon: Percent },
          { id: 'reposicao', label: 'Reposição de fornecedores', desc: 'Gere listas de compras inteligentes', icon: RefreshCw },
        ];
      case 'restaurante':
        return [
          { id: 'comandas', label: 'Controlar mesas e comandas', desc: 'Evite erros nos pedidos dos clientes', icon: ClipboardList },
          { id: 'ingredientes', label: 'Estoque de insumos/ingredientes', desc: 'Baixa automática na produção de pratos', icon: PackageOpen },
          { id: 'delivery', label: 'Integrar vendas de delivery', desc: 'Controle de motoboys e taxas de entrega', icon: Bike },
          { id: 'caixa_diario', label: 'Fechamento de caixa diário', desc: 'Conferência de cartões, PIX e dinheiro', icon: Calculator },
        ];
      case 'servicos':
      case 'beleza':
        return [
          { id: 'os', label: 'Emitir Ordens de Serviço (OS)', desc: 'Documente laudos, peças e serviços', icon: FileText },
          { id: 'agenda', label: 'Agendar horários e profissionais', desc: 'Evite conflito de horários de clientes', icon: Clock },
          { id: 'recorrencia', label: 'Cobrar mensalidades/recorrência', desc: 'Ideal para planos e contratos mensais', icon: Repeat },
          { id: 'comissao', label: 'Comissão de profissionais', desc: 'Cálculo automatizado do ganho da equipe', icon: Award },
        ];
      case 'industria':
        return [
          { id: 'custo_producao', label: 'Calcular o custo real de produção', desc: 'Saiba quanto custa cada item fabricado', icon: CircleDollarSign },
          { id: 'materia_prima', label: 'Controlar matéria-prima', desc: 'Estoque e reposição de insumos industriais', icon: Activity },
          { id: 'fases', label: 'Mapear fases/etapas produtivas', desc: 'Acompanhe o status do lote na fábrica', icon: GitCommit },
          { id: 'os_producao', label: 'Vendas integradas com produção', desc: 'Gere ordens de produção automaticamente', icon: ArrowRightLeft },
        ];
      case 'distribuidora':
        return [
          { id: 'atacado_preco', label: 'Venda fracionada e atacado', desc: 'Preços dinâmicos por volume de compra', icon: Grid },
          { id: 'vendedores', label: 'Gerenciar comissões externas', desc: 'Para representantes e vendedores de rua', icon: Target },
          { id: 'nfe_lote', label: 'Emitir Notas Fiscais em lote', desc: 'Faturamento rápido de pedidos integrados', icon: FileCheck },
          { id: 'rotas', label: 'Logística de entrega e rotas', desc: 'Organize o carregamento por região', icon: MapPin },
        ];
      default:
        return [
          { id: 'financeiro_simples', label: 'Controlar entradas e saídas', desc: 'Registro prático de receitas e despesas', icon: TrendingUp },
          { id: 'estoque_fisico', label: 'Organizar estoque físico', desc: 'Evite furos de estoque na empresa', icon: Database },
          { id: 'clientes_forn', label: 'Cadastrar clientes e fornecedores', desc: 'Agenda unificada de contatos comerciais', icon: Users },
          { id: 'relatorios_vendas', label: 'Relatórios de vendas práticos', desc: 'Gráficos simples de faturamento', icon: BarChart3 },
        ];
    }
  };

  // Dynamically branch production process based on business type selection
  const getProcessOptions = () => {
    const type = selections.businessType;
    if (['varejo', 'mercadinho', 'ecommerce'].includes(type)) {
      return [
        { id: 'revenda_simples', label: 'Compro pronto ➔ Estoco ➔ Vendo', desc: 'Modelo clássico de comércio e varejo', icon: ArrowRight },
        { id: 'consignado', label: 'Consigno produtos ➔ Vendo ➔ Pago', desc: 'Estoque de terceiros com acerto posterior', icon: RefreshCw },
        { id: 'encomenda', label: 'Recebo encomenda ➔ Compro/Entrego', desc: 'Sem estoque fixo, focado sob demanda', icon: HeartHandshake },
      ];
    }
    if (type === 'restaurante') {
      return [
        { id: 'pedido_cozinha', label: 'Pedido ➔ Cozinho na hora ➔ Sirvo', desc: 'Alimentação rápida ou à la carte', icon: Flame },
        { id: 'buffet', label: 'Preparo buffet ➔ Sirvo no balcão', desc: 'Comida por quilo ou preço fixo diário', icon: Layers },
        { id: 'centralizada', label: 'Cozinha Central ➔ Envio para filiais', desc: 'Produção em lote com distribuição posterior', icon: Network },
      ];
    }
    if (['servicos', 'beleza'].includes(type)) {
      return [
        { id: 'agenda_executa', label: 'Agendo ➔ Executo serviço ➔ Cobro', desc: 'Salões, clínicas e atendimentos agendados', icon: Calendar },
        { id: 'orcamento_aprova', label: 'Orçamento ➔ Executo ➔ Fatura', desc: 'Assistências, reformas e serviços técnicos', icon: FileCheck },
        { id: 'mensalidade', label: 'Contrato recorrente ➔ Presto serviços', desc: 'Consultorias, contabilidade e planos mensais', icon: Repeat },
      ];
    }
    if (type === 'industria') {
      return [
        { id: 'compra_produz', label: 'Insumos ➔ Ficha Técnica ➔ Produzo ➔ Vendo', desc: 'Fabricação própria baseada em receitas', icon: Hammer },
        { id: 'industrializo_cliente', label: 'Recebo insumos ➔ Beneficio ➔ Devolvo', desc: 'Facção ou prestação de serviço industrial', icon: RefreshCcw },
        { id: 'producao_sob_medida', label: 'Produzo sob encomenda exclusiva', desc: 'Móveis planejados, confecção sob medida', icon: HeartHandshake },
      ];
    }
    if (type === 'distribuidora') {
      return [
        { id: 'recebo_distribuo', label: 'Carga chega ➔ Estoco ➔ Distribuo', desc: 'Armazenamento tradicional de atacado', icon: Layers },
        { id: 'pedido_separo', label: 'Vendedor vende ➔ Separo ➔ Despacho', desc: 'Fluxo dinâmico de equipe de vendas externas', icon: CheckSquare },
        { id: 'crossdocking', label: 'Produto entra ➔ Roteirizo ➔ Despacho', desc: 'Sem estoque parado, movimentação direta', icon: Zap },
      ];
    }
    return [
      { id: 'simples_pdv', label: 'Cadastro produto ➔ Vendo ➔ Recebo', desc: 'O fluxo mais direto e simples possível', icon: CheckCircle },
      { id: 'misto_etapas', label: 'Misto: Envolve estoque, compras e equipe', desc: 'Processo mais complexo com várias pessoas', icon: HelpCircle },
    ];
  };

  const experienceOptions = [
    { id: 'iniciante', label: 'Estou começando agora', desc: 'Nunca usei um ERP, quero simplicidade máxima', mascotText: 'Sem problemas! O ERP Pra Você foi feito exatamente para ser descomplicado. Vamos deixar tudo bem simples!' },
    { id: 'intermediario', label: 'Já usei planilhas', desc: 'Quero migrar meus dados e ter mais controle profissional', mascotText: 'Excelente! Chega de planilhas confusas e fórmulas que quebram. Você vai amar a organização!' },
    { id: 'avancado', label: 'Já usei outros ERPs', desc: 'Procuro agilidade, automação e recursos completos', mascotText: 'Perfeito! Você vai ver como o Varejoflow é rápido, intuitivo e completo para a sua escala de operação.' }
  ];

  const goalOptions = [
    { id: 'faturamento', label: 'Aumentar o faturamento', desc: 'Vender mais e com melhores margens', icon: TrendingUp },
    { id: 'organizacao', label: 'Organizar finanças', desc: 'Parar de perder dinheiro por falta de controle', icon: ShieldAlert },
    { id: 'tempo', label: 'Economizar tempo na operação', desc: 'Automatizar tarefas repetitivas do dia a dia', icon: Zap },
    { id: 'expansao', label: 'Expandir o negócio', desc: 'Abrir novas filiais ou aumentar a equipe', icon: GitBranch }
  ];

  // Handle choice selection
  const handleSelect = (key: keyof OnboardingData, value: string) => {
    setSelections(prev => ({ ...prev, [key]: value }));
    if (key === 'businessType') setCustomBusinessName('');
    if (key === 'need') setCustomNeedName('');
    if (key === 'process') setCustomProcessName('');
    if (key === 'experience') setCustomExperienceName('');
    if (key === 'goal') setCustomGoalName('');
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      startFinishing();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      onCancel();
    }
  };

  const handleSkip = () => {
    // Fill in placeholders if skipped
    const currentKey = getCurrentStepKey();
    let defaultValue = 'skipped';
    
    if (currentKey === 'businessType') {
      defaultValue = 'outro';
    } else if (currentKey === 'need') {
      defaultValue = getNeedsOptions()[0]?.id || 'financeiro_simples';
    } else if (currentKey === 'process') {
      defaultValue = getProcessOptions()[0]?.id || 'simples_pdv';
    } else if (currentKey === 'experience') {
      defaultValue = 'intermediario';
    } else if (currentKey === 'goal') {
      defaultValue = 'organizacao';
    }

    setSelections(prev => ({ ...prev, [currentKey]: defaultValue }));
    
    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      startFinishing();
    }
  };

  const getCurrentStepKey = (): keyof OnboardingData => {
    switch (step) {
      case 1: return 'businessType';
      case 2: return 'need';
      case 3: return 'process';
      case 4: return 'experience';
      case 5: return 'goal';
      default: return 'businessType';
    }
  };

  const startFinishing = () => {
    setIsFinishing(true);
    setFinishingTicks([]);
    let currentIdx = 0;
    
    const interval = setInterval(() => {
      if (currentIdx < ticksList.length) {
        setFinishingTicks(prev => [...prev, ticksList[currentIdx]]);
        currentIdx++;
        setCurrentTickIndex(currentIdx);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete(selections);
        }, 1200);
      }
    }, 900);
  };

  const isNextDisabled = () => {
    const currentKey = getCurrentStepKey();
    const value = selections[currentKey];
    if (!value || !value.trim()) return true;
    if (currentKey === 'businessType' && value === 'outro' && !customBusinessName.trim()) {
      return true;
    }
    return false;
  };

  // Get current robot mascot SVG based on step and selection
  const getRobotMascot = () => {
    const isDark = document.documentElement.classList.contains('dark');
    
    // Choose mascot face expression
    let expression = 'happy';
    if (step === 2 || step === 3) expression = 'thinking';
    if (selections[getCurrentStepKey()]) expression = 'excited';
    if (isFinishing) expression = 'celebrating';

    // Choose mascot hat
    let hat = null;
    if (selections.businessType === 'restaurante') hat = 'chef';
    if (['servicos', 'industria'].includes(selections.businessType)) hat = 'builder';

    return (
      <svg viewBox="0 0 140 140" className="w-28 h-28 drop-shadow-xl animate-bounce duration-[3000ms] ease-in-out">
        {/* Robot Head */}
        <rect x="25" y="45" width="90" height="70" rx="20" fill={isDark ? '#1e293b' : '#f1f5f9'} stroke="#3b82f6" strokeWidth="6" />
        
        {/* Neck */}
        <rect x="60" y="112" width="20" height="15" rx="4" fill="#3b82f6" />
        
        {/* Ears/Antennas */}
        <circle cx="20" cy="80" r="8" fill="#3b82f6" />
        <circle cx="120" cy="80" r="8" fill="#3b82f6" />
        <rect x="65" y="25" width="10" height="20" rx="3" fill="#3b82f6" />
        <circle cx="70" cy="22" r="6" fill="#ffb300" className="animate-pulse" />

        {/* Eyes Panel */}
        <rect x="38" y="58" width="64" height="28" rx="8" fill="#0f172a" />

        {/* Dynamic Eyes Expression */}
        {expression === 'happy' && (
          <>
            <path d="M 46 72 Q 52 64 58 72" stroke="#00ffcc" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 82 72 Q 88 64 94 72" stroke="#00ffcc" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        )}
        {expression === 'thinking' && (
          <>
            <ellipse cx="52" cy="72" rx="5" ry="5" fill="#ffb300" />
            <ellipse cx="88" cy="72" rx="5" ry="5" fill="#ffb300" />
            {/* Eye brows */}
            <path d="M 45 62 L 57 65" stroke="#ffb300" strokeWidth="3" strokeLinecap="round" />
            <path d="M 95 62 L 83 65" stroke="#ffb300" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        {expression === 'excited' && (
          <>
            {/* Star Eyes */}
            <path d="M 52 64 L 54 69 L 59 69 L 55 72 L 57 77 L 52 74 L 47 77 L 49 72 L 45 69 L 50 69 Z" fill="#00ffcc" />
            <path d="M 88 64 L 90 69 L 95 69 L 91 72 L 93 77 L 88 74 L 83 77 L 85 72 L 81 69 L 86 69 Z" fill="#00ffcc" />
          </>
        )}
        {expression === 'celebrating' && (
          <>
            <path d="M 45 74 Q 52 68 59 74" stroke="#00ffcc" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 81 74 Q 88 68 95 74" stroke="#00ffcc" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Blushing */}
            <circle cx="43" cy="80" r="4" fill="#ef4444" opacity="0.6" />
            <circle cx="97" cy="80" r="4" fill="#ef4444" opacity="0.6" />
          </>
        )}

        {/* Mouth */}
        {expression === 'thinking' ? (
          <line x1="60" y1="94" x2="80" y2="94" stroke={isDark ? '#f1f5f9' : '#1e293b'} strokeWidth="4" strokeLinecap="round" />
        ) : (
          <path d="M 60 92 Q 70 102 80 92" stroke={isDark ? '#f1f5f9' : '#1e293b'} strokeWidth="4" strokeLinecap="round" fill="none" />
        )}

        {/* Chef Hat */}
        {hat === 'chef' && (
          <g>
            <path d="M 45 46 L 95 46 L 95 38 Q 105 25 85 22 Q 70 8 55 22 Q 35 25 45 38 Z" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
            <rect x="52" y="38" width="36" height="8" fill="#e2e8f0" rx="2" />
          </g>
        )}

        {/* Builder Hat */}
        {hat === 'builder' && (
          <path d="M 40 45 Q 70 15 100 45 Z M 35 44 L 105 44 Q 105 48 35 48 Z" fill="#ffb300" stroke="#b45309" strokeWidth="3" />
        )}
      </svg>
    );
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Qual é o seu negócio?';
      case 2: return 'Qual sua maior necessidade hoje?';
      case 3: return 'Seu processo produtivo da forma que você vê:';
      case 4: return 'Seu nível de experiência com sistemas:';
      case 5: return 'Qual a sua principal meta nos próximos 3 meses?';
      default: return '';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return 'Selecione a categoria que melhor define a sua empresa para adaptarmos o sistema.';
      case 2: return 'Isso prioriza os widgets e relatórios mais importantes no seu painel principal.';
      case 3: return 'Mapeamos o fluxo de trabalho para que as etapas do ERP fiquem naturais para você.';
      case 4: return 'Nos ajuda a calibrar a densidade de informações e atalhos na tela.';
      case 5: return 'Vamos colocar um indicador de acompanhamento dessa meta no topo do seu painel.';
      default: return '';
    }
  };

  // Motivational coach bubble text
  const getBubbleText = () => {
    if (selections[getCurrentStepKey()]) {
      if (step === 1) return `Excelente! ${BUSINESS_TYPES.find(b => b.id === selections.businessType)?.label} é um ótimo mercado. Vamos customizar para ele!`;
      if (step === 2) return 'Fantástico! Essa necessidade é muito comum. Já sei qual painel te atende melhor.';
      if (step === 3) return 'Entendido! Esse fluxo de processo ajuda a simplificar o estoque.';
      if (step === 4) return experienceOptions.find(o => o.id === selections.experience)?.mascotText || 'Ótima resposta! Faremos o melhor para você.';
      if (step === 5) return 'Perfeito! Vamos focar em atingir esse objetivo estratégico juntos!';
    }
    
    switch (step) {
      case 1: return 'Olá! Eu sou o Flowey. Vou te ajudar a configurar seu ERP em menos de 1 minuto! Qual é a sua área?';
      case 2: return 'Agora me conta: qual dor ou necessidade tira o seu sono hoje na gestão?';
      case 3: return 'Como as coisas acontecem na prática? Do estoque à venda, me conte seu processo.';
      case 4: return 'Qual o seu nível de intimidade com softwares de gestão ou planilhas?';
      case 5: return 'Por fim, qual o seu principal objetivo estratégico para o trimestre?';
      default: return 'Vamos lá!';
    }
  };

  if (isFinishing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-lg text-center space-y-8 animate-in fade-in duration-500 relative z-10">
          <div className="flex justify-center">
            {getRobotMascot()}
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Personalizando seu ERP...
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Aguarde enquanto desenhamos sua experiência sob medida.
            </p>
          </div>

          <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-xl text-left space-y-3">
            <div className="space-y-2">
              {ticksList.map((tick, idx) => {
                const isDone = currentTickIndex > idx;
                const isCurrent = currentTickIndex === idx;
                
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 text-sm font-semibold transition-all duration-300 ${
                      isDone 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : isCurrent 
                          ? 'text-blue-600 dark:text-blue-400 font-black scale-[1.02] translate-x-1' 
                          : 'text-slate-300 dark:text-slate-700'
                    }`}
                  >
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Check size={12} className="stroke-[3px]" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-800 shrink-0" />
                    )}
                    <span className="truncate">{tick}</span>
                  </div>
                );
              })}
            </div>
          </Card>
          
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-300 shadow-md"
              style={{ width: `${(currentTickIndex / ticksList.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
      
      {/* Top Header & Progress Bar */}
      <header className="w-full max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all"
            title="Voltar"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex-1 max-w-md mx-6">
            <div className="relative w-full bg-slate-200 dark:bg-slate-800 h-4 rounded-full overflow-hidden shadow-inner border border-slate-100 dark:border-slate-900">
              <div 
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
              >
                <div className="absolute top-0.5 left-0 right-0 h-1 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSkip}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors uppercase tracking-widest px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"
          >
            Pular
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center gap-8 min-h-0">
        
        {/* Mascot & Coach Speech Bubble */}
        <div className="w-full flex items-center justify-center gap-6 max-w-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
          <div className="shrink-0">
            {getRobotMascot()}
          </div>
          <div className="relative flex-1 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/20 dark:border-slate-700/20">
            {/* Speech Bubble Tail */}
            <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-r-[10px] border-r-slate-100 dark:border-r-slate-800 border-b-[10px] border-b-transparent" />
            <p className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
              {getBubbleText()}
            </p>
          </div>
        </div>

        {/* Active Step Question */}
        <div className="text-center w-full">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {getStepTitle()}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto font-medium">
            {getStepSubtitle()}
          </p>
        </div>

        {/* Wizard Question Body */}
        <div className="w-full min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {step === 1 && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {BUSINESS_TYPES.map((item) => {
                      const Icon = item.icon;
                      const isSelected = selections.businessType === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect('businessType', item.id)}
                          className={`group relative text-left bg-white dark:bg-slate-900/50 backdrop-blur-xl border-2 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50/10 dark:bg-blue-500/5 shadow-lg shadow-blue-500/10' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/30'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon size={20} />
                          </div>
                          <div className="mt-4">
                            <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight">{item.label}</h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 line-clamp-2 leading-tight">{item.desc}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm">
                              <Check size={12} className="stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 max-w-md mx-auto space-y-2 text-left">
                    <div className="flex items-center gap-2 text-slate-200 dark:text-slate-800">
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ou escreva seu ramo personalizado</span>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                    </div>
                    <input
                      type="text"
                      value={customBusinessName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomBusinessName(val);
                        handleSelect('businessType', val);
                      }}
                      placeholder="Ex: Petshop, Clínica Veterinária, Tabacaria..."
                      className="w-full h-12 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:border-violet-500 focus:ring-0 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {getNeedsOptions().map((item) => {
                      const Icon = item.icon;
                      const isSelected = selections.need === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect('need', item.id)}
                          className={`group relative text-left bg-white dark:bg-slate-900/50 backdrop-blur-xl border-2 p-6 rounded-2xl transition-all duration-300 flex items-start gap-4 hover:-translate-y-1 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50/10 dark:bg-blue-500/5 shadow-lg shadow-blue-500/10' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/30'
                          }`}
                        >
                          <div className={`p-3 rounded-xl ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} group-hover:scale-110 transition-transform shrink-0`}>
                            <Icon size={20} />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{item.label}</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold leading-snug">{item.desc}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm">
                              <Check size={12} className="stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 space-y-2 text-left">
                    <div className="flex items-center gap-2 text-slate-200 dark:text-slate-800">
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ou escreva sua necessidade personalizada</span>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                    </div>
                    <input
                      type="text"
                      value={customNeedName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomNeedName(val);
                        handleSelect('need', val);
                      }}
                      placeholder="Ex: Controlar prazos e cobranças automáticas por email..."
                      className="w-full h-12 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:border-violet-500 focus:ring-0 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="grid sm:grid-cols-3 gap-4">
                    {getProcessOptions().map((item) => {
                      const Icon = item.icon;
                      const isSelected = selections.process === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect('process', item.id)}
                          className={`group relative text-left bg-white dark:bg-slate-900/50 backdrop-blur-xl border-2 p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50/10 dark:bg-blue-500/5 shadow-lg shadow-blue-500/10' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/30'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} flex items-center justify-center shrink-0`}>
                            <Icon size={20} />
                          </div>
                          <div className="mt-4">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{item.label}</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 leading-snug">{item.desc}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm">
                              <Check size={12} className="stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 space-y-2 text-left">
                    <div className="flex items-center gap-2 text-slate-200 dark:text-slate-800">
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ou descreva seu processo personalizado</span>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                    </div>
                    <input
                      type="text"
                      value={customProcessName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomProcessName(val);
                        handleSelect('process', val);
                      }}
                      placeholder="Ex: Produzo em lotes mensais e vendo consignado para lojas parceiras..."
                      className="w-full h-12 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:border-violet-500 focus:ring-0 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="space-y-4">
                    {experienceOptions.map((item) => {
                      const isSelected = selections.experience === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect('experience', item.id)}
                          className={`group w-full relative text-left bg-white dark:bg-slate-900/50 backdrop-blur-xl border-2 p-5 rounded-2xl transition-all duration-300 flex items-center justify-between hover:translate-x-1 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50/10 dark:bg-blue-500/5 shadow-lg shadow-blue-500/10' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/30'
                          }`}
                        >
                          <div className="space-y-1">
                            <h3 className="font-black text-sm text-slate-900 dark:text-white">{item.label}</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{item.desc}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                            {isSelected && <Check size={12} className="stroke-[3px]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 space-y-2 text-left">
                    <div className="flex items-center gap-2 text-slate-200 dark:text-slate-800">
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ou descreva sua experiência personalizada</span>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                    </div>
                    <input
                      type="text"
                      value={customExperienceName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomExperienceName(val);
                        handleSelect('experience', val);
                      }}
                      placeholder="Ex: Tenho facilidade com tecnologia, mas prefiro telas limpas..."
                      className="w-full h-12 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:border-violet-500 focus:ring-0 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {goalOptions.map((item) => {
                      const Icon = item.icon;
                      const isSelected = selections.goal === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect('goal', item.id)}
                          className={`group relative text-left bg-white dark:bg-slate-900/50 backdrop-blur-xl border-2 p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50/10 dark:bg-blue-500/5 shadow-lg shadow-blue-500/10' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/30'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} flex items-center justify-center shrink-0`}>
                            <Icon size={20} />
                          </div>
                          <div className="mt-4">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{item.label}</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 leading-snug">{item.desc}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm">
                              <Check size={12} className="stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 space-y-2 text-left">
                    <div className="flex items-center gap-2 text-slate-200 dark:text-slate-800">
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ou descreva sua meta personalizada</span>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                    </div>
                    <input
                      type="text"
                      value={customGoalName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomGoalName(val);
                        handleSelect('goal', val);
                      }}
                      placeholder="Ex: Organizar todo o estoque da nova filial..."
                      className="w-full h-12 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:border-violet-500 focus:ring-0 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Footer Actions (Duolingo Style Sticky Footer) */}
      <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-6 md:py-8 px-6 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="font-bold text-slate-500 hover:text-slate-950 dark:hover:text-white uppercase tracking-widest px-6"
          >
            {step === 1 ? 'Sair' : 'Voltar'}
          </Button>

          <Button 
            disabled={isNextDisabled()}
            onClick={handleNext}
            className={`px-8 py-3 rounded-2xl text-base font-black uppercase tracking-widest transition-all duration-300 shadow-md ${
              isNextDisabled()
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:translate-y-0.5'
            }`}
          >
            {step === 5 ? (
              <span className="flex items-center gap-2">Finalizar <Sparkles size={16} /></span>
            ) : (
              <span className="flex items-center gap-2">Continuar <ArrowRight size={16} /></span>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
};
