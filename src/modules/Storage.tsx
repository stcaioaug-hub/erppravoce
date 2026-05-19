import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from '../components/ui';
import { HardDrive, AlertTriangle, Trash2, FileText, Image as ImageIcon, Database, Server, Info, Check, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Mock data for storage usage
const STORAGE_LIMIT_GB = 10;
const CURRENT_USAGE_GB = 10.5; // Deliberately over the limit to show the alert

const usageData = [
  { name: 'Imagens de Produtos', value: 4.2, color: '#3b82f6' }, // blue-500
  { name: 'Notas Fiscais (XML/PDF)', value: 3.5, color: '#10b981' }, // emerald-500
  { name: 'Relatórios Exportados', value: 2.1, color: '#f59e0b' }, // amber-500
  { name: 'Logs e Dados Temporários', value: 0.7, color: '#64748b' }, // slate-500
];

const usersUsageData = [
  { name: 'Loja Centro (João)', used: 4.5, limit: 5 },
  { name: 'Filial Sul (Maria)', used: 2.1, limit: 5 },
  { name: 'Admin Principal', used: 3.9, limit: 10 },
];

export const Storage = ({ userRole }: { userRole?: 'admin' | 'client' }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [freedSpace, setFreedSpace] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const usagePercent = ((CURRENT_USAGE_GB - freedSpace) / STORAGE_LIMIT_GB) * 100;
  const isOverLimit = usagePercent > 100;
  const currentUsage = Math.max(0, CURRENT_USAGE_GB - freedSpace);

  useEffect(() => {
    if (isOverLimit) {
      setShowAlert(true);
      // Simulating an API call to alert admins
      console.log('Alerta de limite de armazenamento excedido disparado para os administradores.');
    } else {
      setShowAlert(false);
    }
  }, [isOverLimit]);

  const handleClearSpace = (amountToClear: number) => {
    setFreedSpace(prev => prev + amountToClear);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Armazenamento</h1>
        <p className="text-slate-500">Gerencie o uso de dados do seu banco de dados e arquivos.</p>
      </div>

      {showAlert && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex items-start gap-4">
          <div className="bg-red-100 p-2 rounded-full mt-0.5">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <h3 className="text-red-800 font-bold text-lg">Atenção: Limite de Armazenamento Excedido!</h3>
            <p className="text-red-700 mt-1">
              O seu consumo atual de dados (<strong>{currentUsage.toFixed(2)} GB</strong>) ultrapassou o limite contratado de <strong>{STORAGE_LIMIT_GB} GB</strong>.
            </p>
            <p className="text-red-700 font-medium mt-2">
              ⚠️ Um alerta foi disparado automaticamente para os administradores do sistema. Por favor, libere espaço para garantir o funcionamento adequado.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Storage Overview Card */}
        <Card className="p-6 lg:col-span-2 shadow-sm border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <HardDrive size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Uso Total do Banco de Dados</h2>
              <p className="text-sm text-slate-500">Capacidade e distribuição do seu plano atual</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {usageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} GB`, 'Consumo']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-36px]">
                <span className="text-2xl font-black text-slate-800">{currentUsage.toFixed(1)}</span>
                <span className="text-xs text-slate-500 font-medium">GB Usados</span>
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Capacidade Utilizada</p>
                    <p className="text-2xl font-black text-slate-800">
                      {usagePercent.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">
                      {currentUsage.toFixed(2)} GB / {STORAGE_LIMIT_GB} GB
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${isOverLimit ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                {usageData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-700 truncate" title={item.name}>{item.name}</p>
                      <p className="text-xs text-slate-500">{item.value} GB</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Actionable Tips Card */}
        <Card className="p-6 shadow-sm border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Dicas de Limpeza</h2>
              <p className="text-sm text-slate-500">Libere espaço agora</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <Server size={18} className="text-slate-400" />
                  <span className="font-semibold text-sm">Logs do Sistema</span>
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">~0.7 GB</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">Exclua logs de acesso e dados temporários de sessão antigos.</p>
              <Button 
                onClick={() => handleClearSpace(0.7)}
                className="w-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 h-9"
              >
                <Trash2 size={14} className="mr-2" /> Limpar Logs
              </Button>
            </div>

            <div className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText size={18} className="text-emerald-500" />
                  <span className="font-semibold text-sm">Relatórios Antigos</span>
                </div>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded">~1.5 GB</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">Exclua relatórios gerados há mais de 6 meses que não são mais úteis.</p>
              <Button 
                onClick={() => handleClearSpace(1.5)}
                className="w-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 h-9"
              >
                <Trash2 size={14} className="mr-2" /> Remover Relatórios
              </Button>
            </div>

            <div className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <ImageIcon size={18} className="text-blue-500" />
                  <span className="font-semibold text-sm">Otimizar Imagens</span>
                </div>
                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">~2.0 GB</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">Comprimir imagens de produtos e remover fotos de produtos inativos.</p>
              <Button 
                onClick={() => handleClearSpace(2.0)}
                className="w-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 h-9"
              >
                <Trash2 size={14} className="mr-2" /> Otimizar Galeria
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin specific view: Usage per user */}
      {userRole === 'admin' && (
        <Card className="p-6 shadow-sm border-slate-200 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Uso por Usuário (Cliente)</h2>
              <p className="text-sm text-slate-500">Monitoramento do limite definido por cliente do sistema</p>
            </div>
          </div>
          <div className="space-y-6">
            {usersUsageData.map((user, idx) => {
              const percent = (user.used / user.limit) * 100;
              const isWarning = percent > 85;
              return (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-700">{user.name}</span>
                    <span className="text-sm font-medium text-slate-500">
                      {user.used} GB / {user.limit} GB
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${isWarning ? 'bg-amber-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      
      <Card className="p-6 bg-slate-900 text-white border-none shadow-xl">
        <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
          <div className="p-3 bg-blue-500/20 rounded-xl shrink-0">
            <Info className="text-blue-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">Precisa de mais espaço?</h3>
            <p className="text-slate-400 text-sm mt-1">
              Faça um upgrade no seu plano para aumentar o limite do banco de dados e manter seu negócio crescendo sem interrupções.
            </p>
          </div>
          <Button 
            onClick={() => setShowUpgradeModal(true)}
            className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 border-none"
          >
            Ver Planos de Upgrade
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Planos de Armazenamento"
      >
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-xl p-4 relative overflow-hidden">
            <h4 className="font-bold text-slate-800 text-lg">Básico (Atual)</h4>
            <p className="text-slate-500 text-sm mt-1 mb-4">Ideal para pequenos negócios.</p>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-3xl font-black text-slate-900">R$ 49</span>
              <span className="text-slate-500 font-medium">/mês</span>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <Check size={16} className="text-emerald-500" /> 10 GB de Armazenamento
              </li>
            </ul>
            <Button variant="outline" className="w-full" disabled>
              Plano Atual
            </Button>
          </div>

          <div className="border-2 border-blue-500 rounded-xl p-4 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
              Recomendado
            </div>
            <h4 className="font-bold text-blue-900 text-lg">Profissional</h4>
            <p className="text-blue-700/80 text-sm mt-1 mb-4">Para quem está crescendo rápido.</p>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-3xl font-black text-blue-900">R$ 99</span>
              <span className="text-blue-700 font-medium">/mês</span>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-blue-800">
                <Check size={16} className="text-blue-500" /> 50 GB de Armazenamento
              </li>
              <li className="flex items-center gap-2 text-sm text-blue-800">
                <Check size={16} className="text-blue-500" /> Suporte Prioritário
              </li>
              <li className="flex items-center gap-2 text-sm text-blue-800">
                <Check size={16} className="text-blue-500" /> Backups Diários
              </li>
            </ul>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Fazer Upgrade
            </Button>
          </div>
          
          <div className="border border-slate-200 rounded-xl p-4 relative overflow-hidden">
            <h4 className="font-bold text-slate-800 text-lg">Enterprise</h4>
            <p className="text-slate-500 text-sm mt-1 mb-4">Para operações de grande porte.</p>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-3xl font-black text-slate-900">R$ 299</span>
              <span className="text-slate-500 font-medium">/mês</span>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <Check size={16} className="text-emerald-500" /> 500 GB de Armazenamento
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600">
                <Check size={16} className="text-emerald-500" /> Suporte Dedicado 24/7
              </li>
            </ul>
            <Button variant="outline" className="w-full">
              Falar com Vendas
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
