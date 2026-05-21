/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { UserRoleSelection } from './components/UserRoleSelection';
import { saveClientOnboarding } from './lib/clientOnboardingRepository';
import { createClientAppProfileFromOnboarding, isModuleVisibleForClient, resolveClientFeatures } from './lib/featureCustomizationRepository';
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

const ModuleLoading = () => (
  <div className="flex min-h-[320px] items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
    Carregando...
  </div>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ email: 'admin@erppravoce.com.br', password: 'admin' });
  const [userRole, setUserRole] = useState<'admin' | 'client' | 'business' | 'onboarding' | null>(null);
  const [clientFeatures, setClientFeatures] = useState<ResolvedFeature[] | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientAppProfile | null>(null);
  const { theme, toggleTheme } = useTheme();

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

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard />;
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
        return <Dashboard />;
    }
  };

  if (!userRole) {
    return <UserRoleSelection onSelect={(role) => {
      setUserRole(role);
      setCurrentModule(role === 'business' ? 'business_vision' : 'dashboard');
      setIsAuthenticated(true);
    }} />;
  }

  if (userRole === 'onboarding') {
    return (
      <Suspense fallback={<ModuleLoading />}>
        <Onboarding 
          onComplete={async (data) => {
            localStorage.setItem('varejoflow_onboarding', JSON.stringify(data));
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
            <div className="flex justify-center mb-6">
              <svg viewBox="0 0 120 120" className="w-20 h-20 drop-shadow-xl transition-transform hover:scale-105 duration-500 mx-auto">
                <path d="M 60 60 L 95 25" stroke="#ffb300" strokeWidth="26" strokeLinecap="round" />
                <path d="M 25 95 L 60 60" stroke="#003882" strokeWidth="26" strokeLinecap="round" />
                <rect x="80" y="10" width="30" height="30" rx="6" fill="#ffb300" />
                <rect x="45" y="45" width="30" height="30" rx="6" fill="#00A0F0" />
                <rect x="10" y="80" width="30" height="30" rx="6" fill="#003882" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
              <span className="text-[#003882] dark:text-[#458af0]">ERP</span> <span className="text-[#003882] dark:text-[#458af0] font-medium">pra Você</span>
            </h3>
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
      onNavigate={setCurrentModule} 
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
