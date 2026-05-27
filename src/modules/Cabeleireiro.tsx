import React, { useState, useEffect } from 'react';
import { 
  Scissors, Calendar, Clock, TrendingUp, Plus, CheckCircle, 
  Clock3, Phone, Sparkles, UserPlus, ChevronRight, Sliders, 
  HelpCircle, Info, DollarSign, CalendarDays, Check, RefreshCw, X,
  Share2, Send, ChevronLeft, Search, CheckSquare, Square, CalendarClock,
  User, AlertCircle, Bell, CreditCard, Wallet, MessageSquare
} from 'lucide-react';
import { Button, Card, Input, Badge, Modal } from '../components/ui';
import { StudioBrand } from '../components/StudioBrand';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import { MOCK_CUSTOMERS } from '../data/mocks';
import { Customer, StudioAppointment } from '../types';

type Appointment = StudioAppointment;
type StudioSection = 'agenda' | 'clientes' | 'simulador' | 'finalizar';

interface CabeleireiroProps {
  section?: StudioSection;
  onSectionChange?: (section: StudioSection, appointmentId?: string) => void;
  finishAppointmentId?: string | null;
  onFinishAppointmentConsumed?: () => void;
}

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const playSoftTone = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15); // D6
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.15);
    
    osc1.stop(ctx.currentTime + 0.8);
    osc2.stop(ctx.currentTime + 0.8);
  } catch (error) {
    console.error('Audio play failed:', error);
  }
};

