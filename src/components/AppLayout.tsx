/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  Wallet, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Search,
  Bell,
  Monitor,
  ShoppingBag,
  ArrowRightLeft,
  Receipt,
  HardDrive,
  Sun,
  Moon,
  BriefcaseBusiness,
  Sparkles,
  SlidersHorizontal,
  Scissors,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { ClientAppProfile, ResolvedFeature } from '../types';
import { isModuleVisibleForClient } from '../lib/featureCustomizationRepository';
import { Logo } from './Logo';
import { StudioBrand } from './StudioBrand';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cabeleireiro', label: 'Cabeleireiro Piloto', icon: Scissors },
  { id: 'cabeleireiro_clientes', label: 'Clientes do Estúdio', icon: Users },
  { id: 'cabeleireiro_finalizar', label: 'Finalizar Serviço', icon: CreditCard },
  { id: 'pdv', label: 'Caixa / PDV', icon: Monitor },
  { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
  { id: 'compras', label: 'Compras', icon: ShoppingBag },
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'estoque', label: 'Estoque', icon: ArrowRightLeft },
  { id: 'financeiro', label: 'Financeiro', icon: Wallet },
  { id: 'tributario', label: 'Tributário', icon: Receipt },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'fornecedores', label: 'Fornecedores', icon: Truck },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { id: 'onboarding_insights', label: 'Respostas & Insights', icon: Sparkles },
  { id: 'client_types', label: 'Tipos de Clientes', icon: SlidersHorizontal },
  { id: 'feature_explorer', label: 'Explorar Features', icon: Sparkles },
  { id: 'armazenamento', label: 'Armazenamento', icon: HardDrive },
  { id: 'business_vision', label: 'Plano de Negócio', icon: BriefcaseBusiness },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

interface AppLayoutProps {
  currentModule: string;
  onNavigate: (module: string) => void;
  userRole: 'admin' | 'client' | 'business' | 'onboarding' | 'hairdresser' | null;
  clientFeatures?: ResolvedFeature[] | null;
  clientProfile?: ClientAppProfile | null;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentModule, onNavigate, userRole, clientFeatures = null, clientProfile = null, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Carregar dados de onboarding para adaptabilidade
  const onboardingData = (() => {
    try {
      const raw = localStorage.getItem('easyone_onboarding');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Erro ao processar dados de onboarding:', e);
      return null;
    }
  })();
  const businessType = clientProfile?.businessType || onboardingData?.businessType || '';

  const isMenuItemVisible = (item: typeof MENU_ITEMS[number]) => {
    if (item.id === 'onboarding_insights' || item.id === 'client_types') {
      return userRole === 'admin';
    }
    if (item.id === 'feature_explorer') {
      return userRole === 'client';
    }
    if (['cabeleireiro', 'cabeleireiro_clientes', 'cabeleireiro_finalizar'].includes(item.id)) {
      return userRole === 'hairdresser' || userRole === 'admin';
    }
    if (userRole === 'hairdresser') {
      return ['cabeleireiro', 'cabeleireiro_clientes', 'cabeleireiro_finalizar', 'financeiro', 'configuracoes'].includes(item.id);
    }
    if (userRole === 'client') {
      if (['business_vision'].includes(item.id)) return false;
      return isModuleVisibleForClient(item.id, clientFeatures);
    }
    return true;
  };

  const visibleMenuItems = MENU_ITEMS.filter(isMenuItemVisible);
  const pdvVisible = visibleMenuItems.some((item) => item.id === 'pdv');
  const isHairdresserView = userRole === 'hairdresser';
  const isImmersiveBusinessVision = currentModule === 'business_vision' && userRole !== 'admin';
  const isImmersiveStudioFinish = currentModule === 'cabeleireiro_finalizar' && isHairdresserView;
  const showMobileNavigation = !isImmersiveBusinessVision && !isImmersiveStudioFinish;

  const getCustomLabel = (id: string, defaultLabel: string) => {
    if (isHairdresserView) {
      if (id === 'cabeleireiro') return 'Agenda do Estúdio';
      if (id === 'cabeleireiro_clientes') return 'Clientes';
      if (id === 'cabeleireiro_finalizar') return 'Finalizar Serviço';
      if (id === 'financeiro') return 'Financeiro';
    }
    if (!businessType) return defaultLabel;

    if (id === 'produtos') {
      if (['servicos', 'beleza'].includes(businessType)) return 'Serviços & Prod.';
      if (businessType === 'restaurante') return 'Cardápio / Itens';
      return defaultLabel;
    }
    if (id === 'pdv') {
      if (['servicos', 'beleza'].includes(businessType)) return 'Agendar / PDV';
      if (businessType === 'restaurante') return 'Comandas / PDV';
      if (businessType === 'mercadinho') return 'Caixa / PDV Rápido';
      return defaultLabel;
    }
    if (id === 'estoque') {
      if (businessType === 'industria') return 'Mapear Insumos';
      return defaultLabel;
    }
    if (id === 'vendas') {
      if (businessType === 'distribuidora') return 'Atacado / Vendas';
      return defaultLabel;
    }
    if (id === 'clientes') {
      if (businessType === 'distribuidora') return 'Carteira de Clientes';
      return defaultLabel;
    }
    return defaultLabel;
  };

