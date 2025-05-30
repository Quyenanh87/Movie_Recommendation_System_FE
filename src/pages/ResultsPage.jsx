import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchPosterUrl } from '../utils/fetchPoster';

function ResultsPage() {
  const location = useLocation();
  const { selectedMovies } = location.state || { selectedMovies: [] };

  const [results, setResults] = useState({});
  const [posters, setPosters] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      try {
        const res = await fetch("http://127.0.0.1:8000/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            liked_movies: selectedMovies,
            user_id: parseInt(userId),
          }),
        });

        const data = await res.json();
        setResults(data.results);

        // Fetch posters for all movies
        const allMovies = Object.values(data.results).flat();
        const posterMap = {};

        for (const movie of allMovies) {
          const posterUrl = await fetchPosterUrl(movie);
          posterMap[movie] = posterUrl;
        }

        setPosters(posterMap);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedMovies.length > 0) {
      fetchRecommendations();
    }
  }, [selectedMovies]);

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">🎯 Kết quả gợi ý</h1>
        <h2 className="text-md text-center text-gray-600 mb-4">
          Bạn đã chọn: <span className="font-medium">{selectedMovies.join(', ')}</span>
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Đang tải gợi ý...</p>
        ) : (
          Object.entries(results).map(([model, movies]) => (
            <div key={model} className="mb-10">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">{model}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {movies.map((movie, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border rounded-xl shadow hover:shadow-lg transition-all p-3 flex flex-col items-center"
                  >
                    {posters[movie] ? (
                      <img src={posters[movie]} alt={movie} className="w-32 h-48 object-cover rounded mb-2" />
                    ) : (
                      <div className="w-32 h-48 bg-gray-300 rounded mb-2" />
                    )}
                    <span className="text-center text-sm">{movie}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ResultsPage;
