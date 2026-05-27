import React from 'react';
import { Building2, User, ArrowRight, ShieldCheck, Sun, Moon, BriefcaseBusiness, Sparkles, Scissors } from 'lucide-react';
import { Card } from './ui';
import { useTheme } from '../contexts/ThemeContext';
import { Logo } from './Logo';
import { StudioBrand } from './StudioBrand';

interface UserRoleSelectionProps {
  onSelect: (role: 'admin' | 'client' | 'business' | 'onboarding' | 'hairdresser') => void;
}

export const UserRoleSelection: React.FC<UserRoleSelectionProps> = ({ onSelect }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-x-hidden transition-colors duration-300">
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

      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-7xl animate-in fade-in zoom-in duration-700 relative z-10">
        <div className="text-center mb-12">
          <div className="mb-6">
            <Logo artwork size="xl" className="mx-auto transition-transform hover:scale-105 duration-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-500 dark:text-slate-400 tracking-tight mb-4 transition-colors">
            Bem-vindo
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto font-medium transition-colors">
            Selecione o seu perfil de acesso para continuarmos. A interface será adaptada para suas necessidades.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {/* Admin Card */}
          <button
            onClick={() => onSelect('admin')}
            className="group relative text-left bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={20} />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Building2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Visão do Administrador
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 transition-colors">
              Acesso total ao sistema com permissões específicas, abas de clientes, gerenciamento financeiro avançado, projeções e controle de limites.
            </p>
            <div className="flex items-center text-xs font-semibold text-blue-600 dark:text-blue-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mt-auto">
              Acessar como Administrador <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Client Card */}
          <button
            onClick={() => onSelect('client')}
            className="group relative text-left bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <User size={20} />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <User size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Visão do Cliente
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 transition-colors">
              Acesso focado na operação diária, PDV rápido, fluxo de caixa simplificado, controle de estoque básico e limite de armazenamento padrão.
            </p>
            <div className="flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors mt-auto">
              Acessar como Cliente <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Business Plan Card */}
          <button
            onClick={() => onSelect('business')}
            className="group relative text-left bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BriefcaseBusiness size={20} />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <BriefcaseBusiness size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Plano de Negócio
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 transition-colors">
              Visão estratégica separada do ERP operacional para planejar investimentos, mapear concorrentes, estruturar fluxo e planejar sociedade.
            </p>
            <div className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors mt-auto">
              Acessar plano estratégico <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Onboarding Card */}
          <button
            onClick={() => onSelect('onboarding')}
            className="group relative text-left bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-800/80 hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-violet-500/10 text-violet-500 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-6 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              Onboarding do Cliente
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 transition-colors">
              Fórmula de configuração rápida Duolingo. Responda sobre seu negócio para que todo o app se adapte às suas reais necessidades.
            </p>
            <div className="flex items-center text-xs font-semibold text-violet-600 dark:text-violet-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors mt-auto">
              Iniciar Onboarding Rápido <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Hairdresser Card */}
          <button
            onClick={() => onSelect('hairdresser')}
            className="group relative text-left bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-800/80 hover:border-rose-500/50 dark:hover:border-rose-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Scissors size={20} />
            </div>
            <StudioBrand variant="mark" className="mb-6 h-14 w-14 transition-transform duration-300 group-hover:scale-105" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              Leandro Della Riva
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 transition-colors">
              Estúdio de beleza. Gerencie a agenda de clientes do dia e acompanhe as projeções de faturamento semanal e mensal.
            </p>
            <div className="flex items-center text-xs font-semibold text-rose-600 dark:text-rose-500 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors mt-auto">
              Acessar painel do estúdio <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
      
      <p className="mt-10 pb-4 text-center text-slate-500 dark:text-slate-500 text-sm font-medium">
        Powered by TechFlow Solutions
      </p>
    </div>
  );
};
