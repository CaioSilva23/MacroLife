import React, { useState } from 'react';
import ListaRefeicoes from './ListaRefeicoes';
import CadastroRefeicao from './CadastroRefeicao';

const Refeicoes = () => {
  const [telaAtiva, setTelaAtiva] = useState('lista'); // 'lista' ou 'cadastro'

  const irParaCadastro = () => {
    setTelaAtiva('cadastro');
  };

  const voltarParaLista = () => {
    setTelaAtiva('lista');
  };

  const aoRefeicaoCriada = () => {
    // Após criar uma refeição, volta para a lista
    setTelaAtiva('lista');
  };

  return (
    <>
      {telaAtiva === 'lista' && (
        <ListaRefeicoes onCriarRefeicao={irParaCadastro} />
      )}
      
      {telaAtiva === 'cadastro' && (
        <CadastroRefeicao 
          onVoltar={voltarParaLista}
          onRefeicaoCriada={aoRefeicaoCriada}
        />
      )}
    </>
  );
};

export default Refeicoes;
