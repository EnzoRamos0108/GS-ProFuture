# ProFuture – Plataforma de Empregos e Desenvolvimento Profissional

Um sistema completo que conecta profissionais e empresas, recomendando vagas, trilhas de estudo e insights sobre o futuro do trabalho.

---

## 📖 Resumo do Projeto

O **ProFuture** é um ambiente Web desenvolvido em **React + Vite + TailwindCSS** (frontend) e **Node.js + Express** (backend), utilizando **arquivos JSON** como banco de dados. A plataforma oferece:

- Cadastro e login de profissionais e empresas
- Perfis completos com foto, habilidades e informações profissionais
- Publicação de posts, vagas e candidaturas
- Recomendação de vagas baseada em hard skills
- Assistente de IA Gemini especializado em:
  - Upskilling
  - Reskilling
  - Carreiras do futuro
  - Comparação entre skills do usuário e da vaga
  - Identificação de gaps de competência
- Monitoramento do bem-estar e performance do profissional 

Tudo desenvolvido como **SPA — Single Page Application**, sem recarregar páginas.

---

## 🔐 Usuários e Senhas para Teste

### 👤 Profissional

**Email:** `usuario@gmail.com`
**Senha:** `123456`

### 🏢 Empresa

**Email:** `empresa@gmail.com`
**Senha:** `123456`

---

## 🧰 Pré-requisitos

| Ferramenta | Versão | Função                                     |
| :----------- | :------- | :--------------------------------------- |
| Node.js    | `18+`    | Executar backend e ferramentas do frontend |
| npm        | `Última` | Instalar dependências                      |
| VSCode     | Opcional | Desenvolvimento                            |
| Navegador  | Moderno  | Acessar o frontend                         |

---

## 📥 Instalação do Projeto (Passo a Passo)

### 1️⃣ Baixar o repositório
bash
git clone https://github.com/EnzoRamos0108/GS-ProFuture.git

### 2️⃣ Acessar o diretório
cd GS-ProFuture

Estrutura do projeto:

/frontend — React + Vite + TailwindCSS

/backend  — Node.js + Express + JSON

### ⚙️ Backend – Instalação e Execução

### 3️⃣ Entrar na pasta backend

cd backend

### 4️⃣ Instalar dependências

npm install

### 5️⃣ Rodar o servidor

npm start

📌 Backend disponível em: http://localhost:4000

### 🖥️ Frontend – Instalação e Execução

### 6️⃣ Entrar na pasta frontend

cd ../frontend

### 7️⃣ Instalar dependências

npm install

### 8️⃣ Rodar o frontend

npm run dev

📌 Frontend disponível em: http://localhost:5173

---

## 🟢 OPCIONAL — Pulseira Inteligente (Dashboard Python )

-Este módulo opcional permite visualizar dados da pulseira inteligente através do arquivo grafico.py, exibindo gráficos dinâmicos com informações de sensores. Ele utiliza Flask + Plotly para criar um dashboard web.

-IMPORTANTE: Para conseguir analisar os dados, é necessario ter uma VM criada na AZURE MICROSOFT e ter o Fiware com o projeto configurado. Além de trocar o IP da VM no codigo.

### 📌 Arquivo: grafico.py

Este arquivo cria um dashboard acessível no navegador e exibe:

-Minutos ativos
-Score diário
-Aceleração
-Indicadores de atividade

### ▶️ Como Executar o Dashboard da Pulseira

### 1️⃣ Verifique se o Python 3.13 está instalado

Caminho padrão:
C:\Users\Cpu\AppData\Local\Programs\Python\Python313\python.exe

### 2️⃣ Instale as bibliotecas necessárias

"C:\Users\Cpu\AppData\Local\Programs\Python\Python313\python.exe" -m pip install flask plotly requests pytz numpy

### 3️⃣ Execute o dashboard

python grafico.py

### 4️⃣ Acesse no navegador
-http://127.0.0.1:5000

ou

-entre na aba "Perfil" e clique em "Ver atividade fisica"

---

## 🔗 Link do Repositório
https://github.com/EnzoRamos0108/GS-ProFuture.git

# 👨‍💻 Integrantes do Grupo

| Nome | RM |
| :----------- | :------- |
| Enzo Fernandes Ramos    | 563705    | 
| Felipe Henrique de Souza Cerazi        | 562746 | 
| Gustavo Peaguda de Castro     | 562923 | 

