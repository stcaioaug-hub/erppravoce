import { supabase } from './supabase';
import {
  ALWAYS_VISIBLE_CLIENT_MODULES,
  APP_FEATURES,
  CLIENT_TYPE_FEATURE_DEFAULTS,
  MENU_FEATURE_BY_MODULE_ID,
  normalizeClientType,
} from '../data/featureCustomization';
import {
  AppFeature,
  ClientAppProfile,
  ClientFeatureAccessMode,
  ClientFeatureOverride,
  ClientOnboarding,
  ClientTypeFeatureDefault,
  ClientTypeId,
  ResolvedFeature,
} from '../types';

const LOCAL_STATE_KEY = 'easyone_feature_customization';
export const CURRENT_CLIENT_PROFILE_KEY = 'easyone_client_app_profile_id';

interface LocalFeatureState {
  defaults: ClientTypeFeatureDefault[];
  profiles: ClientAppProfile[];
  overrides: ClientFeatureOverride[];
}

const toDate = (value: unknown) => value ? new Date(String(value)) : new Date();

const mapDefaultRow = (row: any): ClientTypeFeatureDefault => ({
  clientTypeId: normalizeClientType(row.client_type_id),
  featureId: row.feature_id,
  enabled: Boolean(row.enabled),
  optional: Boolean(row.optional),
});

