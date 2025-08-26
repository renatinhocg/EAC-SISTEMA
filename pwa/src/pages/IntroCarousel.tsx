import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface IntroCarouselProps {
  onFinish?: () => void;
}

const slides = [
  {
    title: '',
    description: '',
    image: '/assets/primeiro-box.png',
  },
  {
    title: '',
    description: '',
    image: '/assets/segundo-box.png',
    price: 'R$35',
  },
  {
    title: '',
    description: '',
    image: '/assets/3box.png',
  },
    {
      title: '',
      image: '/assets/4box.png',
      style: { marginTop: 0, marginBottom: 0 }
    },
    {
      title: '',
      image: '/assets/5box.png',
      style: { marginTop: 0, marginBottom: 24 }
    },
];

// Funções separadas para cada slide
function Slide({ index }: { index: number }) {
  return (
    <div
      className="w-full h-full flex flex-col justify-start items-center px-0 pt-0 pb-8 bg-transparent"
      aria-label={slides[index].title}
      tabIndex={0}
    >
      <img
        src={slides[index].image}
        alt={slides[index].title}
        className="w-auto max-w-[90%] h-auto max-h-56 mx-auto mt-0 transition-all duration-300"
        style={{ borderRadius: '0', boxShadow: 'none', ...(slides[index].style || {}) }}
      />
    </div>
  );
}

const IntroCarousel: React.FC<IntroCarouselProps> = ({ onFinish }) => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const finish = () => {
    if (onFinish) onFinish();
    else navigate('/login');
  };

  const nextSlide = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else finish();
  };

  const skip = () => finish();

  return (
    <div className="min-h-screen w-full flex items-center justify-center text-white px-2 py-2" style={{ background: '#0345EF' }}>
      <div className="w-[375px] max-w-full min-h-[600px] flex flex-col items-center  bg-[#0345EF] rounded-2xl shadow-xl p-6 relative overflow-hidden">
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center">
          <Slide index={current} />
          <h2 className="text-xl font-bold text-center mt-2 mb-1 text-[#11182c]">{slides[current].title}</h2>
          {slides[current].description && (
            <p className="text-base text-center text-[#222] mb-2 font-medium px-4">{slides[current].description}</p>
          )}
        </div>
      </div>
      {/* Footer fixo com botões e dots, sempre visível, fora do box */}
      <footer
        className="w-full flex flex-row items-center justify-center px-3 py-4 bg-transparent"
        style={{ position: 'absolute', bottom: 24, left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <div className="flex flex-row items-center justify-center gap-6">
          {/* Botão Pular */}
          <button
            onClick={skip}
            className="text-white text-lg font-normal focus:outline-none"
            style={{ minWidth: '80px', color:'#ffffff' }}
          >
            Pular
          </button>
          {/* Botão Próximo usando imagem customizada */}
          <button
            onClick={nextSlide}
            className="rounded-full flex items-center justify-center shadow-lg bg-transparent"
            style={{ width: '84px', height: '84px', padding: 0, border: 'none', marginLeft: '12px', marginRight: '12px' }}
          >
            <img
              src="/assets/botao-front.png"
              alt="Próximo"
              style={{ width: '84px', height: '84px', objectFit: 'cover' }}
            />
          </button>
          {/* Dots de progresso */}
          <div className="flex flex-row items-center justify-center gap-2">
            {[0,1,2,3,4].map(idx => (
              <span
                key={idx}
                className={`inline-block w-4 h-4 rounded-full transition-all duration-200 ${current === idx ? 'bg-yellow-400' : 'bg-yellow-200'}`}
                style={{ border: current === idx ? '2px solid #eac100' : 'none' }}
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
export default IntroCarousel;
