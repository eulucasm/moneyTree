import React, { useEffect } from 'react';
import { Target, ArrowLeft, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'expo-router';

export default function TermsOfService() {
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
            <FileText size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F5132] tracking-tight mb-4">
            Termos de Uso
          </h1>
          <p className="text-lg text-[#64748B]">
            Regras claras para uma convivência tranquila. Saiba o que esperar dos nossos serviços.
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
              Bem-vindo ao <strong>Money Tree</strong>. Ao acessar e utilizar o nosso aplicativo e website, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Recomendamos que leia atentamente antes de começar a organizar sua vida financeira conosco.
            </p>

            {/* Avisos Importantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex gap-4 items-start">
                <CheckCircle size={24} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#0F5132] mb-1">O que nós fazemos</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">Fornecemos ferramentas tecnológicas, painéis e gráficos para ajudar você a organizar, visualizar e projetar seus próprios dados financeiros.</p>
                </div>
              </div>
              <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 flex gap-4 items-start">
                <AlertCircle size={24} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-orange-800 mb-1">O que NÃO fazemos</h3>
                  <p className="text-xs text-orange-700/80 leading-relaxed">Não prestamos consultoria financeira, de investimentos ou contábil. As projeções são baseadas nos dados inseridos e não garantem resultados futuros.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#0F5132] mt-10 mb-4 border-b border-gray-100 pb-2">1. Aceitação dos Termos</h2>
            <p className="mb-4 text-[#64748B] leading-relaxed">
              Ao criar uma conta no Money Tree, você afirma que tem pelo menos 18 anos de idade (ou a maioridade legal na sua jurisdição) e que as informações fornecidas no momento do cadastro são verdadeiras, precisas e completas.
            </p>

            <h2 className="text-2xl font-bold text-[#0F5132] mt-10 mb-4 border-b border-gray-100 pb-2">2. Uso do Aplicativo e Conta</h2>
            <ul className="list-disc pl-5 space-y-3 mb-6 text-[#64748B] leading-relaxed">
              <li><strong>Segurança da Conta:</strong> Você é responsável por manter a confidencialidade da sua senha. Qualquer atividade realizada sob a sua conta é de sua inteira responsabilidade.</li>
              <li><strong>Uso Pessoal:</strong> O Money Tree é licenciado para seu uso pessoal e não comercial. A revenda ou sublicenciamento dos nossos serviços é expressamente proibida.</li>
              <li><strong>Sincronização:</strong> O aplicativo utiliza arquitetura <em>offline-first</em>. Você é responsável por garantir que o seu dispositivo se conecte à internet periodicamente para que o backup em nuvem seja realizado com sucesso.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0F5132] mt-10 mb-4 border-b border-gray-100 pb-2">3. Planos e Assinaturas (Se aplicável)</h2>
            <p className="mb-4 text-[#64748B] leading-relaxed">
              O Money Tree pode oferecer funcionalidades premium através de assinaturas pagas. Ao optar por um plano pago, você concorda com os preços e condições de faturamento apresentados no momento da compra. As assinaturas podem ser renovadas automaticamente, e o cancelamento pode ser feito a qualquer momento através das configurações da sua conta ou das lojas de aplicativos (App Store / Google Play).
            </p>

            <h2 className="text-2xl font-bold text-[#0F5132] mt-10 mb-4 border-b border-gray-100 pb-2">4. Propriedade Intelectual</h2>
            <p className="mb-4 text-[#64748B] leading-relaxed">
              Toda a identidade visual, design system, código, marcas (incluindo o nome "Money Tree"), gráficos e interfaces pertencem exclusivamente aos criadores do aplicativo. Nenhum direito de propriedade é transferido a você através do uso do serviço.
            </p>

            <h2 className="text-2xl font-bold text-[#0F5132] mt-10 mb-4 border-b border-gray-100 pb-2">5. Limitação de Responsabilidade</h2>
            <p className="mb-4 text-[#64748B] leading-relaxed">
              O Money Tree se esforça para manter o aplicativo seguro e livre de erros, mas não podemos garantir que o serviço será ininterrupto ou perfeito o tempo todo. Não nos responsabilizamos por decisões financeiras tomadas com base nas informações exibidas no aplicativo, perdas de lucros ou danos indiretos decorrentes do uso da plataforma.
            </p>

            <h2 className="text-2xl font-bold text-[#0F5132] mt-10 mb-4 border-b border-gray-100 pb-2">6. Modificações nestes Termos</h2>
            <p className="mb-4 text-[#64748B] leading-relaxed">
              Podemos atualizar estes Termos de Uso periodicamente para refletir novas funcionalidades ou mudanças na legislação. Quando isso acontecer, notificaremos você através do aplicativo ou por e-mail. O uso contínuo após as alterações significa que você concorda com as novas regras.
            </p>

            <h2 className="text-2xl font-bold text-[#0F5132] mt-10 mb-4 border-b border-gray-100 pb-2">7. Dúvidas Jurídicas?</h2>
            <p className="mb-4 text-[#64748B]">
              Se você tem alguma dúvida sobre os seus direitos ou sobre estes termos, a nossa equipe está à disposição. Envie um e-mail para: <a href="mailto:legal@moneytree.app" className="text-[#10B981] font-medium hover:underline">legal@moneytree.app</a>.
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