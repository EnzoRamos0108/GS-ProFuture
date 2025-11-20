import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = 'http://localhost:4000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('profuture_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem('profuture_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('profuture_user');
    }
  }, [user]);

  async function login(email, senha) {
    const res = await fetch(API_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Credenciais inválidas');
    }
    const userData = { ...data, tipoPerfil: data.tipoPerfil || 'profissional' };
    setUser(userData);
    return userData;
  }

  async function register(nome, email, senha, tipoPerfil = 'profissional', radar) {
    const res = await fetch(API_URL + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, tipoPerfil, radar })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao registrar usuário');
    }
    const userData = { ...data, tipoPerfil: data.tipoPerfil || tipoPerfil || 'profissional' };
    setUser(userData);
    return userData;
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
