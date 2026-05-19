import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { 
  Landmark, 
  Receipt, 
  FileText, 
  FolderArchive, 
  Settings as SettingsIcon, 
  Download,
  Search,
  Filter,
  Plus,
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Painel Fiscal', icon: Landmark },
  { id: 'nfe', label: 'Notas Fiscais (NFe/NFCe)', icon: Receipt },
  { id: 'impostos', label: 'Apuração de Impostos', icon: Percent },
  { id: 'arquivos', label: 'Arquivos Fiscais (SPED)', icon: FolderArchive },
  { id: 'configuracoes', label: 'Configurações Tributárias', icon: SettingsIcon },
];

export const Tributary: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <TaxDashboard />;
      case 'nfe':
        return <FiscalNotes />;
      case 'impostos':
        return <TaxesCalculation />;
      case 'arquivos':
        return <FiscalFiles />;
      case 'configuracoes':
        return <TaxConfiguration />;
      default:
        return <TaxDashboard />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Landmark className="text-indigo-600" size={28} />
            Departamento Tributário
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gestão de notas fiscais, impostos e obrigações acessórias.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-slate-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

// Sub-pages Components

const TaxDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Impostos no Mês</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">R$ 12.450,00</h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Percent size={20} />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4 flex items-center gap-1">
            <span className="text-emerald-500 font-medium">-2.4%</span> vs mês anterior
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">NFe Emitidas</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">142</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">Autorizadas com sucesso</p>
        </Card>

        <Card className="p-5 border-l-4 border-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">NFCe Pendentes</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">3</h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <AlertCircle size={20} />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">Aguardando contingência</p>
        </Card>

        <Card className="p-5 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Obrigações</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">SPED Fiscal</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FolderArchive size={20} />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4 text-emerald-500 flex items-center gap-1">
            <CheckCircle2 size={14} /> Enviado este mês
          </p>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Avisos Fiscais</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <div>
              <h4 className="font-bold">Certificado Digital Próximo do Vencimento</h4>
              <p className="text-sm mt-1">O certificado digital A1 da empresa expira em 15 dias (30/05/2026). Providencie a renovação para não interromper a emissão de notas.</p>
            </div>
            <Button variant="outline" className="ml-auto bg-white whitespace-nowrap text-amber-700 border-amber-300 hover:bg-amber-100">
              Renovar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const FiscalNotes = () => {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 items-center bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input className="pl-10 h-10 bg-white" placeholder="Buscar por chave ou número..." />
          </div>
          <Button variant="outline" className="h-10 bg-white">
            <Filter size={18} className="mr-2" />
            Filtros
          </Button>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none">
            Inutilizar Numeração
          </Button>
          <Button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700">
            <Plus size={18} className="mr-2" />
            Emitir NFe Avulsa
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Série/Número</th>
              <th className="px-6 py-4">Data Emissão</th>
              <th className="px-6 py-4">Destinatário</th>
              <th className="px-6 py-4">Valor Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((item) => (
              <tr key={item} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">1 / 000{142 - item}</td>
                <td className="px-6 py-4 text-slate-600">15/05/2026 14:30</td>
                <td className="px-6 py-4 text-slate-600">Cliente Exemplo LTDA</td>
                <td className="px-6 py-4 text-slate-600 font-medium">R$ 1.250,00</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    Autorizada
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600">
                      <Download size={16} />
                    </Button>
                    <Button variant="ghost" className="h-8 px-2 text-slate-400 hover:text-slate-800 text-xs font-medium">
                      DANFE
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const TaxesCalculation = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Apuração do Simples Nacional (DAS)</h3>
        <p className="text-slate-500 mb-6">Competência atual: <strong>Maio/2026</strong></p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Faturamento no Mês</label>
            <Input disabled value="R$ 45.000,00" className="bg-slate-50 font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Alíquota Efetiva</label>
            <Input disabled value="8.4%" className="bg-slate-50 font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Valor Estimado do DAS</label>
            <Input disabled value="R$ 3.780,00" className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200" />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Gerar Guia de Pagamento (DAS)
          </Button>
        </div>
      </Card>
    </div>
  );
};

const FiscalFiles = () => {
  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Arquivos e Obrigações Acessórias</h3>
          <p className="text-slate-500 text-sm">Geração de arquivos SPED, Sintegra e XMLs para o contador.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5 border border-slate-200 shadow-none hover:border-indigo-300 transition-colors cursor-pointer group">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FolderArchive size={24} />
            </div>
          </div>
          <h4 className="font-bold text-slate-800 mt-4">SPED Fiscal (ICMS/IPI)</h4>
          <p className="text-sm text-slate-500 mt-1">Gere o arquivo EFD ICMS/IPI do mês para envio à contabilidade.</p>
          <Button variant="outline" className="w-full mt-4 group-hover:border-indigo-600 group-hover:text-indigo-600">
            Gerar Arquivo
          </Button>
        </Card>

        <Card className="p-5 border border-slate-200 shadow-none hover:border-indigo-300 transition-colors cursor-pointer group">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FolderArchive size={24} />
            </div>
          </div>
          <h4 className="font-bold text-slate-800 mt-4">SPED Contribuições</h4>
          <p className="text-sm text-slate-500 mt-1">Gere o arquivo EFD Contribuições (PIS/COFINS).</p>
          <Button variant="outline" className="w-full mt-4 group-hover:border-indigo-600 group-hover:text-indigo-600">
            Gerar Arquivo
          </Button>
        </Card>

        <Card className="p-5 border border-slate-200 shadow-none hover:border-indigo-300 transition-colors cursor-pointer group">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileText size={24} />
            </div>
          </div>
          <h4 className="font-bold text-slate-800 mt-4">Exportar XMLs</h4>
          <p className="text-sm text-slate-500 mt-1">Baixe um pacote ZIP com todos os XMLs de notas emitidas no período.</p>
          <Button variant="outline" className="w-full mt-4 group-hover:border-indigo-600 group-hover:text-indigo-600">
            Exportar XMLs
          </Button>
        </Card>
      </div>
    </Card>
  );
};

const TaxConfiguration = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Dados Fiscais da Empresa</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Regime Tributário</label>
            <select className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option>Simples Nacional</option>
              <option>Lucro Presumido</option>
              <option>Lucro Real</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Inscrição Estadual</label>
            <Input defaultValue="123.456.789.000" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Inscrição Municipal</label>
            <Input defaultValue="987654321" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">CNAE Principal</label>
            <Input defaultValue="47.11-3-02 - Comércio varejista de mercadorias em geral" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Certificado Digital</h3>
        
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <FileText size={32} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800">Certificado A1 (Arquivo PFX)</h4>
            <p className="text-sm text-slate-500 mt-1">Válido até 30/05/2026</p>
          </div>
          <Button variant="outline">
            Atualizar Certificado
          </Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};
