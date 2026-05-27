import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Unlock,
} from 'lucide-react';
import { Badge, Button, Card, Modal, PageHeader } from '../components/ui';
import {
  APP_FEATURES,
  CLIENT_TYPE_ARCHETYPES,
  getArchetype,
} from '../data/featureCustomization';
import {
  fetchClientAppProfiles,
  fetchClientTypeFeatureDefaults,
  updateClientAppProfileAccessMode,
  updateClientTypeFeatureDefault,
} from '../lib/featureCustomizationRepository';
import { getFeatureIcon } from '../lib/featureIcons';
import { cn } from '../lib/utils';
import {
  ClientAppProfile,
  ClientFeatureAccessMode,
  ClientTypeFeatureDefault,
  ClientTypeId,
} from '../types';

const accessModeLabels: Record<ClientFeatureAccessMode, { label: string; desc: string; icon: any }> = {
  limited: {
    label: 'Limitado',
    desc: 'Cliente altera apenas features opcionais do perfil.',
    icon: ShieldCheck,
  },
  full: {
    label: 'Total',
    desc: 'Cliente pode explorar todo o catalogo de features.',
    icon: Unlock,
  },
  locked: {
    label: 'Bloqueado',
    desc: 'Cliente visualiza o app, mas nao altera features.',
    icon: Lock,
  },
};

const getPreviewLabel = (typeId: ClientTypeId, moduleId: string, defaultLabel: string) => {
  if (moduleId === 'produtos') {
    if (['servicos', 'beleza'].includes(typeId)) return 'Servicos & Prod.';
    if (typeId === 'restaurante') return 'Cardapio / Itens';
  }
  if (moduleId === 'pdv') {
    if (['servicos', 'beleza'].includes(typeId)) return 'Agendar / PDV';
    if (typeId === 'restaurante') return 'Comandas / PDV';
    if (typeId === 'mercadinho') return 'Caixa Rapido';
  }
  if (moduleId === 'estoque' && typeId === 'industria') return 'Insumos';
  if (moduleId === 'vendas' && typeId === 'distribuidora') return 'Atacado / Vendas';
  if (moduleId === 'clientes' && typeId === 'distribuidora') return 'Carteira';
  return defaultLabel;
};

