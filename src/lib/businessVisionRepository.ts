import { supabase } from './supabase';
import {
  BusinessPlanSection,
  NextStep,
  BusinessSimulation,
  BusinessFunnel,
  BusinessPartner,
} from '../types';

const requireClient = () => {
  if (!supabase) {
    throw new Error('Supabase não está configurado.');
  }
  return supabase;
};

// Utilizaremos um companyId padrão fixo no MVP até haver sistema de autenticação
const DEFAULT_COMPANY_ID = 'default_company_1';

export async function fetchBusinessPlanSections(): Promise<BusinessPlanSection[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('business_plan_sections')
    .select('*')
    .eq('company_id', DEFAULT_COMPANY_ID);
  
  if (error) throw error;
  
  return (data || []).map(row => ({
    id: row.id,
    companyId: row.company_id,
    title: row.title,
    body: row.body,
  }));
}

export async function saveBusinessPlanSection(title: string, body: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from('business_plan_sections')
    .upsert({
      company_id: DEFAULT_COMPANY_ID,
      title,
      body,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'company_id, title' });
    
  if (error) throw error;
}

export async function fetchNextSteps(): Promise<NextStep[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('business_next_steps')
    .select('*')
    .eq('company_id', DEFAULT_COMPANY_ID)
    .order('order', { ascending: true })
    .order('created_at', { ascending: true });
    
  if (error) throw error;
  
  return (data || []).map(row => ({
    id: row.id,
    companyId: row.company_id,
    text: row.text,
    completed: row.completed,
    order: row.order,
  }));
}

export async function addNextStep(text: string): Promise<NextStep> {
  const client = requireClient();
  const { data, error } = await client
    .from('business_next_steps')
    .insert({
      company_id: DEFAULT_COMPANY_ID,
      text,
      completed: false,
      order: 0, // Simplificação
    })
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    companyId: data.company_id,
    text: data.text,
    completed: data.completed,
    order: data.order,
  };
}

export async function updateNextStep(id: string, updates: Partial<NextStep>): Promise<void> {
  const client = requireClient();
  
  const payload: any = {};
  if (updates.text !== undefined) payload.text = updates.text;
  if (updates.completed !== undefined) payload.completed = updates.completed;
  if (updates.order !== undefined) payload.order = updates.order;
  
  const { error } = await client
    .from('business_next_steps')
    .update(payload)
    .eq('id', id)
    .eq('company_id', DEFAULT_COMPANY_ID);
    
  if (error) throw error;
}

export async function deleteNextStep(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from('business_next_steps')
    .delete()
    .eq('id', id)
    .eq('company_id', DEFAULT_COMPANY_ID);
    
  if (error) throw error;
}

export async function fetchBusinessSimulations(): Promise<BusinessSimulation[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('business_simulations')
    .select('*')
    .eq('company_id', DEFAULT_COMPANY_ID);
    
  if (error) throw error;
  
  return (data || []).map(row => ({
    id: row.id,
    companyId: row.company_id,
    scenarioName: row.scenario_name,
    isActive: row.is_active,
    clients: Number(row.clients),
    ticket: Number(row.ticket),
    fixedCost: Number(row.fixed_cost),
    variableCost: Number(row.variable_cost),
    initialInvestment: Number(row.initial_investment),
    taxRate: Number(row.tax_rate),
    churnRate: Number(row.churn_rate),
    growthRate: Number(row.growth_rate),
  }));
}

export async function saveBusinessSimulation(scenarioName: string, sim: Partial<BusinessSimulation>): Promise<void> {
  const client = requireClient();
  
  const payload: any = {
    company_id: DEFAULT_COMPANY_ID,
    scenario_name: scenarioName,
  };
  
  if (sim.isActive !== undefined) payload.is_active = sim.isActive;
  if (sim.clients !== undefined) payload.clients = sim.clients;
  if (sim.ticket !== undefined) payload.ticket = sim.ticket;
  if (sim.fixedCost !== undefined) payload.fixed_cost = sim.fixedCost;
  if (sim.variableCost !== undefined) payload.variable_cost = sim.variableCost;
  if (sim.initialInvestment !== undefined) payload.initial_investment = sim.initialInvestment;
  if (sim.taxRate !== undefined) payload.tax_rate = sim.taxRate;
  if (sim.churnRate !== undefined) payload.churn_rate = sim.churnRate;
  if (sim.growthRate !== undefined) payload.growth_rate = sim.growthRate;
  
  const { error } = await client
    .from('business_simulations')
    .upsert(payload, { onConflict: 'company_id, scenario_name' });
    
  if (error) throw error;
}

export async function fetchBusinessFunnel(): Promise<BusinessFunnel | null> {
  const client = requireClient();
  const { data, error } = await client
    .from('business_funnel')
    .select('*')
    .eq('company_id', DEFAULT_COMPANY_ID)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null; // Não encontrado
    throw error;
  }
  
  return {
    id: data.id,
    companyId: data.company_id,
    leads: Number(data.leads),
    meetingConversion: Number(data.meeting_conversion),
    trialConversion: Number(data.trial_conversion),
    paidConversion: Number(data.paid_conversion),
    ticket: Number(data.ticket),
  };
}

export async function saveBusinessFunnel(funnel: Partial<BusinessFunnel>): Promise<void> {
  const client = requireClient();
  
  const payload: any = {
    company_id: DEFAULT_COMPANY_ID,
  };
  
  if (funnel.leads !== undefined) payload.leads = funnel.leads;
  if (funnel.meetingConversion !== undefined) payload.meeting_conversion = funnel.meetingConversion;
  if (funnel.trialConversion !== undefined) payload.trial_conversion = funnel.trialConversion;
  if (funnel.paidConversion !== undefined) payload.paid_conversion = funnel.paidConversion;
  if (funnel.ticket !== undefined) payload.ticket = funnel.ticket;
  
  const { error } = await client
    .from('business_funnel')
    .upsert(payload, { onConflict: 'company_id' });
    
  if (error) throw error;
}
