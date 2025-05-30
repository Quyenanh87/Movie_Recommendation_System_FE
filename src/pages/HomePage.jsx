import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilm } from 'react-icons/fa';
import MovieGridCarousel from '../components/MovieGridCarousel';

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-yellow-400 font-bold text-lg">Đang tải phim...</div>
    </div>
  );
}

const years = Array.from({ length: 2024 - 1960 }, (_, i) => 2023 - i);
const ratings = [9,8,7,6,5,4,3,2,1];

function HomePage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [selectedModel, setSelectedModel] = useState("CB_TF-IDF");
  const [recommended, setRecommended] = useState([]);
  const [hotMovies, setHotMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [genresList, setGenresList] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [filter, setFilter] = useState({ genre: '', year: '', country: '', rating: '' });

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
    // eslint-disable-next-line
  }, [selectedModel, userId]);

  // Fetch genres & countries for filter
  useEffect(() => {
    async function fetchMeta() {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      const [gRes, cRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`),
        fetch(`https://api.themoviedb.org/3/configuration/countries?api_key=${API_KEY}`)
      ]);
      const gData = await gRes.json();
      const cData = await cRes.json();
      setGenresList(gData.genres || []);
      setCountriesList(cData || []);
    }
    fetchMeta();
  }, []);

  const fetchAllData = async (uid, modelName) => {
    setIsLoading(true);
    try {
      const [recRes, hotRes, histRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: uid, model: modelName }),
        }),
        fetch("http://127.0.0.1:8000/movies/trending"),
        fetch(`http://127.0.0.1:8000/user/history?user_id=${uid}`),
      ]);

      const recData = await recRes.json();
      const hotData = await hotRes.json();
      const histData = await histRes.json();

      const chosenRecommendations = recData.results?.slice(0, 10) || [];

      // Lấy thông tin chi tiết cho từng phim
      const fetchMovieInfo = (await import('../utils/fetchPoster')).fetchMovieInfo;
      const recInfo = await Promise.all(chosenRecommendations.map(title => fetchMovieInfo(title)));
      const hotInfo = await Promise.all(hotData.map(title => fetchMovieInfo(title)));
      const histInfo = await Promise.all(histData.map(title => fetchMovieInfo(title)));

      setRecommended(recInfo);
      setHotMovies(hotInfo);
      setRecentMovies(histInfo);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  // Filter handler
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Fetch phim theo filter nâng cao
  const fetchFilteredMovies = async () => {
    setIsLoading(true);
    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc`;
      if (filter.genre) url += `&with_genres=${filter.genre}`;
      if (filter.year) url += `&primary_release_year=${filter.year}`;
      if (filter.country) url += `&with_origin_country=${filter.country}`;
      if (filter.rating) url += `&vote_average.gte=${filter.rating}`;
      const res = await fetch(url);
      const data = await res.json();
      const fetchMovieInfo = (await import('../utils/fetchPoster')).fetchMovieInfo;
      const moviesInfo = await Promise.all((data.results || []).slice(0, 15).map(m => fetchMovieInfo(m.title)));
      setRecommended(moviesInfo);
      setHotMovies([]);
      setRecentMovies([]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-movie-bg bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div className="relative z-10 max-w-7xl mx-auto px-2 pb-10">
        <div className="flex justify-center items-center pt-8 mb-8">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg flex items-center gap-2 font-movie-title">
            <FaFilm className="text-yellow-400" /> Movie Recommender
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-200 font-medium">👤 User: {userId}</span>
            <button 
              onClick={handleLogout} 
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 shadow-lg transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
        {/* Filter model ngang */}
        <div className="flex flex-wrap gap-4 bg-[#181c24]/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl mb-10 border-2 border-yellow-300 items-center mx-auto w-fit">
          <label className="block font-bold text-gray-200 text-base font-movie-section mr-2">Chọn mô hình gợi ý:</label>
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="appearance-none p-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-[#232526] text-yellow-200 font-semibold shadow transition-all min-w-[200px]"
          >
            {modelOptions.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
        {/* Filter nâng cao */}
        <div className="flex flex-wrap gap-4 bg-[#181c24]/80 p-4 rounded-xl shadow mb-8 border border-yellow-300 items-center mx-auto w-fit">
          <select name="genre" value={filter.genre} onChange={handleFilterChange} className="p-2 rounded border border-yellow-300 bg-[#232526] text-yellow-200">
            <option value="">Thể loại</option>
            {genresList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select name="year" value={filter.year} onChange={handleFilterChange} className="p-2 rounded border border-yellow-300 bg-[#232526] text-yellow-200">
            <option value="">Năm</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select name="country" value={filter.country} onChange={handleFilterChange} className="p-2 rounded border border-yellow-300 bg-[#232526] text-yellow-200">
            <option value="">Quốc gia</option>
            {countriesList.map(c => <option key={c.iso_3166_1} value={c.iso_3166_1}>{c.english_name}</option>)}
          </select>
          <select name="rating" value={filter.rating} onChange={handleFilterChange} className="p-2 rounded border border-yellow-300 bg-[#232526] text-yellow-200">
            <option value="">Điểm IMDb</option>
            {ratings.map(r => <option key={r} value={r}>{r}+</option>)}
          </select>
          <button onClick={fetchFilteredMovies} className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-500 transition">Lọc phim</button>
        </div>
        {/* Loading spinner hoặc grid phim */}
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {recommended.length === 0 ? (
              <div className="text-center text-yellow-300 font-bold text-lg py-10">Không tìm thấy film nào phù hợp.</div>
            ) : (
              <MovieGridCarousel
                title={`Gợi ý từ mô hình ${selectedModel}`}
                movies={recommended}
                icon={<span className="inline-block">🎯</span>}
              />
            )}
            <MovieGridCarousel
              title="Phim nổi bật"
              movies={hotMovies}
              icon={<span className="inline-block">🔥</span>}
              autoSlide={true}
            />
            <MovieGridCarousel
              title="Bạn đã xem gần đây"
              movies={recentMovies}
              icon={<span className="inline-block">📺</span>}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default HomePage;
