import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

function gerarRespostaBot(pergunta) {
  const q = pergunta.toLowerCase();

  // ODS gerais da ONU
  if (q.includes('o que são as ods') || (q.includes('o que sao') && q.includes('ods'))) {
    return `As ODS (Objetivos de Desenvolvimento Sustentável) são 17 metas globais definidas pela ONU para até 2030.

No ProFuture, vocês estão trabalhando principalmente com 4 delas:

• ODS 4 - Educação de Qualidade: foco em acesso à educação, requalificação profissional e aprendizado contínuo.
• ODS 8 - Trabalho Decente e Crescimento Econômico: foco em empregos dignos, oportunidades de carreira e melhoria de condições de trabalho.
• ODS 9 - Indústria, Inovação e Infraestrutura: foco em tecnologia, inovação e soluções digitais para o mercado de trabalho.
• ODS 10 - Redução das Desigualdades: foco em ampliar acesso a oportunidades para diferentes perfis de pessoas.

Se quiser, posso explicar melhor como o ProFuture se conecta com cada uma dessas ODS.`;
  }

  // Quais ODS o ProFuture usa
  if (q.includes('quais') && q.includes('ods') && (q.includes('profuture') || q.includes('pro future'))) {
    return `O ProFuture está alinhado principalmente com estas ODS da ONU:

• ODS 4 - Educação de Qualidade: ajudando na curva de aprendizado, requalificação profissional e centralização de conteúdos.
• ODS 8 - Trabalho Decente e Crescimento Econômico: conectando profissionais a vagas, empresas e oportunidades de carreira.
• ODS 9 - Indústria, Inovação e Infraestrutura: usando uma plataforma digital focada em tecnologia, dados e inovação.
• ODS 10 - Redução das Desigualdades: aproximando pessoas e empresas e facilitando o acesso a oportunidades para diferentes perfis.

Essas ODS aparecem no projeto de vocês em gráficos, quiz inicial e na proposta de impacto do ProFuture.`;
  }

  // Como o sistema funciona
  if (q.includes('como funciona') && q.includes('profuture')) {
    return `O ProFuture funciona como uma rede profissional focada em tecnologia:

• Você cria um perfil profissional ou de empresa.
• Profissionais preenchem experiências, formação e escolhem até 3 hard skills.
• Empresas criam vagas e selecionam hard skills desejadas.
• O sistema recomenda empresas e vagas com base nas hard skills em comum.`;
  }

  // Recomendações
  if (
    q.includes('recomenda') ||
    q.includes('recomendadas') ||
    q.includes('recomendação') ||
    q.includes('recomendacoes') ||
    q.includes('recomendações')
  ) {
    return `As recomendações funcionam assim:

• Empresas recomendadas: aparecem na aba "Empresas" quando pelo menos 1 hard skill de interesse da empresa é igual a uma das suas hard skills.
• Vagas com base no seu perfil: na aba "Vagas", aparecem quando as hard skills da vaga têm pelo menos 1 skill em comum com as suas.

Dica: mantenha suas hard skills atualizadas no seu perfil para melhorar as recomendações.`;
  }

  // Perfil, foto e edição
  if (
    q.includes('editar perfil') ||
    q.includes('editar meu perfil') ||
    q.includes('atualizar meu perfil') ||
    q.includes('mudar minha foto') ||
    q.includes('foto de perfil') ||
    q.includes('atualizar foto')
  ) {
    return `Você consegue editar seu perfil na aba "Perfil":

• Profissionais: podem editar resumo, formação, experiências, hard skills, soft skills e projetos.
• Empresas: podem editar sobre, site, telefone, localização e logo.
• A foto de perfil pode ser enviada na área de edição de perfil; se não tiver foto, mostramos um avatar com as iniciais do seu nome.`;
  }

  // Vagas e candidatura
  if (
    q.includes('candidatar') ||
    q.includes('como me candidato') ||
    q.includes('me candidatar') ||
    q.includes('vaga')
  ) {
    return `Para se candidatar a uma vaga:

1. Vá até a aba "Vagas" ou entre no perfil de uma empresa.
2. Clique na vaga desejada para ver os detalhes.
3. Se você estiver logado como profissional, o botão "Candidatar-se" aparece.
4. Ao clicar, o sistema registra sua candidatura e o botão pode mudar para "Cancelar candidatura".

A empresa consegue ver a lista de candidatos daquela vaga no painel dela.`;
  }

  // Empresas, criação de vaga
  if (
    q.includes('criar vaga') ||
    q.includes('publicar vaga') ||
    (q.includes('empresa') && q.includes('vaga'))
  ) {
    return `Se você estiver logado como empresa, pode publicar vagas assim:

1. Acesse seu perfil de empresa.
2. Clique em "Publicar / Vaga".
3. Escolha a opção "Publicar vaga".
4. Preencha título, descrição, competências, salário, benefícios, modalidade, carga horária e localização.
5. Escolha até 3 hard skills buscadas para a vaga.

Essas hard skills também são usadas nas recomendações de profissionais e de vagas.`;
  }

  // Hard skills / soft skills
  if (q.includes('hard skill') || q.includes('soft skill')) {
    return `No ProFuture:

• Hard skills: são habilidades técnicas (ex.: React, Node.js, Python, bancos de dados, AWS).
• Soft skills: são habilidades comportamentais (ex.: comunicação, trabalho em equipe, liderança).

Você escolhe suas hard skills no perfil profissional, e as empresas escolhem hard skills nas vagas. O sistema usa essas informações para gerar recomendações de empresas e vagas para você.`;
  }

  // Saudações
  if (
    q.includes('oi') ||
    q.includes('olá') ||
    q.includes('ola') ||
    q.includes('hello') ||
    q.includes('bom dia') ||
    q.includes('boa tarde') ||
    q.includes('boa noite')
  ) {
    return 'Oi! 👋 Me pergunte sobre vagas, empresas, recomendações, ODS, perfil, hard skills ou como usar o ProFuture.';
  }

  // Pedidos de ajuda/dicas
  if (q.includes('ajuda') || q.includes('dica') || q.includes('melhorar')) {
    return `Algumas dicas para aproveitar melhor o ProFuture:

• Complete seu perfil com experiências, formação e projetos.
• Escolha hard skills que realmente representem sua área de atuação.
• Siga empresas que você tem interesse em trabalhar.
• Acompanhe as seções de recomendações em "Empresas" e "Vagas".`;
  }

  // Resposta padrão
  return `Posso te ajudar com:

• Como funciona o ProFuture.
• Como são feitas as recomendações de vagas e empresas.
• Como editar seu perfil, incluindo foto.
• Como funcionam hard skills e soft skills no ProFuture.
• Como empresas criam e publicam vagas.
• Como se candidatar a vagas e usar as abas de Vagas, Empresas e Network.
• O que são as ODS da ONU e como elas se conectam ao ProFuture.
• Quais ODS o ProFuture usa no projeto de vocês.

Tente perguntar algo relacionado a esses temas. 🙂`;
}

