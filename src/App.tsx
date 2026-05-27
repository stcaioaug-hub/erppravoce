/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { UserRoleSelection } from './components/UserRoleSelection';
import { saveClientOnboarding } from './lib/clientOnboardingRepository';
import { createClientAppProfileFromOnboarding, isModuleVisibleForClient, resolveClientFeatures } from './lib/featureCustomizationRepository';
import { Logo } from './components/Logo';
import { LogIn, Moon, Sun } from 'lucide-react';
import { Button, Input, Card } from './components/ui';
import { useTheme } from './contexts/ThemeContext';
import { ClientAppProfile, ResolvedFeature } from './types';

const Dashboard = lazy(() => import('./modules/Dashboard').then((module) => ({ default: module.Dashboard })));
const PDV = lazy(() => import('./modules/PDV').then((module) => ({ default: module.PDV })));
const Products = lazy(() => import('./modules/Products').then((module) => ({ default: module.Products })));
const Sales = lazy(() => import('./modules/Sales').then((module) => ({ default: module.Sales })));
const Financial = lazy(() => import('./modules/Financial').then((module) => ({ default: module.Financial })));
const Customers = lazy(() => import('./modules/Customers').then((module) => ({ default: module.Customers })));
const Suppliers = lazy(() => import('./modules/Suppliers').then((module) => ({ default: module.Suppliers })));
const Stock = lazy(() => import('./modules/Stock').then((module) => ({ default: module.Stock })));
const Purchases = lazy(() => import('./modules/Purchases').then((module) => ({ default: module.Purchases })));
const Reports = lazy(() => import('./modules/Reports').then((module) => ({ default: module.Reports })));
const Settings = lazy(() => import('./modules/Settings').then((module) => ({ default: module.Settings })));
const Tributary = lazy(() => import('./modules/Tributary').then((module) => ({ default: module.Tributary })));
const Storage = lazy(() => import('./modules/Storage').then((module) => ({ default: module.Storage })));
const BusinessVision = lazy(() => import('./modules/BusinessVision').then((module) => ({ default: module.BusinessVision })));
const Onboarding = lazy(() => import('./modules/Onboarding').then((module) => ({ default: module.Onboarding })));
const OnboardingInsights = lazy(() => import('./modules/OnboardingInsights').then((module) => ({ default: module.OnboardingInsights })));
const ClientTypesAdmin = lazy(() => import('./modules/ClientTypesAdmin').then((module) => ({ default: module.ClientTypesAdmin })));
const FeatureExplorer = lazy(() => import('./modules/FeatureExplorer').then((module) => ({ default: module.FeatureExplorer })));
const Cabeleireiro = lazy(() => import('./modules/Cabeleireiro').then((module) => ({ default: module.Cabeleireiro })));
const ClienteAgendamento = lazy(() => import('./modules/ClienteAgendamento').then((module) => ({ default: module.ClienteAgendamento })));

