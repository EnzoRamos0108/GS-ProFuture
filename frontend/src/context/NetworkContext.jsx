import { createContext, useContext, useState, useEffect } from 'react';

const NetworkContext = createContext();

export function NetworkProvider({ children }) {
  const [connections, setConnections] = useState(() => {
    if (typeof window === 'undefined') {
      return [
        {
          id: 101,
          nome: 'Wellington Cidade Silva',
          foto: '/images/wellington_cidade.jpg',
          cargo: 'Professor de Desenvolvimento Web',
          area: 'Desenvolvimento Web'
        },
        {
          id: 102,
          nome: 'Luis Roberto Guerreiro Lopes',
          foto: '/images/luis_roberto.jpg',
          cargo: 'Professor de Front-end Design',
          area: 'Front-end Design'
        }
      ];
    }
    const stored = localStorage.getItem('profuture_network');
    if (stored) return JSON.parse(stored);
    return [
      {
        id: 101,
        nome: 'Wellington Cidade Silva',
        foto: '/images/wellington_cidade.jpg',
        cargo: 'Professor de Desenvolvimento Web',
        area: 'Desenvolvimento Web'
      },
      {
        id: 102,
        nome: 'Luis Roberto Guerreiro Lopes',
        foto: '/images/luis_roberto.jpg',
        cargo: 'Professor de Front-end Design',
        area: 'Front-end Design'
      }
    ];
  });

  const [followedCompanies, setFollowedCompanies] = useState(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('profuture_companies');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('profuture_network', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('profuture_companies', JSON.stringify(followedCompanies));
  }, [followedCompanies]);

  function isConnected(userId) {
    return connections.some(c => c.id === userId);
  }

  function connect(user) {
    setConnections(prev => {
      if (prev.some(c => c.id === user.id)) return prev;
      return [...prev, user];
    });
  }

  function disconnect(userId) {
    setConnections(prev => prev.filter(c => c.id !== userId));
  }

  function isFollowingCompany(id) {
    return followedCompanies.some(e => e.id === id);
  }

  function followCompany(empresa) {
    setFollowedCompanies(prev => {
      if (prev.some(e => e.id === empresa.id)) return prev;
      return [...prev, empresa];
    });
  }

  function unfollowCompany(id) {
    setFollowedCompanies(prev => prev.filter(e => e.id !== id));
  }

  return (
    <NetworkContext.Provider
      value={{
        connections,
        connect,
        disconnect,
        isConnected,
        followedCompanies,
        followCompany,
        unfollowCompany,
        isFollowingCompany
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
