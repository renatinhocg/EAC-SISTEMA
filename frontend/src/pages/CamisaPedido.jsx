

import React, { useState } from "react";

export default function CamisaPedido() {
  const [form, setForm] = useState({
    responsavel: "",
    telefone: "",
    adolescente: "",
    cor: "",
    tamanho: "",
    comprovante: null,
  });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-green-100 text-green-800 px-8 py-6 rounded-xl shadow-md text-xl font-bold">
          Pedido enviado com sucesso!
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8 px-2">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Imagem da camisa */}
        <div className="md:w-1/2 w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 p-8">
          <img
            src="https://i.ibb.co/3sSj84d/camisa-preta.png"
            alt="Camisa EAC"
            className="w-56 h-auto mb-6 drop-shadow-xl"
          />
          <h1 className="text-white text-2xl font-bold mb-2">Camisa do EAC</h1>
          <span className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-full font-semibold text-lg shadow">R$30</span>
        </div>
        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="md:w-1/2 w-full flex flex-col gap-6 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido de Camisa</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="responsavel"
              placeholder="Nome do responsável"
              value={form.responsavel}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="tel"
              name="telefone"
              placeholder="Telefone"
              value={form.telefone}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="text"
              name="adolescente"
              placeholder="Nome do adolescente"
              value={form.adolescente}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Cor da camisa</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cor"
                  value="preta"
                  checked={form.cor === "preta"}
                  onChange={handleChange}
                  required
                />
                <span>Preta</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cor"
                  value="branca"
                  checked={form.cor === "branca"}
                  onChange={handleChange}
                  required
                />
                <span>Branca</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Tamanho</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {["PP", "P", "M", "G", "GG", "XG"].map((t) => (
                <label key={t} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="tamanho"
                    value={t}
                    checked={form.tamanho === t}
                    onChange={handleChange}
                    required
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Comprovante de pagamento</label>
            <input
              type="file"
              name="comprovante"
              accept="image/*,application/pdf"
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-6 py-3 font-bold text-lg mt-2 hover:bg-blue-700 transition"
          >
            Concluir pedido
          </button>
        </form>
      </div>
    </div>
  );
}