export const ClientTypesAdmin: React.FC = () => {
  const [defaults, setDefaults] = useState<ClientTypeFeatureDefault[]>([]);
  const [profiles, setProfiles] = useState<ClientAppProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ClientTypeId>('varejo');
  const [previewType, setPreviewType] = useState<ClientTypeId | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [defaultRows, profileRows] = await Promise.all([
        fetchClientTypeFeatureDefaults(),
        fetchClientAppProfiles(),
      ]);
      setDefaults(defaultRows);
      setProfiles(profileRows);
    } catch (err) {
      console.error(err);
      setError('Nao foi possivel carregar as configuracoes de tipos de clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const defaultsByType = useMemo(() => {
    return CLIENT_TYPE_ARCHETYPES.reduce<Record<ClientTypeId, Record<string, ClientTypeFeatureDefault>>>((acc, type) => {
      acc[type.id] = {};
      defaults
        .filter((item) => item.clientTypeId === type.id)
        .forEach((item) => {
          acc[type.id][item.featureId] = item;
        });
      return acc;
    }, {} as Record<ClientTypeId, Record<string, ClientTypeFeatureDefault>>);
  }, [defaults]);

  const selectedArchetype = getArchetype(selectedType);
  const selectedTypeDefaults = defaultsByType[selectedType] ?? {};
  const selectedEnabledCount = APP_FEATURES.filter((feature) => selectedTypeDefaults[feature.id]?.enabled).length;
  const selectedOptionalCount = APP_FEATURES.filter((feature) => selectedTypeDefaults[feature.id]?.optional).length;

  const filteredProfiles = profiles.filter((profile) => {
    const term = searchTerm.toLowerCase();
    return (
      profile.clientName.toLowerCase().includes(term) ||
      profile.companyName.toLowerCase().includes(term) ||
      getArchetype(profile.businessType).label.toLowerCase().includes(term)
    );
  });

  const toggleDefault = async (clientTypeId: ClientTypeId, featureId: string, enabled: boolean) => {
    const key = `${clientTypeId}:${featureId}:enabled`;
    setSavingKey(key);
    const previous = defaults;
    const currentDefault = defaults.find(
      (item) => item.clientTypeId === clientTypeId && item.featureId === featureId,
    );
    const optional = currentDefault ? currentDefault.optional : false;

    setDefaults((current) => current.map((item) => (
      item.clientTypeId === clientTypeId && item.featureId === featureId
        ? { ...item, enabled }
        : item
    )));

    try {
      await updateClientTypeFeatureDefault(clientTypeId, featureId, enabled, optional);
    } catch (err) {
      console.error(err);
      setDefaults(previous);
      alert('Erro ao salvar feature do tipo de cliente.');
    } finally {
      setSavingKey(null);
    }
  };

  const toggleOptional = async (clientTypeId: ClientTypeId, featureId: string, optional: boolean) => {
    const key = `${clientTypeId}:${featureId}:optional`;
    setSavingKey(key);
    const previous = defaults;
    const currentDefault = defaults.find(
      (item) => item.clientTypeId === clientTypeId && item.featureId === featureId,
    );
    const enabled = currentDefault ? currentDefault.enabled : false;

    setDefaults((current) => current.map((item) => (
      item.clientTypeId === clientTypeId && item.featureId === featureId
        ? { ...item, optional }
        : item
    )));

    try {
      await updateClientTypeFeatureDefault(clientTypeId, featureId, enabled, optional);
    } catch (err) {
      console.error(err);
      setDefaults(previous);
      alert('Erro ao salvar feature do tipo de cliente.');
    } finally {
      setSavingKey(null);
    }
  };

  const updateAccessMode = async (profileId: string, accessMode: ClientFeatureAccessMode) => {
    const previous = profiles;
    setProfiles((current) => current.map((profile) => (
      profile.id === profileId ? { ...profile, accessMode, updatedAt: new Date() } : profile
    )));

    try {
      const updated = await updateClientAppProfileAccessMode(profileId, accessMode);
      setProfiles((current) => current.map((profile) => profile.id === profileId ? updated : profile));
    } catch (err) {
      console.error(err);
      setProfiles(previous);
      alert('Erro ao alterar acesso do cliente.');
    }
  };

  const buildPreviewFeatures = (typeId: ClientTypeId) => {
    const typeDefaults = defaultsByType[typeId] ?? {};
    return APP_FEATURES.map((feature) => ({
      feature,
      enabled: Boolean(typeDefaults[feature.id]?.enabled),
      optional: Boolean(typeDefaults[feature.id]?.optional),
    }));
  };

  const previewArchetype = previewType ? getArchetype(previewType) : null;
  const previewFeatures = previewType ? buildPreviewFeatures(previewType) : [];
  const previewMenuFeatures = previewFeatures.filter((item) => item.enabled && item.feature.moduleId);
  const previewFutureFeatures = previewFeatures.filter((item) => item.enabled && item.feature.isFuture).slice(0, 8);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tipos de Clientes"
        subtitle="Visao holistica dos 8 arquétipos iniciais e das features que moldam cada app."
        actions={
          <Button onClick={loadData} variant="outline" className="gap-2" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </Button>
        }
      />

      <Card className="p-6 bg-blue-50/80 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Arquétipos iniciais, nao limite do produto</h2>
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 max-w-4xl">
              Estes 8 modelos ajudam a enxergar o produto de forma estrategica nesta fase. O onboarding ainda pode gerar muitas outras combinacoes por necessidade, processo, experiencia e meta do cliente.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center shrink-0">
            <div className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-white/80 dark:border-slate-800 px-4 py-3">
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">8</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipos</p>
            </div>
            <div className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-white/80 dark:border-slate-800 px-4 py-3">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{APP_FEATURES.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Features</p>
            </div>
            <div className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-white/80 dark:border-slate-800 px-4 py-3">
              <p className="text-2xl font-black text-violet-600 dark:text-violet-400">∞</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Variações</p>
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <p className="text-sm font-bold text-red-700 dark:text-red-300">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <div className="space-y-4">
          {CLIENT_TYPE_ARCHETYPES.map((type) => {
            const Icon = getFeatureIcon(type.iconName);
            const typeDefaults = defaultsByType[type.id] ?? {};
            const enabledCount = APP_FEATURES.filter((feature) => typeDefaults[feature.id]?.enabled).length;
            const isSelected = selectedType === type.id;

            return (
              <div
                key={type.id}
                className={cn(
                  'w-full text-left rounded-2xl border p-4 transition-all bg-white dark:bg-slate-900',
                  isSelected
                    ? 'border-blue-500 shadow-md shadow-blue-500/10'
                    : 'border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800',
                )}
              >
                <button onClick={() => setSelectedType(type.id)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300',
                      )}>
                        <Icon size={19} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white">{type.shortLabel}</h3>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{type.subtitle}</p>
                      </div>
                    </div>
                    <Badge variant={isSelected ? 'blue' : 'default'}>{enabledCount} ativas</Badge>
                  </div>
                  <p className="mt-4 text-[11px] font-bold text-slate-400 line-clamp-1">{type.description}</p>
                </button>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => setPreviewType(type.id)}
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400"
                  >
                    <Eye size={12} />
                    Preview
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <Card className="overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-blue-500" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Matriz de Features</h2>
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Checkboxes alteram o padrao do tipo. Clientes com override proprio preservam a escolha deles.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">{selectedEnabledCount} ativas em {selectedArchetype.shortLabel}</Badge>
              <Badge variant="info">{selectedOptionalCount} opcionais para o cliente</Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                  <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-950 p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-48">
                    Tipo
                  </th>
                  {APP_FEATURES.map((feature) => {
                    const Icon = getFeatureIcon(feature.iconName);
                    return (
                      <th key={feature.id} className="p-3 w-28 align-top">
                        <div className="flex flex-col items-center gap-1 text-center" title={feature.title}>
                          <Icon size={16} className={feature.isFuture ? 'text-violet-500' : 'text-blue-500'} />
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 leading-tight line-clamp-2">
                            {feature.title}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                  <th className="p-3 w-28 text-[10px] font-black uppercase tracking-widest text-slate-400">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {CLIENT_TYPE_ARCHETYPES.map((type) => {
                  const Icon = getFeatureIcon(type.iconName);
                  return (
                    <tr key={type.id} className={selectedType === type.id ? 'bg-blue-50/50 dark:bg-blue-950/10' : 'bg-white dark:bg-slate-900'}>
                      <td className="sticky left-0 z-10 bg-inherit p-3">
                        <button onClick={() => setSelectedType(type.id)} className="flex items-center gap-2 text-left">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 flex items-center justify-center">
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">{type.shortLabel}</p>
                            <p className="text-[10px] font-bold text-slate-400">{type.subtitle}</p>
                          </div>
                        </button>
                      </td>
                      {APP_FEATURES.map((feature) => {
                        const row = defaultsByType[type.id]?.[feature.id];
                        const checked = Boolean(row?.enabled);
                        const optional = Boolean(row?.optional);
                        const isSavingEnabled = savingKey === `${type.id}:${feature.id}:enabled`;
                        const isSavingOptional = savingKey === `${type.id}:${feature.id}:optional`;

                        return (
                          <td key={feature.id} className="p-3 text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                            <div className="flex flex-col items-center justify-center gap-2">
                              {/* Enabled Checkbox */}
                              <label className="flex items-center gap-1 cursor-pointer select-none" title="Habilitar funcionalidade como ativa de fábrica para este perfil">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={isSavingEnabled || isSavingOptional || loading}
                                  onChange={(event) => toggleDefault(type.id, feature.id, event.target.checked)}
                                  className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                />
                                <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400">Ativa</span>
                              </label>

                              {/* Optional Checkbox */}
                              <label className="flex items-center gap-1 cursor-pointer select-none" title="Permitir que o cliente ative ou desative este recurso a qualquer momento no app dele">
                                <input
                                  type="checkbox"
                                  checked={optional}
                                  disabled={isSavingEnabled || isSavingOptional || loading}
                                  onChange={(event) => toggleOptional(type.id, feature.id, event.target.checked)}
                                  className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-violet-600 focus:ring-violet-500 cursor-pointer disabled:opacity-50"
                                />
                                <span className="text-[9px] font-black uppercase text-violet-500 dark:text-violet-400">Opt</span>
                              </label>
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-3">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => setPreviewType(type.id)}>
                          <Eye size={13} />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Acesso dos Clientes</h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Controle se cada cliente pode explorar poucas, todas ou nenhuma feature.
            </p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar cliente ou empresa..."
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid gap-3">
          {filteredProfiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
              <p className="font-bold text-slate-500 dark:text-slate-400">
                Nenhum perfil de cliente encontrado ainda. Novos onboardings criarao perfis customizaveis automaticamente.
              </p>
            </div>
          ) : filteredProfiles.map((profile) => {
            const archetype = getArchetype(profile.businessType);
            const ModeIcon = accessModeLabels[profile.accessMode].icon;

            return (
              <div key={profile.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                    {(profile.clientName || profile.companyName || 'C').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">{profile.clientName || 'Cliente sem nome'}</h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {profile.companyName || 'Empresa nao informada'} - {archetype.label}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Badge variant={profile.accessMode === 'full' ? 'success' : profile.accessMode === 'locked' ? 'warning' : 'info'}>
                    <ModeIcon size={12} className="mr-1" />
                    {accessModeLabels[profile.accessMode].label}
                  </Badge>
                  <select
                    value={profile.accessMode}
                    onChange={(event) => updateAccessMode(profile.id, event.target.value as ClientFeatureAccessMode)}
                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-black text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
                  >
                    {Object.entries(accessModeLabels).map(([value, data]) => (
                      <option key={value} value={value}>{data.label} - {data.desc}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal
        isOpen={!!previewType}
        onClose={() => setPreviewType(null)}
        title={previewArchetype?.previewTitle ?? 'Preview'}
        maxWidth="max-w-5xl"
      >
        {previewArchetype && previewType && (
          <div className="grid lg:grid-cols-[260px_1fr] gap-6">
            <div className="rounded-2xl bg-slate-900 text-slate-300 p-4 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">{previewArchetype.shortLabel}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">Preview Admin</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3 rounded-xl bg-blue-600/20 text-blue-300 px-3 py-2">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold">Dashboard</span>
                </div>
                {previewMenuFeatures.map((item) => {
                  const Icon = getFeatureIcon(item.feature.iconName);
                  return (
                    <div key={item.feature.id} className="flex items-center gap-3 rounded-xl px-3 py-2 text-slate-400">
                      <Icon size={16} />
                      <span className="text-xs font-bold">
                        {getPreviewLabel(previewType, item.feature.moduleId!, item.feature.title)}
                      </span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-slate-400">
                  <Sparkles size={16} />
                  <span className="text-xs font-bold">Explorar Features</span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Experiencia simulada</p>
                <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{previewArchetype.previewTitle}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{previewArchetype.previewSubtitle}</p>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {previewFutureFeatures.length === 0 ? (
                  <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-sm font-bold text-slate-400">
                    Nenhuma feature especializada ativa neste preview.
                  </div>
                ) : previewFutureFeatures.map((item) => {
                  const Icon = getFeatureIcon(item.feature.iconName);
                  return (
                    <div key={item.feature.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                        <Icon size={19} />
                      </div>
                      <h4 className="mt-4 font-black text-slate-900 dark:text-white">{item.feature.title}</h4>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{item.feature.description}</p>
                      {item.optional && <Badge className="mt-3" variant="info">Cliente pode escolher</Badge>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
