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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-4 text-center">🔐 Đăng nhập</h1>

        <input
          type="number"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setError("");
          }}
          placeholder="Nhập User ID"
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2"
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
