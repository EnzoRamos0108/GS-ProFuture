import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HARD_SKILLS_SOFTWARE } from '../constants/hardSkills';
import { useAuth } from '../context/AuthContext';
import RadarProposito from '../components/RadarProposito';
import Modal from '../components/Modal';
import PostCard from '../components/PostCard';
import { useNetwork } from '../context/NetworkContext';


const API_URL = 'http://localhost:4000/api';
const BACKEND_BASE_URL = 'http://localhost:4000';

export default function Perfil() {
  const { user: authUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const { connections, isConnected, connect } = useNetwork();
  const [isMe, setIsMe] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editCargo, setEditCargo] = useState('');
  const [editFoto, setEditFoto] = useState('');
  const [editFotoFile, setEditFotoFile] = useState(null);
  const [editResumo, setEditResumo] = useState('');
  const [editLocal, setEditLocal] = useState('');
  const [editArea, setEditArea] = useState('');

  const [editHard, setEditHard] = useState('');
  const [selectedHardSkills, setSelectedHardSkills] = useState([]);
  const [editSoft, setEditSoft] = useState('');
  const [editInteresses, setEditInteresses] = useState('');
  const [editCerts, setEditCerts] = useState('');
  const [editIdiomas, setEditIdiomas] = useState('');
  const [editFormacao, setEditFormacao] = useState('');
  const [editProjetos, setEditProjetos] = useState('');
  const [editExperiencias, setEditExperiencias] = useState('');

  const [editOds4, setEditOds4] = useState(5);
  const [editOds8, setEditOds8] = useState(5);
  const [editOds9, setEditOds9] = useState(5);
  const [editOds10, setEditOds10] = useState(5);

  const [posts, setPosts] = useState([]);

  // carrega perfil
  useEffect(() => {
    async function loadPerfil() {
      if (!authUser) return;

      const res = await fetch(API_URL + '/profissionais');
      const profissionais = await res.json();

      const userIdFromState = location.state && location.state.userId;

      if (userIdFromState && userIdFromState !== authUser.id) {
        const other = profissionais.find(p => p.id === userIdFromState);
        if (other) {
          setPerfil(other);
          setIsMe(false);
          return;
        }
      }

      let me = profissionais.find(p => p.id === authUser.id);
      if (!me) {
        const novo = {
          id: authUser.id,
          nome: authUser.nome,
          foto:
            'https://ui-avatars.com/api/?name=' +
            encodeURIComponent(authUser.nome || 'ProFuture') +
            '&background=0f172a&color=facc15',
          cargo: 'Profissional do Futuro',
          resumo: '',
          localizacao: 'Brasil',
          area: 'Em transição',
          habilidadesTecnicas: [],
          softSkills: [],
          experiencias: [],
          formacao: [],
          projetos: [],
          certificacoes: [],
          idiomas: [],
          areaInteresses: [],
          radar: { ods4: 5, ods8: 5, ods9: 5, ods10: 5 }
        };
        const created = await fetch(API_URL + '/profissionais', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novo)
        });
        me = await created.json();
      }

      setPerfil(me);
      setSelectedHardSkills(Array.isArray(me.habilidadesTecnicas) ? me.habilidadesTecnicas : []);
      setIsMe(true);
    }

    loadPerfil();
  }, [authUser, location.state]);


  async function reloadPosts(currentPerfil) {
    const p = currentPerfil || perfil;
    if (!p) return;
    const res = await fetch(API_URL + '/publicacoes?autorId=' + p.id);
    const data = await res.json();
    setPosts(data);
  }

  // carrega posts da pessoa
  useEffect(() => {
    reloadPosts(perfil);
  }, [perfil]);


  if (!perfil) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Carregando perfil...
      </p>
    );
  }

  function openEdit() {
    setEditNome(perfil.nome || '');
    setEditCargo(perfil.cargo || '');
    setEditFoto(perfil.foto || '');
    setEditFotoFile(null);
    setEditResumo(perfil.resumo || '');
    setEditLocal(perfil.localizacao || '');
    setEditArea(perfil.area || '');

    setSelectedHardSkills(Array.isArray(perfil.habilidadesTecnicas) ? perfil.habilidadesTecnicas : []);
    setEditHard('');
    setEditSoft((perfil.softSkills || []).join(', '));
    setEditInteresses((perfil.areaInteresses || []).join(', '));
    setEditCerts((perfil.certificacoes || []).join(', '));

    setEditFormacao(
      (perfil.formacao || [])
        .map(f => `${f.curso || ''} | ${f.instituicao || ''} | ${f.ano || ''}`)
        .join('\n')
    );

    setEditProjetos(
      (perfil.projetos || [])
        .map(p => `${p.titulo || ''} | ${p.descricao || ''} | ${p.link || ''}`)
        .join('\n')
    );

    setEditIdiomas(
      (perfil.idiomas || [])
        .map(i => `${i.idioma || ''}:${i.nivel || ''}`)
        .join('\n')
    );

    setEditExperiencias(
      (perfil.experiencias || [])
        .map(
          exp =>
            `${exp.cargo || ''} | ${exp.empresa || ''} | ${exp.inicio || ''} | ${exp.fim || ''} | ${exp.descricao || ''}`
        )
        .join('\n')
    );

    const r = perfil.radar || { ods4: 5, ods8: 5, ods9: 5, ods10: 5 };
    setEditOds4(r.ods4 ?? 5);
    setEditOds8(r.ods8 ?? 5);
    setEditOds9(r.ods9 ?? 5);
    setEditOds10(r.ods10 ?? 5);

    setEditOpen(true);
  }

  async function uploadFotoIfNeeded() {
    if (!editFotoFile) return editFoto;
    const formData = new FormData();
    formData.append('imagem', editFotoFile);
    const res = await fetch(API_URL + '/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    const rel = data.url || '';
    if (!rel) return editFoto;
    if (rel.startsWith('http')) return rel;
    return BACKEND_BASE_URL + rel;
  }

  async function saveEdit(e) {
    e.preventDefault();

    let fotoUrl = await uploadFotoIfNeeded();
    if (!fotoUrl) {
      fotoUrl =
        editFoto ||
        'https://ui-avatars.com/api/?name=' +
        encodeURIComponent(editNome || perfil.nome || 'ProFuture') +
        '&background=0f172a&color=facc15';
    }

    const habilidadesTecnicas = selectedHardSkills;

    const softSkills = editSoft
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const areaInteresses = editInteresses
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const certificacoes = editCerts
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const formacao = editFormacao
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [curso, instituicao, ano] = line.split('|').map(s => s.trim());
        return { curso, instituicao, ano: ano || '' };
      });

    const projetos = editProjetos
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [titulo, descricao, link] = line.split('|').map(s => s.trim());
        return { titulo, descricao, link };
      });

    const idiomas = editIdiomas
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [idioma, nivel] = line.split(':').map(s => s.trim());
        return { idioma, nivel: nivel || '' };
      });

    const experiencias = editExperiencias
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [cargo, empresa, inicio, fim, descricao] = line
          .split('|')
          .map(s => s.trim());
        return { cargo, empresa, inicio, fim, descricao };
      });

    const radar = {
      ods4: Number(editOds4) || 0,
      ods8: Number(editOds8) || 0,
      ods9: Number(editOds9) || 0,
      ods10: Number(editOds10) || 0
    };

    const res = await fetch(API_URL + '/profissionais/' + perfil.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: editNome,
        cargo: editCargo,
        foto: fotoUrl,
        resumo: editResumo,
        localizacao: editLocal,
        area: editArea,
        habilidadesTecnicas,
        softSkills,
        areaInteresses,
        certificacoes,
        idiomas,
        formacao,
        projetos,
        experiencias,
        radar
      })
    });
    const updated = await res.json();
    setPerfil(updated);
    setEditOpen(false);
  }

  return (
    <section className="grid lg:grid-cols-[2fr,1fr] gap-6">
      <div className="space-y-4">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => navigate("/atividade")}
            className="px-4 py-2 text-xs sm:text-sm rounded-full bg-neonlime-400 text-slate-900 font-semibold"
          >
            Ver atividade física
          </button>
        </div>
        {/* header perfil */}
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start">
          <img
            src={
              perfil.foto && perfil.foto.trim() !== ''
                ? perfil.foto
                : 'https://ui-avatars.com/api/?name=' +
                encodeURIComponent(perfil.nome || 'ProFuture') +
                '&background=0f172a&color=facc15'
            }
            alt={perfil.nome}
            className="w-20 h-20 rounded-full object-cover border border-slate-300 dark:border-slate-700"
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {perfil.nome}
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {perfil.cargo} • {perfil.localizacao}
            </p>
            <div className="mt-2 flex gap-2">
              {!isMe && (
                isConnected(perfil.id) ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/mensagens', {
                        state: { partnerType: 'profissional', partnerId: perfil.id },
                      })
                    }
                    className="px-3 py-1.5 text-xs rounded-full bg-neonlime-400 text-slate-900 font-semibold"
                  >
                    Enviar mensagem
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => connect({ id: perfil.id, nome: perfil.nome, foto: perfil.foto })}
                    className="px-3 py-1.5 text-xs rounded-full border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                  >
                    Conectar
                  </button>
                )
              )}
            </div>


            <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">
              {perfil.resumo ||
                'Profissional em construção para o futuro do trabalho.'}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {isMe ? (
              <button
                onClick={openEdit}
                className="px-3 py-1.5 text-xs rounded-full border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-neonlime-400/10"
              >
                ✏️ Editar perfil
              </button>
            ) : (
              <>
                <button className="px-3 py-1.5 text-xs rounded-full bg-neonlime-400 text-slate-900 font-semibold">
                  Conectar
                </button>
                <button className="px-3 py-1.5 text-xs rounded-full border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-200">
                  Enviar mensagem
                </button>
              </>
            )}
          </div>
        </div>

        {/* grid principal */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* experiências */}
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Experiências
            </h3>
            {(perfil.experiencias || []).length === 0 && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Adicione experiências relevantes para o seu caminho profissional.
              </p>
            )}
            {(perfil.experiencias || []).map((exp, idx) => (
              <div key={idx} className="mb-2">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {exp.cargo} • {exp.empresa}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  {exp.inicio} - {exp.fim}
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-300 mt-1">
                  {exp.descricao}
                </p>
              </div>
            ))}
          </div>

          {/* formação */}
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Formação
            </h3>
            {(perfil.formacao || []).length === 0 && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Registre cursos, graduações e formações complementares.
              </p>
            )}
            {(perfil.formacao || []).map((f, idx) => (
              <div key={idx} className="mb-2">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {f.curso}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  {f.instituicao} • {f.ano}
                </div>
              </div>
            ))}
          </div>

          {/* skills */}
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Hard & Soft Skills
            </h3>
            <div className="flex flex-wrap gap-1">
              {(perfil.habilidadesTecnicas || []).map(skill => (
                <span
                  key={skill}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                >
                  {skill}
                </span>
              ))}
              {(perfil.softSkills || []).map(skill => (
                <span
                  key={skill}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-900 text-neonlime-400 border border-slate-300 dark:border-slate-700"
                >
                  {skill}
                </span>
              ))}
              {(perfil.habilidadesTecnicas || []).length === 0 &&
                (perfil.softSkills || []).length === 0 && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Adicione suas competências técnicas e comportamentais.
                  </p>
                )}
            </div>
          </div>

          {/* projetos & certificações */}
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Projetos & Certificações
            </h3>
            <ul className="text-xs text-slate-800 dark:text-slate-300 space-y-1">
              {(perfil.projetos || []).map((p, idx) => (
                <li key={idx}>
                  <span className="font-semibold">{p.titulo}</span> — {p.descricao}{' '}
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neonlime-400"
                    >
                      ver projeto
                    </a>
                  )}
                </li>
              ))}
            </ul>
            {perfil.certificacoes && perfil.certificacoes.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Certificações
                </h4>
                <ul className="text-xs text-slate-800 dark:text-slate-300 list-disc list-inside">
                  {perfil.certificacoes.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {(!perfil.projetos || perfil.projetos.length === 0) &&
              (!perfil.certificacoes || perfil.certificacoes.length === 0) && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Inclua projetos pessoais, acadêmicos ou profissionais e certificações.
                </p>
              )}
          </div>
        </div>
        {/* posts do perfil */}
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Publicações recentes
          </h3>
          {posts.length === 0 && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isMe
                ? 'Você ainda não publicou nada. Use o botão "Publicar" no topo para compartilhar um insight.'
                : 'Este profissional ainda não possui publicações.'}
            </p>
          )}
          {posts.map(post => (
            <PostCard key={post.id} post={post} onRefresh={() => reloadPosts(perfil)} />
          ))}
        </div>

      </div>

      {/* coluna lateral */}
      <div className="space-y-4">
        <RadarProposito radar={perfil.radar} />

        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Idiomas
          </h3>
          {(perfil.idiomas || []).length === 0 && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Adicione idiomas e níveis de fluência.
            </p>
          )}
          <ul className="text-xs text-slate-800 dark:text-slate-300 space-y-1">
            {(perfil.idiomas || []).map((i, idx) => (
              <li key={idx}>
                {i.idioma} • {i.nivel}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Interesses
          </h3>
          <div className="flex flex-wrap gap-1">
            {(perfil.areaInteresses || []).map(int => (
              <span
                key={int}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
              >
                {int}
              </span>
            ))}
            {(perfil.areaInteresses || []).length === 0 && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Escolha temas como IA ética, educação, impacto social e inovação.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal edição */}
      <Modal open={editOpen} title="Editar perfil" onClose={() => setEditOpen(false)}>
        <div className="max-h-[65vh] overflow-y-auto pr-1">
          <form className="space-y-3" onSubmit={saveEdit}>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Cargo</label>
                <input
                  type="text"
                  value={editCargo}
                  onChange={e => setEditCargo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  URL da foto de perfil
                </label>
                <input
                  type="text"
                  value={editFoto}
                  onChange={e => setEditFoto(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm mb-1"
                />
                <p className="text-[10px] text-slate-500 mb-1">
                  Ou envie um arquivo abaixo. Se enviar arquivo, a URL será gerada automaticamente.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setEditFotoFile(e.target.files?.[0] || null)}
                  className="w-full text-[11px]"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Localização</label>
                <input
                  type="text"
                  value={editLocal}
                  onChange={e => setEditLocal(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm mb-2"
                />
                <label className="block text-xs text-slate-400 mb-1">Área</label>
                <input
                  type="text"
                  value={editArea}
                  onChange={e => setEditArea(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Resumo</label>
              <textarea
                rows={3}
                value={editResumo}
                onChange={e => setEditResumo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Hard skills do seu perfil (escolha até 3)
                </label>
                <p className="text-[10px] text-slate-500 mb-2">
                  Essas hard skills serão usadas para recomendar empresas compatíveis com você.
                </p>
                <div className="flex flex-wrap gap-2">
                  {HARD_SKILLS_SOFTWARE.map(skill => {
                    const selected = selectedHardSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          const already = selectedHardSkills.includes(skill);
                          if (already) {
                            setSelectedHardSkills(prev =>
                              prev.filter(s => s !== skill)
                            );
                            return;
                          }
                          if (selectedHardSkills.length >= 3) {
                            window.alert('Você pode selecionar no máximo 3 hard skills.');
                            return;
                          }
                          setSelectedHardSkills(prev => [...prev, skill]);
                        }}
                        className={
                          'text-[11px] px-2 py-1 rounded-full border text-left ' +
                          (selected
                            ? 'bg-neonlime-400/10 border-neonlime-400 text-neonlime-400'
                            : 'border-slate-500 text-slate-200')
                        }
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Soft skills (separe por vírgula)
                </label>
                <input
                  type="text"
                  value={editSoft}
                  onChange={e => setEditSoft(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Interesses (separe por vírgula)
                </label>
                <input
                  type="text"
                  value={editInteresses}
                  onChange={e => setEditInteresses(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Certificações (separe por vírgula)
                </label>
                <input
                  type="text"
                  value={editCerts}
                  onChange={e => setEditCerts(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Formação (uma por linha: Curso | Instituição | Ano)
                </label>
                <textarea
                  rows={3}
                  value={editFormacao}
                  onChange={e => setEditFormacao(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Projetos (uma por linha: Título | Descrição | Link opcional)
                </label>
                <textarea
                  rows={3}
                  value={editProjetos}
                  onChange={e => setEditProjetos(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Experiências (uma por linha: Cargo | Empresa | Início | Fim | Descrição)
              </label>
              <textarea
                rows={3}
                value={editExperiencias}
                onChange={e => setEditExperiencias(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Idiomas (um por linha, formato: Inglês:Avançado)
              </label>
              <textarea
                rows={3}
                value={editIdiomas}
                onChange={e => setEditIdiomas(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
              />
            </div>

            <div className="border border-slate-700 rounded-lg p-3">
              <p className="text-[11px] text-slate-300 mb-2">
                Ajuste suas notas (0 a 10) para cada ODS. Isso alimenta o radar de propósito:
                ODS 4 Educação de Qualidade, ODS 8 Trabalho Decente, ODS 9 Inovação e ODS 10 Redução das Desigualdades.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    ODS 4 – Educação de Qualidade
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={editOds4}
                    onChange={e => setEditOds4(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    ODS 8 – Trabalho Decente e Crescimento
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={editOds8}
                    onChange={e => setEditOds8(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    ODS 9 – Indústria, Inovação e Infraestrutura
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={editOds9}
                    onChange={e => setEditOds9(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    ODS 10 – Redução das Desigualdades
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={editOds10}
                    onChange={e => setEditOds10(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-3 py-1.5 text-sm rounded-full border border-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-sm rounded-full bg-neonlime-400 text-slate-900 font-semibold"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </section>
  );
}