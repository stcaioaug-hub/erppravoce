-- Feature customization: catalog, 8 initial client archetypes, defaults and per-client overrides.

create table if not exists public.app_features (
  id text primary key,
  title text not null,
  description text not null default '',
  category text not null default 'Geral',
  module_id text,
  icon_name text not null default 'Activity',
  is_customer_visible boolean not null default true,
  is_future boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_type_archetypes (
  id text primary key,
  label text not null,
  short_label text not null,
  subtitle text not null default '',
  description text not null default '',
  preview_title text not null default '',
  preview_subtitle text not null default '',
  icon_name text not null default 'Activity',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_type_feature_defaults (
  client_type_id text not null references public.client_type_archetypes(id) on delete cascade,
  feature_id text not null references public.app_features(id) on delete cascade,
  enabled boolean not null default false,
  optional boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (client_type_id, feature_id)
);

create table if not exists public.client_app_profiles (
  id text primary key default gen_random_uuid()::text,
  onboarding_id text references public.client_onboarding(id) on delete set null,
  client_name text not null default '',
  company_name text not null default '',
  business_type text not null references public.client_type_archetypes(id),
  access_mode text not null default 'limited' check (access_mode in ('limited', 'full', 'locked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_feature_overrides (
  profile_id text not null references public.client_app_profiles(id) on delete cascade,
  feature_id text not null references public.app_features(id) on delete cascade,
  enabled boolean not null default false,
  source text not null default 'client' check (source in ('client', 'admin')),
  updated_at timestamptz not null default now(),
  primary key (profile_id, feature_id)
);

alter table public.app_features enable row level security;
alter table public.client_type_archetypes enable row level security;
alter table public.client_type_feature_defaults enable row level security;
alter table public.client_app_profiles enable row level security;
alter table public.client_feature_overrides enable row level security;

drop policy if exists "App users can manage app features" on public.app_features;
drop policy if exists "App users can manage client type archetypes" on public.client_type_archetypes;
drop policy if exists "App users can manage client type defaults" on public.client_type_feature_defaults;
drop policy if exists "App users can manage client app profiles" on public.client_app_profiles;
drop policy if exists "App users can manage client feature overrides" on public.client_feature_overrides;

create policy "App users can manage app features" on public.app_features for all to anon, authenticated using (true) with check (true);
create policy "App users can manage client type archetypes" on public.client_type_archetypes for all to anon, authenticated using (true) with check (true);
create policy "App users can manage client type defaults" on public.client_type_feature_defaults for all to anon, authenticated using (true) with check (true);
create policy "App users can manage client app profiles" on public.client_app_profiles for all to anon, authenticated using (true) with check (true);
create policy "App users can manage client feature overrides" on public.client_feature_overrides for all to anon, authenticated using (true) with check (true);

insert into public.app_features (id, title, description, category, module_id, icon_name, is_customer_visible, is_future)
values
  ('pdv', 'Caixa / PDV', 'Aba operacional para vender, cobrar e registrar pedidos rapidamente.', 'Abas principais', 'pdv', 'Monitor', true, false),
  ('vendas', 'Vendas', 'Historico de vendas, pedidos e acompanhamento comercial.', 'Abas principais', 'vendas', 'ShoppingCart', true, false),
  ('compras', 'Compras', 'Controle de compras, entrada de produtos e pedidos para fornecedores.', 'Abas principais', 'compras', 'ShoppingBag', true, false),
  ('produtos', 'Produtos', 'Catalogo de produtos, itens, servicos e precificacao.', 'Abas principais', 'produtos', 'Package', true, false),
  ('estoque', 'Estoque', 'Movimentacao, saldo fisico, alertas e reposicao.', 'Abas principais', 'estoque', 'ArrowRightLeft', true, false),
  ('financeiro', 'Financeiro', 'Contas, fluxo de caixa, recebimentos e despesas.', 'Abas principais', 'financeiro', 'Wallet', true, false),
  ('tributario', 'Tributario', 'Configuracoes fiscais, impostos e organizacao tributaria.', 'Abas principais', 'tributario', 'Receipt', true, false),
  ('clientes', 'Clientes', 'Carteira, contatos, historico e relacionamento com consumidores.', 'Abas principais', 'clientes', 'Users', true, false),
  ('fornecedores', 'Fornecedores', 'Cadastro e relacionamento com fornecedores e parceiros.', 'Abas principais', 'fornecedores', 'Truck', true, false),
  ('relatorios', 'Relatorios', 'Graficos, indicadores e analises do negocio.', 'Abas principais', 'relatorios', 'BarChart3', true, false),
  ('armazenamento', 'Armazenamento', 'Controle de uso, arquivos e limites da conta.', 'Abas principais', 'armazenamento', 'HardDrive', true, false),
  ('grade_produtos', 'Grade de produtos', 'Variacoes por tamanho, cor e combinacoes de SKU.', 'Operacao especializada', null, 'Layers', true, true),
  ('crm_fidelidade', 'CRM e fidelidade', 'Historico, segmentacao, recompra e relacionamento com clientes.', 'Crescimento', null, 'HeartHandshake', true, true),
  ('canais_digitais', 'Canais digitais', 'Venda assistida por WhatsApp, Instagram e catalogo digital.', 'Crescimento', null, 'Globe', true, true),
  ('codigo_barras', 'Codigo de barras', 'Leitura rapida no caixa e organizacao por codigos.', 'Operacao especializada', null, 'Barcode', true, true),
  ('validade_lotes', 'Validade e lotes', 'Controle de vencimento, lote e perdas de produtos.', 'Operacao especializada', null, 'Calendar', true, true),
  ('reposicao_fornecedores', 'Reposicao inteligente', 'Sugestoes de compras e reposicao por giro de estoque.', 'Automacao', null, 'RefreshCw', true, true),
  ('comandas_mesas', 'Mesas e comandas', 'Controle visual de mesas, comandas e atendimento no salao.', 'Operacao especializada', null, 'ClipboardList', true, true),
  ('delivery', 'Delivery', 'Pedidos, entregas, motoboys e taxas de entrega.', 'Operacao especializada', null, 'Bike', true, true),
  ('cozinha', 'Painel de cozinha', 'Fila de preparo, status de pedidos e insumos criticos.', 'Operacao especializada', null, 'Flame', true, true),
  ('agenda', 'Agenda', 'Horarios, profissionais, clientes e disponibilidade.', 'Operacao especializada', null, 'Clock', true, true),
  ('ordens_servico', 'Ordens de servico', 'OS, laudos, orcamentos e execucao de servicos.', 'Operacao especializada', null, 'FileText', true, true),
  ('recorrencia', 'Recorrencia', 'Planos, contratos, mensalidades e cobrancas recorrentes.', 'Automacao', null, 'Repeat', true, true),
  ('comissoes', 'Comissoes', 'Comissao por profissional, vendedor, servico ou venda.', 'Automacao', null, 'Award', true, true),
  ('producao_pcp', 'Producao / PCP', 'Ordens de producao, etapas, insumos e acompanhamento fabril.', 'Operacao especializada', null, 'Factory', true, true),
  ('ficha_tecnica', 'Ficha tecnica', 'Receitas, composicao de produto, custo real e baixa de insumos.', 'Operacao especializada', null, 'ClipboardList', true, true),
  ('rotas_entrega', 'Rotas de entrega', 'Roteirizacao, separacao de pedidos e carregamento por regiao.', 'Operacao especializada', null, 'MapPin', true, true),
  ('ecommerce_integracoes', 'Integracoes e-commerce', 'Sincronizacao futura com marketplaces, loja virtual e canais externos.', 'Integracoes', null, 'PlugZap', true, true)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  module_id = excluded.module_id,
  icon_name = excluded.icon_name,
  is_customer_visible = excluded.is_customer_visible,
  is_future = excluded.is_future,
  updated_at = now();

insert into public.client_type_archetypes (id, label, short_label, subtitle, description, preview_title, preview_subtitle, icon_name)
values
  ('varejo', 'Varejo (Moda & Lojas)', 'Varejo', 'Loja fisica, moda, calcados e presentes', 'Modelo focado em PDV, giro de grade, canais digitais e relacionamento com clientes.', 'App de Varejo & Moda', 'PDV rapido, grade de produtos, estoque e relacionamento comercial.', 'ShoppingBag'),
  ('mercadinho', 'Mercadinho & Mercearia', 'Mercado', 'Frente de caixa, validade e reposicao', 'Modelo para alto volume de itens, leitura por codigo de barras e compras recorrentes.', 'App de Mercadinho', 'Caixa agil, controle de validade, compras e estoque sempre visiveis.', 'ShoppingCart'),
  ('restaurante', 'Restaurante & Delivery', 'Restaurante', 'Comandas, cozinha e pedidos', 'Modelo para comandas, delivery, insumos e acompanhamento de pedidos em preparo.', 'App de Alimentacao', 'Comandas, pedidos, delivery, insumos e fechamento de caixa diario.', 'Utensils'),
  ('servicos', 'Prestacao de Servicos', 'Servicos', 'Agenda, OS, contratos e recorrencia', 'Modelo para prestadores, professores, assistencias, consultorias e operacoes sob demanda.', 'App de Servicos', 'Clientes, agenda, ordens de servico, cobrancas e recorrencia.', 'Wrench'),
  ('industria', 'Industria & Confeccao', 'Industria', 'Producao, insumos e etapas', 'Modelo para fabricacao propria, fichas tecnicas, materia-prima e etapas produtivas.', 'App Industrial', 'Produtos, compras, insumos, producao e visao financeira integrada.', 'Factory'),
  ('distribuidora', 'Distribuidora & Atacado', 'Distribuidora', 'Atacado, vendedores e rotas', 'Modelo para pedidos externos, carteira de clientes, estoque, atacado e logistica.', 'App de Distribuidora', 'Vendas externas, estoque, compras, clientes e rotas de entrega.', 'Truck'),
  ('beleza', 'Salao & Estetica', 'Beleza', 'Agenda, comissoes e clientes', 'Modelo para saloes, clinicas, estetica, profissionais, produtos e agenda diaria.', 'App de Beleza & Estetica', 'Agenda, atendimento, comissoes, clientes e produtos de apoio.', 'Sparkles'),
  ('ecommerce', 'E-commerce & Digital', 'E-commerce', 'Produtos, estoque e canais online', 'Modelo para vendas digitais, catalogo, estoque, clientes e integracoes futuras.', 'App de E-commerce', 'Catalogo, pedidos, estoque, clientes, relatorios e integracoes.', 'Globe')
on conflict (id) do update set
  label = excluded.label,
  short_label = excluded.short_label,
  subtitle = excluded.subtitle,
  description = excluded.description,
  preview_title = excluded.preview_title,
  preview_subtitle = excluded.preview_subtitle,
  icon_name = excluded.icon_name,
  updated_at = now();

with default_seed(client_type_id, enabled_features, optional_features) as (
  values
    ('varejo', array['pdv','vendas','produtos','estoque','clientes','financeiro','relatorios','grade_produtos','crm_fidelidade','canais_digitais'], array['compras','fornecedores','tributario','armazenamento','ecommerce_integracoes']),
    ('mercadinho', array['pdv','vendas','produtos','estoque','compras','fornecedores','financeiro','tributario','codigo_barras','validade_lotes','reposicao_fornecedores'], array['clientes','relatorios','armazenamento','crm_fidelidade']),
    ('restaurante', array['pdv','vendas','produtos','estoque','financeiro','clientes','comandas_mesas','delivery','cozinha'], array['compras','fornecedores','relatorios','tributario','armazenamento','reposicao_fornecedores']),
    ('servicos', array['vendas','clientes','financeiro','relatorios','agenda','ordens_servico','recorrencia'], array['pdv','produtos','estoque','compras','fornecedores','tributario','armazenamento','comissoes']),
    ('industria', array['produtos','estoque','compras','fornecedores','vendas','financeiro','producao_pcp','ficha_tecnica'], array['pdv','clientes','relatorios','tributario','armazenamento','reposicao_fornecedores']),
    ('distribuidora', array['vendas','produtos','estoque','compras','fornecedores','clientes','financeiro','rotas_entrega'], array['pdv','relatorios','tributario','armazenamento','comissoes','codigo_barras']),
    ('beleza', array['pdv','vendas','clientes','financeiro','produtos','agenda','comissoes','crm_fidelidade'], array['estoque','compras','fornecedores','relatorios','tributario','armazenamento','recorrencia']),
    ('ecommerce', array['vendas','produtos','estoque','clientes','financeiro','relatorios','canais_digitais','ecommerce_integracoes'], array['pdv','compras','fornecedores','tributario','armazenamento','codigo_barras','reposicao_fornecedores'])
)
insert into public.client_type_feature_defaults (client_type_id, feature_id, enabled, optional)
select
  default_seed.client_type_id,
  app_features.id,
  app_features.id = any(default_seed.enabled_features),
  app_features.id = any(default_seed.optional_features)
from default_seed
cross join public.app_features
on conflict (client_type_id, feature_id) do nothing;