export default function ChatBot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: `Oi${user ? `, ${user.nome}` : ''}! 👋 Eu sou o assistente do ProFuture.

Posso te ajudar a entender melhor o projeto, a plataforma e as ODS ligadas ao trabalho de vocês.

Alguns exemplos de perguntas que você pode fazer:
• Como funciona o ProFuture?
• Como são feitas as recomendações de vagas e empresas?
• Como editar meu perfil e minha foto?
• Como empresas criam vagas no ProFuture?
• O que são hard skills e soft skills?
• Como me candidatar a uma vaga?
• O que são as ODS da ONU?
• Quais ODS o ProFuture usa?`
    }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  function handleSend(e) {
    e.preventDefault();
    const pergunta = input.trim();
    if (!pergunta) return;

    const userMsg = {
      id: Date.now(),
      from: 'user',
      text: pergunta
    };
    const resposta = gerarRespostaBot(pergunta);
    const botMsg = {
      id: Date.now() + 1,
      from: 'bot',
      text: resposta
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  }

  return (
    <section className="max-w-4xl mx-auto px-4 pt-6 pb-10">
      <div className="bg-slate-900 text-slate-50 rounded-3xl border border-slate-700 shadow-xl grid md:grid-cols-[1.1fr,1.4fr] overflow-hidden">
        {/* Coluna esquerda: descrição */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
          <h1 className="text-xl md:text-2xl font-semibold mb-3 text-neonlime-400">
            Assistente ProFuture
          </h1>
          <p className="text-sm text-slate-200 mb-4">
            Tire dúvidas rápidas sobre o funcionamento da plataforma, recomendações de vagas,
            perfis, candidaturas e também sobre as ODS que aparecem no projeto.
          </p>
          <div className="bg-slate-900/70 rounded-2xl border border-slate-700 p-4 text-xs space-y-2">
            <p className="font-semibold text-slate-100">Você pode perguntar, por exemplo:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-200">
              <li>“Como funciona o ProFuture?”</li>
              <li>“Como são feitas as recomendações de vagas?”</li>
              <li>“O que são hard skills e soft skills?”</li>
              <li>“Como me candidatar a uma vaga?”</li>
              <li>“O que são as ODS da ONU?”</li>
              <li>“Quais ODS o ProFuture usa?”</li>
            </ul>
          </div>
        </div>

        {/* Coluna direita: chat */}
        <div className="flex flex-col bg-slate-950/60">
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[420px]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={
                  'flex ' + (msg.from === 'user' ? 'justify-end' : 'justify-start')
                }
              >
                <div
                  className={
                    'max-w-[85%] px-3 py-2 rounded-2xl text-xs whitespace-pre-line ' +
                    (msg.from === 'user'
                      ? 'bg-neonlime-400 text-slate-900 rounded-br-md'
                      : 'bg-slate-800 text-slate-50 rounded-bl-md')
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-950/80"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Digite sua pergunta..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-neonlime-400"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-full bg-neonlime-400 text-slate-900 hover:bg-neonlime-300"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
