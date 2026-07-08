import React, { useEffect } from 'react';
import { Target, ArrowLeft, ShieldCheck, Lock, EyeOff, HardDrive } from 'lucide-react';
import { useRouter } from 'expo-router';

export default function PrivacyPolicy() {
  const router = useRouter();

  // Rola a página para o topo ao carregar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="h-screen bg-[#F8F9FA] text-[#334155] font-sans selection:bg-[#10B981] selection:text-white overflow-x-hidden overflow-y-auto">
      
      {/* NAVBAR SIMPLIFICADA */}
      <nav className="w-full bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" onClick={(e) => { e.preventDefault(); if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10B981] to-[#0F5132] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Target size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl text-[#0F5132] tracking-tight">Money Tree</span>
          </a>
          
          <a href="/" onClick={(e) => { e.preventDefault(); if (router.canGoBack()) { router.back(); } else { router.replace('/'); } }} className="flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#10B981] transition-colors">
            <ArrowLeft size={16} />
            Voltar ao Início
          </a>
        </div>
      </nav>

      {/* HEADER DA PÁGINA */}
      <header className="pt-20 pb-12 px-6 text-center relative overflow-hidden">
        {/* Background Orbs suaves */}
        <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-400/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#10B981]">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F5132] tracking-tight mb-4">
            Privacidade e Segurança
          </h1>
          <p className="text-lg text-[#64748B]">
            A sua vida financeira é só sua. Entenda como protegemos os seus dados.
          </p>
          <p className="text-xs text-gray-400 mt-6 font-medium uppercase tracking-wider">
            Última atualização: 07 de Julho de 2026
          </p>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="px-6 pb-24">
        <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-12 animate-[fadeIn_0.5s_ease-out]">
          
          <div className="prose prose-emerald max-w-none">
            
            <p className="text-lg leading-relaxed text-[#334155] mb-8">
              No <strong>Money Tree</strong>, nós acreditamos que a clareza financeira não deve custar a sua privacidade. Este documento explica de forma simples e transparente como coletamos, usamos e protegemos as suas informações.
            </p>

            {/* Grid de Destaques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
                <EyeOff size={24} className="text-[#10B981] mb-3" />
                <h3 className="text-sm font-bold text-[#0F5132] mb-1">Nenhum dado vendido</h3>
                <p className="text-xs text-[#64748B]">Seus dados não são nosso produto. Nunca venderemos suas informações para terceiros.</p>
              </div>
              <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
                <HardDrive size={24} className="text-[#3B82F6] mb-3" />
                <h3 className="text-sm font-bold text-[#0F5132] mb-1">Offline-First</h3>
                <p className="text-xs text-[#64748B]">Seus dados processados localmente no seu dispositivo e salvos com segurança.</p>
              </div>
              <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
                <Lock size={24} className="text-[#F59E0B] mb-3" />
                <h3 className="text-sm font-bold text-[#0F5132] mb-1">Criptografia Forte</h3>
                <p className="text-xs text-[#64748B]">Utilizamos os mesmos padrões de segurança (AES-256) adotados por grandes bancos.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#0F5132] mt-10 mb-4 border-b border-gray-100 pb-2">1. Dados que coletamos</h2>
            <p className="mb-4">Para que o Money Tree funcione perfeitamente, coletamos apenas o estritamente necessário:</p>
            <ul className="list-disc pl-5 space-y-2 mb-6 text-[#64748B]">
              <li><strong className="text-[#334155]">Dados de Conta:</strong> Nome, endereço de e-mail e foto de perfil (opcional) para criação da sua conta.</li>
              <li><strong className="text-[#334155]">Dados Financeiros:</strong> Transações, saldos, categorias e metas financeiras que você insere manualmente ou sincroniza.</li>
              <li><strong className="text-[#334155]">Dados de Uso:</strong> Informações anônimas sobre como você interage com o aplicativo, para nos ajudar a identificar bugs e melhorar a interface.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0F5132] mt-10 mb-4 border-b border-gray-100 pb-2">2. Sincronização Offline-First e Armazenamento</h2>
            <p className="mb-4 text-[#64748B] leading-relaxed">
              O Money Tree foi construído com uma arquitetura <em>offline-first</em>. Isso significa que seus dados de entrada (transações, edições de metas) são salvos inicialmente <strong>no seu próprio dispositivo</strong>. 
              <br/><br/>
              A sincronização com nossos servidores em nuvem ocorre em segundo plano apenas para garantir que você não perca seus dados caso troque de aparelho. Todos os dados enviados para a nuvem são transmitidos através de conexões seguras (HTTPS/TLS) e criptografados em repouso.
            </p>

            <h2 className="text-2xl font-bold text-[#0F5132] mt-10 mb-4 border-b border-gray-100 pb-2">3. Como usamos seus dados</h2>
            <p className="mb-4 text-[#64748B]">Utilizamos suas informações exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-2 mb-6 text-[#64748B]">
              <li>Fornecer a projeção de fluxo de caixa (Visão de Futuro) de forma personalizada.</li>
              <li>Manter seus dispositivos sincronizados (Web, iOS e Android).</li>
              <li>Prestar suporte técnico quando você nos solicita ajuda.</li>
              <li>Avisar sobre riscos de saldo negativo (com base nas suas regras).</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0F5132] mt-10 mb-4 border-b border-gray-100 pb-2">4. Seus Direitos e Controle</h2>
            <p className="mb-4 text-[#64748B]">Você tem total controle sobre sua árvore financeira:</p>
            <ul className="list-disc pl-5 space-y-2 mb-6 text-[#64748B]">
              <li><strong>Direito à Exclusão:</strong> Você pode excluir sua conta a qualquer momento diretamente nas configurações do aplicativo. Ao fazer isso, todos os seus dados financeiros são apagados de nossos servidores permanentemente.</li>
              <li><strong>Exportação de Dados:</strong> Você pode exportar seu histórico financeiro completo (em formato CSV ou JSON) a qualquer momento.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0F5132] mt-10 mb-4 border-b border-gray-100 pb-2">5. Contato</h2>
            <p className="mb-4 text-[#64748B]">
              Ficou com alguma dúvida sobre como tratamos seus dados? Sinta-se à vontade para enviar um e-mail para nossa equipe de privacidade em: <a href="mailto:privacidade@moneytree.app" className="text-[#10B981] font-medium hover:underline">privacidade@moneytree.app</a>.
            </p>

          </div>
        </div>
      </main>

      {/* FOOTER DA PÁGINA */}
      <footer className="bg-white border-t border-gray-100 py-8 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Target size={18} className="text-[#10B981]" />
            <span className="font-bold text-[#0F5132]">Money Tree</span>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Money Tree App. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}