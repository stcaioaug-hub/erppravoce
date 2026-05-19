/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const overviewKpis = {
  initialInvestment: 'R$ 2.000-8.000',
  monthlyCost: 'R$ 610-4.200',
  breakEvenClients: '8-15 clientes',
  suggestedTicket: 'R$ 197',
  projectedMrr: 'R$ 4.925',
  currentPhase: 'Beta controlado',
  validationGoal: '10 clientes a R$ 97+',
  tractionGoal: '25 clientes a R$ 197',
};

export const revenueEvolution = [
  { month: 'M1', clients: 3, revenue: 291 },
  { month: 'M2', clients: 6, revenue: 582 },
  { month: 'M3', clients: 10, revenue: 970 },
  { month: 'M4', clients: 15, revenue: 2955 },
  { month: 'M5', clients: 20, revenue: 3940 },
  { month: 'M6', clients: 25, revenue: 4925 },
  { month: 'M9', clients: 50, revenue: 9850 },
  { month: 'M12', clients: 100, revenue: 19700 },
];

export const implementationPhases = [
  {
    phase: 'Protótipo local',
    clients: '0-1 cliente teste',
    stack: 'Ambiente local, GitHub, dados mockados ou Supabase free',
    monthlyCost: 'R$ 0-80',
    monthlyCostValue: 80,
    objective: 'Validar navegação, telas essenciais e demonstração inicial.',
    decision: 'Avançar quando o fluxo principal estiver demonstrável.',
    status: 'Atual',
    risk: 'Validar problema real antes de investir em escala.',
  },
  {
    phase: 'Beta controlado',
    clients: '1-5 clientes',
    stack: 'Vercel Pro ou Render, Supabase/PostgreSQL, domínio e e-mail',
    monthlyCost: 'R$ 250-450',
    monthlyCostValue: 450,
    objective: 'Testar uso real com clientes próximos e suporte manual.',
    decision: 'Avançar com 3-5 clientes usando semanalmente.',
    status: 'Próximo',
    risk: 'Suporte alto e feedback disperso.',
  },
  {
    phase: 'MVP comercial',
    clients: '6-25 clientes',
    stack: 'Deploy profissional, backups, monitoramento e onboarding',
    monthlyCost: 'R$ 450-1.200',
    monthlyCostValue: 1200,
    objective: 'Fechar clientes pagantes com proposta clara.',
    decision: 'Avançar ao atingir 25 clientes e MRR perto de R$ 4.925.',
    status: 'Planejado',
    risk: 'Escopo crescer mais rápido que a operação.',
  },
  {
    phase: 'Tração regional',
    clients: '26-100 clientes',
    stack: 'Infra escalável, observabilidade, suporte e processos comerciais',
    monthlyCost: 'R$ 1.200-4.000',
    monthlyCostValue: 4000,
    objective: 'Consolidar aquisição regional e canais recorrentes.',
    decision: 'Avançar com churn controlado e margem positiva.',
    status: 'Futuro',
    risk: 'Custo de aquisição subir sem previsibilidade.',
  },
  {
    phase: 'Escala nacional',
    clients: '100+ clientes',
    stack: 'Alta disponibilidade, segurança, automações e time especializado',
    monthlyCost: 'R$ 4.000+',
    monthlyCostValue: 6500,
    objective: 'Operar em escala com atendimento, vendas e produto maduros.',
    decision: 'Expandir com unit economics saudáveis.',
    status: 'Futuro',
    risk: 'Complexidade operacional e compliance.',
  },
];

export const businessPlan = [
  { title: 'Problema', body: 'Pequenos comerciantes controlam estoque, vendas e financeiro em planilhas, cadernos ou sistemas complexos demais.' },
  { title: 'Solução', body: 'Um ERP simples, acessível e assistido para centralizar operação comercial em uma experiência direta.' },
  { title: 'Público-alvo', body: 'Mercadinhos, lojas, prestadores locais, distribuidoras pequenas e negócios familiares em fase de profissionalização.' },
  { title: 'Proposta de valor', body: 'Menos retrabalho, mais clareza de caixa, estoque confiável e decisões rápidas no dia a dia.' },
  { title: 'Diferenciais', body: 'Implantação próxima, linguagem simples, preço progressivo e foco em comércio local.' },
  { title: 'Modelo de receita', body: 'Assinatura mensal por plano, com opção premium assistida e serviços de implantação.' },
  { title: 'Estratégia inicial', body: 'Clientes fundadores, entrevistas, pilotos pagos, indicação local e página de vendas objetiva.' },
  { title: 'Riscos', body: 'Baixa disposição de pagamento, suporte intensivo, concorrência de ERPs baratos e escopo amplo.' },
  { title: 'Próximos passos', body: 'Validar 10 comerciantes, fechar pilotos, medir uso semanal e ajustar preço antes de escalar.' },
];

