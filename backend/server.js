require('dotenv').config(); // ← OBRIGATÓRIO
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const https = require('https');
const { GEMINI_API_KEY } = require('./config/gemini');

const app = express();

const DATA_DIR = path.join(__dirname, 'Data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const loginFile = path.join(DATA_DIR, 'login.json');
const profissionaisFile = path.join(DATA_DIR, 'profissionais.json');
const publicacoesFile = path.join(DATA_DIR, 'publicacoes.json');
const empresasFile = path.join(DATA_DIR, 'empresas.json');
const likesFile = path.join(DATA_DIR, 'curtidas.json');
const commentsFile = path.join(DATA_DIR, 'comentarios.json');
const messagesFile = path.join(DATA_DIR, 'messages.json');

function readJson(file, defaultValue) {
  try {
    if (!fs.existsSync(file)) return defaultValue;
    const text = fs.readFileSync(file, 'utf-8');
    return text ? JSON.parse(text) : defaultValue;
  } catch (err) {
    console.error('Erro ao ler', file, err);
    return defaultValue;
  }
}

function writeJson(file, value) {
  try {
    fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao escrever', file, err);
  }
}

function nextId(list) {
  return list && list.length ? Math.max(...list.map(x => x.id || 0)) + 1 : 1;
}

app.use(cors());
// limite aumentado para suportar anexos base64
app.use(bodyParser.json({ limit: '25mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// ========= Upload de imagem genérica (perfil / posts) =========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, 'img-' + unique + ext);
  }
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  const url = '/uploads/' + req.file.filename;
  res.status(201).json({ url });
});

// ========= LOGIN =========
app.get('/api/login', (req, res) => {
  const users = readJson(loginFile, []);
  res.json(users);
});

app.post('/api/login', (req, res) => {
  const { email, senha } = req.body || {};
  const users = readJson(loginFile, []);
  const found = users.find(u => u.email === email && u.senha === senha);
  if (!found) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }
  res.json(found);
});

app.post('/api/register', (req, res) => {
  const { nome, email, senha, tipoPerfil, radar } = req.body || {};
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'nome, email e senha são obrigatórios.' });
  }
  const perfilTipo = tipoPerfil === 'empresa' ? 'empresa' : 'profissional';
  const users = readJson(loginFile, []);
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'Email já cadastrado.' });
  }
  const novo = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    nome,
    email,
    senha,
    tipoPerfil: perfilTipo
  };
  users.push(novo);
  writeJson(loginFile, users);

  // cria perfil inicial no JSON apropriado
  const baseRadar =
    radar && typeof radar === 'object'
      ? {
          ods4: Number(radar.ods4) || 0,
          ods8: Number(radar.ods8) || 0,
          ods9: Number(radar.ods9) || 0,
          ods10: Number(radar.ods10) || 0
        }
      : { ods4: 5, ods8: 5, ods9: 5, ods10: 5 };

  if (perfilTipo === 'profissional') {
    const profs = readJson(profissionaisFile, []);
    if (!profs.some(p => p.id === novo.id)) {
      const perfil = {
        id: novo.id,
        nome: novo.nome,
        foto: '',
        cargo: 'Profissional do Futuro',
        resumo: '',
        localizacao: '',
        area: '',
        habilidadesTecnicas: [],
        softSkills: [],
        experiencias: [],
        formacao: [],
        projetos: [],
        certificacoes: [],
        idiomas: [],
        areaInteresses: [],
        radar: baseRadar
      };
      profs.push(perfil);
      writeJson(profissionaisFile, profs);
    }
  } else {
    const empresas = readJson(empresasFile, []);
    if (!empresas.some(e => e.id === novo.id)) {
      const empresa = {
        id: novo.id,
        nome: novo.nome,
        site: '',
        telefone: '',
        localizacao: '',
        sobre: '',
        logo: '',
        posts: [],
        vagas: []
      };
      empresas.push(empresa);
      writeJson(empresasFile, empresas);
    }
  }

  res.status(201).json(novo);
});

// ========= PROFISSIONAIS =========
app.get('/api/profissionais', (req, res) => {
  const list = readJson(profissionaisFile, []);
  res.json(list);
});

app.get('/api/profissionais/:id', (req, res) => {
  const id = Number(req.params.id);
  const list = readJson(profissionaisFile, []);
  const found = list.find(p => p.id === id);
  if (!found) return res.status(404).json({ error: 'Profissional não encontrado.' });
  res.json(found);
});

