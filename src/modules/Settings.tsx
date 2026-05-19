/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Building, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Save, 
  Upload, 
  Key, 
  Smartphone, 
  Laptop, 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  FileText, 
  Trash2, 
  LogOut, 
  QrCode, 
  Copy,
  Eye, 
  EyeOff 
} from 'lucide-react';
import { PageHeader, Button, Card, Input, Badge } from '../components/ui';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dados do formulário
  const [profileData, setProfileData] = useState({
    name: 'Carlos Oliveira',
    role: 'Administrador',
    email: 'carlos@varejoflow.com.br',
    phone: '(11) 98765-4321',
  });

  const [companyData, setCompanyData] = useState({
    razaoSocial: 'VarejoFlow Tecnologia e Comércio Ltda',
    nomeFantasia: 'VarejoFlow ERP',
    cnpj: '12.345.678/0001-90',
    ie: '123.456.789.000',
    cep: '01234-567',
    logradouro: 'Av. Paulista, 1000',
    numero: 'Conj 101',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    phone: '(11) 3000-1234',
    emailFaturamento: 'financeiro@varejoflow.com.br',
    regimeTributario: 'simples',
  });

  const [notificationsData, setNotificationsData] = useState({
    emailSales: true,
    emailLowStock: true,
    emailDailyClosing: false,
    emailSystemUpdates: true,
    whatsappReceipts: true,
    whatsappMonthlyReports: true,
    pushBrowser: false,
    summaryFrequency: 'daily',
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    showQrCode: false,
  });

  const [importData, setImportData] = useState({
    selectedType: 'products',
    file: null as File | null,
    isImporting: false,
    importProgress: 0,
    importSuccess: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm animate-in fade-in slide-in-from-bottom-5 duration-300 border border-slate-800 dark:border-slate-200">
          <Check size={20} className="text-emerald-400 dark:text-emerald-600" />
          {toastMessage}
        </div>
      )}

      <PageHeader 
        title="Configurações do Sistema" 
        subtitle="Ajuste as preferências do ERP, dados da empresa, segurança e integrações" 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="space-y-2 md:col-span-1">
          {[
            { id: 'profile', label: 'Meu Perfil', icon: User },
            { id: 'company', label: 'Dados da Empresa', icon: Building },
            { id: 'notifications', label: 'Notificações', icon: Bell },
            { id: 'security', label: 'Segurança', icon: Shield },
            { id: 'import', label: 'Importação / Dados', icon: Database },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none translate-x-1' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </aside>

        <div className="md:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card className="p-8">
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 transition-colors">Informações Pessoais</h3>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                    <img src="https://i.pravatar.cc/150?u=carlos" alt="Carlos" className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-700 shadow-md transition-colors" />
                    <div className="text-center sm:text-left space-y-2">
                      <h4 className="font-bold text-slate-800 dark:text-white transition-colors">Foto de Perfil</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Formatos recomendados: JPG, PNG ou GIF. Tamanho máximo: 2MB.</p>
                      <div className="flex gap-2 justify-center sm:justify-start">
                        <Button variant="outline" size="sm" onClick={() => showToast('Seletor de arquivos aberto.')}>
                          <Upload size={14} className="mr-2" /> Alterar Foto
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => showToast('Foto removida.')} className="text-red-500 hover:text-red-600 dark:hover:bg-red-500/10">Remover</Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Nome Completo</label>
                      <Input 
                        value={profileData.name} 
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Cargo / Função</label>
                      <Input value={profileData.role} disabled />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">E-mail Comercial</label>
                      <Input 
                        value={profileData.email} 
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Telefone / Celular</label>
                      <Input 
                        value={profileData.phone} 
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      onClick={() => showToast('Perfil atualizado com sucesso!')}
                      className="bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none gap-2"
                    >
                      <Save size={16} /> Salvar Alterações
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-8 border-red-100 dark:border-red-500/20 bg-red-50/10 dark:bg-red-500/5 transition-colors">
                <h3 className="text-lg font-black text-red-800 dark:text-red-400 mb-2 transition-colors">Zona de Perigo</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium transition-colors">As ações abaixo podem ter impacto permanente nos seus dados de faturamento e estoque.</p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => showToast('Estoque resetado com sucesso para demonstração.')}
                    className="border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    Resetar Estoque
                  </Button>
                  <Button 
                    onClick={() => showToast('Solicitação de encerramento enviada.')}
                    className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 transition-colors"
                  >
                    Encerrar Conta
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'company' && (
            <Card className="p-8 space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 transition-colors">Dados da Empresa e Faturamento</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Razão Social</label>
                  <Input 
                    value={companyData.razaoSocial} 
                    onChange={(e) => setCompanyData({...companyData, razaoSocial: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Nome Fantasia</label>
                  <Input 
                    value={companyData.nomeFantasia} 
                    onChange={(e) => setCompanyData({...companyData, nomeFantasia: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">CNPJ</label>
                  <Input 
                    value={companyData.cnpj} 
                    onChange={(e) => setCompanyData({...companyData, cnpj: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Inscrição Estadual</label>
                  <Input 
                    value={companyData.ie} 
                    onChange={(e) => setCompanyData({...companyData, ie: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Regime Tributário</label>
                  <select 
                    value={companyData.regimeTributario}
                    onChange={(e) => setCompanyData({...companyData, regimeTributario: e.target.value})}
                    className="w-full h-10 px-4 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="simples">Simples Nacional</option>
                    <option value="presumido">Lucro Presumido</option>
                    <option value="real">Lucro Real</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6 transition-colors">
                <h4 className="font-bold text-slate-800 dark:text-white transition-colors">Endereço Principal</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div className="space-y-2 sm:col-span-1">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">CEP</label>
                    <Input 
                      value={companyData.cep} 
                      onChange={(e) => setCompanyData({...companyData, cep: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Logradouro</label>
                    <Input 
                      value={companyData.logradouro} 
                      onChange={(e) => setCompanyData({...companyData, logradouro: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Número</label>
                    <Input 
                      value={companyData.numero} 
                      onChange={(e) => setCompanyData({...companyData, numero: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Bairro</label>
                    <Input 
                      value={companyData.bairro} 
                      onChange={(e) => setCompanyData({...companyData, bairro: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Cidade</label>
                    <Input 
                      value={companyData.cidade} 
                      onChange={(e) => setCompanyData({...companyData, cidade: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">UF</label>
                    <Input 
                      value={companyData.uf} 
                      onChange={(e) => setCompanyData({...companyData, uf: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6 transition-colors">
                <h4 className="font-bold text-slate-800 dark:text-white transition-colors">Contatos e Faturamento</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Telefone Comercial</label>
                    <Input 
                      value={companyData.phone} 
                      onChange={(e) => setCompanyData({...companyData, phone: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">E-mail para Faturamento</label>
                    <Input 
                      value={companyData.emailFaturamento} 
                      onChange={(e) => setCompanyData({...companyData, emailFaturamento: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={() => showToast('Dados da empresa salvos com sucesso!')}
                  className="bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none gap-2"
                >
                  <Save size={16} /> Salvar Empresa
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-8 space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 transition-colors">Configurações de Notificações</h3>

              <div className="space-y-6 border-b border-slate-100 dark:border-slate-800 pb-6 transition-colors">
                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors">
                  <Bell size={18} className="text-blue-500" /> Notificações por E-mail
                </h4>
                <div className="space-y-4">
                  {[
                    { id: 'emailSales', label: 'Vendas Realizadas', desc: 'Receba um e-mail a cada venda de alto valor concluída no PDV.' },
                    { id: 'emailLowStock', label: 'Alerta de Estoque Baixo', desc: 'Seja notificado quando produtos atingirem o estoque mínimo.' },
                    { id: 'emailDailyClosing', label: 'Fechamento de Caixa Diário', desc: 'Receba o resumo financeiro ao encerrar o dia.' },
                    { id: 'emailSystemUpdates', label: 'Atualizações do Sistema', desc: 'Novidades, novas ferramentas e melhorias no VarejoFlow.' },
                  ].map((item) => (
                    <label key={item.id} className="flex items-start gap-4 cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                      <input 
                        type="checkbox" 
                        checked={(notificationsData as any)[item.id]} 
                        onChange={(e) => setNotificationsData({...notificationsData, [item.id]: e.target.checked})}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-white transition-colors">{item.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-6 border-b border-slate-100 dark:border-slate-800 pb-6 transition-colors">
                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors">
                  <Smartphone size={18} className="text-emerald-500" /> Notificações no WhatsApp
                </h4>
                <div className="space-y-4">
                  {[
                    { id: 'whatsappReceipts', label: 'Comprovantes para Clientes', desc: 'Envio automático de cupom fiscal e recibo via WhatsApp para o cliente.' },
                    { id: 'whatsappMonthlyReports', label: 'Relatório Mensal do Gestor', desc: 'Resumo executivo de faturamento e metas enviado no seu WhatsApp.' },
                  ].map((item) => (
                    <label key={item.id} className="flex items-start gap-4 cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                      <input 
                        type="checkbox" 
                        checked={(notificationsData as any)[item.id]} 
                        onChange={(e) => setNotificationsData({...notificationsData, [item.id]: e.target.checked})}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-white transition-colors">{item.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors">
                  <Laptop size={18} className="text-indigo-500" /> Frequência de Resumos
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'daily', label: 'Diário', desc: 'Todos os dias às 18h' },
                    { id: 'weekly', label: 'Semanal', desc: 'Toda sexta-feira' },
                    { id: 'monthly', label: 'Mensal', desc: 'Todo dia 1º do mês' },
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      onClick={() => setNotificationsData({...notificationsData, summaryFrequency: freq.id})}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        notificationsData.summaryFrequency === freq.id 
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{freq.label}</span>
                        {notificationsData.summaryFrequency === freq.id && <Check size={16} />}
                      </div>
                      <p className="text-xs opacity-80">{freq.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={() => showToast('Preferências de notificação salvas!')}
                  className="bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none gap-2"
                >
                  <Save size={16} /> Salvar Notificações
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-8 space-y-8 animate-in fade-in duration-300">
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 transition-colors">Alterar Senha</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 transition-colors">Recomendamos usar uma senha forte com letras, números e símbolos.</p>
                
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Senha Atual</label>
                    <Input 
                      type="password" 
                      value={securityData.currentPassword} 
                      onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})} 
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Nova Senha</label>
                    <Input 
                      type="password" 
                      value={securityData.newPassword} 
                      onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} 
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Confirmar Nova Senha</label>
                    <Input 
                      type="password" 
                      value={securityData.confirmPassword} 
                      onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} 
                      placeholder="••••••••"
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      if(!securityData.currentPassword || !securityData.newPassword) {
                        showToast('Preencha a senha atual e a nova senha.');
                        return;
                      }
                      if(securityData.newPassword !== securityData.confirmPassword) {
                        showToast('A nova senha e a confirmação não coincidem.');
                        return;
                      }
                      showToast('Senha alterada com sucesso!');
                      setSecurityData({...securityData, currentPassword: '', newPassword: '', confirmPassword: ''});
                    }}
                    className="bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none gap-2 mt-2"
                  >
                    <Key size={16} /> Atualizar Senha
                  </Button>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-8 space-y-6 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white transition-colors">Autenticação de Dois Fatores (2FA)</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Aumente a segurança da sua conta exigindo um código de aplicativo (Google Authenticator).</p>
                  </div>
                  <Button 
                    variant={securityData.twoFactorEnabled ? "danger" : "success"}
                    onClick={() => {
                      if(!securityData.twoFactorEnabled) {
                        setSecurityData({...securityData, showQrCode: true, twoFactorEnabled: true});
                      } else {
                        setSecurityData({...securityData, showQrCode: false, twoFactorEnabled: false});
                        showToast('2FA desativado.');
                      }
                    }}
                  >
                    {securityData.twoFactorEnabled ? "Desativar 2FA" : "Ativar 2FA"}
                  </Button>
                </div>

                {securityData.showQrCode && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-8 transition-colors animate-in fade-in duration-300">
                    <div className="p-4 bg-white rounded-xl shadow-md border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center">
                      <QrCode size={120} className="text-slate-900" />
                      <span className="text-[10px] font-mono mt-2 text-slate-500">VAREJOFLOW-2FA</span>
                    </div>
                    <div className="space-y-3 text-center sm:text-left">
                      <h4 className="font-bold text-slate-800 dark:text-white transition-colors">Escaneie o QR Code</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Abra o Google Authenticator ou Authy no seu celular e escaneie o código ao lado. Ou insira a chave secreta manualmente:</p>
                      <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-900 p-2 rounded-lg font-mono text-xs text-slate-700 dark:text-slate-300 justify-center sm:justify-start">
                        <span>JBSWY3DPEHPK3PXP</span>
                        <button onClick={() => showToast('Chave copiada!')} className="p-1 hover:bg-slate-300 dark:hover:bg-slate-800 rounded">
                          <Copy size={14} />
                        </button>
                      </div>
                      <div className="pt-2">
                        <Button size="sm" onClick={() => { setSecurityData({...securityData, showQrCode: false}); showToast('2FA configurado com sucesso!'); }}>
                          Concluir Configuração
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-8 space-y-6 transition-colors">
                <h3 className="text-lg font-black text-slate-800 dark:text-white transition-colors">Sessões Ativas</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Estes são os dispositivos que acessaram sua conta recentemente. Desconecte se não reconhecer algum.</p>
                <div className="space-y-3">
                  {[
                    { device: 'MacBook Pro - Chrome', ip: '187.20.145.99', location: 'São Paulo, SP', time: 'Ativo agora', isCurrent: true, icon: Laptop },
                    { device: 'iPhone 15 Pro - Safari', ip: '177.103.45.12', location: 'São Paulo, SP', time: 'Há 2 horas', isCurrent: false, icon: Smartphone },
                    { device: 'Windows 11 - Edge', ip: '200.15.89.231', location: 'Campinas, SP', time: 'Ontem às 14:32', isCurrent: false, icon: Laptop },
                  ].map((sess, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-300 transition-colors">
                          <sess.icon size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800 dark:text-white transition-colors">{sess.device}</span>
                            {sess.isCurrent && <Badge variant="success">Sessão Atual</Badge>}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{sess.location} • IP: {sess.ip} • {sess.time}</p>
                        </div>
                      </div>
                      {!sess.isCurrent && (
                        <Button variant="ghost" size="sm" onClick={() => showToast('Dispositivo desconectado.')} className="text-red-500 hover:text-red-600 dark:hover:bg-red-500/10">
                          Desconectar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'import' && (
            <Card className="p-8 space-y-8 animate-in fade-in duration-300">
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 transition-colors">Importação de Cadastros em Lote</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 transition-colors">Importe rapidamente seus cadastros usando planilhas CSV ou Excel padrão.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'products', label: 'Produtos', icon: Database, sample: 'modelo_produtos.csv' },
                    { id: 'customers', label: 'Clientes', icon: User, sample: 'modelo_clientes.csv' },
                    { id: 'suppliers', label: 'Fornecedores', icon: Building, sample: 'modelo_fornecedores.csv' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setImportData({...importData, selectedType: type.id, importSuccess: false, importProgress: 0})}
                      className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        importData.selectedType === type.id 
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <type.icon size={24} />
                        {importData.selectedType === type.id && <Check size={18} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-1">{type.label}</h4>
                        <span className="text-[10px] underline opacity-80 hover:opacity-100" onClick={(e) => { e.stopPropagation(); showToast(`Baixando ${type.sample}...`); }}>
                          Baixar planilha modelo
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center space-y-4 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm transition-colors">
                    <FileSpreadsheet size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 dark:text-white text-base transition-colors">Arraste e solte sua planilha aqui</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Suporta arquivos .CSV ou .XLSX até 10MB</p>
                  </div>
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    accept=".csv,.xlsx"
                    onChange={(e) => {
                      if(e.target.files?.[0]) {
                        setImportData({...importData, file: e.target.files[0], importSuccess: false});
                      }
                    }}
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" size="sm" className="cursor-pointer" as="span">
                      Selecionar Arquivo
                    </Button>
                  </label>
                  {importData.file && (
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm text-xs text-slate-700 dark:text-slate-300 transition-colors animate-in fade-in">
                      <FileText size={14} className="text-blue-500" />
                      <span className="font-bold">{importData.file.name}</span>
                      <button onClick={() => setImportData({...importData, file: null})} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {importData.file && !importData.importSuccess && (
                  <div className="flex justify-end">
                    <Button 
                      isLoading={importData.isImporting}
                      onClick={() => {
                        setImportData(prev => ({...prev, isImporting: true}));
                        let prog = 0;
                        const interval = setInterval(() => {
                          prog += 25;
                          setImportData(prev => ({...prev, importProgress: prog}));
                          if(prog >= 100) {
                            clearInterval(interval);
                            setImportData(prev => ({...prev, isImporting: false, importSuccess: true, file: null}));
                            showToast('Importação concluída com sucesso!');
                          }
                        }, 400);
                      }}
                      className="bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none gap-2"
                    >
                      <Upload size={16} /> Iniciar Importação
                    </Button>
                  </div>
                )}

                {importData.isImporting && (
                  <div className="space-y-2 animate-in fade-in">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span>Processando linhas da planilha...</span>
                      <span>{importData.importProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${importData.importProgress}%` }}></div>
                    </div>
                  </div>
                )}

                {importData.importSuccess && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-center gap-4 text-emerald-800 dark:text-emerald-400 transition-colors animate-in fade-in">
                    <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm">
                      <Check size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Registros importados com sucesso!</h4>
                      <p className="text-xs opacity-90">Os novos dados já estão disponíveis nas respectivas abas do sistema.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-8 space-y-6 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white transition-colors">Exportação e Backup Geral</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Faça o download de um backup completo com todas as movimentações, vendas e estoque.</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => showToast('Gerando pacote de backup (SQL + CSV)... Download iniciado.')}
                    className="gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Download size={16} /> Exportar Backup Geral
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

