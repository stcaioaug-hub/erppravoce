/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  UserPlus, 
  Tag, 
  CreditCard, 
  Banknote, 
  QrCode, 
  FileText,
  Package,
  ShoppingCart,
  Maximize,
  History,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, Button, Input, Badge, Modal } from '../components/ui';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS } from '../data/mocks';
import { Product, PaymentMethod, SaleItem } from '../types';
import { formatCurrency, cn } from '../lib/utils';

export const PDV = () => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(MOCK_CUSTOMERS[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');

  const filteredCustomers = useMemo(() => {
    return MOCK_CUSTOMERS.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.document.includes(customerSearch)
    );
  }, [customerSearch]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return MOCK_PRODUCTS.slice(0, 5);
    return MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.barcode.includes(searchTerm) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } 
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.salePrice,
        discount: 0,
        total: product.salePrice
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
    const discount = 0; // Placeholder for logic
    return {
      subtotal,
      discount,
      total: subtotal - discount
    };
  }, [cart]);

  const handleFinishSale = () => {
    alert(`Venda finalizada com sucesso via ${paymentMethod} para ${selectedCustomer.name}!`);
    setCart([]);
    setPaymentMethod(null);
    setCheckoutStep(1);
    setIsCheckoutModalOpen(false);
  };

  const onScanSuccess = (decodedText: string) => {
    const product = MOCK_PRODUCTS.find(p => p.barcode === decodedText || p.sku === decodedText);
    if (product) {
      addToCart(product);
      setIsScannerOpen(false);
      // Small feedback could be added here
    } else {
      console.warn("Produto não encontrado para o código:", decodedText);
    }
  };

  const onScanFailure = (error: any) => {
    // Silent mode for errors during scanning attempts
  };

  React.useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (isScannerOpen) {
      // Small delay to ensure modal is rendered
      const timeoutId = setTimeout(() => {
        scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        scanner.render(onScanSuccess, onScanFailure);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        if (scanner) {
          scanner.clear().catch(err => console.error("Error clearing scanner", err));
        }
      };
    }
  }, [isScannerOpen]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] overflow-hidden">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <Card className="p-4 shrink-0">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <Input 
                className="pl-10 h-12 text-lg" 
                placeholder="Buscar produto por nome, EAN ou SKU..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <Button 
              onClick={() => setIsScannerOpen(true)}
              className="h-12 w-12 p-0 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shrink-0"
              title="Escanear Código"
            >
              <Maximize size={24} />
            </Button>
          </div>
        </Card>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-xl transition-all text-left"
              >
                <div className="h-32 bg-slate-50 flex items-center justify-center text-slate-300 relative">
                  <Package size={48} className="group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-2 right-2">
                    <Badge variant={product.currentStock <= product.minStock ? 'danger' : 'success'}>
                      {product.currentStock} {product.unit}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-slate-900 line-clamp-2 mb-1">{product.name}</h4>
                  <p className="text-xs text-slate-400 mb-3">{product.category}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-black text-blue-600">{formatCurrency(product.salePrice)}</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={20} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-full lg:w-96 flex flex-col gap-4 sticky top-0">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShoppingCart size={20} className="text-blue-600" />
              Carrinho
            </div>
            <Badge variant="blue">{cart.length} itens</Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {cart.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <ShoppingCart size={32} />
                  </div>
                  <p className="text-sm font-medium">Seu carrinho está vazio</p>
                  <p className="text-xs mt-1">Busque produtos ao lado para começar</p>
                </motion.div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    layout
                    key={item.productId} 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="flex gap-3 p-3 bg-white border border-slate-100 rounded-lg group"
                  >
                    <div className="flex-1">
                      <button 
                        onClick={() => {
                          const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
                          if (product) setSelectedProduct(product);
                        }}
                        className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-blue-600 hover:underline transition-all text-left"
                      >
                        {item.name}
                      </button>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-500">{formatCurrency(item.price)} un.</span>
                        <span className="text-sm font-black text-slate-900">{formatCurrency(item.total)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center bg-slate-100 rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="p-1 hover:text-blue-600 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="p-1 hover:text-blue-600 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.productId)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 bg-slate-900 text-white space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center opacity-70">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center opacity-70">
                <span>Desconto</span>
                <span>- {formatCurrency(totals.discount)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="font-bold text-lg">Total</span>
                <span className="font-black text-2xl text-blue-400">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost" className="bg-white/5 border-none hover:bg-white/10 text-white font-bold h-12">
                <UserPlus size={18} className="mr-2" /> Cliente
              </Button>
              <Button variant="ghost" className="bg-white/5 border-none hover:bg-white/10 text-white font-bold h-12">
                <Tag size={18} className="mr-2" /> Cupom
              </Button>
            </div>

            <Button 
              className="w-full h-14 text-lg font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20"
              disabled={cart.length === 0}
              onClick={() => {
                setCheckoutStep(1);
                setIsCheckoutModalOpen(true);
              }}
            >
              FECHAR VENDA (F9)
            </Button>
          </div>
        </Card>
      </div>

      <Modal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)}
        title={checkoutStep === 1 ? "Identificação do Cliente" : checkoutStep === 2 ? "Forma de Pagamento" : "Confirmar Venda"}
        footer={
          <div className="flex justify-between w-full">
            {checkoutStep > 1 ? (
              <Button variant="ghost" onClick={() => setCheckoutStep(prev => prev - 1)}>
                Voltar
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsCheckoutModalOpen(false)}>Cancelar</Button>
            )}
            
            {checkoutStep < 3 ? (
              <Button 
                className="bg-blue-600 text-white"
                onClick={() => setCheckoutStep(prev => prev + 1)}
                disabled={checkoutStep === 2 && !paymentMethod}
              >
                Próximo Passo
              </Button>
            ) : (
              <Button 
                onClick={handleFinishSale}
                className="bg-blue-600 text-white"
              >
                Finalizar Venda
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 px-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center gap-2 relative">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all z-10",
                  checkoutStep >= step ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-400"
                )}>
                  {step}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  checkoutStep >= step ? "text-blue-600" : "text-slate-400"
                )}>
                  {step === 1 ? 'Cliente' : step === 2 ? 'Pagamento' : 'Confirma'}
                </span>
                {step < 3 && (
                  <div className={cn(
                    "absolute left-10 top-5 h-0.5 w-[calc(100%+32px)] ml-2 transition-all",
                    checkoutStep > step ? "bg-blue-600" : "bg-slate-100"
                  )} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {checkoutStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Pesquisar cliente cadastrado..." 
                    className="pl-10"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                        selectedCustomer.id === customer.id 
                          ? "bg-blue-50 border-blue-600 shadow-sm" 
                          : "bg-white border-slate-100 hover:border-blue-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                          selectedCustomer.id === customer.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{customer.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{customer.document}</p>
                        </div>
                      </div>
                      {selectedCustomer.id === customer.id && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                          <Plus size={12} className="rotate-45" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <Button variant="ghost" className="w-full text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-100 border-none">
                  <UserPlus size={16} className="mr-2" /> Cadastrar novo cliente
                </Button>
              </motion.div>
            )}

            {checkoutStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Valor da Venda</span>
                  <h2 className="text-4xl font-black text-blue-700 mt-1">{formatCurrency(totals.total)}</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: PaymentMethod.PIX, icon: QrCode, label: 'PIX' },
                    { id: PaymentMethod.CREDIT, icon: CreditCard, label: 'Crédito' },
                    { id: PaymentMethod.DEBIT, icon: CreditCard, label: 'Débito' },
                    { id: PaymentMethod.CASH, icon: Banknote, label: 'Dinheiro' },
                    { id: PaymentMethod.BOLETO, icon: FileText, label: 'Boleto' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = paymentMethod === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all h-24",
                          isSelected 
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]" 
                            : "bg-white border-slate-100 text-slate-500 hover:border-blue-400 hover:text-blue-600"
                        )}
                      >
                        <Icon size={24} />
                        <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {checkoutStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {paymentMethod === PaymentMethod.PIX ? (
                  <div className="bg-white rounded-3xl p-6 text-center border-2 border-blue-600 shadow-xl shadow-blue-100 flex flex-col items-center">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Escaneie para Pagar</h3>
                    <div className="w-48 h-48 bg-slate-100 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-slate-300">
                      <QrCode size={120} className="text-slate-400" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 mb-2">{formatCurrency(totals.total)}</p>
                    <p className="text-sm text-slate-500 mb-4">{selectedCustomer.name}</p>
                    <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                      <Copy size={16} className="mr-2" /> Copiar Código Pix
                    </Button>
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-3xl p-6 text-white text-center shadow-xl shadow-slate-200">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Total a Receber</h3>
                    <p className="text-5xl font-black text-blue-400 mb-6">{formatCurrency(totals.total)}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-left border-t border-white/10 pt-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cliente</p>
                        <p className="font-bold text-sm truncate">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pagamento</p>
                        <p className="font-bold text-sm">{paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <History size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Estoque será atualizado</p>
                    <p className="text-[10px] text-emerald-600 font-bold">{cart.length} produtos serão retirados do estoque.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      {/* Product Details Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Detalhes do Produto"
        footer={<Button onClick={() => setSelectedProduct(null)}>Fechar</Button>}
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Package size={40} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedProduct.name}</h3>
                <Badge variant="blue" className="mt-1">{selectedProduct.category}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SKU</p>
                <p className="text-sm font-bold text-slate-700">{selectedProduct.sku}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">EAN / Barcode</p>
                <p className="text-sm font-bold text-slate-700">{selectedProduct.barcode}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estoque Atual</p>
                <p className={cn(
                  "text-sm font-bold",
                  selectedProduct.currentStock <= selectedProduct.minStock ? "text-red-500" : "text-emerald-500"
                )}>
                  {selectedProduct.currentStock} {selectedProduct.unit}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preço de Venda</p>
                <p className="text-sm font-bold text-blue-600">{formatCurrency(selectedProduct.salePrice)}</p>
              </div>
            </div>

            {selectedProduct.description && (
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 italic text-sm text-slate-600 leading-relaxed">
                "{selectedProduct.description}"
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Scanner Modal */}
      <Modal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title="Escanear Produto"
      >
        <div className="space-y-4">
          <div id="reader" className="w-full overflow-hidden rounded-xl bg-slate-100 min-h-[300px]"></div>
          <div className="text-center text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="font-bold text-slate-700 mb-1">Posicione o código de barras ou QR no centro</p>
            <p>O scanner reconhecerá automaticamente e adicionará ao carrinho</p>
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="Ou digite o código manualmente..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onScanSuccess((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
