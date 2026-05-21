import { supabase } from './supabase';
import { ClientOnboarding } from '../types';

const mapRow = (row: any): ClientOnboarding => ({
  id: row.id,
  clientName: row.client_name ?? '',
  companyName: row.company_name ?? '',
  businessType: row.business_type ?? '',
  need: row.need ?? '',
  process: row.process ?? '',
  experience: row.experience ?? '',
  goal: row.goal ?? '',
  createdAt: row.created_at ? new Date(String(row.created_at)) : new Date(),
});

export async function fetchClientOnboardings(): Promise<ClientOnboarding[]> {
  if (!supabase) {
    // Return mock data for when Supabase is not configured yet
    const local = localStorage.getItem('varejoflow_client_onboardings_mock');
    if (local) return JSON.parse(local).map((x: any) => ({ ...x, createdAt: new Date(x.createdAt) }));
    
    const mockData: ClientOnboarding[] = [
      {
        id: 'mock-1',
        clientName: 'Carlos Silva',
        companyName: 'Silva Modas',
        businessType: 'varejo',
        need: 'grade',
        process: 'revenda_simples',
        experience: 'intermediario',
        goal: 'faturamento',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'mock-2',
        clientName: 'Amanda Souza',
        companyName: 'Café Gourmet',
        businessType: 'restaurante',
        need: 'comandas',
        process: 'pedido_cozinha',
        experience: 'iniciante',
        goal: 'tempo',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'mock-3',
        clientName: 'Roberto Santos',
        companyName: 'Santos Atacado',
        businessType: 'distribuidora',
        need: 'vendedores',
        process: 'pedido_separo',
        experience: 'avancado',
        goal: 'expansao',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'mock-4',
        clientName: 'Mariana Lima',
        companyName: 'Lima Estética',
        businessType: 'beleza',
        need: 'agenda',
        process: 'agenda_executa',
        experience: 'iniciante',
        goal: 'organizacao',
        createdAt: new Date(),
      }
    ];
    localStorage.setItem('varejoflow_client_onboardings_mock', JSON.stringify(mockData));
    return mockData;
  }

  const { data, error } = await supabase
    .from('client_onboarding')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function saveClientOnboarding(input: Omit<ClientOnboarding, 'id' | 'createdAt'>): Promise<string> {
  if (!supabase) {
    // Save locally to mock database
    const existing = await fetchClientOnboardings();
    const newEntry: ClientOnboarding = {
      ...input,
      id: 'mock-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
    };
    localStorage.setItem('varejoflow_client_onboardings_mock', JSON.stringify([newEntry, ...existing]));
    return newEntry.id;
  }

  const { data, error } = await supabase
    .from('client_onboarding')
    .insert({
      client_name: input.clientName,
      company_name: input.companyName,
      business_type: input.businessType,
      need: input.need,
      process: input.process,
      experience: input.experience,
      goal: input.goal,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function deleteClientOnboarding(id: string): Promise<void> {
  if (!supabase) {
    const existing = await fetchClientOnboardings();
    const filtered = existing.filter(x => x.id !== id);
    localStorage.setItem('varejoflow_client_onboardings_mock', JSON.stringify(filtered));
    return;
  }

  const { error } = await supabase
    .from('client_onboarding')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