app.post('/api/profissionais', (req, res) => {
  const body = req.body || {};
  const list = readJson(profissionaisFile, []);
  let id = body.id;
  if (typeof id !== 'number') {
    id = list.length ? Math.max(...list.map(p => p.id)) + 1 : 1;
  }
  const novo = { ...body, id };
  list.push(novo);
  writeJson(profissionaisFile, list);
  res.status(201).json(novo);
});

app.put('/api/profissionais/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const list = readJson(profissionaisFile, []);
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Profissional não encontrado.' });
  const updated = { ...list[idx], ...body, id };
  list[idx] = updated;
  writeJson(profissionaisFile, list);
  res.json(updated);
});

// ========= EMPRESAS =========
app.get('/api/empresas', (req, res) => {
  const list = readJson(empresasFile, []);
  res.json(list);
});

app.get('/api/empresas/:id', (req, res) => {
  const id = Number(req.params.id);
  const list = readJson(empresasFile, []);
  const found = list.find(e => e.id === id);
  if (!found) return res.status(404).json({ error: 'Empresa não encontrada.' });
  res.json(found);
});

app.post('/api/empresas', (req, res) => {
  const body = req.body || {};
  const list = readJson(empresasFile, []);
  let id = body.id;
  if (typeof id !== 'number') {
    id = list.length ? Math.max(...list.map(e => e.id)) + 1 : 1;
  }
  const base = {
    id,
    nome: body.nome || '',
    site: body.site || '',
    telefone: body.telefone || '',
    localizacao: body.localizacao || '',
    sobre: body.sobre || '',
    logo: body.logo || '',
    hardSkillsInteresse: body.hardSkillsInteresse || [],
    posts: body.posts || [],
    vagas: body.vagas || []
  };
  list.push(base);
  writeJson(empresasFile, list);
  res.status(201).json(base);
});

app.put('/api/empresas/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const list = readJson(empresasFile, []);
  const idx = list.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Empresa não encontrada.' });
  list[idx] = { ...list[idx], ...body };
  writeJson(empresasFile, list);
  res.json(list[idx]);
});

app.post('/api/empresas/:id/vagas', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const list = readJson(empresasFile, []);
  const idx = list.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Empresa não encontrada.' });
  const empresa = list[idx];
  const vagas = empresa.vagas || [];
  const vagaId = vagas.length ? Math.max(...vagas.map(v => v.id)) + 1 : 1;
  const novaVaga = {
    id: vagaId,
    titulo: body.titulo || '',
    descricao: body.descricao || '',
    competencias: body.competencias || '',
    salario: body.salario || '',
    beneficios: body.beneficios || '',
    modalidade: body.modalidade || '',
    cargaHoraria: body.cargaHoraria || '',
    localizacao: body.localizacao || '',
    hardSkills: Array.isArray(body.hardSkills) ? body.hardSkills : []
  };
  empresa.vagas = [...vagas, novaVaga];

  const atuais = Array.isArray(empresa.hardSkillsInteresse)
    ? empresa.hardSkillsInteresse
    : [];
  const novas = novaVaga.hardSkills || [];
  const combinado = Array.from(new Set([...atuais, ...novas]));
  empresa.hardSkillsInteresse = combinado;

  list[idx] = empresa;
  writeJson(empresasFile, list);
  res.status(201).json(novaVaga);
});

// ========= PUBLICAÇÕES =========
app.get('/api/publicacoes', (req, res) => {
  let list = readJson(publicacoesFile, []);
  const likes = readJson(likesFile, []);
  const { autorId } = req.query;

  if (autorId) {
    const authorNum = Number(autorId);
    list = list.filter(p => Number(p.autorId) === authorNum);
  }

  list = list.map(p => {
    const count = likes.filter(l => l.postId === p.id).length;
    return { ...p, curtidas: count };
  });

  list.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
  res.json(list);
});

app.post('/api/publicacoes', (req, res) => {
  const body = req.body || {};
  const list = readJson(publicacoesFile, []);
  const novo = {
    id: list.length ? Math.max(...list.map(p => p.id)) + 1 : 1,
    autorId: body.autorId,
    autorNome: body.autorNome || 'Anônimo',
    autorFoto: body.autorFoto || '',
    cargo: body.cargo || '',
    texto: body.texto || '',
    imagem: body.imagem || null,
    curtidas: 0,
    data: new Date().toISOString()
  };
  list.push(novo);
  writeJson(publicacoesFile, list);
  res.status(201).json(novo);
});

