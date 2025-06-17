import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    const trimmed = userId.trim();
    if (!trimmed) {
      setError("⚠️ Vui lòng nhập User ID");
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/user/exists?user_id=${trimmed}`);
      const data = await res.json();

      if (data.exists) {
        localStorage.setItem("user_id", trimmed);
        login();
        navigate("/");
      } else {
        setError("❌ User ID không tồn tại. Vui lòng kiểm tra lại.");
      }
    } catch (err) {
      console.error("Lỗi khi xác minh:", err);
      setError("❗ Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-sm border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-white text-center flex items-center justify-center gap-2">
          <span role="img" aria-label="lock">🔐</span> Đăng nhập Movie Recommender
        </h1>

        <input
          type="number"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setError("");
          }}
          placeholder="🎟️ Nhập User ID của bạn"
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-3"
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-lg transition duration-200"
        >
          🎬 Đăng nhập
        </button>
      </div>
    </div>
  );
}