const ModuleLoading = () => (
  <div className="flex min-h-[320px] items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
    Carregando...
  </div>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [studioFinishAppointmentId, setStudioFinishAppointmentId] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ email: 'admin@erppravoce.com.br', password: 'admin' });
  const [userRole, setUserRole] = useState<'admin' | 'client' | 'business' | 'onboarding' | 'hairdresser' | null>(null);
  const [clientFeatures, setClientFeatures] = useState<ResolvedFeature[] | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientAppProfile | null>(null);
  const [isClientBookingMode, setIsClientBookingMode] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'agendar-cliente') {
      setIsClientBookingMode(true);
    }
  }, []);

  const loadClientFeatureState = useCallback(async () => {
    if (userRole !== 'client') {
      setClientFeatures(null);
      setClientProfile(null);
      return;
    }

    try {
      const result = await resolveClientFeatures();
      setClientFeatures(result.features);
      setClientProfile(result.profile);
    } catch (error) {
      console.error('Erro ao carregar features do cliente:', error);
      setClientFeatures([]);
      setClientProfile(null);
    }
  }, [userRole]);

  useEffect(() => {
    loadClientFeatureState();
  }, [loadClientFeatureState]);

  useEffect(() => {
    if (userRole !== 'client' || !clientFeatures) return;
    if (!isModuleVisibleForClient(currentModule, clientFeatures)) {
      setCurrentModule('dashboard');
    }
  }, [clientFeatures, currentModule, userRole]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  const openStudioSection = (section: 'agenda' | 'clientes' | 'simulador' | 'finalizar', appointmentId?: string) => {
    const studioModules = {
      agenda: 'cabeleireiro',
      clientes: 'cabeleireiro_clientes',
      simulador: 'cabeleireiro_simulador',
      finalizar: 'cabeleireiro_finalizar',
    };

    setStudioFinishAppointmentId(section === 'finalizar' ? appointmentId ?? null : null);
    setCurrentModule(studioModules[section]);
  };

  const handleNavigate = (module: string) => {
    if (module !== 'cabeleireiro_finalizar') {
      setStudioFinishAppointmentId(null);
    }
    if (userRole === 'hairdresser') {
      if (module === 'clientes') {
        setCurrentModule('cabeleireiro_clientes');
        return;
      }
      if (module === 'finalizar') {
        setCurrentModule('cabeleireiro_finalizar');
        return;
      }
      if (module === 'cabeleireiro') {
        setCurrentModule('cabeleireiro');
        return;
      }
    }
    setCurrentModule(module);
  };

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'cabeleireiro':
        return <Cabeleireiro section="agenda" onSectionChange={openStudioSection} />;
      case 'cabeleireiro_clientes':
        return <Cabeleireiro section="clientes" onSectionChange={openStudioSection} />;
      case 'cabeleireiro_simulador':
        return <Cabeleireiro section="simulador" onSectionChange={openStudioSection} />;
      case 'cabeleireiro_finalizar':
        return (
          <Cabeleireiro
            section="finalizar"
            onSectionChange={openStudioSection}
            finishAppointmentId={studioFinishAppointmentId}
            onFinishAppointmentConsumed={() => setStudioFinishAppointmentId(null)}
          />
        );
      case 'pdv':
        return <PDV />;
      case 'produtos':
        return <Products />;
      case 'vendas':
        return <Sales />;
      case 'financeiro':
        return <Financial />;
      case 'clientes':
        return <Customers />;
      case 'fornecedores':
        return <Suppliers />;
      case 'estoque':
        return <Stock />;
      case 'compras':
        return <Purchases />;
      case 'relatorios':
        return <Reports />;
      case 'onboarding_insights':
        return <OnboardingInsights />;
      case 'client_types':
        return <ClientTypesAdmin />;
      case 'feature_explorer':
        return <FeatureExplorer onChanged={loadClientFeatureState} />;
      case 'tributario':
        return <Tributary />;
      case 'armazenamento':
        return <Storage />;
      case 'business_vision':
        return <BusinessVision />;
      case 'configuracoes':
        return <Settings />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  if (isClientBookingMode) {
    return (
      <Suspense fallback={<ModuleLoading />}>
        <ClienteAgendamento />
      </Suspense>
    );
  }

  if (!userRole) {
    return <UserRoleSelection onSelect={(role) => {
      setUserRole(role);
      setCurrentModule(role === 'business' ? 'business_vision' : role === 'hairdresser' ? 'cabeleireiro' : 'dashboard');
      setIsAuthenticated(true);
    }} />;
  }

  if (userRole === 'onboarding') {
    return (
      <Suspense fallback={<ModuleLoading />}>
        <Onboarding 
          onComplete={async (data) => {
            localStorage.setItem('easyone_onboarding', JSON.stringify(data));
            let onboardingId: string | null = null;
            try {
              onboardingId = await saveClientOnboarding(data);
            } catch (e) {
              console.error('Erro ao salvar onboarding no Supabase:', e);
            }
            try {
              await createClientAppProfileFromOnboarding(data, onboardingId);
            } catch (e) {
              console.error('Erro ao criar perfil de app customizado:', e);
            }
            setUserRole('client');
            setCurrentModule('dashboard');
            setIsAuthenticated(true);
          }}
          onCancel={() => {
            setUserRole(null);
          }}
        />
      </Suspense>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative transition-colors duration-300">
        {/* Theme Toggle Button */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-lg transition-all"
            title={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
          >
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </button>
        </div>

        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500 relative z-10">
          <div className="text-center">
            <Logo artwork size="xl" className="mx-auto mb-2 transition-transform hover:scale-105 duration-500" />
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium transition-colors">Gestão profissional para o seu negócio</p>
          </div>

          <Card className="p-8 shadow-xl border-none bg-white dark:bg-slate-900 transition-colors">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 transition-colors">E-mail</label>
                <Input 
                  type="email" 
                  value={loginForm.email} 
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 transition-colors">Senha</label>
                <Input 
                  type="password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="h-12 rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 dark:shadow-none">
                Acessar Sistema <LogIn size={20} className="ml-2" />
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center transition-colors">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest transition-colors">
                Modo Demonstração
              </p>
            </div>
          </Card>
          
          <p className="text-center text-slate-400 dark:text-slate-500 text-sm transition-colors">
            Powered by TechFlow Solutions
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout 
      currentModule={currentModule} 
      onNavigate={handleNavigate} 
      userRole={userRole}
      clientFeatures={clientFeatures}
      clientProfile={clientProfile}
      onLogout={() => {
        setIsAuthenticated(false);
        setUserRole(null);
      }}
    >
      <Suspense fallback={<ModuleLoading />}>
        {renderModule()}
      </Suspense>
    </AppLayout>
  );
}
