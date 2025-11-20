import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import PostCard from '../components/PostCard';
import ApplicantsPanel from '../components/ApplicantsPanel';
import { HARD_SKILLS_SOFTWARE } from '../constants/hardSkills';

const API_URL = 'http://localhost:4000/api';
const BACKEND_BASE_URL = 'http://localhost:4000';

export default function PerfilEmpresa() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: authUser } = useAuth();

  const [empresa, setEmpresa] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState('inicio'); // 'inicio' | 'vagas'
  const [vagaSelecionada, setVagaSelecionada] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editSobre, setEditSobre] = useState('');
  const [editSite, setEditSite] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editLocalizacao, setEditLocalizacao] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editLogoFile, setEditLogoFile] = useState(null);

  const [publishTab, setPublishTab] = useState('post'); // 'post' | 'vaga'
  const [appliedVacancies, setAppliedVacancies] = useState([]);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishText, setPublishText] = useState('');
  const [vagaTitulo, setVagaTitulo] = useState('');
  const [vagaDescricao, setVagaDescricao] = useState('');
  const [vagaCompetencias, setVagaCompetencias] = useState('');
  const [vagaSalario, setVagaSalario] = useState('');
  const [vagaBeneficios, setVagaBeneficios] = useState('');
  const [vagaModalidade, setVagaModalidade] = useState('');
  const [vagaCargaHoraria, setVagaCargaHoraria] = useState('');
  const [vagaLocalizacao, setVagaLocalizacao] = useState('');
  const [empresaSkillsInteresse, setEmpresaSkillsInteresse] = useState([]);

  const empresaId = Number(id || authUser?.id);
  const isMe = authUser && authUser.id === empresaId && authUser.tipoPerfil === 'empresa';
  const isProfessional = authUser && authUser.tipoPerfil !== 'empresa';

  useEffect(() => {
    async function loadEmpresa() {
      if (!empresaId) return;
      const res = await fetch(API_URL + '/empresas/' + empresaId);
      if (!res.ok) {
        console.error('Empresa não encontrada');
        return;
      }
      const data = await res.json();
      setEmpresa(data);
    }
    loadEmpresa();
  }, [empresaId]);

  useEffect(() => {
    async function loadPosts() {
      if (!empresaId) return;
      try {
        const res = await fetch(API_URL + '/publicacoes?autorId=' + empresaId);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar posts da empresa', err);
      }
    }
    loadPosts();
  }, [empresaId]);

  if (!empresa) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400 px-4 pt-6">
        Carregando perfil da empresa...
      </p>
    );
  }

  const logoUrl =
    empresa.logo ||
    'https://ui-avatars.com/api/?name=' +
      encodeURIComponent(empresa.nome || 'Empresa') +
      '&background=020617&color=e5e7eb&size=256';

  function openEdit() {
    setEditSobre(empresa.sobre || '');
    setEditSite(empresa.site || '');
    setEditTelefone(empresa.telefone || '');
    setEditLocalizacao(empresa.localizacao || '');
    setEditLogo(empresa.logo || '');
    setEditLogoFile(null);
    setEditOpen(true);
  }

  async function uploadLogoIfNeeded() {
    if (editLogoFile) {
      const formData = new FormData();
      formData.append('imagem', editLogoFile);
      const res = await fetch(API_URL + '/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Erro ao fazer upload do logo', data);
        return editLogo || empresa.logo || '';
      }
      const relativeUrl = data.url || '';
      if (!relativeUrl) return editLogo || empresa.logo || '';
      return relativeUrl.startsWith('http')
        ? relativeUrl
        : BACKEND_BASE_URL + relativeUrl;
    }
    return editLogo || empresa.logo || '';
  }

  async function handleSaveEmpresa(e) {
    e.preventDefault();
    const logo = await uploadLogoIfNeeded();
    const res = await fetch(API_URL + '/empresas/' + empresa.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sobre: editSobre,
        site: editSite,
        telefone: editTelefone,
        localizacao: editLocalizacao,
        logo
      })
    });
    const updated = await res.json();
    setEmpresa(updated);
    setEditOpen(false);
  }

  async function handlePublish(e) {
    e.preventDefault();
    if (publishTab === 'post') {
      if (!publishText.trim()) return;
      await fetch(API_URL + '/publicacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autorId: empresa.id,
          autorNome: empresa.nome,
          autorFoto: empresa.logo || '',
          cargo: 'Empresa',
          texto: publishText,
          imagem: null
        })
      });
      setPublishText('');
      setPublishOpen(false);
      const res = await fetch(API_URL + '/publicacoes?autorId=' + empresa.id);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } else {
      if (!vagaTitulo.trim()) return;
      const res = await fetch(API_URL + '/empresas/' + empresa.id + '/vagas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: vagaTitulo,
          descricao: vagaDescricao,
          competencias: vagaCompetencias,
          salario: vagaSalario,
          beneficios: vagaBeneficios,
          modalidade: vagaModalidade,
          cargaHoraria: vagaCargaHoraria,
          localizacao: vagaLocalizacao || empresa.localizacao,
          hardSkills: empresaSkillsInteresse
        })
      });
      const nova = await res.json();
      setEmpresa(prev => ({
        ...prev,
        vagas: [...(prev.vagas || []), nova]
      }));
      setVagaTitulo('');
      setVagaDescricao('');
      setVagaCompetencias('');
      setVagaSalario('');
      setVagaBeneficios('');
      setVagaModalidade('');
      setVagaCargaHoraria('');
      setVagaLocalizacao('');
      setPublishOpen(false);
    }
  }

  const vagas = empresa.vagas || [];

  function handleToggleCandidate(vaga) {
    if (!vaga || !authUser) return;
    const already = appliedVacancies.includes(vaga.id);
    if (!already) {
      fetch(`${API_URL}/vagas/${empresa.id}/${vaga.id}/candidatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profissionalId: authUser.id, nome: authUser.nome })
      })
        .then(res => res.json())
        .then(() => {
          window.alert(`Você se candidatou para a vaga de ${vaga.titulo} na empresa ${empresa.nome}.`);
          setAppliedVacancies(prev => [...prev, vaga.id]);
        })
        .catch(() => {});
    } else {
      fetch(`${API_URL}/vagas/${empresa.id}/${vaga.id}/candidatar/${authUser.id}`, {
        method: 'DELETE'
      })
        .then(() => {
          setAppliedVacancies(prev => prev.filter(id => id !== vaga.id));
        })
        .catch(() => {});
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 flex gap-4 items-start">
        <img
          src={logoUrl}
          alt={empresa.nome}
          className="w-20 h-20 rounded-xl object-cover border border-slate-300 dark:border-slate-700 bg-slate-900/40"
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {empresa.nome}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {empresa.localizacao || 'Localização não informada'}
          </p>
          <div className="mt-2 text-xs text-slate-700 dark:text-slate-200 space-y-1">
            {empresa.site && (
              <div>
                <span className="font-semibold">Site: </span>
                <a
                  href={empresa.site}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neonlime-400 hover:underline"
                >
                  {empresa.site}
                </a>
              </div>
            )}
            {empresa.telefone && (
              <div>
                <span className="font-semibold">Telefone: </span>
                <span>{empresa.telefone}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {!isMe && isProfessional && (
            <button
              onClick={() =>
                navigate('/mensagens', { state: { partnerType: 'empresa', partnerId: empresa.id } })
              }
              className="px-3 py-1.5 text-xs rounded-full border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-200"
            >
              Enviar mensagem
            </button>
          )}

          {isMe && (
            <>
              <button
                onClick={openEdit}
                className="px-3 py-1.5 text-xs rounded-full border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-neonlime-400/10"
              >
                ✏️ Editar perfil
              </button>
              <button
                onClick={() => setPublishOpen(true)}
                className="px-3 py-1.5 text-xs rounded-full bg-neonlime-400 text-slate-900 font-semibold"
              >
                Publicar / Vaga
              </button>
            </>
          )}
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700 flex gap-4 text-sm">
        <button
          onClick={() => {
            setTab('inicio');
            setVagaSelecionada(null);
          }}
          className={
            'pb-2 px-1 -mb-px border-b-2 ' +
            (tab === 'inicio'
              ? 'border-neonlime-400 text-neonlime-400'
              : 'border-transparent text-slate-500 dark:text-slate-400')
          }
        >
          Início
        </button>
        <button
          onClick={() => {
            setTab('vagas');
            setVagaSelecionada(null);
          }}
          className={
            'pb-2 px-1 -mb-px border-b-2 ' +
            (tab === 'vagas'
              ? 'border-neonlime-400 text-neonlime-400'
              : 'border-transparent text-slate-500 dark:text-slate-400')
          }
        >
          Vagas
        </button>
      </div>

      {tab === 'inicio' && (
        <div className="grid md:grid-cols-[2fr,1.5fr] gap-6">
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Sobre
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {empresa.sobre ||
                  'Conte aqui sobre a missão, cultura e projetos desta empresa.'}
              </p>
            </div>

            <div className="space-y-3">
              {posts.map(p => (
                <PostCard key={p.id} post={p} onRefresh={() => {}} />
              ))}
              {posts.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ainda não há publicações desta empresa.
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm">
              <h3 className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Informações de contato
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Localização: </span>
                {empresa.localizacao || 'Não informada'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Telefone: </span>
                {empresa.telefone || 'Não informado'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Site: </span>
                {empresa.site || 'Não informado'}
              </p>
            </div>
          </aside>
        </div>
      )}

      {tab === 'vagas' && (
        <div className="grid md:grid-cols-[1.3fr,1.7fr] gap-6">
          <div className="space-y-3">
            {vagas.map(v => (
              <button
                key={v.id}
                onClick={() => setVagaSelecionada(v)}
                className={
                  'w-full text-left rounded-xl border px-4 py-3 text-sm ' +
                  (vagaSelecionada && vagaSelecionada.id === v.id
                    ? 'border-neonlime-400 bg-neonlime-400/5'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900')
                }
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {v.titulo}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {empresa.nome} • {v.localizacao || empresa.localizacao}
                </div>
              </button>
            ))}
            {vagas.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nenhuma vaga publicada por esta empresa.
              </p>
            )}
          </div>

          <div>
            {vagaSelecionada ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm space-y-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {vagaSelecionada.titulo}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {empresa.nome} •{' '}
                  {vagaSelecionada.localizacao || empresa.localizacao}
                </p>

                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    O que faz
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {vagaSelecionada.descricao ||
                      'Descrição da vaga ainda não informada.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-2">
                    Competências
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {vagaSelecionada.competencias ||
                      'Competências desejadas ainda não informadas.'}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-2 mt-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Salário
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {vagaSelecionada.salario || 'A combinar'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Modalidade
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {vagaSelecionada.modalidade || 'Não informada'}
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Benefícios
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {vagaSelecionada.beneficios || 'Não informado'}
                  </p>
                </div>

                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Carga horária
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {vagaSelecionada.cargaHoraria || 'Não informada'}
                  </p>
                </div>

                {!isMe && isProfessional && (
                  <button
                    onClick={() =>
                      navigate('/mensagens', { state: { partnerType: 'empresa', partnerId: empresa.id } })
                    }
                    className="px-3 py-1.5 text-xs rounded-full border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                  >
                    Enviar mensagem
                  </button>
                )}

                {isMe && (
                  <div className="mt-3">
                    <ApplicantsPanel empresaId={empresa.id} vaga={vagaSelecionada} />
                  </div>
                )}

                {isProfessional && vagaSelecionada && (
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => handleToggleCandidate(vagaSelecionada)}
                      className={
                        'px-4 py-1.5 text-sm rounded-full font-semibold ' +
                        (appliedVacancies.includes(vagaSelecionada.id)
                          ? 'bg-slate-700 text-slate-100'
                          : 'bg-neonlime-400 text-slate-900')
                      }
                    >
                      {appliedVacancies.includes(vagaSelecionada.id)
                        ? 'Cancelar candidatura'
                        : 'Candidatar-se'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Selecione uma vaga para ver os detalhes.
              </p>
            )}
          </div>
        </div>
      )}

      <Modal open={editOpen} title="Editar perfil da empresa" onClose={() => setEditOpen(false)}>
        <form onSubmit={handleSaveEmpresa} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Sobre</label>
            <textarea
              rows={4}
              value={editSobre}
              onChange={e => setEditSobre(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Site</label>
              <input
                type="text"
                value={editSite}
                onChange={e => setEditSite(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Telefone</label>
              <input
                type="text"
                value={editTelefone}
                onChange={e => setEditTelefone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Localização</label>
              <input
                type="text"
                value={editLocalizacao}
                onChange={e => setEditLocalizacao(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                URL do logo da empresa
              </label>
              <input
                type="text"
                value={editLogo}
                onChange={e => setEditLogo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm mb-1"
              />
              <p className="text-[10px] text-slate-500 mb-1">
                Ou envie um arquivo abaixo. Se enviar, o logo será atualizado automaticamente.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={e => setEditLogoFile(e.target.files?.[0] || null)}
                className="w-full text-[11px]"
              />
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
      </Modal>

      <Modal
        open={publishOpen}
        title="Publicar em nome da empresa"
        onClose={() => setPublishOpen(false)}
      >
        <form onSubmit={handlePublish} className="space-y-4">
          <div className="flex mb-2 rounded-full bg-slate-800/80 p-1 text-xs">
            <button
              type="button"
              onClick={() => setPublishTab('post')}
              className={
                'flex-1 py-1 rounded-full ' +
                (publishTab === 'post'
                  ? 'bg-slate-900 text-neonlime-400'
                  : 'text-slate-300')
              }
            >
              Post normal
            </button>
            <button
              type="button"
              onClick={() => setPublishTab('vaga')}
              className={
                'flex-1 py-1 rounded-full ' +
                (publishTab === 'vaga'
                  ? 'bg-slate-900 text-neonlime-400'
                  : 'text-slate-300')
              }
            >
              Publicar vaga
            </button>
          </div>

          {publishTab === 'post' && (
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Texto do post
              </label>
              <textarea
                rows={4}
                value={publishText}
                onChange={e => setPublishText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm"
              />
            </div>
          )}

          {publishTab === 'vaga' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Título da vaga
                </label>
                <input
                  type="text"
                  value={vagaTitulo}
                  onChange={e => setVagaTitulo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  O que faz (descrição)
                </label>
                <textarea
                  rows={3}
                  value={vagaDescricao}
                  onChange={e => setVagaDescricao(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Competências desejadas
                </label>
                <textarea
                  rows={2}
                  value={vagaCompetencias}
                  onChange={e => setVagaCompetencias(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Faixa salarial
                  </label>
                  <input
                    type="text"
                    value={vagaSalario}
                    onChange={e => setVagaSalario(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Modalidade (presencial, remoto...)
                  </label>
                  <input
                    type="text"
                    value={vagaModalidade}
                    onChange={e => setVagaModalidade(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Benefícios
                </label>
                <textarea
                  rows={2}
                  value={vagaBeneficios}
                  onChange={e => setVagaBeneficios(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Localização da vaga (opcional)
                </label>
                <input
                  type="text"
                  value={vagaLocalizacao}
                  onChange={e => setVagaLocalizacao(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {publishTab === 'vaga' && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-200 mb-1">
                Hard skills buscadas para esta vaga (escolha até 3)
              </h4>
              <p className="text-[10px] text-slate-400">
                Essas hard skills também serão usadas para conectar sua empresa com profissionais compatíveis.
              </p>
              <div className="grid md:grid-cols-2 gap-2">
                {HARD_SKILLS_SOFTWARE.map(skill => {
                  const selected = empresaSkillsInteresse.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        const already = empresaSkillsInteresse.includes(skill);
                        if (already) {
                          setEmpresaSkillsInteresse(prev =>
                            prev.filter(s => s !== skill)
                          );
                          return;
                        }
                        if (empresaSkillsInteresse.length >= 3) {
                          window.alert('Você pode selecionar no máximo 3 hard skills para a vaga.');
                          return;
                        }
                        setEmpresaSkillsInteresse(prev => [...prev, skill]);
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
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPublishOpen(false)}
              className="px-3 py-1.5 text-sm rounded-full border border-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm rounded-full bg-neonlime-400 text-slate-900 font-semibold"
            >
              Publicar
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
