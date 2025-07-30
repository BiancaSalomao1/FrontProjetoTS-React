import React, { useState } from 'react';
import { UserSearch } from './components/UserSearch';
import ClientForm from './components/ClientForm';


function App() {
  const [currentPage, setCurrentPage] = useState<'form' | 'search'>('form');

  return (
    <div>
      <nav>
        <button onClick={() => setCurrentPage('form')}>
          📋 Cadastrar
        </button>
        <button onClick={() => setCurrentPage('search')}>
          👥 Buscar
        </button>
      </nav>
      
      {currentPage === 'form' ? <ClientForm /> : <UserSearch />}
    </div>
  );
}

export default App;
