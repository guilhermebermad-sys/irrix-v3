import { Link } from "react-router-dom";
import { Reveal, Counter } from "./Reveal";
import {
  Calculator, Sprout, Timer, Radar, CalendarClock, Wheat, BarChart3, FileText, BellRing,
  Home, Sun, FileBarChart, Check, X, Star, Instagram, Linkedin, Youtube, Droplets, Lock,
  ShieldCheck, ClipboardList, Heart,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";

/* ──────────────── PROVA SOCIAL ──────────────── */
export function SocialProof() {
  return (
    <section className="py-12 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Confiado por consultores e produtores em todo o Brasil
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm md:text-base font-medium">
          <span>🌱 Sojicultura</span>
          <span>☕ Cafeicultura</span>
          <span>🍅 Olericultura</span>
          <span>🌽 Milho</span>
          <span>🍓 Fruticultura</span>
          <span>🛰 2 APIs climáticas integradas</span>
        </div>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
          <span className="text-warning">★★★★★</span>
          <span>4.9/5 de satisfação · +<Counter to={500} />+ talhões monitorados</span>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── PROBLEMA × SOLUÇÃO ──────────────── */
export function ProblemaSolucao() {
  const sem = [
    "Irrigar por feeling, sem dados reais do solo",
    "Não saber o Kc certo para cada fase da cultura",
    "Desperdiçar água por excesso ou perder produção por deficit",
    "Sem histórico para tomar decisões futuras",
    "Risco de escoamento e erosão sem perceber",
    "Relatórios manuais em planilha desatualizada",
  ];
  const com = [
    "Balanço hídrico diário encadeado e automatizado",
    "Kc preenchido automaticamente por cultura e estádio",
    "Lâmina e tempo de irrigação calculados com precisão",
    "Histórico completo exportável em CSV, Excel e PDF",
    "Diagnóstico de risco de escoamento em tempo real",
    "Relatório técnico profissional com 1 clique",
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <Reveal>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center">
            O problema que todo produtor conhece
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Reveal>
            <div className="neu p-7 rounded-2xl border-l-4" style={{ borderColor: "hsl(var(--destructive))" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl neu-sm flex items-center justify-center text-destructive">
                  <X className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl">Sem o IrriX</h3>
              </div>
              <ul className="space-y-3">
                {sem.map((t) => (
                  <li key={t} className="flex gap-3 text-sm">
                    <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="neu p-7 rounded-2xl border-l-4" style={{ borderColor: "hsl(var(--primary))" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                  style={{ background: "var(--gradient-brand)" }}>
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl">Com o IrriX</h3>
              </div>
              <ul className="space-y-3">
                {com.map((t) => (
                  <li key={t} className="flex gap-3 text-sm">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── FUNCIONALIDADES ──────────────── */
const features = [
  { icon: Calculator, emoji: "🧮", title: "Balanço Hídrico Diário Encadeado",
    desc: "Cálculo automático de ETc, Lâmina Líquida, Lâmina Bruta e Armazenamento do Solo. O Arm.Final de hoje vira o Arm.Inicial de amanhã — sem redigitar nada." },
  { icon: Sprout, emoji: "🌱", title: "Inteligência Solo-Água",
    desc: "Selecione o tipo de solo e obtenha automaticamente a Taxa de Infiltração Básica (TiB) e a CAD. O sistema compara com sua taxa de aplicação e alerta sobre riscos de escoamento e erosão." },
  { icon: Timer, emoji: "⏱", title: "Tempo de Irrigação Preciso",
    desc: "Calcula em hh:mm exatamente quanto tempo ligar o sistema, com base na vazão real dos emissores, espaçamento, área e eficiência de aplicação." },
  { icon: Radar, emoji: "📡", title: "Taxa de Aplicação × TiB",
    desc: "Diagnóstico automático: se sua taxa de aplicação superar a infiltração do solo, o sistema emite alerta visual imediato com recomendação agronômica." },
  { icon: CalendarClock, emoji: "🗓", title: "Turno de Rega Inteligente",
    desc: "Projeta automaticamente quando o solo atingirá o nível crítico de água disponível, indicando a data exata da próxima irrigação necessária." },
  { icon: Wheat, emoji: "🌾", title: "Kc Automático por Estádio",
    desc: "Banco de dados de Kc baseado na FAO-56 para Soja, Milho, Café, Tomate, Cana, Feijão, Citros, Morango e mais. Atualiza automaticamente conforme o estádio fenológico." },
  { icon: BarChart3, emoji: "📊", title: "Histórico e Gráficos",
    desc: "Série histórica completa de todos os dias registrados, com gráficos de Armazenamento do Solo, ETc, Chuva e Lâmina aplicada. Visualize tendências e tome decisões." },
  { icon: FileText, emoji: "📄", title: "Exportação Profissional",
    desc: "Exporte seus dados em CSV, Excel (.xlsx) ou Relatório PDF com cabeçalho técnico, gráficos incorporados e espaço para CREA do responsável. Ideal para laudos." },
  { icon: BellRing, emoji: "🔔", title: "Alertas Automáticos",
    desc: "Notificações internas quando o solo atingir ponto crítico, quando houver risco de drenagem profunda ou quando a taxa de aplicação superar a TiB do solo." },
  { icon: Radar, emoji: "🛰", title: "Dados Climáticos Automáticos", badge: "NOVO",
    desc: "Esqueça o trabalho de buscar ET₀ manualmente. O IRRIX conecta com NASA POWER e Open-Meteo para obter automaticamente a evapotranspiração de referência, chuva, temperatura e radiação solar da sua localização exata — gratuitamente e sem configuração adicional." },
];

export function TecnologiaSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <Reveal>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center">🛰 Dados Científicos em Tempo Real</h2>
          <p className="text-center text-muted-foreground mt-3 max-w-2xl mx-auto">
            O IRRIX integra com as melhores fontes de dados climáticos do mundo — gratuitas e confiáveis
          </p>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Reveal>
            <div className="neu p-7 rounded-2xl h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl">🛰</div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ background: "var(--gradient-brand)" }}>
                  Dados Históricos · Gratuito
                </span>
              </div>
              <h3 className="font-display font-bold text-xl mb-2">NASA POWER API</h3>
              <p className="text-sm text-muted-foreground">
                Desenvolvida pela NASA, a API POWER fornece dados meteorológicos diários desde 1981 para qualquer ponto do globo.
                O IRRIX usa esses dados para calcular ET₀ pelo método Hargreaves-Samani (FAO-56) com precisão agronômica.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm">
                <li>☀️ Radiação solar (MJ/m²/dia)</li>
                <li>🌡 Temperatura máx, mín e média</li>
                <li>💧 Umidade relativa do ar</li>
                <li>🌬 Velocidade do vento a 2m</li>
                <li>🌧 Precipitação corrigida</li>
                <li>📊 ET₀ calculada automaticamente</li>
              </ul>
              <div className="text-xs text-muted-foreground mt-4">Fonte: power.larc.nasa.gov</div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="neu p-7 rounded-2xl h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl">⛅</div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ background: "hsl(var(--secondary))" }}>
                  Previsão 7 Dias · Gratuito
                </span>
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Open-Meteo API</h3>
              <p className="text-sm text-muted-foreground">
                API meteorológica de código aberto com previsão de alta resolução para o Brasil. Fornece ET₀ calculada
                pelo método Penman-Monteith FAO-56 — o padrão ouro da agronomia — para os próximos 7 dias.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm">
                <li>📅 Previsão de ET₀ para 7 dias</li>
                <li>🌧 Precipitação prevista por dia</li>
                <li>🌡 Temperatura máx e mín previstas</li>
                <li>⛅ Condição do tempo com ícones</li>
                <li>💡 Alerta de alta demanda hídrica</li>
                <li>🗓 Planejamento antecipado do turno</li>
              </ul>
              <div className="text-xs text-muted-foreground mt-4">Fonte: open-meteo.com</div>
            </div>
          </Reveal>
        </div>
        <div className="mt-8 neu-sm p-4 rounded-xl text-center text-sm font-medium">
          🇧🇷 Cobertura total do território brasileiro · Dados atualizados diariamente · Sem custo adicional para o usuário
        </div>
      </div>
    </section>
  );
}

export function Funcionalidades() {
  return (
    <section id="funcionalidades" className="py-20 md:py-28 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <Reveal>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center">
            Tudo que um software de irrigação precisa ter — em um só lugar
          </h2>
          <p className="text-center text-muted-foreground mt-4 max-w-3xl mx-auto">
            Desenvolvido com base na literatura agronômica (FAO-56, Bernardo et al.) para
            consultores e produtores exigentes
          </p>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {features.map((f: any, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="neu p-6 rounded-2xl hover-lift h-full relative">
                {f.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: "hsl(var(--warning))" }}>{f.badge}</span>
                )}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 text-white"
                  style={{ background: "var(--gradient-brand)" }}>
                  {f.emoji}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────── COMO FUNCIONA ──────────────── */
const steps = [
  { icon: Home, emoji: "🏠", title: "Cadastre sua Fazenda",
    desc: "Registre suas fazendas, talhões, cultura, estádio fenológico e os dados do sistema de irrigação instalado. O sistema preenche os parâmetros técnicos automaticamente." },
  { icon: Sun, emoji: "☀️", title: "Insira os Dados do Dia",
    desc: "Informe a ET₀, a chuva efetiva e ajuste o Kc se necessário. Tudo calculado instantaneamente enquanto você digita." },
  { icon: BarChart3, emoji: "📊", title: "Receba o Diagnóstico",
    desc: "Visualize a Lâmina a aplicar, o Tempo de irrigação, o Armazenamento do Solo, o diagnóstico de eficiência e o próximo turno de rega." },
  { icon: FileBarChart, emoji: "📄", title: "Exporte o Relatório",
    desc: "Com um clique, gere um relatório técnico profissional em PDF, planilha Excel ou CSV para enviar ao produtor ou arquivar." },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <Reveal>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center">
            Da fazenda ao relatório em 4 passos
          </h2>
        </Reveal>
        <div className="relative mt-14 grid md:grid-cols-4 gap-8 md:gap-4">
          <div aria-hidden className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-1 rounded-full"
            style={{ background: "var(--gradient-brand)", opacity: 0.3 }} />
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 rounded-full neu flex items-center justify-center text-3xl mb-5">
                  {s.emoji}
                  <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ background: "var(--gradient-brand)" }}>
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────── DEPOIMENTOS ──────────────── */
const testimonials = [
  { initials: "CR", name: "Carlos R.", role: "Eng. Agrônomo, CREA-SP",
    grad: "var(--gradient-brand)",
    text: "Antes eu usava planilha e perdia horas calculando o balanço hídrico manualmente. Com o IrriX, em 2 minutos tenho o diagnóstico completo e o relatório pronto para o produtor. Virou ferramenta indispensável." },
  { initials: "MS", name: "Mariana S.", role: "Consultora de Irrigação, MG",
    grad: "linear-gradient(135deg, hsl(189 94% 43%), hsl(200 90% 50%))",
    text: "O alerta de risco de escoamento me salvou em um talhão de tomate. A taxa de aplicação estava acima da TiB do solo e eu não tinha percebido. O sistema identificou na hora." },
  { initials: "JP", name: "João P.", role: "Produtor Rural, Goiás",
    grad: "linear-gradient(135deg, hsl(38 92% 50%), hsl(20 90% 55%))",
    text: "Reduzi o consumo de água em quase 35% na safra de soja. O sistema me mostrou que eu estava irrigando além do necessário. Simples de usar e os resultados foram imediatos." },
];

export function Depoimentos() {
  return (
    <section className="py-20 md:py-28 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <Reveal>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center">
            O que dizem nossos consultores
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="neu p-6 rounded-2xl h-full hover-lift">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: t.grad }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3 text-warning">
                  {[...Array(5)].map((_, k) => <Star key={k} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">"{t.text}"</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────── PLANOS ──────────────── */
const plans = [
  {
    name: "Básico", icon: "🌱", badge: "Para começar",
    monthly: 49, annual: 39,
    cta: "Começar Grátis por 14 dias", to: "/cadastro",
    features: [
      [true, "1 Fazenda"], [true, "Até 3 Talhões"],
      [true, "Balanço hídrico diário completo"],
      [true, "Exportação CSV"], [true, "Alertas automáticos"],
      [true, "Histórico de 90 dias"],
      [false, "Exportação PDF/Excel"], [false, "Múltiplas fazendas"],
      [false, "Suporte prioritário"],
    ] as [boolean, string][],
  },
  {
    name: "Pro", icon: "💧", badge: "Mais Popular", featured: true,
    monthly: 149, annual: 119,
    cta: "Assinar Plano Pro", to: "/cadastro",
    features: [
      [true, "Fazendas ilimitadas"], [true, "Talhões ilimitados"],
      [true, "Tudo do Básico"], [true, "Exportação PDF profissional"],
      [true, "Exportação Excel (.xlsx)"], [true, "Histórico ilimitado"],
      [true, "Gráficos avançados"], [true, "Logo nos relatórios PDF"],
      [true, "Suporte via WhatsApp"],
    ] as [boolean, string][],
  },
  {
    name: "Consultor", icon: "🏆", badge: "Para escritórios",
    monthly: 299, annual: 239,
    cta: "Falar com Especialista", to: "/cadastro",
    features: [
      [true, "Tudo do Pro"], [true, "Múltiplos usuários (até 5 consultores)"],
      [true, "Gestão de clientes/produtores"], [true, "Relatórios com CREA e logotipo"],
      [true, "Dashboard de todos os talhões"], [true, "API de integração (em breve)"],
      [true, "Suporte prioritário"], [true, "Onboarding personalizado"],
    ] as [boolean, string][],
  },
];

export function Planos() {
  const [annual, setAnnual] = useState(false);
  return (
    <section id="planos" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <Reveal>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center">
            Planos para cada tamanho de operação
          </h2>
          <p className="text-center text-muted-foreground mt-3">
            Comece grátis. Escale quando precisar.
          </p>
        </Reveal>

        <div className="flex justify-center mt-8">
          <div className="neu-inset rounded-full p-1.5 inline-flex items-center gap-1">
            <button onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? "neu-sm text-foreground" : "text-muted-foreground"}`}>
              Mensal
            </button>
            <button onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${annual ? "neu-sm text-foreground" : "text-muted-foreground"}`}>
              Anual
              <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold"
                style={{ background: "hsl(var(--warning))" }}>Economize 20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12 items-start">
          {plans.map((p, i) => {
            const price = annual ? p.annual : p.monthly;
            const card = (
              <div className={`neu p-7 rounded-2xl h-full flex flex-col ${p.featured ? "md:scale-105" : ""}`}>
                {p.badge && (
                  <div className={`inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-4 ${p.featured ? "text-white" : "neu-sm text-muted-foreground"}`}
                    style={p.featured ? { background: "hsl(var(--warning))" } : {}}>
                    {p.badge}
                  </div>
                )}
                <div className="text-3xl mb-2">{p.icon}</div>
                <h3 className="font-display font-bold text-2xl">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display font-bold text-4xl">R$ {price}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                {annual && <div className="text-xs text-primary font-semibold mt-1">cobrado anualmente</div>}

                <ul className="space-y-2.5 mt-6 mb-6 flex-1">
                  {p.features.map(([ok, txt]) => (
                    <li key={txt} className="flex gap-2 text-sm">
                      {ok
                        ? <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        : <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
                      <span className={ok ? "text-foreground/80" : "text-muted-foreground line-through"}>{txt}</span>
                    </li>
                  ))}
                </ul>

                <Link to={p.to}
                  className={`btn-shimmer neu-button w-full text-center px-5 py-3 rounded-xl text-sm font-semibold ${p.featured ? "text-white" : ""}`}
                  style={p.featured ? { background: "var(--gradient-brand)", boxShadow: "0 10px 24px rgba(16,185,129,0.35)" } : {}}>
                  {p.cta}
                </Link>
              </div>
            );
            return (
              <Reveal key={p.name} delay={i * 80}>
                {p.featured ? (
                  <div className="rounded-[18px] p-[2px]" style={{ background: "var(--gradient-brand)" }}>
                    {card}
                  </div>
                ) : card}
              </Reveal>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Pagamento seguro</span>
          <span className="inline-flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> Cancele quando quiser</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> 14 dias grátis sem cartão</span>
          <span>🇧🇷 Suporte em português</span>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── FAQ ──────────────── */
const faq = [
  ["Preciso saber programar para usar o IrriX?",
    "Não. O sistema foi desenvolvido para consultores agrônomos e produtores rurais. Basta cadastrar sua fazenda, inserir os dados diários e o sistema faz todos os cálculos automaticamente."],
  ["De onde vêm os valores de Kc e TiB?",
    "Os coeficientes Kc são baseados na publicação FAO-56 (Allen et al., 1998) e as Taxas de Infiltração Básica seguem a tabela de Bernardo et al. (2006), referências padrão na agronomia brasileira."],
  ["Posso usar em qualquer tipo de irrigação?",
    "Sim. O sistema atende Gotejamento, Microaspersão, Aspersão e Pivô Central. Os cálculos se adaptam aos dados do equipamento que você cadastrar."],
  ["Como funciona o balanço hídrico encadeado?",
    "O Armazenamento Final do solo calculado hoje é automaticamente usado como ponto de partida do cálculo de amanhã. Isso elimina erros de redigitação e garante consistência no histórico."],
  ["Posso exportar para apresentar ao produtor?",
    "Sim. Nos planos Pro e Consultor você exporta relatórios em PDF com seu logo e CREA, planilhas Excel organizadas por mês e arquivos CSV."],
  ["Os dados ficam salvos com segurança?",
    "Sim. Utilizamos infraestrutura com criptografia e backup automático. Cada usuário acessa apenas seus próprios dados (Row Level Security)."],
  ["Posso cancelar a qualquer momento?",
    "Sim. Não há fidelidade. Você cancela quando quiser direto pelo painel, sem burocracia."],
];

export function FAQ() {
  return (
    <section className="py-20 md:py-28 bg-muted/40">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <Reveal>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-10">
            Dúvidas frequentes
          </h2>
        </Reveal>
        <Accordion type="single" collapsible className="space-y-3">
          {faq.map(([q, a], i) => (
            <Reveal key={q} delay={i * 50}>
              <AccordionItem value={`i${i}`} className="neu rounded-2xl px-5 border-none">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">{q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{a}</AccordionContent>
              </AccordionItem>
            </Reveal>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ──────────────── CTA FINAL ──────────────── */
export function CTAFinal() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="neu p-10 md:p-14 rounded-3xl text-center relative overflow-hidden">
            <div aria-hidden className="absolute inset-0 opacity-10"
              style={{ background: "var(--gradient-brand)" }} />
            <div className="relative">
              <Droplets className="w-14 h-14 mx-auto text-primary animate-bounce" style={{ animationDuration: "2.5s" }} />
              <h2 className="font-display font-bold text-3xl md:text-5xl mt-6 leading-tight">
                Comece a irrigar com<br />
                <span className="text-gradient-brand">inteligência hoje.</span>
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                14 dias grátis. Sem cartão de crédito. Sem complicação.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <Link to="/cadastro"
                  className="btn-shimmer neu-button px-7 py-4 rounded-xl font-semibold text-white text-base"
                  style={{ background: "var(--gradient-brand)", boxShadow: "0 12px 28px rgba(16,185,129,0.4)" }}>
                  Criar conta grátis
                </Link>
                <Link to="/login" className="neu-button px-7 py-4 rounded-xl font-semibold text-base">
                  Já sou cliente →
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-8 text-xs text-muted-foreground font-medium">
                <span>⚡ Configuração em 5 minutos</span>
                <span>🌱 Primeiro cálculo imediato</span>
                <span>📄 Relatório no mesmo dia</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────── FOOTER ──────────────── */
export function Footer() {
  return (
    <footer id="contato" className="pt-16 pb-8 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="font-display font-bold text-xl text-gradient-brand">IrriX</div>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Plataforma de Manejo de Irrigação de Precisão para consultores e
              produtores rurais brasileiros.
            </p>
            <div className="flex gap-2 mt-4">
              {[
                { Icon: Instagram, href: "https://www.instagram.com/irrixapp/", label: "Instagram" },
                { Icon: Linkedin, href: "#", label: "LinkedIn" },
                { Icon: Youtube, href: "#", label: "YouTube" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="neu-button w-9 h-9 rounded-lg flex items-center justify-center"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Produto" items={["Funcionalidades", "Como Funciona", "Planos e Preços", "Atualizações", "Roadmap"]} />
          <FooterCol title="Suporte" items={["Central de Ajuda", "Documentação Técnica", "Contato via WhatsApp", "Política de Privacidade", "Termos de Uso"]} />

          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📧 contato@irrix.com.br</li>
              <li>📱 WhatsApp: (XX) XXXXX-XXXX</li>
              <li>🌎 irrix.com.br</li>
            </ul>
            <div className="neu-sm inline-flex items-center gap-2 px-3 py-2 rounded-xl mt-4 text-xs font-semibold">
              <Heart className="w-3.5 h-3.5 text-destructive fill-current" />
              Desenvolvido para o agro brasileiro 🇧🇷
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-foreground/10 text-center text-xs text-muted-foreground">
          © 2025 IrriX. Todos os direitos reservados. Desenvolvido com base em FAO-56 e Bernardo et al. (2006).
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">{title}</h4>
      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <li key={it}>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">{it}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