export const productModules = [
  ['Dashboard', 'Indicadores de vendas, estoque e financeiro em tempo real.', 'Em uso', 'Alta', 'Decisão rápida', 'MVP'],
  ['Produtos', 'Cadastro, preços, categorias e códigos.', 'Em uso', 'Alta', 'Organização comercial', 'MVP'],
  ['Clientes', 'Cadastro, histórico e relacionamento.', 'Em uso', 'Alta', 'Venda recorrente', 'MVP'],
  ['Estoque', 'Entradas, saídas, mínimos e alertas.', 'Em uso', 'Alta', 'Menos ruptura', 'MVP'],
  ['Vendas', 'Registro de pedidos e controle comercial.', 'Em uso', 'Alta', 'Receita rastreável', 'MVP'],
  ['Financeiro', 'Contas a pagar, receber e fluxo de caixa.', 'Em uso', 'Alta', 'Clareza de caixa', 'MVP'],
  ['Relatórios', 'Análises gerenciais e exportações.', 'Admin', 'Média', 'Gestão por dados', 'Beta'],
  ['Permissões', 'Controle por perfil de acesso.', 'Parcial', 'Alta', 'Segurança operacional', 'Beta'],
  ['Usuários', 'Gestão de operadores e administradores.', 'Parcial', 'Média', 'Governança', 'Beta'],
  ['Alertas', 'Avisos de estoque, financeiro e operação.', 'Planejado', 'Média', 'Ação preventiva', 'Tração'],
].map(([name, description, status, priority, benefit, deliveryPhase]) => ({ name, description, status, priority, benefit, deliveryPhase }));

export const salesFunnelSteps = [
  'Leads mapeados',
  'Contatos feitos',
  'Reuniões',
  'Diagnóstico',
  'Demonstração',
  'Proposta',
  'Teste',
  'Fechamento',
  'Implantação',
  'Cliente recorrente',
];

export const infrastructureCosts = [
  { item: 'Frontend/deploy', lean: 0, professional: 120, scalable: 250 },
  { item: 'Banco de dados', lean: 0, professional: 150, scalable: 600 },
  { item: 'Autenticação', lean: 0, professional: 0, scalable: 200 },
  { item: 'GitHub', lean: 0, professional: 25, scalable: 100 },
  { item: 'Domínio', lean: 5, professional: 5, scalable: 10 },
  { item: 'E-mail transacional', lean: 0, professional: 80, scalable: 250 },
  { item: 'Observabilidade', lean: 0, professional: 80, scalable: 400 },
  { item: 'Backups', lean: 30, professional: 120, scalable: 500 },
  { item: 'Segurança', lean: 0, professional: 100, scalable: 700 },
  { item: 'Marketing', lean: 150, professional: 600, scalable: 1800 },
  { item: 'Jurídico', lean: 80, professional: 250, scalable: 800 },
  { item: 'Contador', lean: 150, professional: 350, scalable: 900 },
  { item: 'Suporte', lean: 150, professional: 700, scalable: 2200 },
  { item: 'Ferramentas de IA', lean: 45, professional: 180, scalable: 600 },
];

export const pricingPlans = [
  { name: 'Fundador/Beta', price: 'R$ 49-79/mês', focus: 'Primeiros clientes e feedback intenso' },
  { name: 'Essencial', price: 'R$ 97-149/mês', focus: 'Operação básica de vendas, estoque e clientes' },
  { name: 'Profissional', price: 'R$ 197-249/mês', focus: 'Financeiro, relatórios e gestão completa' },
  { name: 'Premium/Assistido', price: 'R$ 349-499/mês', focus: 'Implantação, suporte próximo e acompanhamento' },
];

export const swot = [
  { type: 'Forças', items: ['Produto próximo da dor local', 'Preço acessível', 'Time com visão operacional'] },
  { type: 'Fraquezas', items: ['Marca nova', 'Suporte ainda manual', 'Poucos cases iniciais'] },
  { type: 'Oportunidades', items: ['Comércio local digitalizando gestão', 'Clientes cansados de planilhas', 'Venda consultiva regional'] },
  { type: 'Ameaças', items: ['ERPs consolidados', 'Sensibilidade a preço', 'Mudanças fiscais e LGPD'] },
];

export const partners = [
  { name: 'Caio A.', role: 'Produto e tecnologia', responsibilities: 'Arquitetura, produto, integrações e evolução técnica.', share: 34, area: 'Produto', notes: 'Responsável por priorização técnica e qualidade.' },
  { name: 'João Paulo', role: 'Comercial e operação', responsibilities: 'Prospecção, relacionamento, implantação e feedback de campo.', share: 33, area: 'Vendas', notes: 'Responsável por cadência comercial e sucesso inicial.' },
  { name: 'João Tosi', role: 'Estratégia e gestão', responsibilities: 'Financeiro, processos, contratos e indicadores do negócio.', share: 33, area: 'Gestão', notes: 'Responsável por governança e planejamento.' },
];

export const scenarioPresets = {
  Conservador: { clients: 10, ticket: 97, fixedCost: 1450, initialInvestment: 8000, growth: 4, churn: 4, tax: 6, variableCost: 12 },
  Realista: { clients: 25, ticket: 197, fixedCost: 3000, initialInvestment: 6000, growth: 8, churn: 3, tax: 8, variableCost: 18 },
  Agressivo: { clients: 60, ticket: 249, fixedCost: 5200, initialInvestment: 12000, growth: 14, churn: 2, tax: 10, variableCost: 25 },
  Personalizado: { clients: 25, ticket: 197, fixedCost: 3000, initialInvestment: 6000, growth: 8, churn: 3, tax: 8, variableCost: 18 },
};