export const Cabeleireiro = ({
  section,
  onSectionChange,
  finishAppointmentId = null,
  onFinishAppointmentConsumed,
}: CabeleireiroProps) => {
  const todayStr = getLocalDateString();
  
  // Date navigation state
  const [viewDate, setViewDate] = useState<string>(todayStr);

  // Clients state loaded from localStorage
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(() => {
    const stored = localStorage.getItem('flow_customers');
    return stored ? JSON.parse(stored) : MOCK_CUSTOMERS;
  });
  
  // Appointment list loaded from localStorage
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const stored = localStorage.getItem('flow_appointments');
    const defaultApps: Appointment[] = [
      { id: '1', date: todayStr, time: '09:00', clientName: 'Maria Silva', service: 'Corte Feminino + Escova', price: 120.00, status: 'concluido', phone: '(11) 98765-4321', paymentMethod: 'PIX' },
      { id: '2', date: todayStr, time: '10:30', clientName: 'Ana Souza', service: 'Mechas & Luzes', price: 350.00, status: 'atendimento', phone: '(11) 99888-7766' },
      { id: '3', date: todayStr, time: '13:00', clientName: 'Bruna Costa', service: 'Hidratação L\'Oréal', price: 180.00, status: 'aguardando', phone: '(11) 97766-5544' },
      { id: '4', date: todayStr, time: '15:00', clientName: 'Carlos Eduardo', service: 'Corte Masculino + Barba', price: 80.00, status: 'aguardando', phone: '(11) 96655-4433' },
      { id: '5', date: todayStr, time: '16:30', clientName: 'Juliana Lima', service: 'Progressiva Definitiva', price: 250.00, status: 'aguardando', phone: '(11) 95544-3322' },
    ];
    return stored ? JSON.parse(stored) : defaultApps;
  });

  // Timers state for active service
  const [timers, setTimers] = useState<{ [key: string]: number }>({});

  // Visual pulse state and ref for pending appointments chime
  const [pulseActive, setPulseActive] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const seenPendingIdsRef = React.useRef<Set<string>>(new Set());

  // Sync states with localStorage
  useEffect(() => {
    localStorage.setItem('flow_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('flow_customers', JSON.stringify(localCustomers));
  }, [localCustomers]);

  // Synchronize on focus event and storage event (e.g. client makes a booking in another tab)
  useEffect(() => {
    const syncState = () => {
      const storedApps = localStorage.getItem('flow_appointments');
      if (storedApps) setAppointments(JSON.parse(storedApps));
      const storedCusts = localStorage.getItem('flow_customers');
      if (storedCusts) setLocalCustomers(JSON.parse(storedCusts));
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'flow_appointments' && e.newValue) {
        setAppointments(JSON.parse(e.newValue));
      }
      if (e.key === 'flow_customers' && e.newValue) {
        setLocalCustomers(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('focus', syncState);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('focus', syncState);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Soft audio tone and dynamic visual pulse effect when new pending booking arrives
  const pendingApps = appointments.filter(app => app.status === 'pendente_aprovacao');
  const pendingCount = pendingApps.length;

  useEffect(() => {
    const currentPending = appointments.filter(app => app.status === 'pendente_aprovacao');
    
    if (isFirstRender) {
      currentPending.forEach(app => seenPendingIdsRef.current.add(app.id));
      setIsFirstRender(false);
      return;
    }

    const currentPendingIds = currentPending.map(app => app.id);
    let hasNewPending = false;
    currentPendingIds.forEach(id => {
      if (!seenPendingIdsRef.current.has(id)) {
        hasNewPending = true;
        seenPendingIdsRef.current.add(id);
      }
    });

    // Clean up IDs that are no longer pending
    seenPendingIdsRef.current.forEach(id => {
      if (!currentPendingIds.includes(id)) {
        seenPendingIdsRef.current.delete(id);
      }
    });

    if (hasNewPending) {
      playSoftTone();
      setPulseActive(true);
      const timer = setTimeout(() => setPulseActive(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [appointments, isFirstRender]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        appointments.forEach(app => {
          if (app.status === 'atendimento' && app.date === todayStr) {
            updated[app.id] = (updated[app.id] || 0) + 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [appointments, todayStr]);

  const formatTimer = (seconds: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulators State
  const [ticketMedio, setTicketMedio] = useState<number>(150);
  const [weeklyClients, setWeeklyClients] = useState<number>(20);

  // Targets
  const dailyTarget = 800.00;
  const weeklyTarget = 3500.00;
  const monthlyTarget = 14000.00;

  // Today's stats
  const todayRealized = appointments
    .filter(app => app.date === todayStr && app.status === 'concluido')
    .reduce((sum, app) => sum + app.price, 0);

  const todayScheduledCount = appointments.filter(app => app.date === todayStr && app.status !== 'cancelado').length;
  const todayCompletedCount = appointments.filter(app => app.date === todayStr && app.status === 'concluido').length;

  // Projections
  const simulatedWeeklyRevenue = weeklyClients * ticketMedio;
  const simulatedMonthlyRevenue = simulatedWeeklyRevenue * 4.33;
  const simulatedAnnualRevenue = simulatedWeeklyRevenue * 52;

  // List of standard time slots for beauty salon appointments
  const standardTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Helper to calculate available times for a given date
  const getAvailableTimes = (dateStr: string) => {
    const bookedTimes = appointments
      .filter(app => app.date === dateStr && app.status !== 'cancelado')
      .map(app => app.time);
    return standardTimeSlots.filter(t => !bookedTimes.includes(t));
  };

  // Phone formatting utility
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  // Generate list of next 7 days for quick date picker
  const next7Days = React.useMemo(() => {
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

  // Helper to calculate dates for the week of a dateStr (starts Monday)
  const getWeekDates = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const startOfWeek = new Date(d);
    
    // Set to Monday (if day is Sunday, go back 6 days; otherwise go back day - 1 days)
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(d.getDate() + diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);
      weekDates.push(getLocalDateString(current));
    }
    return weekDates;
  };

  // vCard VCF Parser
  const parseVCF = (vcfText: string) => {
    const contacts: { id: string; name: string; phone: string; totalSpent: number; document: string; email: string; address: string }[] = [];
    const cards = vcfText.split('END:VCARD');
    
    for (const card of cards) {
      if (!card.trim()) continue;
      let name = '';
      let phone = '';
      
      const lines = card.split(/\r?\n/);
      for (const line of lines) {
        if (line.startsWith('FN:')) {
          name = line.substring(3).trim();
        } else if (line.startsWith('TEL;')) {
          const colonIdx = line.indexOf(':');
          if (colonIdx !== -1) {
            phone = line.substring(colonIdx + 1).replace(/\D/g, '').trim();
            // Format phone
            if (phone.length === 11) {
              phone = `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
            } else if (phone.length === 10) {
              phone = `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
            }
          }
        }
      }
      
      if (name) {
        contacts.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          name,
          phone: phone ? formatPhoneNumber(phone) : '(99) 99999-9999',
          totalSpent: 0,
          document: '',
          email: '',
          address: ''
        });
      }
    }
    return contacts;
  };

  // --- Layout Tab State ---
  const [localActiveMainTab, setActiveMainTab] = useState<StudioSection>('agenda');
  const activeMainTab = section ?? localActiveMainTab;
  const navigateSection = (nextSection: StudioSection, appointmentId?: string) => {
    if (onSectionChange) {
      onSectionChange(nextSection, appointmentId);
    } else {
      setActiveMainTab(nextSection);
    }
  };

  // --- Wizard 'Finalizar Serviço' State ---
  const [finishStep, setFinishStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [isManualFinish, setIsManualFinish] = useState(false);
  const [finishSelectedApp, setFinishSelectedApp] = useState<Appointment | null>(null);
  const [finishSelectedClient, setFinishSelectedClient] = useState<Customer | null>(null);
  const [finishClientSearch, setFinishClientSearch] = useState('');
  const [finishService, setFinishService] = useState<string>('');
  const [finishPrice, setFinishPrice] = useState<number>(0);
  const [finishExtraItems, setFinishExtraItems] = useState<Array<{ name: string; price: number }>>([]);
  const [finishFinalPrice, setFinishFinalPrice] = useState<number>(0);
  const [finishPaymentMethod, setFinishPaymentMethod] = useState<'PIX' | 'Cartão' | 'Dinheiro'>('PIX');
  
  // Custom extra item temp input state
  const [customExtraName, setCustomExtraName] = useState('');
  const [customExtraPrice, setCustomExtraPrice] = useState<number>(0);

  // New Client Form inside wizard
  const [isCreatingNewClientFinish, setIsCreatingNewClientFinish] = useState(false);
  const [newClientNameFinish, setNewClientNameFinish] = useState('');
  const [newClientPhoneFinish, setNewClientPhoneFinish] = useState('');

  const handleCreateAndSelectNewClientFinish = () => {
    if (!newClientNameFinish) return;
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: newClientNameFinish,
      phone: newClientPhoneFinish || '(99) 99999-9999',
      document: '',
      email: '',
      address: '',
      totalSpent: 0
    };
    setLocalCustomers(prev => [...prev, newCustomer]);
    setFinishSelectedClient(newCustomer);
    setIsCreatingNewClientFinish(false);
    setNewClientNameFinish('');
    setNewClientPhoneFinish('');
  };

  const handleSelectSuggestedApp = (app: Appointment) => {
    setIsManualFinish(false);
    setFinishSelectedApp(app);
    const existing = localCustomers.find(c => c.name === app.clientName);
    if (existing) {
      setFinishSelectedClient(existing);
    } else {
      setFinishSelectedClient({
        id: 'temp-' + Date.now(),
        name: app.clientName,
        phone: app.phone || '(99) 99999-9999',
        totalSpent: 0,
        document: '',
        email: '',
        address: ''
      });
    }
    setFinishService(app.service);
    setFinishPrice(app.price);
    setFinishFinalPrice(app.price);
    setFinishStep(4);
  };

  const handleToggleExtra = (item: { name: string; price: number }) => {
    setFinishExtraItems(prev => {
      const exists = prev.some(i => i.name === item.name);
      let updated;
      if (exists) {
        updated = prev.filter(i => i.name !== item.name);
      } else {
        updated = [...prev, item];
      }
      const extrasSum = updated.reduce((sum, i) => sum + i.price, 0);
      setFinishFinalPrice(finishPrice + extrasSum);
      return updated;
    });
  };

  const handleAddCustomExtra = () => {
    if (!customExtraName || customExtraPrice <= 0) return;
    const newItem = { name: customExtraName, price: customExtraPrice };
    setFinishExtraItems(prev => {
      const updated = [...prev, newItem];
      const extrasSum = updated.reduce((sum, i) => sum + i.price, 0);
      setFinishFinalPrice(finishPrice + extrasSum);
      return updated;
    });
    setCustomExtraName('');
    setCustomExtraPrice(0);
  };

  const handleRemoveExtra = (name: string) => {
    setFinishExtraItems(prev => {
      const updated = prev.filter(i => i.name !== name);
      const extrasSum = updated.reduce((sum, i) => sum + i.price, 0);
      setFinishFinalPrice(finishPrice + extrasSum);
      return updated;
    });
  };

  const resetFinishWizard = () => {
    setFinishStep(1);
    setIsManualFinish(false);
    setFinishSelectedApp(null);
    setFinishSelectedClient(null);
    setFinishClientSearch('');
    setFinishService('');
    setFinishPrice(0);
    setFinishExtraItems([]);
    setFinishFinalPrice(0);
    setFinishPaymentMethod('PIX');
    setCustomExtraName('');
    setCustomExtraPrice(0);
    setIsCreatingNewClientFinish(false);
    setNewClientNameFinish('');
    setNewClientPhoneFinish('');
  };
  
  // --- Weekly Toggler State ---
  const [isWeeklyView, setIsWeeklyView] = useState(false);

  // --- Multi-Step Scheduler Wizard State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [scheduleStep, setScheduleStep] = useState<1 | 2 | 3 | 4>(1);
  const [scheduleClientSearch, setScheduleClientSearch] = useState('');
  
  // Selections
  const [schedClient, setSchedClient] = useState<Customer | null>(null);
  const [schedDate, setSchedDate] = useState<string>(todayStr);
  const [schedTime, setSchedTime] = useState<string>('');
  const [schedService, setSchedService] = useState<string>('Corte Feminino + Escova');
  const [schedPrice, setSchedPrice] = useState<number>(120.00);

  // New Client Form inside wizard
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  // --- Contact Importer State ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importText, setImportText] = useState('');
  const [importedPreview, setImportedPreview] = useState<Customer[]>([]);

  // --- Share Availability Wizard State ---
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareStep, setShareStep] = useState<1 | 2 | 3>(1);
  const [shareClientSearch, setShareClientSearch] = useState('');
  const [shareClient, setShareClient] = useState<Customer | null>(null);
  const [shareDate, setShareDate] = useState<string>(todayStr);
  const [shareSelectedSlots, setShareSelectedSlots] = useState<string[]>([]);

  // Other UI Modal States
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<string>('');

  const handleOpenDetailsModal = (app: Appointment) => {
    setSelectedApp(app);
    setIsDetailsModalOpen(true);
  };

  // Service list mapping
  const serviceOptions = [
    { name: 'Corte Feminino + Escova', price: 120.00 },
    { name: 'Mechas & Luzes', price: 350.00 },
    { name: 'Hidratação L\'Oréal', price: 180.00 },
    { name: 'Corte Masculino Degradê', price: 50.00 },
    { name: 'Corte Masculino Social', price: 45.00 },
    { name: 'Corte Masculino + Barba', price: 80.00 },
    { name: 'Barba Completa (Terapia)', price: 45.00 },
    { name: 'Selante / Progressiva Masculina', price: 90.00 },
    { name: 'Pigmentação Cabelo/Barba', price: 40.00 },
    { name: 'Progressiva Definitiva', price: 250.00 },
    { name: 'Penteado Especial', price: 150.00 },
    { name: 'Maquiagem Profissional', price: 160.00 },
    { name: 'Manicure & Pedicure', price: 70.00 },
  ];

  // Appointments for the currently viewed date
  const filteredAppointments = appointments
    .filter(app => app.date === viewDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const todayAppsSuggested = appointments.filter(
    app => app.status === 'atendimento'
  );

  // Date Navigation handlers
  const handlePrevDay = () => {
    const d = new Date(viewDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setViewDate(getLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = new Date(viewDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setViewDate(getLocalDateString(d));
  };

  const handleGoToToday = () => {
    setViewDate(todayStr);
  };

  const handleStartService = (id: string) => {
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status: 'atendimento' } : app
    ));
    setTimers(prev => ({ ...prev, [id]: 0 }));
  };

  const openFinishFlow = (app?: Appointment) => {
    if (!onSectionChange && app) {
      handleSelectSuggestedApp(app);
    } else if (!app) {
      resetFinishWizard();
    }
    navigateSection('finalizar', app?.id);
  };

  const handleOpenRescheduleModal = (app: Appointment) => {
    setSelectedApp(app);
    setRescheduleTime(app.time);
    setIsRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = () => {
    if (!selectedApp) return;
    setAppointments(prev => prev.map(app => 
      app.id === selectedApp.id ? { ...app, time: rescheduleTime } : app
    ));
    setIsRescheduleModalOpen(false);
    setSelectedApp(null);
  };

  const handleCancelService = (id: string) => {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      setAppointments(prev => prev.map(app => 
        app.id === id ? { ...app, status: 'cancelado' } : app
      ));
    }
  };

  // --- Approval Flow Handlers ---
  const handleApproveAppointment = (id: string) => {
    const appToApprove = appointments.find(app => app.id === id);
    if (appToApprove) {
      const cleanPhone = (appToApprove.phone || '').replace(/\D/g, '');
      const exists = localCustomers.some(c => c.name.toLowerCase() === appToApprove.clientName.toLowerCase() || (c.phone && c.phone.replace(/\D/g, '') === cleanPhone));
      if (!exists) {
        const newCustomer: Customer = {
          id: Date.now().toString(),
          name: appToApprove.clientName,
          phone: appToApprove.phone || '(99) 99999-9999',
          document: '',
          email: '',
          address: '',
          totalSpent: 0
        };
        setLocalCustomers(prev => [...prev, newCustomer]);
      }
    }
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status: 'aguardando' } : app
    ));
  };

  const handleDeclineAppointment = (id: string) => {
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status: 'cancelado' } : app
    ));
  };

  // --- WhatsApp Booking Link Share ---
  const handleShareBookingLink = (client: Customer) => {
    const cleanPhone = client.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const bookingUrl = `${window.location.origin}${window.location.pathname}?mode=agendar-cliente`;
    const message = `Olá, *${client.name}*! Tudo bem?\n\nVocê já pode agendar o seu próximo atendimento diretamente pelo nosso link online:\n\n${bookingUrl}\n\nAbraço e nos vemos em breve!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSendReminder = (client: Customer) => {
    const clientApps = appointments.filter(
      app => app.clientName.toLowerCase() === client.name.toLowerCase() && 
             app.status === 'aguardando' && 
             app.date >= todayStr
    ).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    const cleanPhone = client.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    let message = '';
    if (clientApps.length > 0) {
      const nextApp = clientApps[0];
      const dateFormatted = nextApp.date.split('-').reverse().join('/');
      message = `Olá, *${client.name}*! Tudo bem?\n\nPassando para confirmar o seu horário agendado de *${nextApp.service}* para o dia *${dateFormatted}* às *${nextApp.time}*.\n\nConfirmado? Nos vemos lá!`;
    } else {
      const bookingUrl = `${window.location.origin}${window.location.pathname}?mode=agendar-cliente`;
      message = `Olá, *${client.name}*! Tudo bem?\n\nNotamos que você não tem nenhum horário agendado recentemente. Que tal reservar um momento para cuidar do visual? \n\nAgende online aqui: ${bookingUrl}`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // --- Contact Import Wizard Handlers ---
  const openImportWizard = () => {
    setImportStep(1);
    setImportText('');
    setImportedPreview([]);
    setIsImportModalOpen(true);
  };

  const handleParseAndPreview = () => {
    if (!importText.trim()) return;
    let parsed: Customer[] = [];
    if (importText.includes('BEGIN:VCARD')) {
      parsed = parseVCF(importText);
    } else {
      const lines = importText.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        let name = '';
        let phone = '';
        const parts = line.split(/[-,\t]/);
        if (parts.length >= 2) {
          name = parts[0].trim();
          phone = parts[1].replace(/\D/g, '').trim();
        } else {
          name = line.trim();
        }
        if (name) {
          parsed.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name,
            phone: phone ? formatPhoneNumber(phone) : '(99) 99999-9999',
            totalSpent: 0,
            document: '',
            email: '',
            address: ''
          });
        }
      }
    }
    setImportedPreview(parsed);
    setImportStep(3);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (importedPreview.length === 0) return;
    setLocalCustomers(prev => {
      const existingPhones = prev.map(c => c.phone.replace(/\D/g, ''));
      const newUnique = importedPreview.filter(c => {
        const clean = c.phone.replace(/\D/g, '');
        return clean === '' || !existingPhones.includes(clean);
      });
      return [...prev, ...newUnique];
    });
    setIsImportModalOpen(false);
    setImportText('');
    setImportedPreview([]);
    setImportStep(1);
  };

  // --- Scheduler wizard functions ---
  const openScheduleWizard = () => {
    setScheduleStep(1);
    setSchedClient(null);
    setSchedDate(viewDate);
    setSchedTime('');
    setScheduleClientSearch('');
    setIsCreatingNewClient(false);
    setNewClientName('');
    setNewClientPhone('');
    setIsAddModalOpen(true);
  };

  const handleSelectClient = (client: Customer) => {
    setSchedClient(client);
    setScheduleStep(2);
  };

  const handleCreateAndSelectNewClient = () => {
    if (!newClientName) return;
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: newClientName,
      phone: newClientPhone || '(99) 99999-9999',
      document: '',
      email: '',
      address: '',
      totalSpent: 0
    };
    setLocalCustomers(prev => [...prev, newCustomer]);
    setSchedClient(newCustomer);
    setScheduleStep(2);
  };

  const handleServiceChange = (serviceName: string) => {
    const matched = serviceOptions.find(s => s.name === serviceName);
    setSchedService(serviceName);
    if (matched) {
      setSchedPrice(matched.price);
    }
  };

  const handleConfirmAppointment = () => {
    if (!schedClient || !schedTime) return;

    const newApp: Appointment = {
      id: Date.now().toString(),
      date: schedDate,
      time: schedTime,
      clientName: schedClient.name,
      service: schedService,
      price: schedPrice,
      status: 'aguardando',
      phone: schedClient.phone,
    };

    setAppointments(prev => [...prev, newApp]);
    setIsAddModalOpen(false);
    // If the scheduled date is different, navigate to it so the user sees it in the list!
    setViewDate(schedDate);
  };

  // --- Share Availability Wizard Functions ---
  const openShareWizard = () => {
    setShareStep(1);
    setShareClient(null);
    setShareDate(viewDate);
    setShareSelectedSlots([]);
    setShareClientSearch('');
    setIsShareModalOpen(true);
  };

  const handleSelectShareClient = (client: Customer) => {
    setShareClient(client);
    setShareStep(2);
  };

  const handleToggleShareSlot = (time: string) => {
    setShareSelectedSlots(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const handleSendWhatsapp = () => {
    if (!shareClient || shareSelectedSlots.length === 0) return;

    // Format phone: remove non-digits
    const cleanPhone = shareClient.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    // Format date: YYYY-MM-DD to DD/MM/YYYY
    const [year, month, day] = shareDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    
    const slotsText = shareSelectedSlots
      .sort((a, b) => a.localeCompare(b))
      .map(s => `• *${s}*`)
      .join('\n');
      
    const message = `Olá, *${shareClient.name}*! Tudo bem?\n\nSeguem meus horários disponíveis para atendimento no dia *${formattedDate}*:\n\n${slotsText}\n\nQual desses horários fica melhor para você?`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsShareModalOpen(false);
  };

  // Filter lists inside wizards
  const filteredScheduleCustomers = localCustomers.filter(c => 
    c.name.toLowerCase().includes(scheduleClientSearch.toLowerCase()) ||
    c.phone.includes(scheduleClientSearch)
  );

  const filteredShareCustomers = localCustomers.filter(c => 
    c.name.toLowerCase().includes(shareClientSearch.toLowerCase()) ||
    c.phone.includes(shareClientSearch)
  );

  // Available slots computed dynamically
  const availableSlotsForSchedule = getAvailableTimes(schedDate);
  const availableSlotsForShare = getAvailableTimes(shareDate);

  // Format YYYY-MM-DD to friendly Portuguese date
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

  const finishExtraOptions = [
    { name: 'Hidratacao premium', price: 60 },
    { name: 'Barba terapia', price: 45 },
    { name: 'Finalizacao especial', price: 35 },
    { name: 'Produto home care', price: 85 },
  ];

  const filteredFinishCustomers = localCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(finishClientSearch.toLowerCase()) ||
    customer.phone.includes(finishClientSearch)
  );

  const beginManualFinish = () => {
    resetFinishWizard();
    setIsManualFinish(true);
    setFinishStep(2);
  };

  const selectFinishService = (name: string, price: number) => {
    setFinishService(name);
    setFinishPrice(price);
    setFinishExtraItems([]);
    setFinishFinalPrice(price);
  };

  const completeFinishService = () => {
    if (!finishSelectedClient || !finishService || finishFinalPrice <= 0) return;

    const finishedService = finishExtraItems.length
      ? `${finishService} + ${finishExtraItems.map((item) => item.name).join(', ')}`
      : finishService;

    if (finishSelectedApp) {
      setAppointments((prev) => prev.map((appointment) =>
        appointment.id === finishSelectedApp.id
          ? {
              ...appointment,
              status: 'concluido',
              price: finishFinalPrice,
              service: finishedService,
              paymentMethod: finishPaymentMethod,
              additions: finishExtraItems,
            }
          : appointment
      ));
    } else {
      const now = new Date();
      const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setAppointments((prev) => [...prev, {
        id: Date.now().toString(),
        date: todayStr,
        time,
        clientName: finishSelectedClient.name,
        phone: finishSelectedClient.phone,
        service: finishedService,
        price: finishFinalPrice,
        status: 'concluido',
        paymentMethod: finishPaymentMethod,
        additions: finishExtraItems,
      }]);
    }

    setLocalCustomers((prev) => {
      let hasCustomer = false;
      const updated = prev.map((customer) => {
        const samePhone = customer.phone && finishSelectedClient.phone &&
          customer.phone.replace(/\D/g, '') === finishSelectedClient.phone.replace(/\D/g, '');
        const isSameCustomer = customer.id === finishSelectedClient.id ||
          customer.name.toLowerCase() === finishSelectedClient.name.toLowerCase() ||
          samePhone;

        if (!isSameCustomer) return customer;
        hasCustomer = true;
        return { ...customer, totalSpent: (customer.totalSpent || 0) + finishFinalPrice };
      });

      if (hasCustomer) return updated;
      return [...updated, {
        ...finishSelectedClient,
        id: finishSelectedClient.id.startsWith('temp-') ? Date.now().toString() : finishSelectedClient.id,
        totalSpent: (finishSelectedClient.totalSpent || 0) + finishFinalPrice,
      }];
    });

    setFinishStep(6);
  };

  const handledFinishAppointmentId = React.useRef<string | null>(null);
  useEffect(() => {
    if (!finishAppointmentId) {
      handledFinishAppointmentId.current = null;
      return;
    }
    if (handledFinishAppointmentId.current === finishAppointmentId) return;
    const appointment = appointments.find((item) => item.id === finishAppointmentId);
    if (!appointment) return;

    handledFinishAppointmentId.current = finishAppointmentId;
    handleSelectSuggestedApp(appointment);
    onFinishAppointmentConsumed?.();
  }, [finishAppointmentId, appointments, onFinishAppointmentConsumed]);

  if (activeMainTab === 'finalizar') {
    const steps = ['Origem', 'Cliente', 'Serviço', 'Complementos', 'Pagamento', 'Conclusão'];
    const canContinue =
      (finishStep === 2 && !!finishSelectedClient) ||
      (finishStep === 3 && !!finishService && finishPrice > 0) ||
      (finishStep === 4 && finishFinalPrice > 0) ||
      (finishStep === 5);

    const goBackInFinish = () => {
      if (finishStep === 1) {
        navigateSection('agenda');
      } else if (finishStep === 4 && !isManualFinish) {
        resetFinishWizard();
      } else {
        setFinishStep((finishStep - 1) as 1 | 2 | 3 | 4 | 5);
      }
    };

    const advanceFinish = () => {
      if (finishStep === 2) setFinishStep(3);
      else if (finishStep === 3) setFinishStep(4);
      else if (finishStep === 4) setFinishStep(5);
      else if (finishStep === 5) completeFinishService();
    };

    return (
      <div className="fixed inset-0 z-[55] w-screen h-screen bg-[#fcfbf9] text-slate-800 flex flex-col overflow-hidden select-none">
        {/* Fullscreen Header */}
        <header className="shrink-0 border-b border-slate-100 bg-white px-6 py-4 flex items-center justify-between gap-4 pt-[calc(1rem+env(safe-area-inset-top))]">
          <div className="flex items-center gap-3">
            <StudioBrand variant="mark" className="h-9 w-9 shrink-0 text-[#ff0b1a]" />
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#ff0b1a]">Leandro Della Riva</p>
              <h1 className="font-serif text-lg font-bold text-slate-900 leading-tight">Finalizar Serviço</h1>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => {
              resetFinishWizard();
              navigateSection('agenda');
            }}
            className="flex items-center justify-center rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            title="Sair do Fechamento"
          >
            <X size={20} />
          </button>
        </header>

        {/* Step Indicator Header Bar */}
        <div className="shrink-0 border-b border-slate-100 bg-white px-6 py-3 overflow-x-auto custom-scrollbar">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-3 min-w-[500px]">
            {steps.map((label, index) => {
              const number = index + 1;
              const active = number === finishStep;
              const completed = number < finishStep;
              return (
                <div key={label} className="flex-1 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        active
                          ? 'bg-[#ff0b1a] text-white shadow-sm shadow-[#ff0b1a]/20'
                          : completed
                          ? 'bg-emerald-50 text-emerald-600 font-extrabold'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {completed ? <Check size={10} strokeWidth={3} /> : number}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                        active ? 'text-[#ff0b1a]' : completed ? 'text-slate-650' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 border-t border-dashed border-slate-205 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-6 sm:py-8 bg-[#fdfdfc]">
          <div className="mx-auto w-full max-w-5xl h-full flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={finishStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                {/* STEP 1: ORIGEM */}
                {finishStep === 1 && (
                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                    <div className="text-center max-w-xl mx-auto space-y-2 mb-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff0b1a]">Passo 1 de 6</p>
                      <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Qual atendimento você vai finalizar?</h2>
                      <p className="text-sm text-slate-500">Selecione um cliente que já possui atendimento iniciado hoje ou inicie uma venda manual.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto w-full">
                      {/* Left: Suggested in-progress appointments */}
                      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col min-h-[280px]">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Atendimentos em Andamento</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-1 custom-scrollbar">
                          {todayAppsSuggested.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                              <Clock size={32} className="text-slate-300 mb-2" />
                              <p className="text-xs font-semibold">Nenhum atendimento iniciado no momento.</p>
                              <p className="text-[10px] text-slate-400 mt-1">Use a venda rápida manual ao lado.</p>
                            </div>
                          ) : (
                            todayAppsSuggested.map((app) => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => handleSelectSuggestedApp(app)}
                                className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-[#fdfdfc] text-left transition-all hover:border-[#ff0b1a]/40 hover:bg-[#fffcfc] group"
                              >
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-800 group-hover:text-[#ff0b1a] transition-colors">{app.clientName}</p>
                                  <p className="text-xs text-slate-500 truncate mt-0.5">{app.service}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-extrabold text-[#ff0b1a]">{formatCurrency(app.price)}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{app.time}</p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Right: Manual checkout trigger */}
                      <button
                        type="button"
                        onClick={beginManualFinish}
                        className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col justify-between text-left transition-all hover:border-[#ff0b1a]/40 hover:shadow-md group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ff0b1a] group-hover:scale-105 transition-transform">
                          <Plus size={24} />
                        </div>
                        <div className="mt-8 space-y-2">
                          <h3 className="font-serif text-2xl font-bold text-slate-900">Venda Rápida</h3>
                          <p className="text-sm text-slate-500">Registre um serviço avulso ou finalize um atendimento sem agendamento prévio.</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: CLIENTE */}
                {finishStep === 2 && (
                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                    <div className="text-center max-w-xl mx-auto space-y-1 mb-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff0b1a]">Passo 2 de 6</p>
                      <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Para quem é o atendimento?</h2>
                      <p className="text-sm text-slate-500">Busque um cliente cadastrado ou faça um cadastro rápido.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto w-full">
                      {/* Search client */}
                      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col min-h-[340px]">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Buscar Cliente</h3>
                        <div className="relative mb-3">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <Input
                            value={finishClientSearch}
                            onChange={(e) => setFinishClientSearch(e.target.value)}
                            placeholder="Buscar por nome ou telefone..."
                            className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                          />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[220px] custom-scrollbar">
                          {filteredFinishCustomers.map((customer) => {
                            const isSelected = finishSelectedClient?.id === customer.id;
                            return (
                              <button
                                type="button"
                                key={customer.id}
                                onClick={() => setFinishSelectedClient(customer)}
                                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs transition-all ${
                                  isSelected
                                    ? 'border-[#ff0b1a] bg-[#fffcfc] text-[#ff0b1a] font-bold'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-750 bg-slate-50/30'
                                }`}
                              >
                                <div>
                                  <p className="font-extrabold">{customer.name}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{customer.phone}</p>
                                </div>
                                {isSelected && <Check size={16} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Add new client */}
                      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[340px]">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Cadastro Rápido</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                              <Input
                                value={newClientNameFinish}
                                onChange={(e) => setNewClientNameFinish(e.target.value)}
                                placeholder="Ex: Rodrigo Souza"
                                className="h-11 rounded-xl border-slate-200"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">WhatsApp / Celular</label>
                              <Input
                                value={newClientPhoneFinish}
                                onChange={(e) => setNewClientPhoneFinish(e.target.value)}
                                placeholder="Ex: (11) 99999-8888"
                                className="h-11 rounded-xl border-slate-200"
                              />
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleCreateAndSelectNewClientFinish}
                          disabled={!newClientNameFinish}
                          className="h-11 w-full rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 mt-6 disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          Salvar e Selecionar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: SERVIÇO */}
                {finishStep === 3 && (
                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                    <div className="text-center max-w-xl mx-auto space-y-1 mb-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff0b1a]">Passo 3 de 6</p>
                      <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Qual serviço foi realizado?</h2>
                      <p className="text-sm text-slate-500">Selecione uma opção padrão ou insira um serviço personalizado.</p>
                    </div>

                    <div className="max-w-4xl mx-auto w-full space-y-6">
                      {/* Services Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar p-1">
                        {serviceOptions.map((service) => {
                          const isSelected = finishService === service.name;
                          return (
                            <button
                              key={service.name}
                              type="button"
                              onClick={() => selectFinishService(service.name, service.price)}
                              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[90px] ${
                                isSelected
                                  ? 'border-[#ff0b1a] bg-[#fffcfc] shadow-sm shadow-[#ff0b1a]/5'
                                  : 'border-slate-100 bg-white hover:border-slate-200'
                              }`}
                            >
                              <span className={`font-extrabold text-xs leading-snug ${isSelected ? 'text-[#ff0b1a]' : 'text-slate-800'}`}>{service.name}</span>
                              <div className="flex justify-between items-end mt-4">
                                <span className="font-black text-xs text-slate-900">{formatCurrency(service.price)}</span>
                                {isSelected && <Check size={14} className="text-[#ff0b1a]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom service manual input */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 w-full">
                          <Input
                            placeholder="Outro serviço personalizado..."
                            value={finishService && !serviceOptions.some(s => s.name === finishService) ? finishService : ''}
                            onChange={(e) => {
                              setFinishService(e.target.value);
                              if (finishPrice === 0) setFinishPrice(45.00); // Default standard price
                            }}
                            className="h-11 rounded-xl border-slate-200 bg-slate-50/40"
                          />
                        </div>
                        <div className="w-full sm:w-32 shrink-0">
                          <Input
                            type="number"
                            placeholder="Valor"
                            value={finishPrice || ''}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFinishPrice(val);
                              setFinishFinalPrice(val + finishExtraItems.reduce((sum, item) => sum + item.price, 0));
                            }}
                            className="h-11 rounded-xl border-slate-200 bg-slate-50/40 text-center font-bold"
                          />
                        </div>
                        <Button
                          onClick={() => {
                            if (finishService) {
                              setFinishFinalPrice(finishPrice + finishExtraItems.reduce((sum, item) => sum + item.price, 0));
                              setFinishStep(4);
                            }
                          }}
                          disabled={!finishService || finishPrice <= 0}
                          className="w-full sm:w-auto h-11 rounded-xl bg-slate-950 text-white font-bold hover:bg-slate-850 px-6 disabled:bg-slate-100 disabled:text-slate-400 shrink-0"
                        >
                          Confirmar Personalizado
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: COMPLEMENTOS */}
                {finishStep === 4 && (
                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                    <div className="text-center max-w-xl mx-auto space-y-1 mb-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff0b1a]">Passo 4 de 6</p>
                      <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Deseja adicionar complementos?</h2>
                      <p className="text-sm text-slate-500">Adicione serviços adicionais ou ajuste o valor total cobrado.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] max-w-4xl mx-auto w-full">
                      {/* Left: Extra options */}
                      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Opções Rápidas</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {finishExtraOptions.map((item) => {
                              const isSelected = finishExtraItems.some((extra) => extra.name === item.name);
                              return (
                                <button
                                  key={item.name}
                                  type="button"
                                  onClick={() => handleToggleExtra(item)}
                                  className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                                    isSelected
                                      ? 'border-[#ff0b1a] bg-[#fffcfc] text-[#ff0b1a] font-bold'
                                      : 'border-slate-100 bg-slate-50/20 hover:border-slate-200'
                                  }`}
                                >
                                  <p className="truncate">{item.name}</p>
                                  <p className="text-[10px] font-extrabold text-[#ff0b1a] mt-1">+ {formatCurrency(item.price)}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-5">
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Item Personalizado</h3>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                              value={customExtraName}
                              onChange={(e) => setCustomExtraName(e.target.value)}
                              placeholder="Nome do extra (ex: Hidratação caseira)"
                              className="h-11 rounded-xl border-slate-200"
                            />
                            <Input
                              type="number"
                              value={customExtraPrice || ''}
                              onChange={(e) => setCustomExtraPrice(Number(e.target.value))}
                              placeholder="Valor"
                              className="h-11 rounded-xl border-slate-200 sm:w-28 text-center"
                            />
                            <Button
                              onClick={handleAddCustomExtra}
                              disabled={!customExtraName || customExtraPrice <= 0}
                              className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 disabled:bg-slate-100 disabled:text-slate-400"
                            >
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Summary */}
                      <div className="bg-[#fffcfc] rounded-3xl border border-rose-100/50 p-6 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-[#ff0b1a] mb-4">Resumo do Fechamento</h3>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cliente</p>
                              <p className="font-extrabold text-slate-800 mt-0.5">{finishSelectedClient?.name}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Serviço Base</p>
                              <div className="flex justify-between items-center mt-0.5 text-xs text-slate-700">
                                <span className="font-medium">{finishService}</span>
                                <span className="font-extrabold">{formatCurrency(finishPrice)}</span>
                              </div>
                            </div>
                            {finishExtraItems.length > 0 && (
                              <div className="border-t border-rose-100/30 pt-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Complementos</p>
                                <div className="space-y-2 mt-1.5">
                                  {finishExtraItems.map((item) => (
                                    <div key={item.name} className="flex justify-between items-center text-xs">
                                      <span className="text-slate-500 truncate mr-2">{item.name}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-700">+{formatCurrency(item.price)}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveExtra(item.name)}
                                          className="text-[10px] font-black text-rose-500 hover:underline"
                                        >
                                          Remover
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-rose-100/50 pt-5 mt-6">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Valor Final Ajustável</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-[#ff0b1a]">R$</span>
                            <Input
                              type="number"
                              value={finishFinalPrice || ''}
                              onChange={(e) => setFinishFinalPrice(Number(e.target.value))}
                              className="pl-10 h-14 rounded-2xl text-2xl font-black text-[#ff0b1a] border-rose-200 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: PAGAMENTO */}
                {finishStep === 5 && (
                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                    <div className="text-center max-w-xl mx-auto space-y-1 mb-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff0b1a]">Passo 5 de 6</p>
                      <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Qual a forma de pagamento?</h2>
                      <p className="text-sm text-slate-500">Selecione o método de recebimento para fechar a fatura.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto w-full">
                      {/* Left: Methods */}
                      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-center space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Selecione uma opção</h3>
                        
                        {(['PIX', 'Cartão', 'Dinheiro'] as const).map((method) => {
                          const isSelected = finishPaymentMethod === method;
                          return (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setFinishPaymentMethod(method)}
                              className={`w-full flex items-center justify-between p-4 rounded-2xl border text-sm font-extrabold transition-all ${
                                isSelected
                                  ? 'border-[#ff0b1a] bg-[#fffcfc] text-[#ff0b1a]'
                                  : 'border-slate-100 text-slate-700 bg-[#fdfdfc] hover:border-slate-200'
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                {method === 'PIX' ? (
                                  <Sparkles size={18} />
                                ) : method === 'Dinheiro' ? (
                                  <Wallet size={18} />
                                ) : (
                                  <CreditCard size={18} />
                                )}
                                {method}
                              </span>
                              {isSelected && <Check size={18} strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right: Checkout Ticket styling */}
                      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 relative overflow-hidden flex flex-col justify-between">
                        {/* Perforated edge illusion */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#ff0b1a]" />
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Recibo de Fechamento</span>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5">Pronto</span>
                          </div>

                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Cliente:</span>
                              <span className="font-bold text-slate-800 truncate max-w-[200px]">{finishSelectedClient?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Serviço:</span>
                              <span className="font-bold text-slate-800 truncate max-w-[200px]">{finishService}</span>
                            </div>
                            {finishExtraItems.length > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Complementos:</span>
                                <span className="font-bold text-slate-800">{finishExtraItems.length} itens</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-slate-100 pt-3">
                              <span className="text-slate-500">Pagamento:</span>
                              <span className="font-black text-[#ff0b1a]">{finishPaymentMethod}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-slate-200 pt-5 mt-6 text-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pago</span>
                          <p className="text-4xl font-black text-[#ff0b1a] mt-1">{formatCurrency(finishFinalPrice)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: CONCLUSÃO */}
                {finishStep === 6 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100 shadow-inner">
                      <CheckCircle size={40} className="animate-bounce" />
                    </div>
                    
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-2">Concluído com Sucesso</p>
                    <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Atendimento Finalizado</h2>
                    <p className="text-sm text-slate-500 mt-2">O histórico do cliente e o fluxo financeiro da agenda foram atualizados no sistema.</p>
                    
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 px-8 py-5 my-6 w-full">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Valor Recebido ({finishPaymentMethod})</span>
                      <p className="text-3xl font-black text-[#ff0b1a] mt-1">{formatCurrency(finishFinalPrice)}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button
                        onClick={() => {
                          resetFinishWizard();
                          navigateSection('agenda');
                        }}
                        variant="outline"
                        className="h-12 flex-1 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                      >
                        Voltar para Agenda
                      </Button>
                      <Button
                        onClick={beginManualFinish}
                        className="h-12 flex-1 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                      >
                        Novo Fechamento
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Fullscreen Sticky Footer */}
        {finishStep < 6 && (
          <footer className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-3">
            <div className="mx-auto w-full max-w-5xl flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goBackInFinish}
                className="h-12 rounded-xl px-6 border-slate-200 text-slate-650 hover:bg-slate-50 font-bold flex items-center gap-1.5"
              >
                <ChevronLeft size={16} />
                {finishStep === 1 ? 'Sair' : 'Voltar'}
              </Button>

              {finishStep > 1 && (
                <Button
                  onClick={advanceFinish}
                  disabled={!canContinue}
                  className="h-12 rounded-xl bg-[#ff0b1a] hover:bg-[#cc0a12] text-white font-bold px-8 shadow-md shadow-[#ff0b1a]/15 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {finishStep === 5 ? 'Confirmar Fechamento' : 'Avançar'}
                  <ChevronRight size={16} />
                </Button>
              )}
            </div>
          </footer>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#543747]/60 bg-[#21151d] p-4 shadow-xl shadow-[#160d13]/15 sm:p-5">
        <div aria-hidden="true" className="absolute -right-16 -top-24 h-60 w-60 rounded-full bg-[#8f1725]/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-20 left-32 h-44 w-44 rounded-full bg-[#725973]/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-center">
            <div className="w-full max-w-[23rem] shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-lg">
              <StudioBrand variant="signature" />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-rose-300">Painel do estúdio</p>
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl">Leandro Della Riva</h1>
              <p className="max-w-md text-sm leading-relaxed text-slate-300">
                Gerencie atendimentos, clientes e metas em uma agenda criada para o seu estúdio.
              </p>
            </div>
          </div>
          <div className="flex flex-row flex-wrap gap-3 xl:justify-end items-center">
            <button 
              onClick={() => {
                const banner = document.getElementById('pending-approvals-banner');
                if (banner) {
                  banner.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`relative h-11 w-11 shrink-0 flex items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 transition-all ${
                pulseActive 
                  ? 'ring-4 ring-amber-500/50 bg-amber-500/20 border-amber-400 scale-105 shadow-lg shadow-amber-500/30' 
                  : ''
              }`}
              title="Solicitações Pendentes"
            >
              <Bell size={18} className={`${pendingCount > 0 ? 'text-amber-400' : 'text-slate-300'} ${pulseActive ? 'animate-bounce' : ''}`} />
              {pendingCount > 0 && (
                <span className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-black text-white ring-2 ring-[#21151d] ${pulseActive ? 'animate-ping' : ''}`}>
                  {pendingCount}
                </span>
              )}
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-black text-white ring-2 ring-[#21151d]">
                  {pendingCount}
                </span>
              )}
            </button>
            <Button 
              onClick={openShareWizard} 
              variant="outline"
              className="h-11 rounded-xl border-white/15 text-slate-100 hover:bg-white/10 dark:border-white/15 dark:text-slate-100 dark:hover:bg-white/10"
            >
              <Share2 size={16} className="mr-2 text-rose-300" /> WhatsApp
            </Button>
            <Button
              onClick={() => openFinishFlow()}
              variant="outline"
              className="hidden h-11 rounded-xl border-rose-300/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20 dark:border-rose-300/30 dark:text-rose-100 lg:flex"
            >
              <CheckCircle size={16} className="mr-2 text-rose-300" /> Finalizar Servico
            </Button>
            <Button 
              onClick={openScheduleWizard} 
              className="h-11 rounded-xl bg-gradient-to-r from-[#8f1725] to-[#bd2635] text-white shadow-lg shadow-rose-950/30 hover:from-[#a31b2b] hover:to-[#d52d3c] dark:from-[#8f1725] dark:to-[#bd2635]"
            >
              <Plus size={16} className="mr-2" /> Agendar Cliente
            </Button>
          </div>
        </div>
      </section>

      {/* PENDING APPROVALS NOTIFICATIONS BANNER */}
      {appointments.filter(app => app.status === 'pendente_aprovacao').length > 0 && (
        <div id="pending-approvals-banner" className="bg-gradient-to-r from-amber-500/10 to-orange-600/10 dark:from-amber-500/5 dark:to-orange-600/5 border border-amber-200 dark:border-amber-900/50 p-5 rounded-3xl shadow-sm space-y-4 scroll-mt-6">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertCircle size={22} className="animate-bounce" />
            <h3 className="font-extrabold text-sm tracking-tight uppercase">Solicitações de Agendamento Online Pendentes</h3>
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-black flex items-center justify-center">
              {appointments.filter(app => app.status === 'pendente_aprovacao').length}
            </span>
          </div>

          <div className="divide-y divide-amber-200/50 dark:divide-amber-900/20 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {appointments
              .filter(app => app.status === 'pendente_aprovacao')
              .map((app) => (
                <div key={app.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">{app.clientName} ({app.phone})</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Serviço: <strong className="text-slate-700 dark:text-slate-300">{app.service}</strong> • Valor: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(app.price)}</strong>
                    </p>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                      Reservado: {app.date.split('-').reverse().join('/')} às {app.time}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveAppointment(app.id)}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs py-1 h-8 flex items-center gap-1 shadow-sm"
                    >
                      <Check size={12} /> Aprovar
                    </Button>
                    <Button
                      onClick={() => handleDeclineAppointment(app.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-200 hover:bg-red-50 text-red-600 dark:border-red-900 dark:hover:bg-red-500/10 font-bold rounded-xl text-xs py-1 h-8 flex items-center gap-1"
                    >
                      <X size={12} /> Recusar
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MAIN NAVIGATION TABS */}
      <div className="flex bg-slate-200/40 dark:bg-slate-900/50 p-1.5 rounded-2xl max-w-xl border border-slate-200/20 dark:border-slate-800/40 shadow-inner">
        <button
          onClick={() => navigateSection('agenda')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
            activeMainTab === 'agenda'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/5 dark:border-slate-700/50'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Agenda do Salão
        </button>
        <button
          onClick={() => navigateSection('clientes')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
            activeMainTab === 'clientes'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/5 dark:border-slate-700/50'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Meus Clientes
        </button>
        <button
          onClick={() => navigateSection('simulador')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
            activeMainTab === 'simulador'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/5 dark:border-slate-700/50'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Simulador & Metas
        </button>
      </div>

      {/* Conditionally render based on Active Main Tab */}
      {activeMainTab === 'simulador' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. Projections / Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Today's Realized */}
            <Card className="p-6 relative overflow-hidden border-none bg-gradient-to-br from-rose-600 to-indigo-700 text-white shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign size={24} />
                </div>
                <Badge className="bg-white/20 text-white border-none font-bold text-[10px]">HOJE</Badge>
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Realizado Hoje</p>
                <h2 className="text-3xl font-black tracking-tight">{formatCurrency(todayRealized)}</h2>
                <div className="mt-4 flex items-center justify-between text-xs text-white/90">
                  <span>Meta do dia: {formatCurrency(dailyTarget)}</span>
                  <span className="font-bold">{Math.round((todayRealized / dailyTarget) * 100)}%</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (todayRealized / dailyTarget) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-white/70 mt-2 font-medium">
                  {todayCompletedCount} de {todayScheduledCount} atendimentos concluídos.
                </p>
              </div>
            </Card>

            {/* Card 2: Weekly Projection */}
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl">
                  <CalendarDays size={24} />
                </div>
                <Badge className="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-none font-bold text-[10px]">SEMANA</Badge>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Projeção da Semana</p>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{formatCurrency(simulatedWeeklyRevenue)}</h2>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Meta da semana: {formatCurrency(weeklyTarget)}</span>
                  <span className="font-bold text-violet-600 dark:text-violet-400">{Math.round((simulatedWeeklyRevenue / weeklyTarget) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-violet-600 dark:bg-violet-500 h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (simulatedWeeklyRevenue / weeklyTarget) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium flex items-center gap-1">
                  <Info size={12} className="text-slate-400" /> Baseado no simulador: {weeklyClients} cli/sem a {formatCurrency(ticketMedio)}
                </p>
              </div>
            </Card>

            {/* Card 3: Monthly Projection */}
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                  <TrendingUp size={24} />
                </div>
                <Badge className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none font-bold text-[10px]">MÊS</Badge>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Projeção do Mês</p>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{formatCurrency(simulatedMonthlyRevenue)}</h2>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Meta do mês: {formatCurrency(monthlyTarget)}</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{Math.round((simulatedMonthlyRevenue / monthlyTarget) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-rose-600 dark:bg-rose-500 h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (simulatedMonthlyRevenue / monthlyTarget) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium flex items-center gap-1">
                  <Sparkles size={12} className="text-rose-500" /> Projeção Anual Bruta: <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(simulatedAnnualRevenue)}</span>
                </p>
              </div>
            </Card>
          </div>

          {/* 3. Simulador Estratégico (Cabeleireiro Piloto) */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Sliders className="text-rose-600" size={20} />
              Simulador Estratégico
            </h3>

            <Card className="p-6 border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sliders Input Area */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">Pilote sua Margem & Faturamento</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Simule ajustes em seu modelo de atendimento para ver a projeção de receita líquida decolar.</p>
                  </div>

                  {/* Slider 1: Ticket Médio */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400">Ticket Médio por Cliente</span>
                      <span className="text-rose-600 dark:text-rose-400">{formatCurrency(ticketMedio)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="500" 
                      step="10"
                      value={ticketMedio} 
                      onChange={(e) => setTicketMedio(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>R$ 50</span>
                      <span>R$ 500</span>
                    </div>
                  </div>

                  {/* Slider 2: Clientes por Semana */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400">Atendimentos por Semana</span>
                      <span className="text-rose-600 dark:text-rose-400">{weeklyClients} clientes</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="80" 
                      step="1"
                      value={weeklyClients} 
                      onChange={(e) => setWeeklyClients(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>5 atendimentos</span>
                      <span>80 atendimentos</span>
                    </div>
                  </div>
                </div>

                {/* Outputs Panel Area */}
                <div className="lg:col-span-1 flex flex-col justify-center">
                  <div className="p-4 bg-rose-50/50 dark:bg-rose-500/5 rounded-2xl border border-rose-100/50 dark:border-rose-500/10 space-y-4">
                    <div className="grid grid-cols-2 gap-4 divide-x divide-rose-100/50 dark:divide-rose-500/10">
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Faturamento Mensal</p>
                        <p className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1">{formatCurrency(simulatedMonthlyRevenue)}</p>
                      </div>
                      <div className="pl-4">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Lucro Estimado (75%)</p>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(simulatedMonthlyRevenue * 0.75)}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-rose-100/50 dark:border-rose-500/10 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <Sparkles size={16} className="text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Dica de Piloto:</strong> Se você aumentar seu ticket médio em apenas <strong>R$ 20</strong> (ex: oferecendo hidratação casada), seu lucro estimado subirá para <strong>{formatCurrency(weeklyClients * 4.33 * (ticketMedio + 20) * 0.75)}</strong> por mês!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : false ? (
        <div className="relative overflow-hidden rounded-[2rem] border border-[#543747]/60 bg-[#21151d] p-6 shadow-2xl shadow-[#160d13]/20 text-white min-h-[600px] flex flex-col justify-between">
          {/* Ambient Background Orbs */}
          <div aria-hidden="true" className="absolute -right-16 -top-24 h-60 w-60 rounded-full bg-[#8f1725]/30 blur-3xl pointer-events-none" />
          <div aria-hidden="true" className="absolute -bottom-20 left-32 h-44 w-44 rounded-full bg-[#725973]/30 blur-3xl pointer-events-none" />

          {/* Wizard Header */}
          <div className="relative z-10 border-b border-white/10 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#8f1725]/40 text-rose-300 rounded-2xl border border-rose-500/20">
                <CheckCircle size={24} className="text-rose-400" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold tracking-tight">Finalizar Serviço</h2>
                <p className="text-xs text-rose-200/70">Registre atendimentos, adicione extras e confirme pagamentos em tempo real.</p>
              </div>
            </div>

            {/* Step Indicators */}
            {finishStep < 4 && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      finishStep === step
                        ? 'bg-[#bd2635] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Passo {step}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wizard Body with Slide/Fade Transition */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={finishStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-3xl mx-auto flex-1 flex flex-col"
              >
                {/* STEP 1: Select Service/Appointment and Client */}
                {finishStep === 1 && (
                  <div className="space-y-6 flex-1 flex flex-col">
                    {/* Suggested Appointments today */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-rose-300 mb-3 flex items-center gap-2">
                        <Clock size={16} />
                        Agendamentos Sugeridos para Hoje ({getFriendlyDate(todayStr)})
                      </h3>
                      {todayAppsSuggested.length === 0 ? (
                        <div className="p-5 text-center rounded-2xl border border-white/5 bg-white/5 text-slate-400 text-xs italic">
                          Nenhum agendamento pendente para hoje. Prossiga com o preenchimento manual abaixo.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                          {todayAppsSuggested.map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => handleSelectSuggestedApp(app)}
                              className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition-all hover:border-[#8f1725]/50 flex justify-between items-center group"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-rose-300">{app.time}</span>
                                  <h4 className="font-bold text-sm truncate text-white group-hover:text-rose-300 transition-colors">
                                    {app.clientName}
                                  </h4>
                                </div>
                                <p className="text-xs text-slate-300 mt-1 truncate">{app.service}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-sm font-black text-white">{formatCurrency(app.price)}</span>
                                <span className="block text-[9px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">Tap para faturar</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Manual section */}
                    <div className="border-t border-white/10 pt-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                          <User size={16} />
                          Ou Finalizar Serviço Manual
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsCreatingNewClientFinish(!isCreatingNewClientFinish)}
                          className="text-xs font-bold text-rose-300 flex items-center gap-1 hover:underline px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl transition-all"
                        >
                          <UserPlus size={14} />
                          {isCreatingNewClientFinish ? 'Selecionar da Lista' : 'Novo Cliente'}
                        </button>
                      </div>

                      {isCreatingNewClientFinish ? (
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-rose-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <UserPlus size={14} /> Cadastro Rápido de Cliente
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome Completo</label>
                              <Input
                                type="text"
                                placeholder="Ex: Clara Mendes"
                                value={newClientNameFinish}
                                onChange={(e) => setNewClientNameFinish(e.target.value)}
                                className="rounded-xl h-11 bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-rose-500 focus:bg-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">WhatsApp / Telefone</label>
                              <Input
                                type="text"
                                placeholder="Ex: (11) 98888-1111"
                                value={newClientPhoneFinish}
                                onChange={(e) => setNewClientPhoneFinish(formatPhoneNumber(e.target.value))}
                                className="rounded-xl h-11 bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-rose-500 focus:bg-transparent"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={handleCreateAndSelectNewClientFinish}
                            disabled={!newClientNameFinish}
                            className="w-full bg-[#bd2635] text-white hover:bg-rose-700 rounded-xl h-11 font-bold mt-2"
                          >
                            Criar & Continuar
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 flex-1 flex flex-col">
                          {/* Selected Client Badge */}
                          {finishSelectedClient ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl flex justify-between items-center">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center">
                                  {finishSelectedClient.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-xs text-white">Cliente Selecionado:</p>
                                  <p className="text-sm font-black text-emerald-300">{finishSelectedClient.name}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFinishSelectedClient(null);
                                  setFinishService('');
                                  setFinishPrice(0);
                                  setFinishFinalPrice(0);
                                }}
                                className="text-slate-400 hover:text-white p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <Input
                                placeholder="Buscar cliente..."
                                value={finishClientSearch}
                                onChange={(e) => setFinishClientSearch(e.target.value)}
                                className="pl-12 rounded-xl h-11 bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-rose-500 focus:bg-transparent"
                              />
                            </div>
                          )}

                          {/* Client List (only shown if client not selected) */}
                          {!finishSelectedClient && (
                            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                              {localCustomers
                                .filter(c =>
                                  c.name.toLowerCase().includes(finishClientSearch.toLowerCase()) ||
                                  c.phone.includes(finishClientSearch)
                                )
                                .slice(0, 10)
                                .map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setFinishSelectedClient(c)}
                                    className="w-full p-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-white/15"
                                  >
                                    <div>
                                      <p className="font-bold text-sm text-white">{c.name}</p>
                                      <p className="text-xs text-slate-400 mt-0.5">{c.phone}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400" />
                                  </button>
                                ))}
                            </div>
                          )}

                          {/* Service options and manual inputs (only shown if client is selected) */}
                          {finishSelectedClient && (
                            <div className="space-y-4 pt-2">
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Selecione o Serviço Realizado</label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                {serviceOptions.map((opt) => {
                                  const isSelected = finishService === opt.name;
                                  return (
                                    <button
                                      key={opt.name}
                                      type="button"
                                      onClick={() => {
                                        setFinishService(opt.name);
                                        setFinishPrice(opt.price);
                                        setFinishFinalPrice(opt.price);
                                      }}
                                      className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between min-h-[70px] ${
                                        isSelected
                                          ? 'border-rose-500 bg-rose-500/10 text-white font-black'
                                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                                      }`}
                                    >
                                      <span className="font-bold truncate w-full">{opt.name}</span>
                                      <span className="font-black text-rose-300 mt-1">{formatCurrency(opt.price)}</span>
                                    </button>
                                  );
                                })}
                                {/* Custom service card */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFinishService('Serviço Personalizado');
                                    setFinishPrice(50.00);
                                    setFinishFinalPrice(50.00);
                                  }}
                                  className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between min-h-[70px] ${
                                    finishService === 'Serviço Personalizado'
                                      ? 'border-rose-500 bg-rose-500/10 text-white font-black'
                                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                                  }`}
                                >
                                  <span className="font-bold">Outro / Personalizado</span>
                                  <span className="font-black text-rose-300 mt-1">Digitar valor...</span>
                                </button>
                              </div>

                              {/* Manual inputs for custom service or modifying base service name/price */}
                              {finishService === 'Serviço Personalizado' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 border border-white/5 p-4 rounded-xl">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome do Serviço Customizado</label>
                                    <Input
                                      type="text"
                                      placeholder="Ex: Alisamento com Laser"
                                      value={finishService}
                                      onChange={(e) => setFinishService(e.target.value)}
                                      className="rounded-xl h-11 bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-rose-500 focus:bg-transparent"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor do Serviço Customizado (R$)</label>
                                    <Input
                                      type="number"
                                      value={finishPrice || ''}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setFinishPrice(val);
                                        setFinishFinalPrice(val);
                                      }}
                                      className="rounded-xl h-11 bg-white/5 border-white/10 text-white focus:ring-rose-500 focus:bg-transparent"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: Confirm Details & Add Extras */}
                {finishStep === 2 && (
                  <div className="space-y-6 flex-1">
                    {/* Summary ticket header */}
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">Cliente</span>
                        <h4 className="text-lg font-black">{finishSelectedClient?.name}</h4>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">Serviço Realizado</span>
                        <p className="text-sm font-bold text-slate-200">{finishService}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Extra Items Grid & Chips */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">Itens Extras & Produtos</h4>
                          <p className="text-[11px] text-slate-400">Selecione produtos ou serviços adicionais oferecidos durante o atendimento.</p>
                        </div>

                        {/* Common extras list */}
                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: 'Shaving / Barba', price: 35.00 },
                            { name: 'Tônico Capilar', price: 15.00 },
                            { name: 'Pomada Modeladora', price: 40.00 },
                            { name: 'Design Sobrancelha', price: 20.00 },
                            { name: 'Cerveja Artesanal', price: 15.00 }
                          ].map((item) => {
                            const isAdded = finishExtraItems.some(i => i.name === item.name);
                            return (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => handleToggleExtra(item)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                  isAdded
                                    ? 'bg-[#bd2635] border-[#bd2635] text-white shadow-sm shadow-[#bd2635]/25'
                                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                                }`}
                              >
                                {isAdded ? <Check size={12} /> : <Plus size={12} />}
                                {item.name} (+{formatCurrency(item.price)})
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Extra Item Creator */}
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outro Item / Consumo Especial</label>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="Nome do produto/serviço..."
                              value={customExtraName}
                              onChange={(e) => setCustomExtraName(e.target.value)}
                              className="rounded-xl h-10 flex-1 bg-white/5 border-white/10 text-white placeholder-slate-500 text-xs focus:bg-transparent"
                            />
                            <Input
                              type="number"
                              placeholder="Valor R$..."
                              value={customExtraPrice || ''}
                              onChange={(e) => setCustomExtraPrice(Number(e.target.value))}
                              className="rounded-xl h-10 w-24 bg-white/5 border-white/10 text-white text-xs focus:bg-transparent"
                            />
                            <Button
                              type="button"
                              onClick={handleAddCustomExtra}
                              className="h-10 px-3 bg-[#8f1725] hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                            >
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Itemized summary and total price modification */}
                      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 border-b border-white/5 pb-2 mb-3">Detalhamento da Conta</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar text-xs">
                            {/* Base service */}
                            <div className="flex justify-between items-center text-slate-200">
                              <span>Serviço: {finishService}</span>
                              <span className="font-bold">{formatCurrency(finishPrice)}</span>
                            </div>

                            {/* Extra items list */}
                            {finishExtraItems.map((item) => (
                              <div key={item.name} className="flex justify-between items-center text-slate-300 bg-white/5 p-2 rounded-lg">
                                <span className="flex items-center gap-1">
                                  <button type="button" onClick={() => handleRemoveExtra(item.name)} className="text-rose-400 hover:text-rose-300">
                                    <X size={12} />
                                  </button>
                                  {item.name}
                                </span>
                                <span className="font-bold">{formatCurrency(item.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Adjust final price */}
                        <div className="border-t border-white/5 pt-4 space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 uppercase font-bold tracking-wider">Subtotal Calculado:</span>
                            <span className="font-bold text-slate-200">
                              {formatCurrency(finishPrice + finishExtraItems.reduce((sum, i) => sum + i.price, 0))}
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Ajustar Valor Final Coletado (R$)</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                              <Input
                                type="number"
                                value={finishFinalPrice || ''}
                                onChange={(e) => setFinishFinalPrice(Number(e.target.value))}
                                className="rounded-xl h-12 pl-10 bg-white/10 border-white/10 text-white font-black text-base focus:ring-rose-500 focus:bg-white/10 focus:text-white"
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 mt-1 block">Você pode alterar livremente se oferecer descontos ou cobranças extras.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Confirm Payment Method & Complete */}
                {finishStep === 3 && (
                  <div className="space-y-6 flex-1 max-w-xl mx-auto w-full">
                    {/* Big total display */}
                    <div className="bg-gradient-to-br from-[#8f1725]/30 to-[#bd2635]/10 border border-rose-500/20 p-6 rounded-3xl text-center space-y-2">
                      <p className="text-xs text-rose-300 font-bold uppercase tracking-widest">Total a Receber</p>
                      <h3 className="text-4xl font-black text-rose-100 tracking-tight">{formatCurrency(finishFinalPrice)}</h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Cliente: <strong className="text-white">{finishSelectedClient?.name}</strong> • {finishExtraItems.length + 1} item(s)
                      </p>
                    </div>

                    {/* Payment methods selectors */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Selecione a Forma de Pagamento</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'PIX', name: 'PIX', icon: Sparkles },
                          { id: 'Cartão', name: 'Cartão', icon: CreditCard },
                          { id: 'Dinheiro', name: 'Dinheiro', icon: Wallet }
                        ].map((method) => {
                          const isSelected = finishPaymentMethod === method.id;
                          const IconComp = method.icon;
                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setFinishPaymentMethod(method.id as 'PIX' | 'Cartão' | 'Dinheiro')}
                              className={`p-5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2.5 ${
                                isSelected
                                  ? 'border-rose-500 bg-rose-500/10 text-white font-black scale-[1.03] shadow-md shadow-[#8f1725]/15'
                                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                              }`}
                            >
                              <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                                <IconComp size={20} />
                              </div>
                              <span className="text-xs font-bold">{method.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Contribution check */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-xs text-emerald-300 flex items-start gap-2">
                      <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        Ao confirmar, o status do agendamento será definido como <strong>Concluído</strong> e o caixa será alimentado imediatamente, refletindo nas metas do dia.
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 4: Success confirmation screen */}
                {finishStep === 4 && (
                  <div className="text-center py-12 space-y-6 max-w-md mx-auto">
                    {/* Circle check animated glow */}
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-lg shadow-emerald-500/15">
                      <CheckCircle size={48} className="text-emerald-400 animate-bounce" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white tracking-tight">Atendimento Finalizado!</h3>
                      <p className="text-sm text-slate-300">
                        O serviço de <strong>{finishSelectedClient?.name}</strong> foi concluído com sucesso e o caixa foi liberado.
                      </p>
                    </div>

                    {/* Quick Receipt Summary */}
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3.5 text-xs text-left">
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Forma de Pagamento:</span>
                        <span className="font-bold text-white">{finishPaymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Valor Recebido:</span>
                        <span className="font-black text-rose-300 text-sm">{formatCurrency(finishFinalPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300 border-t border-white/5 pt-2">
                        <span>Projeção de Hoje Atualizada:</span>
                        <span className="font-black text-emerald-400">{formatCurrency(todayRealized)}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        onClick={() => {
                          resetFinishWizard();
                          setActiveMainTab('agenda');
                        }}
                        variant="outline"
                        className="flex-1 rounded-xl h-11 border-white/10 text-slate-300 hover:bg-white/10"
                      >
                        Ir para Agenda
                      </Button>
                      <Button
                        type="button"
                        onClick={resetFinishWizard}
                        className="flex-1 bg-[#bd2635] text-white hover:bg-rose-700 rounded-xl h-11 font-bold"
                      >
                        Novo Atendimento
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Wizard Footer (Only for steps 1-3) */}
          {finishStep < 4 && (
            <div className="relative z-10 border-t border-white/10 pt-5 mt-6 flex items-center justify-between gap-4">
              <Button
                type="button"
                onClick={() => {
                  if (finishStep === 1) {
                    resetFinishWizard();
                    setActiveMainTab('agenda');
                  } else {
                    setFinishStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
                  }
                }}
                variant="outline"
                className="rounded-xl h-11 border-white/10 text-slate-300 hover:bg-white/10 px-4 flex items-center gap-1 text-xs"
              >
                <ChevronLeft size={16} /> {finishStep === 1 ? 'Sair' : 'Voltar'}
              </Button>

              {finishStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => {
                    setFinishStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
                  }}
                  disabled={
                    (finishStep === 1 && (!finishSelectedClient || !finishService || finishPrice <= 0)) ||
                    (finishStep === 2 && finishFinalPrice <= 0)
                  }
                  className="bg-[#bd2635] text-white hover:bg-rose-700 rounded-xl h-11 px-5 font-bold flex items-center gap-1.5 text-xs shadow-md shadow-[#8f1725]/20 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Avançar <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    // Finalize Appointment logic
                    if (finishSelectedApp) {
                      setAppointments(prev => prev.map(app =>
                        app.id === finishSelectedApp.id
                          ? {
                              ...app,
                              status: 'concluido',
                              price: finishFinalPrice,
                              paymentMethod: finishPaymentMethod,
                              service: finishService + (finishExtraItems.length > 0 ? ` + ${finishExtraItems.map(item => item.name).join(', ')}` : '')
                            }
                          : app
                      ));
                    } else {
                      const newApp: Appointment = {
                        id: Date.now().toString(),
                        date: todayStr,
                        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        clientName: finishSelectedClient ? finishSelectedClient.name : 'Cliente Avulso',
                        service: finishService + (finishExtraItems.length > 0 ? ` + ${finishExtraItems.map(item => item.name).join(', ')}` : ''),
                        price: finishFinalPrice,
                        status: 'concluido',
                        phone: finishSelectedClient?.phone || undefined,
                        paymentMethod: finishPaymentMethod
                      };
                      setAppointments(prev => [...prev, newApp]);
                    }

                    if (finishSelectedClient) {
                      setLocalCustomers(prev => {
                        const cleanPhoneFinish = (finishSelectedClient.phone || '').replace(/\D/g, '');
                        const exists = prev.some(c => c.name.toLowerCase() === finishSelectedClient.name.toLowerCase() || (c.phone && cleanPhoneFinish && c.phone.replace(/\D/g, '') === cleanPhoneFinish));
                        if (exists) {
                          return prev.map(c => {
                            if (c.name.toLowerCase() === finishSelectedClient.name.toLowerCase() || (c.phone && cleanPhoneFinish && c.phone.replace(/\D/g, '') === cleanPhoneFinish)) {
                              return { ...c, totalSpent: (c.totalSpent || 0) + finishFinalPrice };
                            }
                            return c;
                          });
                        } else {
                          const newCust: Customer = {
                            ...finishSelectedClient,
                            totalSpent: finishFinalPrice
                          };
                          return [...prev, newCust];
                        }
                      });
                    }
                    // Advance to success step (4)
                    setFinishStep(4);
                  }}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl h-11 px-5 font-bold flex items-center gap-1.5 text-xs shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle size={16} /> Confirmar & Concluir
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Agenda & Clientes View (now takes 100% width of container) */
        <div className="w-full animate-in fade-in duration-300">
          {activeMainTab === 'agenda' ? (
            /* AGENDA VIEW (DAILY OR WEEKLY) */
            <div className="space-y-4">
              {/* Agenda Control header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <Clock className="text-rose-600" size={20} />
                  <h3 className="font-black text-slate-800 dark:text-white text-base">
                    {isWeeklyView ? `Semana de ${getFriendlyDate(getWeekDates(viewDate)[0])}` : `Agenda de ${getFriendlyDate(viewDate)}`}
                  </h3>
                  
                  {/* Switch View Toggle */}
                  <div className="flex items-center gap-2 border-l border-slate-100 dark:border-slate-800 pl-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semana</span>
                    <button
                      type="button"
                      onClick={() => setIsWeeklyView(!isWeeklyView)}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-all ${
                        isWeeklyView ? 'bg-rose-600 shadow-sm shadow-rose-600/10' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                      title="Alternar entre Dia / Semana"
                    >
                      <div
                        className={`bg-white dark:bg-slate-100 w-4 h-4 rounded-full shadow-md transform transition-all ${
                          isWeeklyView ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {!isWeeklyView ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={handlePrevDay}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                      title="Dia Anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    <Input 
                      type="date"
                      value={viewDate}
                      onChange={(e) => setViewDate(e.target.value)}
                      className="rounded-xl h-9 text-xs py-1"
                    />
                    
                    <button 
                      onClick={handleNextDay}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                      title="Próximo Dia"
                    >
                      <ChevronRight size={16} />
                    </button>
                    
                    <Button 
                      onClick={handleGoToToday}
                      variant="ghost" 
                      size="sm" 
                      className="h-9 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
                    >
                      Hoje
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => {
                        const d = new Date(viewDate + 'T00:00:00');
                        d.setDate(d.getDate() - 7);
                        setViewDate(getLocalDateString(d));
                      }}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                      title="Semana Anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/60 select-none">
                      Navegação Semanal
                    </span>
                    <button 
                      onClick={() => {
                        const d = new Date(viewDate + 'T00:00:00');
                        d.setDate(d.getDate() + 7);
                        setViewDate(getLocalDateString(d));
                      }}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                      title="Próxima Semana"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <Button 
                      onClick={handleGoToToday}
                      variant="ghost" 
                      size="sm" 
                      className="h-9 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
                    >
                      Hoje
                    </Button>
                  </div>
                )}
              </div>

              {isWeeklyView ? (
                /* WEEKLY AGENDA PLANNER GRID */
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {getWeekDates(viewDate).map((dateStr) => {
                    const dayApps = appointments
                      .filter(app => app.date === dateStr && app.status !== 'cancelado')
                      .sort((a, b) => a.time.localeCompare(b.time));
                    
                    const isSelectedDay = viewDate === dateStr;
                    const d = new Date(dateStr + 'T00:00:00');
                    const weekdayShort = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
                    const dayNum = d.getDate();
                    const monthShort = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toLowerCase();

                    return (
                      <Card 
                        key={dateStr}
                        onClick={() => {
                          setViewDate(dateStr);
                          setIsWeeklyView(false);
                        }}
                        className={`p-4 border transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer min-h-[350px] flex flex-col justify-between ${
                          isSelectedDay 
                            ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-500/5 ring-1 ring-rose-500 shadow-sm' 
                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Day Header */}
                          <div className="border-b border-slate-100 dark:border-slate-800 pb-2 text-center">
                            <p className={`text-[10px] font-black tracking-widest ${isSelectedDay ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                              {weekdayShort}
                            </p>
                            <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{dayNum}</p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{monthShort}</p>
                          </div>

                          {/* Day Appointments */}
                          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                            {dayApps.length === 0 ? (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center py-6 italic font-medium">Livre</p>
                            ) : (
                              dayApps.map((app) => (
                                <div 
                                  key={app.id} 
                                  className={`p-2 rounded-xl text-[10px] border transition-colors ${
                                    app.status === 'concluido' 
                                      ? 'bg-slate-50/80 border-slate-200/50 text-slate-500 dark:bg-slate-950/20 dark:border-slate-800' 
                                      : app.status === 'atendimento'
                                      ? 'bg-blue-50/50 border-blue-100 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 animate-pulse'
                                      : app.status === 'pendente_aprovacao'
                                      ? 'bg-amber-50/50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 font-extrabold'
                                      : 'bg-rose-50/30 border-rose-100/50 text-rose-700 dark:bg-rose-500/5 dark:border-rose-500/10 dark:text-rose-400'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDetailsModal(app);
                                  }}
                                >
                                  <div className="flex justify-between items-center font-bold">
                                    <span>{app.time}</span>
                                    <span>{formatCurrency(app.price)}</span>
                                  </div>
                                  <p className="font-extrabold truncate mt-0.5 text-[9px]">{app.clientName}</p>
                                  <p className="opacity-80 truncate text-[8px]">{app.service}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400">Ver Agenda</span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                /* DAILY AGENDA VIEW */
                <Card className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                  <div className="hidden md:flex p-4 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <div className="w-20 shrink-0">Horário</div>
                    <div className="flex-1">Cliente & Serviço</div>
                    <div className="w-24 text-right">Valor</div>
                    <div className="w-32 text-center">Status</div>
                    <div className="w-32 text-right">Ações</div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAppointments.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                        Nenhum cliente agendado para esta data.
                      </div>
                    ) : (
                      filteredAppointments.map((app) => (
                        <div 
                          key={app.id} 
                          onClick={() => handleOpenDetailsModal(app)}
                          className={`transition-all hover:bg-slate-50/40 dark:hover:bg-slate-800/20 group cursor-pointer ${
                            app.status === 'concluido' ? 'opacity-70' : ''
                          } ${app.status === 'cancelado' ? 'opacity-40' : ''}`}
                        >
                          {/* Desktop View */}
                          <div className="hidden md:flex items-center p-4 text-sm w-full">
                            {/* Time */}
                            <div className="w-20 shrink-0 flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                              <Clock size={14} className="text-slate-400" />
                              {app.time}
                            </div>

                            {/* Client & Service */}
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{app.clientName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <Scissors size={12} className="text-rose-500 shrink-0" />
                                {app.service}
                              </p>
                              {app.phone && (
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Phone size={10} /> {app.phone}
                                </p>
                              )}
                            </div>

                            {/* Price */}
                            <div className="w-24 text-right font-black text-slate-800 dark:text-slate-200">
                              {formatCurrency(app.price)}
                            </div>

                            {/* Status Badge */}
                            <div className="w-32 text-center flex justify-center">
                              {app.status === 'aguardando' && (
                                <Badge variant="warning" className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                  Aguardando
                                </Badge>
                              )}
                              {app.status === 'atendimento' && (
                                <Badge variant="info" className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                                  <RefreshCw size={10} className="animate-spin" />
                                  Atendendo ({formatTimer(timers[app.id] || 0)})
                                </Badge>
                              )}
                              {app.status === 'concluido' && (
                                <Badge variant="success" className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <Check size={10} />
                                  Pago ({app.paymentMethod || 'PIX'})
                                </Badge>
                              )}
                              {app.status === 'cancelado' && (
                                <Badge variant="danger" className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                  Cancelado
                                </Badge>
                              )}
                            </div>

                            {/* Quick Actions */}
                            <div className="w-32 text-right flex justify-end gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                              {app.status === 'aguardando' && (
                                <>
                                  <Button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartService(app.id);
                                    }}
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 px-2 rounded-lg"
                                  >
                                    Atender
                                  </Button>
                                  <Button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenRescheduleModal(app);
                                    }}
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 px-2 rounded-lg"
                                  >
                                    Reagendar
                                  </Button>
                                </>
                              )}
                              {app.status === 'atendimento' && (
                                <Button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openFinishFlow(app);
                                  }}
                                  variant="success" 
                                  size="sm" 
                                  className="h-8 text-xs font-bold text-white px-2.5 rounded-lg flex items-center gap-1"
                                >
                                  <CheckCircle size={12} /> Concluir
                                </Button>
                              )}
                              {app.status === 'aguardando' && (
                                <Button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelService(app.id);
                                  }}
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                  title="Cancelar Agendamento"
                                >
                                  <X size={14} />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Mobile View */}
                          <div className="flex md:hidden flex-col p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="shrink-0 py-1 px-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black rounded-lg text-xs flex items-center gap-1">
                                  <Clock size={12} />
                                  {app.time}
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{app.clientName}</h4>
                              </div>
                              
                              <div className="shrink-0">
                                {app.status === 'aguardando' && (
                                  <Badge variant="warning" className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                    Aguardando
                                  </Badge>
                                )}
                                {app.status === 'atendimento' && (
                                  <Badge variant="info" className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                                    <RefreshCw size={8} className="animate-spin" />
                                    Atendendo
                                  </Badge>
                                )}
                                {app.status === 'concluido' && (
                                  <Badge variant="success" className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <Check size={8} />
                                    Pago
                                  </Badge>
                                )}
                                {app.status === 'cancelado' && (
                                  <Badge variant="danger" className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                    Cancelado
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 min-w-0 max-w-[70%]">
                                <Scissors size={12} className="text-rose-500 shrink-0" />
                                <span className="truncate">{app.service}</span>
                              </div>
                              <div className="font-black text-slate-800 dark:text-slate-200">
                                {formatCurrency(app.price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}

              {/* Metrics belong after the appointment grid in both day and week views. */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 text-xs shadow-sm md:grid-cols-4 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Realizado Hoje</span>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <strong className="text-sm text-slate-800 dark:text-white">{formatCurrency(todayRealized)}</strong>
                    <Badge variant="success" className="rounded-full px-1.5 py-0 text-[9px] font-black">{Math.round((todayRealized / dailyTarget) * 100)}%</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Atendimentos Concluidos</span>
                  <strong className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">{todayCompletedCount} / {todayScheduledCount}</strong>
                </div>
                <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Projecao Semanal</span>
                  <strong className="mt-0.5 text-sm text-violet-600 dark:text-violet-400">{formatCurrency(simulatedWeeklyRevenue)}</strong>
                </div>
                <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Projecao Mensal</span>
                  <strong className="mt-0.5 text-sm text-rose-600 dark:text-rose-400">{formatCurrency(simulatedMonthlyRevenue)}</strong>
                </div>
              </div>
            </div>
          ) : (
            /* CLIENTS DATABASE (CONTACTS LIST) */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2">
                  <User className="text-[#a6192e]" size={20} />
                  <h3 className="font-black text-slate-800 dark:text-white text-base">
                    Banco de Contatos ({localCustomers.length})
                  </h3>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    onClick={openImportWizard}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 h-9 font-bold flex items-center gap-1.5"
                  >
                    <UserPlus size={14} className="text-[#a6192e]" /> Importar Contatos
                  </Button>
                </div>
              </div>

              <Card className="border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-4 space-y-4">
                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    placeholder="Buscar contato por nome ou telefone..."
                    value={scheduleClientSearch}
                    onChange={(e) => setScheduleClientSearch(e.target.value)}
                    className="pl-10 rounded-xl h-11 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50"
                  />
                </div>

                {/* Table Header (Desktop only) */}
                <div className="hidden md:flex items-center px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <div className="flex-1">Cliente</div>
                  <div className="w-56">Próximo Horário</div>
                  <div className="w-80 text-right">Ações de Disparo</div>
                </div>

                {/* Contacts Table/List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredScheduleCustomers.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                      Nenhum contato encontrado.
                    </div>
                  ) : (
                    filteredScheduleCustomers.map((c) => {
                      const initials = c.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                      return (
                        <div 
                          key={c.id} 
                          className="px-4 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all border-l-4 border-l-transparent hover:border-l-[#ff0b1a] pl-3"
                        >
                          
                          {/* Column 1: Client Info */}
                          <div className="flex-1 flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#cc0a12] to-[#ff0b1a] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                              {initials}
                            </div>
                            <div className="truncate">
                              <p className="font-extrabold text-slate-900 dark:text-white text-sm truncate">{c.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                <Phone size={10} className="text-slate-400" /> {c.phone}
                              </p>
                            </div>
                          </div>

                          {/* Column 2: Next Appointment */}
                          <div className="w-full md:w-56 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <div className="md:hidden font-bold text-slate-400 uppercase tracking-wider text-[10px] w-24 shrink-0">Próximo:</div>
                            {(() => {
                              const nextApp = appointments
                                .filter(app => app.clientName.toLowerCase() === c.name.toLowerCase() && app.status === 'aguardando' && app.date >= todayStr)
                                .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0];
                              return nextApp ? (
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <span className="font-extrabold text-[#a6192e] dark:text-rose-400 flex items-center gap-1">
                                    <Calendar size={12} className="shrink-0" />
                                    {nextApp.date.split('-').reverse().join('/')} às {nextApp.time}
                                  </span>
                                  <span className="text-[10px] text-slate-500 truncate">{nextApp.service}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Sem horários agendados</span>
                              );
                            })()}
                          </div>

                          {/* Column 3: Quick Action Buttons */}
                          <div className="w-full md:w-80 flex items-center justify-end gap-2 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100 dark:border-slate-800">
                            <div className="md:hidden font-bold text-slate-400 uppercase tracking-wider text-[10px] flex-1">Disparar:</div>
                            
                            {/* Chat Button */}
                            <Button
                              onClick={() => {
                                const cleanPhone = c.phone.replace(/\D/g, '');
                                const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                                window.open(`https://wa.me/${phoneWithCountry}`, '_blank');
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-9 px-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-xl flex items-center gap-1 border border-transparent hover:border-emerald-200/30"
                              title="Conversar no WhatsApp"
                            >
                              <MessageSquare size={13} /> Chat
                            </Button>

                            {/* Booking Link */}
                            <Button
                              onClick={() => handleShareBookingLink(c)}
                              variant="ghost"
                              size="sm"
                              className="h-9 px-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 rounded-xl flex items-center gap-1 border border-transparent hover:border-rose-200/30"
                              title="Disparar Link de Agendamento"
                            >
                              <Send size={12} /> Link
                            </Button>

                            {/* Lembrar Horário */}
                            <Button
                              onClick={() => handleSendReminder(c)}
                              variant="ghost"
                              size="sm"
                              className="h-9 px-2.5 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10 rounded-xl flex items-center gap-1 border border-transparent hover:border-amber-200/30"
                              title="Disparar Lembrete de Horário"
                            >
                              <Clock size={12} /> Lembrete
                            </Button>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

              </Card>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: SCHEDULE CLIENT WIZARD (MULTI-STEP FULLSCREEN) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-screen overflow-hidden text-slate-800 dark:text-slate-100"
          >
            {/* Ambient Background Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 px-6 py-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/80 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
                    <CalendarClock size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">Novo Agendamento</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Atendimento Passo a Passo</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Step indicator progress bar */}
              <div className="w-full space-y-2 mt-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span className={scheduleStep >= 1 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}>1. Cliente</span>
                  <span className={scheduleStep >= 2 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}>2. Data</span>
                  <span className={scheduleStep >= 3 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}>3. Horário</span>
                  <span className={scheduleStep >= 4 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}>4. Confirmar</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-rose-600 to-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${scheduleStep === 1 ? 25 : scheduleStep === 2 ? 50 : scheduleStep === 3 ? 75 : 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Main Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-8 relative z-10 w-full max-w-2xl mx-auto custom-scrollbar flex flex-col justify-between">
              <div className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={scheduleStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col space-y-6"
                  >
                    {/* STEP 1: SELECT OR CREATE CLIENT */}
                    {scheduleStep === 1 && (
                      <div className="space-y-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-base">Quem você vai atender?</h4>
                          <button 
                            type="button"
                            onClick={() => setIsCreatingNewClient(!isCreatingNewClient)}
                            className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 rounded-lg transition-all"
                          >
                            <UserPlus size={14} />
                            {isCreatingNewClient ? 'Buscar Cliente Existente' : 'Cadastrar Novo Cliente'}
                          </button>
                        </div>

                        {isCreatingNewClient ? (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-md space-y-4"
                          >
                            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                              <UserPlus size={16} className="text-rose-500" /> Cadastro Rápido de Cliente
                            </h5>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Nome Completo</label>
                                <Input 
                                  type="text" 
                                  placeholder="Ex: Clara Mendes" 
                                  value={newClientName}
                                  onChange={(e) => setNewClientName(e.target.value)}
                                  className="rounded-xl h-12 focus:ring-2 focus:ring-rose-500 border-slate-200 dark:border-slate-800"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">WhatsApp / Telefone</label>
                                <Input 
                                  type="text" 
                                  placeholder="Ex: (11) 98888-1111" 
                                  value={newClientPhone}
                                  onChange={(e) => setNewClientPhone(formatPhoneNumber(e.target.value))}
                                  className="rounded-xl h-12 focus:ring-2 focus:ring-rose-500 border-slate-200 dark:border-slate-800"
                                />
                              </div>
                              <Button 
                                type="button" 
                                onClick={handleCreateAndSelectNewClient}
                                disabled={!newClientName}
                                className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white rounded-xl h-12 shadow-lg shadow-rose-600/10 font-bold transition-all mt-2"
                              >
                                Cadastrar e Continuar <ChevronRight size={16} className="ml-1" />
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="space-y-4 flex-1 flex flex-col">
                            <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <Input 
                                placeholder="Buscar por nome ou telefone..." 
                                value={scheduleClientSearch}
                                onChange={(e) => setScheduleClientSearch(e.target.value)}
                                className="pl-12 rounded-xl h-12 focus:ring-2 focus:ring-rose-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                              />
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[50vh] space-y-2 pr-1 custom-scrollbar">
                              {filteredScheduleCustomers.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 p-8">
                                  <User size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                                  <p className="text-sm font-semibold text-slate-500">Nenhum cliente cadastrado com esse nome.</p>
                                  <button
                                    onClick={() => setIsCreatingNewClient(true)}
                                    className="mt-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                                  >
                                    Cadastrar "{scheduleClientSearch}" agora
                                  </button>
                                </div>
                              ) : (
                                filteredScheduleCustomers.map((c) => {
                                  const initials = c.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                                  return (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => handleSelectClient(c)}
                                      className="w-full p-4 flex items-center justify-between text-left bg-white dark:bg-slate-900 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 rounded-2xl transition-all border border-slate-100 dark:border-slate-800/60 hover:border-rose-200 dark:hover:border-rose-800/50 shadow-sm group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-100 to-indigo-100 dark:from-rose-500/10 dark:to-indigo-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-sm flex items-center justify-center border border-rose-200/30 dark:border-rose-500/20 shadow-inner">
                                          {initials}
                                        </div>
                                        <div>
                                          <p className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{c.name}</p>
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                            <Phone size={10} className="text-slate-400" /> {c.phone}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 group-hover:text-rose-500 group-hover:bg-rose-100/50 dark:group-hover:bg-rose-500/20 transition-all">
                                        <ChevronRight size={16} />
                                      </div>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 2: SELECT DATE */}
                    {scheduleStep === 2 && (
                      <div className="space-y-6">
                        <div className="bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-500/10 p-3.5 rounded-xl text-xs flex items-center gap-2">
                          <User size={14} className="text-rose-500" />
                          <span>Cliente selecionado: <strong className="text-rose-600 dark:text-rose-400">{schedClient?.name}</strong></span>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-base">Qual é o dia do atendimento?</h4>
                          
                          {/* Quick Date Select Slider/Grid */}
                          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                            {next7Days.map((d) => {
                              const isSelected = schedDate === d.dateStr;
                              return (
                                <button
                                  key={d.dateStr}
                                  type="button"
                                  onClick={() => setSchedDate(d.dateStr)}
                                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 min-h-[90px] shadow-sm ${
                                    isSelected 
                                      ? 'border-rose-500 bg-gradient-to-b from-rose-50 to-rose-100/30 text-rose-600 dark:from-rose-950/20 dark:to-rose-900/10 dark:text-rose-400 scale-[1.03] ring-2 ring-rose-500/20 font-black' 
                                      : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                                  }`}
                                >
                                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-85">{d.dayName}</span>
                                  <span className="text-xl font-black leading-none">{d.dayNum}</span>
                                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-70">{d.monthName}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Fallback Custom Date Picker */}
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-md space-y-4">
                          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Calendar size={16} className="text-rose-500" /> Outra Data?
                          </h5>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            <Input 
                              type="date"
                              value={schedDate}
                              onChange={(e) => setSchedDate(e.target.value)}
                              className="rounded-xl h-12 pl-12 focus:ring-2 focus:ring-rose-500 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50"
                              min={todayStr}
                            />
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                            <span>Data Escolhida:</span>
                            <span className="font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg">
                              {getFriendlyDate(schedDate)} ({schedDate.split('-').reverse().join('/')})
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: SELECT TIME & SERVICE */}
                    {scheduleStep === 3 && (
                      <div className="space-y-6">
                        {/* Breadcrumbs/Info */}
                        <div className="bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-500/10 p-3.5 rounded-xl text-xs flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <User size={12} className="text-rose-500" />
                            <span>Cliente: <strong className="text-slate-800 dark:text-white">{schedClient?.name}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
                            <Calendar size={12} className="text-rose-500" />
                            <span>Data: <strong className="text-slate-800 dark:text-white">{schedDate.split('-').reverse().join('/')}</strong></span>
                          </div>
                        </div>

                        {/* Service Cards (Visually clickable instead of select dropdown) */}
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Escolha o Serviço</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                            {serviceOptions.map((opt) => {
                              const isSelected = schedService === opt.name;
                              return (
                                <button
                                  key={opt.name}
                                  type="button"
                                  onClick={() => handleServiceChange(opt.name)}
                                  className={`p-4 rounded-2xl border text-left transition-all flex justify-between items-center shadow-sm relative ${
                                    isSelected 
                                      ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-500/5 ring-1 ring-rose-500' 
                                      : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`p-2 rounded-xl shrink-0 ${
                                      isSelected ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400'
                                    }`}>
                                      <Scissors size={14} />
                                    </div>
                                    <div className="truncate pr-2">
                                      <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{opt.name}</p>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Atendimento padrão</p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-sm font-black text-slate-950 dark:text-white">{formatCurrency(opt.price)}</span>
                                    {isSelected && (
                                      <div className="absolute top-2 right-2 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                                        <Check size={10} strokeWidth={3} />
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Custom price adjustment input */}
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-md">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h5 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Preço Combinado</h5>
                              <p className="text-[10px] text-slate-500">Ajuste o valor deste atendimento se necessário</p>
                            </div>
                            <div className="relative w-full sm:w-44">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                              <Input 
                                type="number" 
                                value={schedPrice}
                                onChange={(e) => setSchedPrice(Number(e.target.value))}
                                className="rounded-xl h-11 pl-10 focus:ring-2 focus:ring-rose-500 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 font-bold"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Time Slots selector */}
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Escolha o Horário Livre</label>
                          {availableSlotsForSchedule.length === 0 ? (
                            <div className="text-center py-6 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-dashed border-red-200 dark:border-red-500/20 text-red-500 font-bold text-xs flex flex-col items-center justify-center gap-1.5 p-4">
                              <Clock size={20} />
                              <span>Não há horários livres disponíveis para {schedDate.split('-').reverse().join('/')}.</span>
                              <span className="text-[10px] font-normal opacity-85">Por favor, selecione outra data no passo anterior.</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-4 gap-2">
                              {availableSlotsForSchedule.map((time) => {
                                const isSelected = schedTime === time;
                                return (
                                  <button
                                    key={time}
                                    type="button"
                                    onClick={() => setSchedTime(time)}
                                    className={`py-3 px-3 text-xs font-bold rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 shadow-sm ${
                                      isSelected 
                                        ? 'border-rose-500 bg-gradient-to-b from-rose-50 to-rose-100/30 text-rose-600 dark:from-rose-950/20 dark:to-rose-900/10 dark:text-rose-400 scale-[1.03] ring-2 ring-rose-500/20 font-black' 
                                        : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                                  >
                                    <span>{time}</span>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 4: CONFIRMATION/REVIEW */}
                    {scheduleStep === 4 && (
                      <div className="space-y-6">
                        <div className="text-center space-y-1">
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-base">Tudo pronto! Revise os detalhes</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Verifique se as informações abaixo estão corretas antes de confirmar o agendamento.</p>
                        </div>

                        {/* Receipt / Booking Ticket Design */}
                        <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-lg">
                          {/* Decorative colored top header */}
                          <div className="h-2 bg-gradient-to-r from-rose-600 to-indigo-600" />
                          
                          <div className="p-6 space-y-6">
                            {/* Ticket Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4">
                              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                <CalendarClock size={20} />
                                <span className="font-black text-xs uppercase tracking-widest">Resumo do Cupom</span>
                              </div>
                              <Badge variant="warning" className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                Aguardando
                              </Badge>
                            </div>

                            {/* Client Profile details */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</span>
                              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-100 to-indigo-100 dark:from-rose-500/10 dark:to-indigo-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-sm flex items-center justify-center">
                                  {schedClient?.name ? schedClient.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'C'}
                                </div>
                                <div>
                                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">{schedClient?.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Phone size={10} className="text-slate-400" /> {schedClient?.phone}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Date and Time Details */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</span>
                                <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 h-[58px]">
                                  <Calendar size={16} className="text-rose-500 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{getFriendlyDate(schedDate)}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{schedDate.split('-').reverse().join('/')}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horário</span>
                                <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 h-[58px]">
                                  <Clock size={16} className="text-rose-500 shrink-0" />
                                  <div>
                                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">{schedTime}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-bold">Horário Reservado</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Service and Price Summary */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serviço & Faturamento</span>
                              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start gap-2">
                                    <Scissors size={14} className="text-rose-500 mt-0.5 shrink-0" />
                                    <div>
                                      <p className="font-extrabold text-xs text-slate-900 dark:text-white">{schedService}</p>
                                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Serviço de Beleza</p>
                                    </div>
                                  </div>
                                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Padrão</span>
                                </div>
                                
                                <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
                                  <span className="font-bold text-xs text-slate-800 dark:text-slate-300">Valor Cobrado:</span>
                                  <span className="text-lg font-black text-rose-600 dark:text-rose-400">{formatCurrency(schedPrice)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Contribution to Goals */}
                            <div className="p-3.5 bg-emerald-50/55 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/10 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                              <Sparkles size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                              <span>
                                <strong>Bônus Meta:</strong> Este atendimento aumentará o faturamento real do dia para <strong>{formatCurrency(todayRealized + (schedDate === todayStr ? schedPrice : 0))}</strong>.
                              </span>
                            </div>
                          </div>

                          {/* Jagged border graphic at the ticket bottom */}
                          <div className="relative h-2 bg-slate-100 dark:bg-slate-800 select-none overflow-hidden flex pointer-events-none">
                            {Array.from({ length: 24 }).map((_, i) => (
                              <div key={i} className="w-4 h-4 bg-white dark:bg-slate-900 rounded-full shrink-0 -mt-2 mx-[-2px] border border-slate-200/50 dark:border-slate-800" />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Immersive Footer */}
            <div className="relative z-10 p-5 bg-white/85 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/80 mt-auto flex items-center justify-between gap-4">
              <Button 
                type="button"
                onClick={() => {
                  if (scheduleStep === 1) {
                    setIsAddModalOpen(false);
                  } else {
                    setScheduleStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
                  }
                }} 
                variant="outline" 
                className="flex-1 rounded-xl h-12 hover:scale-[1.01] active:scale-[0.99] transition-all max-w-[150px] font-bold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft size={18} className="mr-1" /> {scheduleStep === 1 ? 'Cancelar' : 'Voltar'}
              </Button>

              {scheduleStep < 4 ? (
                <Button 
                  type="button"
                  onClick={() => {
                    setScheduleStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
                  }}
                  disabled={
                    (scheduleStep === 1 && !schedClient) ||
                    (scheduleStep === 2 && !schedDate) ||
                    (scheduleStep === 3 && (!schedTime || !schedService))
                  }
                  className="flex-1 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white rounded-xl h-12 shadow-lg shadow-rose-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all font-bold flex items-center justify-center gap-1"
                >
                  Avançar <ChevronRight size={18} />
                </Button>
              ) : (
                <Button 
                  type="button"
                  onClick={handleConfirmAppointment} 
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl h-12 shadow-lg shadow-emerald-500/15 hover:scale-[1.01] active:scale-[0.99] transition-all font-bold flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={18} /> Confirmar & Agendar
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: SEND AVAILABILITY WIZARD (WHATSAPP) */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Enviar Disponibilidade via WhatsApp"
        maxWidth="max-w-xl"
      >
        <div className="space-y-6">
          {/* Progress Indicators */}
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className={`flex items-center gap-1.5 ${shareStep >= 1 ? 'text-rose-600 dark:text-rose-400' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                shareStep === 1 ? 'bg-rose-600 text-white' : shareStep > 1 ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-100 text-slate-400'
              }`}>1</span>
              Cliente
            </span>
            <span className="h-px bg-slate-200 dark:bg-slate-800 flex-1 mx-4" />
            <span className={`flex items-center gap-1.5 ${shareStep >= 2 ? 'text-rose-600 dark:text-rose-400' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                shareStep === 2 ? 'bg-rose-600 text-white' : shareStep > 2 ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-100 text-slate-400'
              }`}>2</span>
              Data
            </span>
            <span className="h-px bg-slate-200 dark:bg-slate-800 flex-1 mx-4" />
            <span className={`flex items-center gap-1.5 ${shareStep >= 3 ? 'text-rose-600 dark:text-rose-400' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                shareStep === 3 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>3</span>
              Selecionar Livres
            </span>
          </div>

          {/* STEP 1: SELECT CLIENT */}
          {shareStep === 1 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Selecione o Cliente</h4>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input 
                  placeholder="Buscar cliente..." 
                  value={shareClientSearch}
                  onChange={(e) => setShareClientSearch(e.target.value)}
                  className="pl-10 rounded-xl h-11"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredShareCustomers.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-4">Nenhum cliente encontrado.</p>
                ) : (
                  filteredShareCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectShareClient(c)}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{c.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{c.phone}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DATE */}
          {shareStep === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Data da Disponibilidade</h4>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="text-rose-600" size={20} />
                  <Input 
                    type="date"
                    value={shareDate}
                    onChange={(e) => setShareDate(e.target.value)}
                    className="rounded-xl h-11"
                    min={todayStr}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Data Selecionada:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{getFriendlyDate(shareDate)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setShareStep(1)} 
                  variant="outline" 
                  className="flex-1 rounded-xl h-11"
                >
                  <ChevronLeft size={16} className="mr-1" /> Voltar
                </Button>
                <Button 
                  onClick={() => setShareStep(3)} 
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11"
                >
                  Avançar <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: CHOOSE MULTIPLE FREE TIMES */}
          {shareStep === 3 && (
            <div className="space-y-5">
              <div className="p-3 bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                Enviar para: <strong>{shareClient?.name}</strong> • Celular: <strong>{shareClient?.phone}</strong>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Selecione um ou mais horários livres</label>
                
                {availableSlotsForShare.length === 0 ? (
                  <p className="text-center text-xs text-red-500 font-bold py-4">Sem horários livres nesta data.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlotsForShare.map((time) => {
                      const isSelected = shareSelectedSlots.includes(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleToggleShareSlot(time)}
                          className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                            isSelected 
                              ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 font-extrabold shadow-sm' 
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Message Live Preview */}
              {shareSelectedSlots.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visualização da Mensagem</span>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line font-mono leading-relaxed">
                    {`Olá, *${shareClient?.name}*! Tudo bem?\n\nSeguem meus horários disponíveis para atendimento no dia *${shareDate.split('-').reverse().join('/')}*:\n\n${shareSelectedSlots.sort().map(s => `• *${s}*`).join('\n')}\n\nQual desses horários fica melhor para você?`}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => setShareStep(2)} 
                  variant="outline" 
                  className="flex-1 rounded-xl h-11"
                >
                  <ChevronLeft size={16} className="mr-1" /> Voltar
                </Button>
                <Button 
                  onClick={handleSendWhatsapp} 
                  disabled={shareSelectedSlots.length === 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1.5"
                >
                  <Send size={16} /> Enviar WhatsApp
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 4: REAGENDAR */}
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        title="Reagendar Atendimento"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setIsRescheduleModalOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleConfirmReschedule} className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 text-white rounded-xl">
              Confirmar Alteração
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Ajuste o horário do atendimento de <strong>{selectedApp?.clientName}</strong> ({selectedApp?.service}).
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Novo Horário</label>
            <Input 
              type="time" 
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
        </div>
      </Modal>

      {/* MODAL 5: DETALHES DO AGENDAMENTO */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalhes do Agendamento"
        maxWidth="max-w-md"
      >
        {selectedApp && (
          <div className="space-y-6">
            {/* Header info / Client Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 font-black text-lg">
                {selectedApp.clientName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">{selectedApp.clientName}</h4>
                {selectedApp.phone && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone size={12} className="text-slate-400" /> {selectedApp.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/20 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Horário</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                  <Clock size={14} className="text-rose-500" />
                  {selectedApp.time}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/20 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Valor</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-500" />
                  {formatCurrency(selectedApp.price)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/20 rounded-xl col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Serviço</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                  <Scissors size={14} className="text-indigo-500" />
                  {selectedApp.service}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/20 rounded-xl col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
                  <div className="mt-1">
                    {selectedApp.status === 'aguardando' && (
                      <Badge variant="warning" className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Aguardando
                      </Badge>
                    )}
                    {selectedApp.status === 'atendimento' && (
                      <Badge variant="info" className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <RefreshCw size={10} className="animate-spin" />
                        Atendendo ({formatTimer(timers[selectedApp.id] || 0)})
                      </Badge>
                    )}
                    {selectedApp.status === 'concluido' && (
                      <Badge variant="success" className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Check size={10} />
                        Pago ({selectedApp.paymentMethod || 'PIX'})
                      </Badge>
                    )}
                    {selectedApp.status === 'cancelado' && (
                      <Badge variant="danger" className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Cancelado
                      </Badge>
                    )}
                  </div>
                </div>
                {selectedApp.status === 'atendimento' && timers[selectedApp.id] !== undefined && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tempo Decorrido</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1 block">
                      {formatTimer(timers[selectedApp.id])}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Ações Disponíveis</span>
              
              {selectedApp.status === 'aguardando' && (
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => {
                      handleStartService(selectedApp.id);
                      setIsDetailsModalOpen(false);
                    }}
                    variant="primary" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 flex items-center justify-center gap-1.5 font-bold"
                  >
                    <RefreshCw size={16} /> Atender
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleOpenRescheduleModal(selectedApp);
                    }}
                    variant="outline" 
                    className="w-full rounded-xl h-11 flex items-center justify-center gap-1.5 font-bold text-slate-700 dark:text-slate-300"
                  >
                    <Calendar size={16} className="text-rose-500" /> Reagendar
                  </Button>
                </div>
              )}

              {selectedApp.status === 'atendimento' && (
                <Button 
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    openFinishFlow(selectedApp);
                  }}
                  variant="success" 
                  className="w-full text-white rounded-xl h-11 flex items-center justify-center gap-2 font-bold"
                >
                  <CheckCircle size={18} /> Concluir & Faturar
                </Button>
              )}

              {selectedApp.status === 'aguardando' && (
                <Button 
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleCancelService(selectedApp.id);
                  }}
                  variant="ghost" 
                  className="w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl h-11 flex items-center justify-center gap-1.5 font-bold"
                >
                  <X size={16} /> Cancelar Agendamento
                </Button>
              )}

              {selectedApp.phone && (
                <a 
                  href={`https://wa.me/55${selectedApp.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${selectedApp.clientName}! Confirmamos o seu atendimento de ${selectedApp.service} agendado para às ${selectedApp.time}.`)}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 rounded-xl h-11 flex items-center justify-center gap-1.5 font-bold text-sm cursor-pointer"
                >
                  <Send size={16} className="text-emerald-500" /> Enviar Mensagem WhatsApp
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 5: IMPORT CONTACTS WIZARD */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Importar Contatos do Celular"
        maxWidth="max-w-xl"
      >
        <div className="space-y-6">
          {/* Progress Indicators */}
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className={`flex items-center gap-1.5 ${importStep >= 1 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                importStep === 1 ? 'bg-rose-600 text-white' : importStep > 1 ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-100 text-slate-400'
              }`}>1</span>
              Exportar (Android)
            </span>
            <span className="h-px bg-slate-200 dark:bg-slate-800 flex-1 mx-4" />
            <span className={`flex items-center gap-1.5 ${importStep >= 2 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                importStep === 2 ? 'bg-rose-600 text-white' : importStep > 2 ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-100 text-slate-400'
              }`}>2</span>
              Upload / Colar
            </span>
            <span className="h-px bg-slate-200 dark:bg-slate-800 flex-1 mx-4" />
            <span className={`flex items-center gap-1.5 ${importStep >= 3 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                importStep === 3 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>3</span>
              Confirmar
            </span>
          </div>

          {/* STEP 1: ANDROID EXPORT GUIDE */}
          {importStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50/50 dark:bg-rose-500/5 rounded-2xl border border-rose-100 dark:border-rose-900/20 flex gap-3">
                <Info className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-black uppercase text-rose-600 dark:text-rose-400">Como exportar contatos do Android?</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Siga o passo a passo no seu celular Android para exportar seus clientes de uma vez só em um arquivo <code>.vcf</code> (vCard).
                  </p>
                </div>
              </div>

              <div className="space-y-3 pl-2">
                <div className="flex gap-3 text-xs leading-relaxed">
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">1.</span>
                  <p>Abra o aplicativo nativo <strong>Contatos</strong> do seu Android.</p>
                </div>
                <div className="flex gap-3 text-xs leading-relaxed">
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">2.</span>
                  <p>Toque em <strong>Organizar</strong>, <strong>Gerenciar contatos</strong> ou toque na sua foto de perfil e vá em <strong>Configurações do app Contatos</strong>.</p>
                </div>
                <div className="flex gap-3 text-xs leading-relaxed">
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">3.</span>
                  <p>Selecione a opção <strong>Exportar contatos</strong> ou <strong>Exportar para arquivo .vcf</strong>.</p>
                </div>
                <div className="flex gap-3 text-xs leading-relaxed">
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">4.</span>
                  <p>Salve o arquivo no seu telefone e envie para o seu computador/whatsapp web.</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => setIsImportModalOpen(false)}
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => setImportStep(2)}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11"
                >
                  Próximo Passo <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: FILE UPLOAD OR COPY PASTE */}
          {importStep === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Upload ou colar contatos</h4>
                <p className="text-xs text-slate-500">Selecione o arquivo exportado ou cole o conteúdo de texto do arquivo / lista de contatos.</p>
              </div>

              {/* File selection input */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <label className="cursor-pointer block space-y-1">
                  <UserPlus className="mx-auto text-slate-400" size={24} />
                  <span className="text-xs font-bold text-rose-600 block hover:underline">Selecionar arquivo .vcf (vCard)</span>
                  <span className="text-[10px] text-slate-400 block">Tamanho máximo 2MB</span>
                  <input
                    type="file"
                    accept=".vcf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Paste textarea */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ou cole o texto aqui (VCF ou lista no formato: Nome - Telefone)</label>
                <textarea
                  rows={6}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="BEGIN:VCARD&#10;FN:Juliana Silva&#10;TEL;CELL:11988887777&#10;END:VCARD&#10;&#10;Ou cole assim:&#10;Juliana Silva - (11) 98888-7777&#10;Carlos Souza, 11 97777-6666"
                  className="w-full text-xs font-mono p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 outline-none focus:ring-2 focus:ring-rose-500 transition-all custom-scrollbar"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => setImportStep(1)}
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                >
                  <ChevronLeft size={16} className="mr-1" /> Voltar
                </Button>
                <Button
                  onClick={handleParseAndPreview}
                  disabled={!importText.trim()}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11"
                >
                  Analisar Contatos <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & CONFIRM */}
          {importStep === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Visualizar Contatos a Importar</h4>
                <p className="text-xs text-slate-500">Encontramos os contatos abaixo. Clique em Confirmar para importá-los para o banco de clientes.</p>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 max-h-56 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                {importedPreview.length === 0 ? (
                  <p className="text-center text-xs text-red-500 font-bold py-4">Nenhum contato válido encontrado. Verifique a formatação do texto inserido.</p>
                ) : (
                  importedPreview.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">{c.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">{c.phone}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => setImportStep(2)}
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                >
                  <ChevronLeft size={16} className="mr-1" /> Ajustar Texto
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={importedPreview.length === 0}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl h-11 font-bold shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                >
                  <Check size={16} /> Confirmar Importação ({importedPreview.length})
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