app.put('/api/publicacoes/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const list = readJson(publicacoesFile, []);
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Publicação não encontrada.' });
  const updated = { ...list[idx], ...body, id };
  list[idx] = updated;
  writeJson(publicacoesFile, list);
  res.json(updated);
});

app.delete('/api/publicacoes/:id', (req, res) => {
  const id = Number(req.params.id);
  let list = readJson(publicacoesFile, []);
  const before = list.length;
  list = list.filter(p => p.id !== id);
  writeJson(publicacoesFile, list);

  let likes = readJson(likesFile, []);
  likes = likes.filter(l => l.postId !== id);
  writeJson(likesFile, likes);

  let comments = readJson(commentsFile, []);
  comments = comments.filter(c => c.postId !== id);
  writeJson(commentsFile, comments);

  if (before === list.length) {
    return res.status(404).json({ error: 'Publicação não encontrada.' });
  }
  res.json({ success: true });
});

// ========= CURTIDAS =========
app.post('/api/publicacoes/:id/curtir', (req, res) => {
  const postId = Number(req.params.id);
  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'userId é obrigatório.' });
  }
  let likes = readJson(likesFile, []);
  const existingIndex = likes.findIndex(l => l.postId === postId && l.userId === userId);
  let liked;
  if (existingIndex !== -1) {
    likes.splice(existingIndex, 1);
    liked = false;
  } else {
    likes.push({ postId, userId });
    liked = true;
  }
  writeJson(likesFile, likes);
  const count = likes.filter(l => l.postId === postId).length;
  res.json({ postId, curtidas: count, liked });
});

// ========= COMENTÁRIOS =========
app.get('/api/publicacoes/:id/comentarios', (req, res) => {
  const postId = Number(req.params.id);
  const all = readJson(commentsFile, []);
  const list = all.filter(c => c.postId === postId);
  res.json(list);
});

app.post('/api/publicacoes/:id/comentarios', (req, res) => {
  const postId = Number(req.params.id);
  const body = req.body || {};
  const texto = body.texto;
  const autorId = body.autorId ? Number(body.autorId) : null;
  const autorNome = body.autorNome || 'Anônimo';

  if (!texto || !texto.trim()) {
    return res.status(400).json({ error: 'texto é obrigatório.' });
  }

  let all = readJson(commentsFile, []);
  const novo = {
    id: all.length ? Math.max(...all.map(c => c.id)) + 1 : 1,
    postId,
    autorId,
    autorNome,
    texto: texto.trim(),
    data: new Date().toISOString()
  };

  all.push(novo);
  writeJson(commentsFile, all);
  res.status(201).json(novo);
});

// ========= MENSAGENS =========

// Upload de anexos via base64 (imagens/arquivos)
app.post('/api/messages/upload', (req, res) => {
  try {
    const { name, mime, contentBase64 } = req.body || {};
    if (!name || !mime || !contentBase64) {
      return res.status(400).json({ error: 'name, mime, contentBase64 são obrigatórios' });
    }
    const safe = Date.now() + '_' + String(name).replace(/[^a-z0-9._-]/gi, '_');
    const filePath = path.join(UPLOADS_DIR, safe);
    const buf = Buffer.from(contentBase64, 'base64');
    fs.writeFileSync(filePath, buf);
    return res.status(201).json({ url: '/uploads/' + safe, name, mime, size: buf.length });
  } catch (e) {
    console.error('upload error', e);
    return res.status(500).json({ error: 'Falha no upload' });
  }
});

// Conversas (lista de parceiros)
app.get('/api/messages/conversations/:tipo/:id', (req, res) => {
  const { tipo, id } = req.params;
  const uid = String(id);
  const msgs = readJson(messagesFile, []);
  const convMap = {};
  msgs.forEach(m => {
    const mine = (m.fromType === tipo && String(m.fromId) === uid) || (m.toType === tipo && String(m.toId) === uid);
    if (!mine) return;
    const partnerType = (m.fromType === tipo && String(m.fromId) === uid) ? m.toType : m.fromType;
    const partnerId = (m.fromType === tipo && String(m.fromId) === uid) ? m.toId : m.fromId;
    const key = partnerType + ':' + partnerId;
    if (!convMap[key]) convMap[key] = { partnerType, partnerId, last: 0, lastText: '' };
    if (m.ts > convMap[key].last) { convMap[key].last = m.ts; convMap[key].lastText = m.text; }
  });
  res.json(Object.values(convMap).sort((a,b) => b.last - a.last));
});

