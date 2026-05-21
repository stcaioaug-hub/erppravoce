import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  Unlock,
} from 'lucide-react';
import { Badge, Button, Card, PageHeader } from '../components/ui';
import { getArchetype } from '../data/featureCustomization';
import {
  resolveClientFeatures,
  updateClientFeatureOverride,
} from '../lib/featureCustomizationRepository';
import { getFeatureIcon } from '../lib/featureIcons';
import { cn } from '../lib/utils';
import { ClientAppProfile, ClientFeatureAccessMode, ResolvedFeature } from '../types';

const accessModeCopy: Record<ClientFeatureAccessMode, { label: string; desc: string; icon: any; variant: 'info' | 'success' | 'warning' }> = {
  limited: {
    label: 'Acesso limitado',
    desc: 'O admin liberou escolhas opcionais para o seu perfil.',
    icon: ShieldCheck,
    variant: 'info',
  },
  full: {
    label: 'Acesso total',
    desc: 'O admin liberou todo o catalogo para exploracao.',
    icon: Unlock,
    variant: 'success',
  },
  locked: {
    label: 'Acesso bloqueado',
    desc: 'O admin travou alteracoes neste momento.',
    icon: Lock,
    variant: 'warning',
  },
};

interface FeatureExplorerProps {
  onChanged?: () => void;
}

export const FeatureExplorer: React.FC<FeatureExplorerProps> = ({ onChanged }) => {
  const [profile, setProfile] = useState<ClientAppProfile | null>(null);
  const [features, setFeatures] = useState<ResolvedFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingFeatureId, setSavingFeatureId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await resolveClientFeatures();
      setProfile(result.profile);
      setFeatures(result.features);
    } catch (err) {
      console.error(err);
      setError('Nao foi possivel carregar suas features.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const visibleFeatures = useMemo(() => {
    if (!profile) return [];
    return features.filter((item) => {
      if (!item.feature.isCustomerVisible) return false;
      if (profile.accessMode === 'full') return true;
      if (profile.accessMode === 'locked') return item.enabled;
      return item.enabled || item.optional;
    });
  }, [features, profile]);

  const categories = useMemo(() => {
    return ['todas', ...Array.from(new Set(visibleFeatures.map((item) => item.feature.category)))];
  }, [visibleFeatures]);

  const filteredFeatures = visibleFeatures.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.feature.title.toLowerCase().includes(term) ||
      item.feature.description.toLowerCase().includes(term) ||
      item.feature.category.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'todas' || item.feature.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const groupedFeatures = filteredFeatures.reduce<Record<string, ResolvedFeature[]>>((acc, item) => {
    acc[item.feature.category] = acc[item.feature.category] ?? [];
    acc[item.feature.category].push(item);
    return acc;
  }, {});

  const enabledCount = visibleFeatures.filter((item) => item.enabled).length;
  const availableCount = visibleFeatures.filter((item) => item.canClientToggle).length;
  const archetype = profile ? getArchetype(profile.businessType) : null;
  const access = profile ? accessModeCopy[profile.accessMode] : null;
  const AccessIcon = access?.icon ?? ShieldCheck;

  const toggleFeature = async (item: ResolvedFeature) => {
    if (!profile || !item.canClientToggle) return;
    const nextEnabled = !item.enabled;
    setSavingFeatureId(item.feature.id);
    const previous = features;
    setFeatures((current) => current.map((featureItem) => (
      featureItem.feature.id === item.feature.id
        ? { ...featureItem, enabled: nextEnabled, overridden: true }
        : featureItem
    )));

    try {
      await updateClientFeatureOverride(profile.id, item.feature.id, nextEnabled, 'client');
      await onChanged?.();
    } catch (err) {
      console.error(err);
      setFeatures(previous);
      alert('Erro ao salvar a feature.');
    } finally {
      setSavingFeatureId(null);
    }
  };

  if (!profile && !loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Explorar Features" subtitle="Seu perfil de app ainda nao foi criado." />
        <Card className="p-8 text-center">
          <Sparkles size={42} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Complete o onboarding para gerar seu app personalizado.</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Depois disso, suas features aparecem aqui conforme o perfil definido para sua empresa.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Explorar Features"
        subtitle={archetype ? `${archetype.label} - ${profile?.companyName || 'Sua empresa'}` : 'Carregando configuracao'}
        actions={
          <Button onClick={loadData} variant="outline" className="gap-2" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </Button>
        }
      />

      {error && (
        <Card className="p-4 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <p className="text-sm font-bold text-red-700 dark:text-red-300">{error}</p>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Features ativas</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{enabledCount}</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Recursos ligados no seu app</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Liberadas para escolha</span>
            <ToggleLeft size={18} className="text-blue-500" />
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{availableCount}</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Controladas por voce nesta fase</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Modo do admin</span>
            <AccessIcon size={18} className="text-violet-500" />
          </div>
          <div className="mt-4">
            {access && <Badge variant={access.variant}>{access.label}</Badge>}
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{access?.desc}</p>
          </div>
        </Card>
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Catalogo do seu app</h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Recursos ativos, opcionais e futuras expansoes liberadas para o seu perfil.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar feature..."
                className="h-10 w-full sm:w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category === 'todas' ? 'Todas categorias' : category}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="p-10 text-center text-slate-400">
          <RefreshCw size={28} className="mx-auto animate-spin text-blue-500 mb-3" />
          <p className="font-bold">Carregando features...</p>
        </Card>
      ) : Object.keys(groupedFeatures).length === 0 ? (
        <Card className="p-10 text-center text-slate-400">
          <p className="font-bold">Nenhuma feature encontrada com os filtros atuais.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedFeatures) as Array<[string, ResolvedFeature[]]>).map(([category, items]) => (
            <section key={category} className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{category}</h3>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((item) => {
                  const Icon = getFeatureIcon(item.feature.iconName);
                  const disabled = !item.canClientToggle || savingFeatureId === item.feature.id;

                  return (
                    <Card key={item.feature.id} className={cn(
                      'p-5 border transition-all',
                      item.enabled
                        ? 'border-emerald-200 dark:border-emerald-900/50'
                        : 'border-slate-100 dark:border-slate-800',
                    )}>
                      <div className="flex items-start justify-between gap-4">
                        <div className={cn(
                          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                          item.enabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                        )}>
                          <Icon size={20} />
                        </div>

                        <button
                          onClick={() => toggleFeature(item)}
                          disabled={disabled}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60',
                            item.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700',
                            item.canClientToggle && 'hover:ring-4 hover:ring-blue-500/10',
                          )}
                          title={item.canClientToggle ? 'Alternar feature' : 'Controle travado pelo admin'}
                        >
                          <span className={cn(
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                            item.enabled ? 'translate-x-5' : 'translate-x-1',
                          )} />
                        </button>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-black text-slate-900 dark:text-white">{item.feature.title}</h4>
                          {item.feature.isFuture && <Badge variant="info">Evolucao</Badge>}
                        </div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.feature.description}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant={item.enabled ? 'success' : 'default'}>
                          {item.enabled ? 'Ativa' : 'Inativa'}
                        </Badge>
                        {item.optional && <Badge variant="blue">Opcional</Badge>}
                        {item.overridden && <Badge variant="warning">Personalizada</Badge>}
                        {!item.canClientToggle && <Badge variant="default">Admin</Badge>}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
