import React from "react";
import { useNavigate } from "react-router-dom";

export default function BannerCriancaTeste() {
  const navigate = useNavigate();

  return (
    <div className="bg-yellow-200 border-l-4 border-yellow-500 p-4 mb-6 rounded shadow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      </div>
    </div>
  );
}