const mapProfileRow = (row: any): ClientAppProfile => ({
  id: row.id,
  onboardingId: row.onboarding_id ?? undefined,
  clientName: row.client_name ?? '',
  companyName: row.company_name ?? '',
  businessType: normalizeClientType(row.business_type),
  accessMode: (row.access_mode ?? 'limited') as ClientFeatureAccessMode,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

const mapOverrideRow = (row: any): ClientFeatureOverride => ({
  profileId: row.profile_id,
  featureId: row.feature_id,
  enabled: Boolean(row.enabled),
  source: row.source === 'admin' ? 'admin' : 'client',
  updatedAt: toDate(row.updated_at),
});

const makeLocalId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const reconcileDefaults = (defaults: ClientTypeFeatureDefault[]) => {
  const byKey = new Map(defaults.map((item) => [`${item.clientTypeId}:${item.featureId}`, item]));
  CLIENT_TYPE_FEATURE_DEFAULTS.forEach((seed) => {
    const key = `${seed.clientTypeId}:${seed.featureId}`;
    if (!byKey.has(key)) byKey.set(key, seed);
  });
  return Array.from(byKey.values());
};

const readLocalState = (): LocalFeatureState => {
  try {
    const raw = localStorage.getItem(LOCAL_STATE_KEY);
    if (!raw) {
      return {
        defaults: CLIENT_TYPE_FEATURE_DEFAULTS,
        profiles: [],
        overrides: [],
      };
    }
    const parsed = JSON.parse(raw);
    return {
      defaults: reconcileDefaults(parsed.defaults ?? CLIENT_TYPE_FEATURE_DEFAULTS),
      profiles: (parsed.profiles ?? []).map((item: any) => ({
        ...item,
        businessType: normalizeClientType(item.businessType),
        createdAt: toDate(item.createdAt),
        updatedAt: toDate(item.updatedAt),
      })),
      overrides: (parsed.overrides ?? []).map((item: any) => ({
        ...item,
        updatedAt: toDate(item.updatedAt),
      })),
    };
  } catch (error) {
    console.error('Erro ao ler customizacoes locais:', error);
    return {
      defaults: CLIENT_TYPE_FEATURE_DEFAULTS,
      profiles: [],
      overrides: [],
    };
  }
};

const writeLocalState = (state: LocalFeatureState) => {
  localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify({
    defaults: state.defaults,
    profiles: state.profiles,
    overrides: state.overrides,
  }));
};

export const getCurrentClientProfileId = () => {
  return localStorage.getItem(CURRENT_CLIENT_PROFILE_KEY);
};

export const setCurrentClientProfileId = (profileId: string) => {
  localStorage.setItem(CURRENT_CLIENT_PROFILE_KEY, profileId);
};

export const getFeatureByModuleId = (moduleId: string) => {
  const featureId = MENU_FEATURE_BY_MODULE_ID[moduleId];
  return featureId ? APP_FEATURES.find((feature) => feature.id === featureId) : undefined;
};

export const isModuleVisibleForClient = (moduleId: string, resolvedFeatures: ResolvedFeature[] | null) => {
  if (ALWAYS_VISIBLE_CLIENT_MODULES.includes(moduleId)) return true;
  if (!resolvedFeatures) return true;
  const feature = getFeatureByModuleId(moduleId);
  if (!feature) return true;
  return resolvedFeatures.some((item) => item.feature.id === feature.id && item.enabled);
};

export async function fetchClientTypeFeatureDefaults(): Promise<ClientTypeFeatureDefault[]> {
  if (!supabase) return readLocalState().defaults;

  const { data, error } = await supabase
    .from('client_type_feature_defaults')
    .select('*');

  if (error) throw error;
  return reconcileDefaults(data?.length ? data.map(mapDefaultRow) : CLIENT_TYPE_FEATURE_DEFAULTS);
}

export async function fetchDefaultsForType(clientTypeId: ClientTypeId): Promise<ClientTypeFeatureDefault[]> {
  const defaults = await fetchClientTypeFeatureDefaults();
  return reconcileDefaults(defaults).filter((item) => item.clientTypeId === clientTypeId);
}

export async function updateClientTypeFeatureDefault(
  clientTypeId: ClientTypeId,
  featureId: string,
  enabled: boolean,
  optional?: boolean,
): Promise<void> {
  const seed = CLIENT_TYPE_FEATURE_DEFAULTS.find(
    (item) => item.clientTypeId === clientTypeId && item.featureId === featureId,
  );

  const finalOptional = optional !== undefined ? optional : (seed?.optional ?? false);

  if (!supabase) {
    const state = readLocalState();
    const nextDefaults = reconcileDefaults(state.defaults).map((item) => (
      item.clientTypeId === clientTypeId && item.featureId === featureId
        ? { ...item, enabled, optional: finalOptional }
        : item
    ));
    writeLocalState({ ...state, defaults: nextDefaults });
    return;
  }

  const { error } = await supabase
    .from('client_type_feature_defaults')
    .upsert({
      client_type_id: clientTypeId,
      feature_id: featureId,
      enabled,
      optional: finalOptional,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'client_type_id,feature_id' });

  if (error) throw error;
}

export async function fetchClientAppProfiles(): Promise<ClientAppProfile[]> {
  if (!supabase) return readLocalState().profiles;

  const { data, error } = await supabase
    .from('client_app_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapProfileRow);
}

export async function createClientAppProfileFromOnboarding(
  input: Omit<ClientOnboarding, 'id' | 'createdAt'>,
  onboardingId?: string | null,
): Promise<ClientAppProfile> {
  const payload = {
    onboarding_id: onboardingId ?? null,
    client_name: input.clientName,
    company_name: input.companyName,
    business_type: normalizeClientType(input.businessType),
    access_mode: 'limited' as ClientFeatureAccessMode,
  };

  if (!supabase) {
    const state = readLocalState();
    const now = new Date();
    const profile: ClientAppProfile = {
      id: makeLocalId('profile'),
      onboardingId: onboardingId ?? undefined,
      clientName: payload.client_name,
      companyName: payload.company_name,
      businessType: payload.business_type,
      accessMode: payload.access_mode,
      createdAt: now,
      updatedAt: now,
    };
    writeLocalState({ ...state, profiles: [profile, ...state.profiles] });
    setCurrentClientProfileId(profile.id);
    return profile;
  }

  const { data, error } = await supabase
    .from('client_app_profiles')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  const profile = mapProfileRow(data);
  setCurrentClientProfileId(profile.id);
  return profile;
}

export async function updateClientAppProfileAccessMode(
  profileId: string,
  accessMode: ClientFeatureAccessMode,
): Promise<ClientAppProfile> {
  if (!supabase) {
    const state = readLocalState();
    const now = new Date();
    const profiles = state.profiles.map((profile) => (
      profile.id === profileId ? { ...profile, accessMode, updatedAt: now } : profile
    ));
    const updated = profiles.find((profile) => profile.id === profileId);
    writeLocalState({ ...state, profiles });
    if (!updated) throw new Error('Perfil de cliente nao encontrado.');
    return updated;
  }

  const { data, error } = await supabase
    .from('client_app_profiles')
    .update({ access_mode: accessMode, updated_at: new Date().toISOString() })
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw error;
  return mapProfileRow(data);
}

export async function fetchClientFeatureOverrides(profileId: string): Promise<ClientFeatureOverride[]> {
  if (!supabase) {
    return readLocalState().overrides.filter((item) => item.profileId === profileId);
  }

  const { data, error } = await supabase
    .from('client_feature_overrides')
    .select('*')
    .eq('profile_id', profileId);

  if (error) throw error;
  return (data ?? []).map(mapOverrideRow);
}

export async function updateClientFeatureOverride(
  profileId: string,
  featureId: string,
  enabled: boolean,
  source: 'client' | 'admin' = 'client',
): Promise<void> {
  if (!supabase) {
    const state = readLocalState();
    const now = new Date();
    const existingIndex = state.overrides.findIndex(
      (item) => item.profileId === profileId && item.featureId === featureId,
    );
    const nextOverride: ClientFeatureOverride = {
      profileId,
      featureId,
      enabled,
      source,
      updatedAt: now,
    };
    const overrides = existingIndex >= 0
      ? state.overrides.map((item, index) => index === existingIndex ? nextOverride : item)
      : [nextOverride, ...state.overrides];
    writeLocalState({ ...state, overrides });
    return;
  }

  const { error } = await supabase
    .from('client_feature_overrides')
    .upsert({
      profile_id: profileId,
      feature_id: featureId,
      enabled,
      source,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'profile_id,feature_id' });

  if (error) throw error;
}

export async function ensureCurrentClientProfile(): Promise<ClientAppProfile | null> {
  const currentId = getCurrentClientProfileId();
  const profiles = await fetchClientAppProfiles();
  const existing = currentId ? profiles.find((profile) => profile.id === currentId) : null;
  if (existing) return existing;

  const raw = localStorage.getItem('easyone_onboarding');
  if (!raw) return null;

  try {
    const onboarding = JSON.parse(raw) as Omit<ClientOnboarding, 'id' | 'createdAt'>;
    return await createClientAppProfileFromOnboarding(onboarding);
  } catch (error) {
    console.error('Erro ao garantir perfil de app do cliente:', error);
    return null;
  }
}

const resolveFeatures = (
  features: AppFeature[],
  defaults: ClientTypeFeatureDefault[],
  overrides: ClientFeatureOverride[],
  accessMode: ClientFeatureAccessMode,
): ResolvedFeature[] => {
  return features.map((feature) => {
    const defaultItem = defaults.find((item) => item.featureId === feature.id);
    const override = overrides.find((item) => item.featureId === feature.id);
    const defaultEnabled = Boolean(defaultItem?.enabled);
    const optional = Boolean(defaultItem?.optional);
    const overridden = Boolean(override);
    const enabled = override ? override.enabled : defaultEnabled;
    const canClientToggle = accessMode === 'full'
      ? feature.isCustomerVisible
      : accessMode === 'limited'
        ? optional
        : false;

    return {
      feature,
      enabled,
      defaultEnabled,
      optional,
      overridden,
      canClientToggle,
    };
  });
};

export async function resolveClientFeatures(profileId?: string | null): Promise<{
  profile: ClientAppProfile | null;
  features: ResolvedFeature[];
}> {
  const profile = profileId
    ? (await fetchClientAppProfiles()).find((item) => item.id === profileId) ?? null
    : await ensureCurrentClientProfile();

  if (!profile) {
    return { profile: null, features: [] };
  }

  const [defaults, overrides] = await Promise.all([
    fetchDefaultsForType(profile.businessType),
    fetchClientFeatureOverrides(profile.id),
  ]);

  return {
    profile,
    features: resolveFeatures(APP_FEATURES, defaults, overrides, profile.accessMode),
  };
}

export async function resolveClientTypeFeatures(clientTypeId: ClientTypeId): Promise<ResolvedFeature[]> {
  const defaults = await fetchDefaultsForType(clientTypeId);
  return resolveFeatures(APP_FEATURES, defaults, [], 'locked');
}
