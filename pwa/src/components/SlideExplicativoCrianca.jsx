import React, { useState } from "react";

const slides = [
  {
    img: '/assets/brincadeiras.png',
    texto: "Haverá uma programação de atividades para as crianças, portanto pedimos aos pais que confiem na equipe e deixem as crianças no ambiente destinado para tal e que só interfiram ou se apresentem quando solicitados"
  },
  {
    img: '/assets/rezando.png',
    texto: "A equipe de Evangelização Infantil participará dos momentos de abertura e fechamento da vigília, como qualquer outra equipe, portanto, nesses momentos pedimos que cada pai/mãe se responsabilize por seu (s) filho (s)"
  },
  {
    img: '/assets/dente.png',
    texto: "Cada criança deve participar do encontro vestida de maneira confortável e trazer objetos de uso/higiene pessoal (p. ex.: escova de dente, uma muda de roupa – se necessário) identificados com o nome da criança, dos pais e da equipe em que estão trabalhando. Pedimos que evitem trazer objetos de valor como: joias, telefones celulares, Ipod’s, etc. A equipe não irá se responsabilizar por esses itens"
  },
  {
    img: '/assets/almoco.png',
    texto: " Se a criança estiver tomando algum medicamento, este deve ser entregue os coordenadores da equipe de evangelização infantil com as devidas orientações de dosagens e horários;Os lanches e refeições serão coletivos e com horários incluídos na programação"
  },
  {
    img: '/assets/bola.png',
    texto: "Não será permitida a entrada de bolas, de qualquer tipo ou tamanho."
  },
  {
    img: '/assets/respeito.png',
    texto: "Converse com seu filho(a) para que respeite o Jovem. Durante o encontro ele está fazendo um serviço para ajudar a você como Tio(a) a trabalharem, portanto eles são os responsáveis pelas crianças nesse momento. Deve obedecer e fazer as atividades coordenadas pelo jovem"
  }
];

export default function SlideExplicativoCrianca({ onFim }) {
  const [atual, setAtual] = useState(0);

  const avancar = () => {
    if (atual < slides.length - 1) {
      setAtual(atual + 1);
    } else {
      onFim();
    }
  };

  return (
    <div style={{
      background: '#09112C',
      borderRadius: '16px',
      padding: '32px 16px',
      maxWidth: '400px',
      margin: '0 auto',
      color: 'white',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(34, 197, 94, 0.08)'
    }}>
  <img src={slides[atual].img} alt="Explicação" style={{ width: '100%', maxWidth: '320px', marginBottom: '24px', borderRadius: '12px', background: '#222', minHeight: '120px', objectFit: 'cover' }} />
      <div style={{ fontSize: '14px', fontWeight: 400, marginBottom: '24px' }}>{slides[atual].texto}</div>
      <button
        onClick={avancar}
        style={{
          background: '#FDC608',
          color: '#09112C',
          fontWeight: 700,
          borderRadius: '8px',
          padding: '12px 32px',
          fontSize: '14px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {atual < slides.length - 1 ? 'Próximo' : 'Próximo'}
      </button>
    </div>
  );
}