// Thread (A<->B)
app.get('/api/messages/thread', (req, res) => {
  const { fromType, fromId, toType, toId } = req.query;
  try {
    const msgs = readJson(messagesFile, []);
    const thread = msgs
      .filter(m =>
        (m.fromType === fromType && String(m.fromId) === String(fromId) && m.toType === toType && String(m.toId) === String(toId)) ||
        (m.fromType === toType && String(m.fromId) === String(toId) && m.toType === fromType && String(m.toId) === String(fromId))
      )
      .sort((a,b) => a.ts - b.ts);
    return res.json(thread);
  } catch (e) {
    console.error('thread error', e);
    return res.status(500).json({ error: 'Falha ao carregar thread' });
  }
});

// Enviar mensagem (texto OU anexos)
app.post('/api/messages', (req, res) => {
  try {
    const { fromType, fromId, toType, toId, text, attachments } = req.body || {};
    if (!fromType || !fromId || !toType || !toId) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    if (!text && !(attachments && attachments.length)) {
      return res.status(400).json({ error: 'Mensagem vazia' });
    }
    const msgs = readJson(messagesFile, []);
    const novo = {
      id: nextId(msgs),
      fromType, fromId, toType, toId,
      text: text || '',
      attachments: Array.isArray(attachments) ? attachments : [],
      ts: Date.now()
    };
    msgs.push(novo);
    writeJson(messagesFile, msgs);
    return res.status(201).json(novo);
  } catch (e) {
    console.error('post message error', e);
    return res.status(500).json({ error: 'Falha ao enviar mensagem' });
  }
});

// ========= CANDIDATURAS =========
app.post('/api/vagas/:empresaId/:vagaId/candidatar', (req, res) => {
  const { empresaId, vagaId } = req.params;
  const { profissionalId, nome } = req.body || {};
  const empresas = readJson(empresasFile, []);
  const emp = empresas.find(e => String(e.id) === String(empresaId));
  if (!emp) return res.status(404).json({ error: 'Empresa não encontrada' });
  const vaga = (emp.vagas || []).find(v => String(v.id) === String(vagaId));
  if (!vaga) return res.status(404).json({ error: 'Vaga não encontrada' });
  vaga.candidatos = Array.isArray(vaga.candidatos) ? vaga.candidatos : [];
  if (!vaga.candidatos.some(c => String(c.profissionalId) === String(profissionalId))) {
    vaga.candidatos.push({ profissionalId, nome, ts: Date.now() });
  }
  writeJson(empresasFile, empresas);
  res.status(201).json({ ok: true, candidatos: vaga.candidatos });
});

app.delete('/api/vagas/:empresaId/:vagaId/candidatar/:profId', (req, res) => {
  const { empresaId, vagaId, profId } = req.params;
  const empresas = readJson(empresasFile, []);
  const emp = empresas.find(e => String(e.id) === String(empresaId));
  if (!emp) return res.status(404).json({ error: 'Empresa não encontrada' });
  const vaga = (emp.vagas || []).find(v => String(v.id) === String(vagaId));
  if (!vaga) return res.status(404).json({ error: 'Vaga não encontrada' });
  vaga.candidatos = Array.isArray(vaga.candidatos) ? vaga.candidatos : [];
  vaga.candidatos = vaga.candidatos.filter(c => String(c.profissionalId) !== String(profId));
  writeJson(empresasFile, empresas);
  res.json({ ok: true, candidatos: vaga.candidatos });
});

app.get('/api/vagas/:empresaId/:vagaId/candidatos', (req, res) => {
  const { empresaId, vagaId } = req.params;
  const empresas = readJson(empresasFile, []);
  const emp = empresas.find(e => String(e.id) === String(empresaId));
  if (!emp) return res.status(404).json({ error: 'Empresa não encontrada' });
  const vaga = (emp.vagas || []).find(v => String(v.id) === String(vagaId));
  if (!vaga) return res.status(404).json({ error: 'Vaga não encontrada' });
  vaga.candidatos = Array.isArray(vaga.candidatos) ? vaga.candidatos : [];
  res.json(vaga.candidatos);
});