  const getBusinessTypeLabel = () => {
    switch (businessType) {
      case 'varejo': return 'Modo Varejo';
      case 'mercadinho': return 'Modo Mercado';
      case 'restaurante': return 'Modo Alimentação';
      case 'servicos': return 'Modo Serviços';
      case 'industria': return 'Modo Indústria';
      case 'distribuidora': return 'Modo Distribuidora';
      case 'beleza': return 'Modo Estética';
      case 'ecommerce': return 'Modo E-commerce';
      default: return 'Modo Customizado';
    }
  };

  const mobileMenuItems = isHairdresserView
    ? [
        { id: 'cabeleireiro', label: 'Agenda', icon: Scissors },
        { id: 'cabeleireiro_clientes', label: 'Clientes', icon: Users },
        { id: 'cabeleireiro_finalizar', label: 'Finalizar', icon: CreditCard },
        { id: 'financeiro', label: 'Financeiro', icon: Wallet },
      ]
    : [
        { id: 'pdv', label: 'PDV', icon: Monitor },
        { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
        { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
        { id: 'produtos', label: 'Produtos', icon: Package },
      ].filter((item) => item.id === 'dashboard' || visibleMenuItems.some((menuItem) => menuItem.id === item.id));

  return (
    <div className="h-dvh w-full bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300 overflow-hidden">
      {/* Sidebar - Desktop */}
      {!isImmersiveBusinessVision && !isImmersiveStudioFinish && (
        <aside className={cn(
          "hidden lg:flex flex-col text-slate-300 transition-all duration-300 ease-in-out z-30 fixed left-0 top-0 bottom-0",
          isHairdresserView ? "bg-[#21151d]" : "bg-slate-900",
          sidebarOpen ? "w-64" : "w-20"
        )}>
          <div className="p-6 flex items-center gap-3">
            {isHairdresserView ? (
              sidebarOpen ? (
                <StudioBrand inverse />
              ) : (
                <StudioBrand variant="mark" className="h-9 w-9" />
              )
            ) : (
              <Logo
                iconOnly={!sidebarOpen}
                subtitle={sidebarOpen && businessType ? getBusinessTypeLabel() : undefined}
                variant="sidebar"
              />
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id || 
                (item.id === 'cabeleireiro' && ['cabeleireiro', 'cabeleireiro_simulador'].includes(currentModule)) ||
                (item.id === 'cabeleireiro_clientes' && currentModule === 'cabeleireiro_clientes') ||
                (item.id === 'cabeleireiro_finalizar' && currentModule === 'cabeleireiro_finalizar');
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group",
                    isActive 
                      ? isHairdresserView
                        ? "border border-rose-400/20 bg-rose-500/15 text-rose-200"
                        : "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
                      : "hover:bg-slate-800 hover:text-white text-slate-400"
                  )}
                >
                  <Icon size={20} className={cn("shrink-0", isActive ? (isHairdresserView ? "text-rose-300" : "text-blue-400") : "text-slate-500 group-hover:text-slate-200")} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {getCustomLabel(item.id, item.label)}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={onLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors",
                !sidebarOpen && "justify-center px-0"
              )}
              title="Sair do Sistema"
            >
              <LogOut size={20} />
              {sidebarOpen && <span className="text-sm font-medium">Sair</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className={cn(
        "h-full flex-1 flex flex-col transition-all duration-300 min-w-0 overflow-hidden",
        isImmersiveBusinessVision || isImmersiveStudioFinish ? "lg:ml-0" : (sidebarOpen ? "lg:ml-64" : "lg:ml-20")
      )}>
        {/* Header */}
        {isImmersiveStudioFinish ? null : isImmersiveBusinessVision ? (
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <BriefcaseBusiness size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">Plano de Negócio</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Visão estratégica do EasyOne</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                title={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  Trocar visão
                </button>
              )}
            </div>
          </header>
        ) : (
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8 transition-colors duration-300">
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hidden lg:block transition-colors"
              >
                <Menu size={20} />
              </button>
              <button 
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menu de navegacao"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 lg:hidden transition-colors"
              >
                <Menu size={20} />
              </button>

              {isHairdresserView ? (
                <StudioBrand variant="mark" className="h-9 w-9 md:hidden" />
              ) : (
                <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 w-64 lg:w-[480px] border border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <Search size={16} className="text-slate-400 mr-2" />
                  <input 
                    type="text" 
                    disabled
                    aria-label="Pesquisa indisponivel"
                    title="Pesquisa em breve"
                    placeholder="Pesquisa em breve"
                    className="bg-transparent border-none outline-none text-sm w-full text-slate-500 dark:text-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 disabled:cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <button 
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                title={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <button
                type="button"
                disabled
                aria-label="Notificacoes indisponiveis"
                title="Notificacoes em breve"
                className="relative p-2 rounded-lg text-slate-400 dark:text-slate-500 cursor-not-allowed transition-colors"
              >
                <Bell size={20} />
              </button>

              {pdvVisible && (
                <button 
                  type="button"
                  onClick={() => onNavigate('pdv')}
                  aria-label="Iniciar nova venda"
                  className="hidden lg:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 shadow-sm transition-colors"
                >
                  <ShoppingCart size={16} />
                  Nova Venda
                </button>
              )}
            </div>
          </header>
        )}

        {/* Content */}
        <main className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden min-w-0",
          currentModule === 'business_vision' || isImmersiveStudioFinish ? "p-0" : "pt-4 px-4 lg:pt-8 lg:px-8 lg:pb-8",
          showMobileNavigation && "with-mobile-bottom-navigation"
        )}>
          {children}
        </main>
      </div>

      {/* Floating Action Button (Mobile) - Nova Venda */}
      {showMobileNavigation && currentModule !== 'pdv' && pdvVisible && (
        <div className="mobile-navigation-fab lg:hidden fixed right-4 z-[45]">
          <button 
            type="button"
            onClick={() => onNavigate('pdv')}
            aria-label="Iniciar nova venda"
            className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors shadow-blue-500/30"
            title="Nova Venda"
          >
            <ShoppingCart size={24} />
          </button>
        </div>
      )}

      {/* Bottom Navigation Bar - Mobile Only */}
      {showMobileNavigation && <nav aria-label="Navegacao principal" className="mobile-bottom-navigation lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 px-2 flex items-center justify-between transition-colors duration-300 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]">
        {[
          ...mobileMenuItems,
          { id: 'mais', label: 'Mais', icon: Menu, action: () => setMobileMenuOpen(true) },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = item.id === 'mais' 
            ? mobileMenuOpen 
            : (currentModule === item.id || 
               (item.id === 'cabeleireiro' && ['cabeleireiro', 'cabeleireiro_simulador'].includes(currentModule)) ||
               (item.id === 'cabeleireiro_clientes' && currentModule === 'cabeleireiro_clientes') ||
               (item.id === 'cabeleireiro_finalizar' && currentModule === 'cabeleireiro_finalizar'));
          const action = 'action' in item ? item.action : undefined;

          if (isHairdresserView && item.id === 'cabeleireiro_finalizar') {
            return (
              <button
                key={item.id}
                type="button"
                onClick={action ? action : () => onNavigate(item.id)}
                className={cn(
                  "relative -mt-6 w-14 h-14 bg-gradient-to-tr from-[#cc0a12] to-[#ff0b1a] text-white rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center border-4 border-white dark:border-slate-900 transition-all hover:scale-105 active:scale-95 z-55 shrink-0",
                  isActive && "from-[#e60e18] to-[#ff2b38] border-[#ff0b1a]"
                )}
                title="Finalizar Serviço"
              >
                <Icon size={24} className={cn("text-white", isActive ? "stroke-[2.5px]" : "")} />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={action ? action : () => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 my-1 rounded-xl transition-all min-w-[50px] flex-1",
                isActive 
                  ? isHairdresserView
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                    : "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon size={20} className={cn("mb-1", isActive ? "stroke-[2.5px]" : "")} />
              <span className="text-[10px] font-medium">{isHairdresserView ? item.label : getCustomLabel(item.id, item.label)}</span>
            </button>
          );
        })}
      </nav>}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu de navegacao"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.div 
            initial={{ x: -250 }} 
            animate={{ x: 0 }}
            className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 p-4 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                {isHairdresserView ? (
                  <StudioBrand inverse />
                ) : (
                  <Logo
                    subtitle={businessType ? getBusinessTypeLabel() : undefined}
                    variant="sidebar"
                  />
                )}
              </div>
              <button
                type="button"
                aria-label="Fechar menu de navegacao"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 p-2"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
              {visibleMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentModule === item.id || 
                  (item.id === 'cabeleireiro' && ['cabeleireiro', 'cabeleireiro_simulador'].includes(currentModule)) ||
                  (item.id === 'cabeleireiro_clientes' && currentModule === 'cabeleireiro_clientes') ||
                  (item.id === 'cabeleireiro_finalizar' && currentModule === 'cabeleireiro_finalizar');
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                      isActive
                        ? isHairdresserView ? "bg-rose-700 text-white" : "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{getCustomLabel(item.id, item.label)}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 mt-auto">
              <button 
                onClick={() => {
                  onLogout?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Sair do Sistema</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
