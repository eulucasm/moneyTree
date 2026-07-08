import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Shield, PieChart, Target, CreditCard, 
  TrendingUp, Cloud, Lock, ChevronRight, Menu, X, Smartphone
} from 'lucide-react';

// --- CUSTOM HOOK PARA ANIMAÇÃO DE SCROLL (REVEAL) ---
const ScrollContext = React.createContext<React.RefObject<HTMLDivElement> | null>(null);

const useOnScreen = (ref: React.RefObject<HTMLElement | null>, threshold = 0.1) => {
  const [isIntersecting, setIntersecting] = useState(false);
  const scrollRef = React.useContext(ScrollContext);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.unobserve(entry.target); // Anima apenas uma vez
        }
      },
      { 
        threshold,
        root: scrollRef?.current || null
      }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, threshold, scrollRef]);
  return isIntersecting;
};

const Reveal = ({ children, delay = 0, direction = 'up', className = '' }: { children: React.ReactNode, delay?: number, direction?: string, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  const baseClasses = "transition-all duration-1000 ease-out transform-gpu";
  
  let hiddenClasses = "opacity-0";
  if (direction === 'up') hiddenClasses += " translate-y-12";
  if (direction === 'down') hiddenClasses += " -translate-y-12";
  if (direction === 'left') hiddenClasses += " translate-x-12";
  if (direction === 'right') hiddenClasses += " -translate-x-12";

  const visibleClasses = "opacity-100 translate-y-0 translate-x-0";

  return (
    <div 
      ref={ref} 
      style={{ transitionDelay: `${delay}ms` }}
      className={`${baseClasses} ${isVisible ? visibleClasses : hiddenClasses} ${className}`}
    >
      {children}
    </div>
  );
};

// --- COMPONENTES DA APLICAÇÃO ---

import { useRouter } from 'expo-router';

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.MouseEvent) => { e.preventDefault(); router.push('/login'); };
  const handleRegister = (e: React.MouseEvent) => { e.preventDefault(); router.push('/register'); };

  // Efeito para Navbar Glassmorphism
  // Using onScroll on the main div instead of window since Expo Web might wrap in a non-window scroll container.
  useEffect(() => {
    // Window scroll fallback just in case
    const handleScroll = () => {
      if (window.scrollY > 20) setIsScrolled(true);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ScrollContext.Provider value={scrollRef}>
      <div 
        ref={scrollRef}
        className="h-screen bg-[#F8F9FA] text-[#334155] font-sans selection:bg-[#10B981] selection:text-white overflow-x-hidden overflow-y-auto"
      onScroll={(e) => {
        const scrolled = e.currentTarget.scrollTop > 20;
        if (isScrolled !== scrolled) setIsScrolled(scrolled);
      }}
    >
      
      {/* BACKGROUND ORBS (Estilo Apple) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[120px] transform-gpu"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-[120px] transform-gpu"></div>
      </div>

      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex items-center justify-between rounded-full px-6 py-3 transition-all duration-300 ${isScrolled ? 'bg-white/70 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40' : 'bg-transparent'}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10B981] to-[#0F5132] flex items-center justify-center shadow-lg">
                <Target size={16} className="text-white" />
              </div>
              <span className="font-bold text-xl text-[#0F5132] tracking-tight">Money Tree</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[#64748B]">
              <a href="#features" className="hover:text-[#10B981] transition-colors">Recursos</a>
              <a href="#futuro" className="hover:text-[#10B981] transition-colors">Previsões</a>
              <a href="#seguranca" className="hover:text-[#10B981] transition-colors">Segurança</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <a href="/login" onClick={handleLogin} className="text-[#0F5132] font-semibold text-sm hover:text-[#10B981] transition-colors">Entrar</a>
              <a href="/register" onClick={handleRegister} className="bg-[#10B981] hover:bg-[#0ea5e9] text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5">
                Começar Agora
              </a>
            </div>

            <button className="md:hidden text-[#0F5132]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* MENU MOBILE EXPANDIDO */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-[120%] left-4 right-4 bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-[0_16px_40px_rgb(0,0,0,0.08)] flex flex-col p-6 gap-6 animate-[fadeIn_0.2s_ease-out]">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-[#0F5132] px-2">Recursos</a>
              <a href="#futuro" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-[#0F5132] px-2">Previsões</a>
              <a href="#seguranca" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-[#0F5132] px-2">Segurança</a>
              
              <div className="w-full h-px bg-gray-200/50 my-1"></div>
              
              <div className="flex flex-col gap-3">
                <a href="/login" onClick={(e) => { setMobileMenuOpen(false); handleLogin(e); }} className="text-center text-[#0F5132] font-bold text-base py-3 border border-gray-200/60 rounded-2xl hover:bg-white/50 transition-colors">Entrar</a>
                <a href="/register" onClick={(e) => { setMobileMenuOpen(false); handleRegister(e); }} className="text-center bg-[#10B981] hover:bg-[#0ea5e9] transition-colors text-white py-3 rounded-2xl font-bold text-base shadow-lg shadow-emerald-500/20">Começar Agora</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          
          {/* Hero Text */}
          <div className="flex-1 text-center lg:text-left z-10">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200/50 text-[#0F5132] text-sm font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-[#10B981]"></span>
                O novo padrão em organização financeira
              </div>
            </Reveal>
            
            <Reveal delay={100}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0F5132] leading-[1.1] tracking-tight mb-6">
                Clareza e tranquilidade <br className="hidden md:block"/> para a sua vida financeira.
              </h1>
            </Reveal>
            
            <Reveal delay={200}>
              <p className="text-lg md:text-xl text-[#64748B] mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Um organizador financeiro moderno, inteligente e minimalista. Transforme a gestão do seu dinheiro em uma experiência relaxante e altamente visual.
              </p>
            </Reveal>
            
            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a href="/register" onClick={handleRegister} className="w-full sm:w-auto bg-[#10B981] text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2">
                  Começar a organizar <ArrowRight size={20} />
                </a>
                <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-[#0F5132] bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center">
                  Conhecer recursos
                </a>
              </div>
            </Reveal>
          </div>

          {/* Hero Mockup (CSS Glassmorphism) */}
          <div className="flex-1 relative w-full max-w-[500px] lg:max-w-none">
            <Reveal direction="left" delay={400} className="relative z-10">
              <style>{`
                @keyframes float {
                  0% { transform: translate3d(0, 0px, 0); }
                  50% { transform: translate3d(0, -20px, 0); }
                  100% { transform: translate3d(0, 0px, 0); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-delayed { animation: float 6s ease-in-out 3s infinite; }
              `}</style>
              
              {/* App Mockup Principal */}
              <div className="animate-float relative bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 z-20">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <p className="text-sm text-[#64748B] font-medium">Saldo Total</p>
                    <h3 className="text-3xl font-bold text-[#0F5132]">R$ 14.250<span className="text-xl text-gray-400">,00</span></h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="text-[#10B981]" size={24} />
                  </div>
                </div>
                
                {/* Chart Mockup */}
                <div className="h-32 mb-6 flex items-end gap-2">
                  {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-100 rounded-t-lg relative group transition-all">
                      <div className="absolute bottom-0 w-full bg-[#10B981] rounded-t-lg transition-all duration-500 ease-out" style={{ height: `${h}%` }}></div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transações Recentes</p>
                  
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500"><Smartphone size={18} /></div>
                      <div>
                        <p className="text-sm font-bold text-[#0F5132]">Conta de Luz</p>
                        <p className="text-xs text-[#64748B]">Hoje, 10:45</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-red-500">- R$ 185,00</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-500"><TrendingUp size={18} /></div>
                      <div>
                        <p className="text-sm font-bold text-[#0F5132]">Salário</p>
                        <p className="text-xs text-[#64748B]">Ontem, 09:00</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#10B981]">+ R$ 6.500,00</span>
                  </div>
                </div>
              </div>

              {/* Elementos Flutuantes (Cartões de Crédito) */}
              <div className="absolute -right-8 -top-12 animate-float-delayed z-10 scale-90 md:scale-100 hidden sm:block">
                 <div className="w-56 h-36 rounded-2xl bg-gradient-to-br from-[#820AD1] to-[#590494] shadow-2xl p-4 text-white relative overflow-hidden rotate-12 border border-white/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                    <CreditCard className="mb-6 opacity-80" size={24} />
                    <p className="text-sm font-medium opacity-80">Nubank</p>
                    <p className="text-lg font-bold">R$ 1.250,00</p>
                 </div>
              </div>
              
              <div className="absolute -left-12 bottom-12 animate-float z-30 scale-90 md:scale-100 hidden sm:block">
                 <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-[#3B82F6] flex items-center justify-center text-xs font-bold text-[#3B82F6]">
                      75%
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0F5132]">Viagem</p>
                      <p className="text-xs text-[#64748B]">Meta: R$ 5.000</p>
                    </div>
                 </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* BENTO GRID (FEATURES) */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-[#0F5132] mb-4 tracking-tight">Tudo o que você precisa,<br/>em um só lugar.</h2>
              <p className="text-lg text-[#64748B] max-w-2xl mx-auto">Funcionalidades desenhadas para trazer controle total com o mínimo de esforço.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
            
            {/* Feature 1: Dashboard (Large) */}
            <Reveal delay={100} className="md:col-span-2 md:row-span-2">
              <div className="bg-[#F8F9FA] rounded-[2rem] p-8 h-full border border-gray-100 shadow-sm relative overflow-hidden group transform-gpu">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 transform-gpu"></div>
                <div className="relative z-10 w-full md:w-1/2 mb-8 md:mb-0">
                  <h3 className="text-2xl font-bold text-[#0F5132] mb-3">Dashboard Inteligente</h3>
                  <p className="text-[#64748B] leading-relaxed mb-6">Acompanhe entradas, saídas e saúde geral das suas finanças em um painel unificado e reativo. Os números ganham vida.</p>
                </div>
                {/* Mini UI element */}
                <div className="absolute right-[-10%] md:right-8 bottom-[-10%] md:bottom-8 w-full md:w-1/2 h-[80%] bg-white rounded-t-2xl md:rounded-2xl shadow-xl border border-gray-100 p-5 transform translate-y-8 group-hover:translate-y-4 transition-transform duration-500">
                  <div className="w-full h-8 bg-gray-50 rounded-lg mb-4"></div>
                  <div className="w-3/4 h-8 bg-gray-50 rounded-lg mb-4"></div>
                  <div className="w-full h-32 bg-emerald-50 rounded-xl mt-auto relative overflow-hidden">
                     <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-emerald-200/50 to-transparent"></div>
                     {/* SVG wave mock */}
                     <svg className="absolute bottom-0 w-full h-24 text-[#10B981]" preserveAspectRatio="none" viewBox="0 0 1440 320" fill="currentColor">
                        <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,213.3C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                     </svg>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Feature 2: Múltiplos Cartões */}
            <Reveal delay={200}>
              <div className="bg-[#F8F9FA] rounded-[2rem] p-8 h-full border border-gray-100 shadow-sm relative overflow-hidden group">
                <h3 className="text-xl font-bold text-[#0F5132] mb-2 z-10 relative">Múltiplos Cartões</h3>
                <p className="text-sm text-[#64748B] mb-6 z-10 relative">Acompanhe limites e faturas customizadas por banco.</p>
                <div className="relative mt-8 h-32">
                  <div className="absolute right-0 top-0 w-48 h-28 bg-gradient-to-r from-[#009EE3] to-[#0073A8] rounded-xl shadow-lg rotate-12 origin-bottom-right transform group-hover:rotate-6 transition-transform"></div>
                  <div className="absolute left-0 top-4 w-48 h-28 bg-gradient-to-r from-[#F29100] to-[#D97E00] rounded-xl shadow-lg -rotate-6 transform group-hover:-rotate-2 transition-transform border border-white/20 p-4 text-white flex flex-col justify-between">
                     <p className="text-xs font-bold opacity-80">Cartão Itaú</p>
                     <div>
                       <p className="text-xs opacity-80 mb-1">Usado: 75%</p>
                       <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                         <div className="w-[75%] h-full bg-white rounded-full"></div>
                       </div>
                     </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Feature 3: Caixinhas */}
            <Reveal delay={300}>
              <div className="bg-[#F8F9FA] rounded-[2rem] p-8 h-full border border-gray-100 shadow-sm flex flex-col group">
                <h3 className="text-xl font-bold text-[#0F5132] mb-2">Metas e Poupança</h3>
                <p className="text-sm text-[#64748B] mb-6">Distribua recursos em caixinhas com progresso visual.</p>
                <div className="mt-auto bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 group-hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-full border-4 border-gray-100 border-t-[#3B82F6] border-r-[#3B82F6] flex items-center justify-center">
                    <Target className="text-[#3B82F6]" size={20}/>
                  </div>
                  <div>
                    <p className="font-bold text-[#0F5132]">Reserva</p>
                    <p className="text-xs text-[#3B82F6] font-medium mt-1">Concluído: 50%</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Feature 4: Analytics */}
            <Reveal delay={400} className="md:col-span-3">
              <div className="bg-[#F8F9FA] rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#0F5132] mb-3">Inteligência e Analytics</h3>
                  <p className="text-[#64748B] leading-relaxed mb-6">Entenda para onde seu dinheiro está indo com gráficos interativos e minimalistas. Distribuição por categoria e evolução histórica.</p>

                </div>
                <div className="flex-1 w-full flex gap-4 h-40">
                  {/* Mock Analytics Bars */}
                  {[
                    { c: 'bg-emerald-400', h: '80%' },
                    { c: 'bg-blue-400', h: '50%' },
                    { c: 'bg-orange-400', h: '30%' },
                    { c: 'bg-red-400', h: '60%' },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 bg-white rounded-t-xl relative border border-gray-100 overflow-hidden group-hover:shadow-md transition-shadow">
                       <div className={`absolute bottom-0 w-full ${bar.c} rounded-t-xl opacity-80 hover:opacity-100 transition-opacity`} style={{ height: bar.h }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* VISÃO DE FUTURO SECTION */}
      <section id="futuro" className="py-24 px-6 bg-[#F8F9FA] border-y border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
           <div className="flex-1 order-2 lg:order-1 relative w-full">
              <Reveal direction="right">
                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-100 relative z-10">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Previsão 6 Meses</p>
                      <h4 className="text-2xl font-bold text-[#0F5132]">Saldo Projetado</h4>
                    </div>
                    <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1">
                      IA Ativada
                    </div>
                  </div>
                  {/* Chart Line Mock */}
                  <div className="h-48 relative border-b border-l border-gray-100">
                    <svg className="absolute bottom-0 left-0 w-full h-full text-[#10B981] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,80 Q20,80 40,50 T80,30 T100,10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="animate-[dash_3s_ease-out_forwards]" style={{ strokeDasharray: 300, strokeDashoffset: 0 }} />
                      <circle cx="40" cy="50" r="2" fill="currentColor" className="animate-ping" />
                      <circle cx="80" cy="30" r="2" fill="currentColor" className="animate-ping" style={{ animationDelay: '1s' }} />
                      <circle cx="100" cy="10" r="3" fill="currentColor" />
                    </svg>
                    {/* Tooltip Hover Mock */}
                    <div className="absolute top-[5%] right-[-10%] bg-[#0F5132] text-white px-3 py-2 rounded-xl shadow-lg text-xs font-bold animate-bounce hidden sm:block">
                      R$ 22.400 em Dezembro
                      <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F5132] rotate-45"></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium">
                    <span>Jul</span>
                    <span>Ago</span>
                    <span>Set</span>
                    <span>Out</span>
                    <span>Nov</span>
                    <span>Dez</span>
                  </div>
                </div>
              </Reveal>
           </div>
           
           <div className="flex-1 order-1 lg:order-2">
              <Reveal>
                <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center mb-6">
                  <PieChart className="text-yellow-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0F5132] mb-6 tracking-tight">
                  Nunca mais seja pego de surpresa.
                </h2>
                <p className="text-lg text-[#64748B] mb-8 leading-relaxed">
                  O Money Tree gera previsões automatizadas para os próximos meses baseando-se em suas contas fixas, assinaturas e faturas de cartão. Tenha uma <strong>visão de futuro</strong> do seu dinheiro.
                </p>
                <ul className="space-y-4">
                  {[
                    "Projeção automática de contas fixas",
                    "Avisos de risco de saldo negativo",
                    "Simulação de cenários financeiros"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#0F5132] font-medium">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
           </div>
        </div>
      </section>

      {/* DARK MODE SHOWCASE & SEGURANÇA */}
      <section id="seguranca" className="py-24 px-6 bg-[#0B0F19] text-white relative overflow-hidden transform-gpu">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#10B981]/5 rounded-full blur-[100px] pointer-events-none transform-gpu"></div>
        
        <div className="max-w-7xl mx-auto text-center mb-16 relative z-10">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Beleza que não cansa.<br/>Segurança de banco.</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Trabalhe confortavelmente à noite com nosso modo escuro nativo. Seus dados sempre protegidos e sincronizados.</p>
          </Reveal>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          <Reveal delay={100}>
            {/* Dark Mode Mockup */}
            <div className="bg-[#151D30] rounded-[2rem] p-8 border border-white/5 h-full flex flex-col items-center justify-center">
               <div className="w-full bg-[#0B0F19] rounded-2xl p-6 shadow-2xl border border-white/5 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#10B981] to-blue-500"></div>
                 <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-400 text-sm">Cartão Principal</p>
                    <Lock size={16} className="text-emerald-500" />
                 </div>
                 <p className="text-3xl font-bold text-white mb-2">R$ 4.320,00</p>
                 <div className="w-full bg-gray-800 h-2 rounded-full mt-4">
                   <div className="bg-[#10B981] h-2 rounded-full w-[45%]"></div>
                 </div>
               </div>
               <p className="mt-8 text-center text-gray-400 font-medium">Dark Mode Premium. Conforto visual absoluto.</p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="bg-[#151D30] rounded-[2rem] p-8 border border-white/5 h-full flex flex-col justify-center">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Cloud className="text-[#3B82F6]" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Sincronização Offline-First</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">O app funciona perfeitamente sem internet. Assim que a conexão volta, tudo é salvo na nuvem com criptografia de ponta.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Shield className="text-[#10B981]" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Privacidade Total</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">Nós não vendemos seus dados. Sua vida financeira é só sua. Utilizamos padrões de segurança bancária para garantir a tranquilidade.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA & FOOTER */}
      <section className="py-24 px-6 bg-white border-t border-gray-100 text-center relative overflow-hidden transform-gpu">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-emerald-50 rounded-full blur-[80px] -z-10 transform-gpu"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <Reveal>
            <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12">
              <Target size={32} className="text-[#0F5132]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F5132] mb-6 tracking-tight">Pronto para assumir o controle?</h2>
            <p className="text-xl text-[#64748B] mb-10">Junte-se ao Money Tree e descubra como organizar seu dinheiro pode ser uma experiência incrível.</p>
            
            <a href="/register" onClick={handleRegister} className="inline-flex items-center gap-3 bg-[#0F5132] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-[#10B981] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
              Criar Conta Gratuita Agora <ArrowRight />
            </a>
          </Reveal>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-[#10B981]" />
            <span className="font-bold text-[#0F5132]">Money Tree</span>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Money Tree. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-400">
            <a href="/privacidade" onClick={(e) => { e.preventDefault(); router.push('/privacidade'); }} className="hover:text-[#10B981] transition-colors">Privacidade</a>
            <a href="/termos" onClick={(e) => { e.preventDefault(); router.push('/termos'); }} className="hover:text-[#10B981] transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
    </ScrollContext.Provider>
  );
}