// ========= ASSISTENTE DE CARREIRA (IA) =========
async function chamarGemini(prompt) {
  if (!GEMINI_API_KEY) {
    return (
      'Olá! Parece que a chave GEMINI_API_KEY ainda não foi configurada no backend. ' +
      'Mesmo assim, posso te ajudar com uma orientação básica de carreira baseada nos dados locais.\n\n' +
      prompt.slice(0, 600)
    );
  }

  const payload = JSON.stringify({
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  });

  // 🔹 Modelo atualizado para a família 2.5
  const MODEL_NAME = 'gemini-2.5-flash';

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('[Gemini raw response]', json); // para debug

          if (json.error) {
            console.error('[Gemini ERROR]', json.error);
            return resolve(
              'A IA retornou um erro (' +
                json.error.message +
                '). Tente novamente em alguns minutos.'
            );
          }

          const candidates = json.candidates || [];
          const first = candidates[0] || {};
          const parts = (first.content && first.content.parts) || [];
          const text = parts.map((p) => p.text || '').join('\n').trim();

          if (text) return resolve(text);

          return resolve(
            'Não consegui gerar uma resposta detalhada neste momento. Tente novamente em instantes.'
          );
        } catch (e) {
          console.error('Erro ao processar resposta do Gemini:', e);
          return resolve(
            'Ocorreu um erro ao processar a resposta da IA. Tente novamente em alguns minutos.'
          );
        }
      });
    });

    req.on('error', (err) => {
      console.error('Erro de rede ao chamar Gemini:', err);
      resolve(
        'Não consegui me conectar ao serviço de IA agora. Tente novamente mais tarde.'
      );
    });

    req.write(payload);
    req.end();
  });
}



app.post('/api/assistant', async (req, res) => {
  try {
    const { message, userId } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Mensagem é obrigatória.' });
    }

    // Identifica usuário logado
    const uid = userId != null ? Number(userId) : null;
    if (!uid) {
      return res.status(400).json({ error: 'userId é obrigatório para o assistente.' });
    }

    // Busca login e perfil profissional
    const logins = readJson(loginFile, []);
    const loginUser = logins.find(l => Number(l.id) === uid);

    const profissionais = readJson(profissionaisFile, []);
    const perfil = profissionais.find(p => Number(p.id) === uid);

    const empresas = readJson(empresasFile, []);

    // Monta descrições legíveis
    const perfilTexto = perfil
      ? [
          `Nome: ${perfil.nome || ''}`,
          `Cargo atual: ${perfil.cargo || ''}`,
          `Resumo: ${perfil.resumo || ''}`,
          `Área de interesse: ${(perfil.areaInteresses || []).join(', ')}`,
          `Localização: ${perfil.localizacao || ''}`
        ].join('\n')
      : 'Perfil profissional não encontrado no sistema.';

    const skillsUsuario = perfil && Array.isArray(perfil.habilidadesTecnicas)
      ? perfil.habilidadesTecnicas.join(', ')
      : 'Usuário ainda não cadastrou hard skills.';

    const vagasLista = [];
    empresas.forEach(emp => {
      (emp.vagas || []).forEach(v => {
        const hs = Array.isArray(v.hardSkills) ? v.hardSkills.join(', ') : (v.competencias || '');
        vagasLista.push(
          `Empresa: ${emp.nome} | Vaga: ${v.titulo} | Hard skills desejadas: ${hs}`
        );
      });
    });

    const vagasTexto = vagasLista.length
      ? vagasLista.join('\n')
      : 'Ainda não há vagas cadastradas no sistema.';

    const promptBase = `
Você é o Assistente de Carreira Oficial do ProFuture, uma plataforma de empregabilidade focada no Futuro do Trabalho.
Seu papel é ajudar o usuário a desenvolver habilidades, planejar sua carreira, realizar upskilling e reskilling,
indicar carreiras promissoras, listar gaps entre as capacidades do usuário e as vagas, recomendar trilhas e estudos.

Dados do usuário:
${perfilTexto}

Hard skills do usuário:
${skillsUsuario}

Vagas registradas no sistema:
${vagasTexto}

Pergunta do usuário:
${message}

Regras:
- Explique sempre de forma prática e direta.
- Seja amigável, motivador e útil.
- Evite respostas vagas.
- Traga exemplos reais de trilhas de estudo (com tecnologias, temas ou áreas para pesquisar).
- Mostre próximos passos concretos (o que fazer nos próximos 30, 60 e 90 dias se fizer sentido).
- Aponte gaps entre as habilidades do usuário e o que as vagas pedem.
- Use uma linguagem natural em português do Brasil.
`;

    const respostaIA = await chamarGemini(promptBase);

    res.json({
      ok: true,
      reply: respostaIA
    });
  } catch (err) {
    console.error('Erro na rota /api/assistant:', err);
    res.status(500).json({
      error: 'Erro interno ao processar a mensagem do assistente.'
    });
  }
});

// ========= HEALTH =========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
