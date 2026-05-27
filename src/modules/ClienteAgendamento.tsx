import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scissors, Calendar, Clock, Sparkles, CheckCircle, 
  Phone, ChevronRight, ChevronLeft, Search, Check, 
  CalendarClock, User, X, MessageSquare, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button, Card, Input, Badge } from '../components/ui';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { StudioBrand } from '../components/StudioBrand';
import { StudioAppointment } from '../types';

type Appointment = StudioAppointment;

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ClienteAgendamento = () => {
  const todayStr = getLocalDateString();
  const { theme, toggleTheme } = useTheme();
  
  // Navigation tabs: 'agendar' (booking wizard) or 'acompanhar' (track booking status)
  const [activeTab, setActiveTab] = useState<'agendar' | 'acompanhar'>('agendar');

  // Appointments database (loaded from localStorage)
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Load existing appointments
    const stored = localStorage.getItem('flow_appointments');
    if (stored) {
      setAppointments(JSON.parse(stored));
    }
  }, []);

  // Wizard selections state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState('Corte Feminino + Escova');
  const [selectedPrice, setSelectedPrice] = useState(120.00);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Booking requested success state
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [lastRequestedId, setLastRequestedId] = useState('');

  // Status check states
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedUser, setSearchedUser] = useState(false);

  // Standard service options matching the salon configuration
  const serviceOptions = [
    { name: 'Corte Feminino + Escova', price: 120.00, duration: '45 min' },
    { name: 'Mechas & Luzes', price: 350.00, duration: '180 min' },
    { name: 'Hidratação L\'Oréal', price: 180.00, duration: '60 min' },
    { name: 'Corte Masculino Degradê', price: 50.00, duration: '30 min' },
    { name: 'Corte Masculino Social', price: 45.00, duration: '30 min' },
    { name: 'Corte Masculino + Barba', price: 80.00, duration: '45 min' },
    { name: 'Barba Completa (Terapia)', price: 45.00, duration: '30 min' },
    { name: 'Selante / Progressiva Masculina', price: 90.00, duration: '60 min' },
    { name: 'Pigmentação Cabelo/Barba', price: 40.00, duration: '30 min' },
    { name: 'Progressiva Definitiva', price: 250.00, duration: '120 min' },
    { name: 'Penteado Especial', price: 150.00, duration: '90 min' },
    { name: 'Maquiagem Profissional', price: 160.00, duration: '60 min' },
    { name: 'Manicure & Pedicure', price: 70.00, duration: '60 min' },
  ];

  const standardTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Dynamically compute available times for the client based on date selected
  const availableSlots = useMemo(() => {
    const booked = appointments
      .filter(app => app.date === selectedDate && app.status !== 'cancelado')
      .map(app => app.time);
    return standardTimeSlots.filter(t => !booked.includes(t));
  }, [selectedDate, appointments]);

  // Compute next 7 days
  const next7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateStr = getLocalDateString(d);
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      days.push({
        dateStr,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        dayNum,
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1)
      });
    }
    return days;
  }, [todayStr]);

  // Formatter utilities
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const getFriendlyDate = (dateStr: string) => {
    if (dateStr === todayStr) return 'Hoje';
    const d = new Date(dateStr + 'T00:00:00');
    const tomorrow = new Date(todayStr + 'T00:00:00');
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === getLocalDateString(tomorrow)) return 'Amanhã';

    return d.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short',
      weekday: 'long' 
    });
  };

  const handleServiceSelect = (name: string, price: number) => {
    setSelectedService(name);
    setSelectedPrice(price);
    setStep(2);
  };

  const handleConfirmRequest = () => {
    if (!clientName || !clientPhone || !selectedTime) return;

    const newApp: Appointment = {
      id: Date.now().toString(),
      date: selectedDate,
      time: selectedTime,
      clientName,
      service: selectedService,
      price: selectedPrice,
      status: 'pendente_aprovacao',
      phone: clientPhone
    };

    const updated = [...appointments, newApp];
    setAppointments(updated);
    localStorage.setItem('flow_appointments', JSON.stringify(updated));
    setLastRequestedId(newApp.id);
    setBookingSuccess(true);
  };

  const clientAppointments = useMemo(() => {
    if (!searchPhone) return [];
    const cleanSearch = searchPhone.replace(/\D/g, '');
    return appointments.filter(app => {
      const cleanPhone = app.phone?.replace(/\D/g, '') || '';
      return cleanPhone === cleanSearch || cleanPhone.includes(cleanSearch);
    }).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }, [searchPhone, appointments]);

  const resetWizard = () => {
    setStep(1);
    setSelectedDate(todayStr);
    setSelectedTime('');
    setClientName('');
    setClientPhone('');
    setBookingSuccess(false);
    setLastRequestedId('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 transition-colors duration-300 relative overflow-x-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#b81830]/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#b81830]/[0.04] rounded-full blur-3xl pointer-events-none" />

      {/* Booking Portal Header */}
      <header className="relative z-10 px-6 py-5 bg-white border-b border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <StudioBrand />

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200/60">
          <button
            onClick={() => {
              setActiveTab('agendar');
              resetWizard();
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'agendar'
                ? 'bg-[#b81830] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarClock size={14} /> Novo Agendamento
          </button>
          <button
            onClick={() => setActiveTab('acompanhar')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'acompanhar'
                ? 'bg-[#b81830] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone size={14} /> Meus Agendamentos
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-4 py-8 relative z-10 flex flex-col justify-center">
        
        {/* TAB 1: NEW BOOKING WIZARD */}
        {activeTab === 'agendar' && (
          <div className="w-full flex-1 flex flex-col justify-center">
            {bookingSuccess ? (
              /* Success Screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6 max-w-md mx-auto"
              >
                <div className="w-16 h-16 bg-[#b81830]/10 text-[#b81830] rounded-full flex items-center justify-center mx-auto shadow-inner border border-[#b81830]/20">
                  <CheckCircle size={36} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 font-serif">Solicitação Enviada!</h2>
                  <p className="text-sm text-slate-500">
                    O profissional foi notificado. Assim que ele aprovar o seu horário, você poderá acompanhar por aqui.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 text-slate-700">
                  <p><strong>Serviço:</strong> {selectedService}</p>
                  <p><strong>Data:</strong> {selectedDate.split('-').reverse().join('/')} às {selectedTime}</p>
                  <p><strong>Valor:</strong> {formatCurrency(selectedPrice)}</p>
                  <p className="text-[#b81830] font-bold flex items-center gap-1 mt-2">
                    <RefreshCw size={12} className="animate-spin" /> Status: Aguardando aprovação do profissional
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      setActiveTab('acompanhar');
                      setSearchPhone(clientPhone);
                    }}
                    className="w-full bg-[#b81830] hover:bg-[#991326] text-white rounded-xl h-11 shadow-md shadow-[#b81830]/10 font-bold"
                  >
                    Acompanhar Meus Agendamentos
                  </Button>
                  <Button
                    onClick={resetWizard}
                    variant="outline"
                    className="w-full rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600"
                  >
                    Fazer Outro Agendamento
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* Multi-step Wizard Container */
              <div className="flex flex-col flex-1 space-y-6">
                
                {/* Visual Step Indicator Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span className={step >= 1 ? 'text-[#b81830] font-black' : ''}>1. Serviço</span>
                    <span className={step >= 2 ? 'text-[#b81830] font-black' : ''}>2. Data & Hora</span>
                    <span className={step >= 3 ? 'text-[#b81830] font-black' : ''}>3. Identificação</span>
                    <span className={step >= 4 ? 'text-[#b81830] font-black' : ''}>4. Revisão</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300/40">
                    <div 
                      className="bg-[#b81830] h-full transition-all duration-300"
                      style={{ width: `${step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-lg shadow-slate-100 min-h-[400px] flex flex-col justify-between">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 flex flex-col space-y-5"
                    >
                      {/* STEP 1: SELECT SERVICE */}
                      {step === 1 && (
                        <div className="space-y-4 flex-1">
                          <div>
                            <h2 className="text-lg font-black tracking-tight text-slate-900 font-serif">Qual serviço você gostaria de agendar?</h2>
                            <p className="text-xs text-slate-500">Escolha uma das opções abaixo para ver a disponibilidade.</p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                            {serviceOptions.map((opt) => {
                               const isSelected = selectedService === opt.name;
                               return (
                                 <button
                                   key={opt.name}
                                   type="button"
                                   onClick={() => handleServiceSelect(opt.name, opt.price)}
                                   className={`p-4 rounded-2xl border text-left transition-all flex justify-between items-center shadow-sm relative ${
                                     isSelected 
                                       ? 'border-[#b81830] bg-[#b81830]/5 ring-1 ring-[#b81830]' 
                                       : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50'
                                   }`}
                                 >
                                   <div className="flex items-center gap-2.5 min-w-0">
                                     <div className="p-2 bg-slate-100 text-slate-500 rounded-xl shrink-0">
                                       <Scissors size={14} className="text-[#b81830]" />
                                     </div>
                                     <div className="truncate pr-2">
                                       <p className="font-extrabold text-sm text-slate-800 truncate">{opt.name}</p>
                                       <p className="text-[10px] text-slate-500 mt-0.5">{opt.duration}</p>
                                     </div>
                                   </div>
                                   <div className="text-right shrink-0 font-black text-sm text-[#b81830]">
                                     {formatCurrency(opt.price)}
                                   </div>
                                 </button>
                               );
                            })}
                          </div>
                        </div>
                      )}

                      {/* STEP 2: SELECT DATE & TIME */}
                      {step === 2 && (
                        <div className="space-y-5 flex-1">
                          <div>
                            <h2 className="text-lg font-black tracking-tight text-slate-900 font-serif">Escolha a data e o horário</h2>
                            <p className="text-xs text-slate-500">Selecione um dos dias abaixo e visualize os horários livres.</p>
                          </div>

                          {/* Quick Date Grid */}
                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-550 uppercase tracking-widest">
                              Sugestões de Datas Próximas
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                              {next7Days.map((d) => {
                                const isSelected = selectedDate === d.dateStr;
                                return (
                                  <button
                                    key={d.dateStr}
                                    type="button"
                                    onClick={() => {
                                      setSelectedDate(d.dateStr);
                                      setSelectedTime('');
                                    }}
                                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 min-h-[80px] shadow-sm ${
                                      isSelected 
                                        ? 'border-[#b81830] bg-[#b81830]/10 text-[#b81830] font-black ring-2 ring-[#b81830]/10 scale-[1.02]' 
                                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-100/50'
                                    }`}
                                  >
                                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">{d.dayName}</span>
                                    <span className={`text-lg font-black leading-none ${isSelected ? 'text-[#b81830]' : 'text-slate-800'}`}>{d.dayNum}</span>
                                    <span className="text-[8px] uppercase font-bold opacity-75">{d.monthName}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Custom Date Selector Card */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#b81830]/10 text-[#b81830] rounded-xl border border-[#b81830]/15">
                                <Calendar size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-800">Outra Data</p>
                                <p className="text-[10px] text-slate-500">Quer agendar para o próximo mês ou outra data futura?</p>
                              </div>
                            </div>
                            <div className="w-full sm:w-auto relative">
                              <Input
                                type="date"
                                min={todayStr}
                                value={selectedDate}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    setSelectedDate(e.target.value);
                                    setSelectedTime('');
                                  }
                                }}
                                className="rounded-xl h-11 text-xs border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-[#b81830] text-center font-bold px-3 w-full sm:w-44"
                              />
                            </div>
                          </div>

                          {/* Time Grid */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Horários disponíveis para {getFriendlyDate(selectedDate)}</label>
                            {availableSlots.length === 0 ? (
                              <div className="text-center p-6 bg-rose-50/40 rounded-2xl border border-dashed border-[#b81830]/20 text-[#b81830] font-bold text-xs">
                                Todos os horários estão preenchidos para esta data. Por favor escolha outro dia acima.
                              </div>
                            ) : (
                              <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                                {availableSlots.map((time) => {
                                  const isSelected = selectedTime === time;
                                  return (
                                    <button
                                      key={time}
                                      type="button"
                                      onClick={() => setSelectedTime(time)}
                                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 shadow-sm ${
                                        isSelected 
                                          ? 'border-[#b81830] bg-[#b81830]/10 text-[#b81830] font-extrabold ring-2 ring-[#b81830]/10' 
                                          : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50'
                                      }`}
                                    >
                                      {time}
                                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-[#b81830]' : 'bg-emerald-500'}`} />
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* STEP 3: CLIENT DETAILS */}
                      {step === 3 && (
                        <div className="space-y-5 flex-1">
                          <div>
                            <h2 className="text-lg font-black tracking-tight text-slate-900 font-serif">Identificação do Cliente</h2>
                            <p className="text-xs text-slate-500">Insira seu nome e telefone para que possamos confirmar seu horário.</p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Seu Nome Completo</label>
                              <Input 
                                type="text" 
                                placeholder="Ex: Maria de Oliveira" 
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="rounded-xl h-12 focus:ring-2 focus:ring-[#b81830] border-slate-200 bg-white text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Seu WhatsApp / Telefone</label>
                              <Input 
                                type="text" 
                                placeholder="Ex: (11) 99999-8888" 
                                value={clientPhone}
                                onChange={(e) => setClientPhone(formatPhoneNumber(e.target.value))}
                                className="rounded-xl h-12 focus:ring-2 focus:ring-[#b81830] border-slate-200 bg-white text-slate-800"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 4: REVIEW & CONFIRM */}
                      {step === 4 && (
                        <div className="space-y-4 flex-1">
                          <div className="text-center">
                            <h2 className="text-base font-black text-slate-900 font-serif">Revise seus dados de agendamento</h2>
                            <p className="text-xs text-slate-500">Confirme se tudo está correto antes de solicitar seu horário.</p>
                          </div>

                          {/* Ticket summary */}
                          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4 shadow-inner relative overflow-hidden text-slate-700">
                            <div className="h-1 bg-[#b81830] absolute top-0 inset-x-0" />
                            
                            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resumo da Reserva</span>
                              <Badge variant="warning" className="rounded-full font-black text-[9px] uppercase tracking-wider">Aprovação Pendente</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-slate-500 font-semibold mb-0.5">Nome:</p>
                                <p className="font-extrabold text-slate-800 truncate">{clientName}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 font-semibold mb-0.5">Telefone:</p>
                                <p className="font-extrabold text-slate-800">{clientPhone}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 font-semibold mb-0.5">Serviço:</p>
                                <p className="font-extrabold text-slate-800 truncate">{selectedService}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 font-semibold mb-0.5">Valor Padrão:</p>
                                <p className="font-black text-[#b81830] text-sm">{formatCurrency(selectedPrice)}</p>
                              </div>
                              <div className="col-span-2 pt-2 border-t border-dashed border-slate-200 flex items-center gap-2">
                                <Calendar size={14} className="text-[#b81830] shrink-0" />
                                <div>
                                  <p className="font-extrabold text-slate-800">{getFriendlyDate(selectedDate)}</p>
                                  <p className="text-[10px] text-slate-500">Reservado para as <strong>{selectedTime}</strong></p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Actions footer inside card */}
                  <div className="pt-6 border-t border-slate-200 flex justify-between gap-4 mt-6">
                    <Button
                      onClick={() => {
                        if (step > 1) {
                          setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
                        }
                      }}
                      disabled={step === 1}
                      variant="outline"
                      className="flex-1 rounded-xl h-11 border-slate-200 hover:bg-slate-50 text-slate-500"
                    >
                      <ChevronLeft size={16} className="mr-1" /> Voltar
                    </Button>

                    {step < 4 ? (
                      <Button
                        onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)}
                        disabled={
                          (step === 1 && !selectedService) ||
                          (step === 2 && !selectedTime) ||
                          (step === 3 && (!clientName || clientPhone.length < 10))
                        }
                        className="flex-1 bg-[#b81830] hover:bg-[#991326] text-white rounded-xl h-11 shadow-md shadow-[#b81830]/10 font-bold"
                      >
                        Avançar <ChevronRight size={16} className="ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleConfirmRequest}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl h-11 shadow-md shadow-emerald-500/10 font-bold"
                      >
                        <Check size={16} className="mr-1.5" /> Solicitar Horário
                      </Button>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRACK STATUS DASHBOARD */}
        {activeTab === 'acompanhar' && (
          <div className="w-full flex-1 flex flex-col justify-center">
            <Card className="p-6 border border-slate-200 bg-white shadow-lg space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-black tracking-tight text-slate-900 font-serif">Acompanhar Meus Horários</h2>
                <p className="text-xs text-slate-500">Digite seu WhatsApp para buscar o histórico de solicitações.</p>
              </div>

              {/* Phone search field */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <Input
                    placeholder="WhatsApp (ex: 11 99999-8888)"
                    value={searchPhone}
                    onChange={(e) => {
                      setSearchPhone(formatPhoneNumber(e.target.value));
                      setSearchedUser(false);
                    }}
                    className="pl-12 rounded-xl h-12 border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-[#b81830]"
                  />
                </div>
                <Button
                  onClick={() => setSearchedUser(true)}
                  disabled={searchPhone.length < 10}
                  className="bg-[#b81830] hover:bg-[#991326] text-white rounded-xl h-12 shadow-md shadow-[#b81830]/10 font-bold px-6"
                >
                  <Search size={16} className="mr-2" /> Buscar
                </Button>
              </div>

              {/* Search results list */}
              {searchedUser && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-2"
                >
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Solicitações Encontradas ({clientAppointments.length})</h3>
                  {clientAppointments.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs p-6">
                      Nenhum agendamento foi encontrado para o número {searchPhone}.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {clientAppointments.map((app) => (
                        <div
                          key={app.id}
                          className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-slate-200/60 text-slate-700 font-bold text-[10px] border border-slate-300/40">
                                {app.time}
                              </Badge>
                              <span className="text-xs text-slate-500">{app.date.split('-').reverse().join('/')}</span>
                            </div>
                            <p className="font-extrabold text-sm text-slate-800">{app.service}</p>
                            <p className="text-[10px] text-slate-500">Solicitado por {app.clientName}</p>
                          </div>
                          <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                            <span className="font-black text-sm text-slate-900">{formatCurrency(app.price)}</span>
                            
                            {app.status === 'pendente_aprovacao' && (
                              <Badge variant="warning" className="rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                <RefreshCw size={8} className="animate-spin" /> Analisando
                              </Badge>
                            )}
                            {app.status === 'aguardando' && (
                              <Badge variant="success" className="rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                <Check size={8} /> Confirmado
                              </Badge>
                            )}
                            {app.status === 'concluido' && (
                              <Badge variant="success" className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-wider">
                                Concluído
                              </Badge>
                            )}
                            {app.status === 'cancelado' && (
                              <Badge variant="danger" className="rounded-full text-[9px] font-black uppercase tracking-wider">
                                Recusado
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 border-t border-slate-200/80 relative z-10 transition-colors">
        <p>© 2026 Leandro Della Riva. Todos os direitos reservados.</p>
        <p className="mt-1 opacity-70">Desenvolvido com ERP Pra Você & TechFlow</p>
      </footer>
    </div>
  );
};
