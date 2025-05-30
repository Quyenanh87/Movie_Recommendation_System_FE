import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPosterUrl } from '../utils/fetchPoster';

function HomePage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [selectedModel, setSelectedModel] = useState("CB_TF-IDF");
  const [recommended, setRecommended] = useState([]);
  const [hotMovies, setHotMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [posters, setPosters] = useState({});

  const modelOptions = [
    "CB_TF-IDF", "CB_TF-IDF-Ridge", "CB_TF-IDF-MLP", "CB_TF-IDF-AE",
    "CB_BERT", "CF_kNN", "CF_NeuCF", "CF_VAE", "CF_LightGCN", "CF_Transformer"
  ];

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      navigate("/login");
      return;
    }

    const validateUser = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/user/exists?user_id=${storedUserId}`);
        const data = await res.json();

        if (data.exists) {
          setUserId(storedUserId);
        } else {
          localStorage.removeItem("user_id");
          navigate("/login");
        }
      } catch (err) {
        console.error("Lỗi xác minh user_id:", err);
      }
    };

    validateUser();
  }, []);

  useEffect(() => {
    if (userId) fetchAllData(parseInt(userId), selectedModel);
  }, [selectedModel, userId]);

  const fetchAllData = async (uid, modelName) => {
    try {
      const [recRes, hotRes, histRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: uid, model: modelName }), // ✅ Gửi model được chọn
        }),
        fetch("http://127.0.0.1:8000/movies/trending"),
        fetch(`http://127.0.0.1:8000/user/history?user_id=${uid}`),
      ]);

      const recData = await recRes.json();
      const hotData = await hotRes.json();
      const histData = await histRes.json();

      const chosenRecommendations = recData.results?.slice(0, 10) || [];

      const allMovies = [...chosenRecommendations, ...hotData, ...histData];
      const posterMap = {};
      for (const movie of allMovies) {
        const posterUrl = await fetchPosterUrl(movie);
        posterMap[movie] = posterUrl;
      }

      setRecommended(chosenRecommendations);
      setHotMovies(hotData);
      setRecentMovies(histData);
      setPosters(posterMap);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  const MovieCarousel = ({ title, movies }) => (
    <div className="mb-10">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.length > 0 ? (
          movies.map((movie, index) => (
            <div
              key={index}
              className="bg-white border rounded-xl shadow hover:shadow-lg transition-all p-3 flex flex-col items-center"
            >
              {posters[movie] ? (
                <img src={posters[movie]} alt={movie} className="w-32 h-48 object-cover rounded mb-2" />
              ) : (
                <div className="w-32 h-48 bg-gray-300 rounded mb-2" />
              )}
              <span className="text-center text-sm">{movie}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">Không tìm thấy phim phù hợp</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-blue-100 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🎬 Movie Recommender</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">👤 User: {userId}</span>
            <button onClick={handleLogout} className="text-red-500 font-medium">Đăng xuất</button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Chọn mô hình gợi ý:</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="p-2 border rounded w-full max-w-xs"
          >
            {modelOptions.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <MovieCarousel title={`🎯 Gợi ý từ mô hình ${selectedModel}`} movies={recommended} />
        <MovieCarousel title="🔥 Phim nổi bật" movies={hotMovies} />
        <MovieCarousel title="📺 Bạn đã xem gần đây" movies={recentMovies} />
      </div>
    </div>
  );
}

export default HomePage;
