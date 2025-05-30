import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFilm } from 'react-icons/fa';
import YouTube from 'react-youtube';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function cleanMovieTitle(title) {
  // Loại bỏ năm (1999) và trim
  return title.replace(/\s*\(\d{4}\)/, '').trim();
}

function getYouTubeTrailerId(query) {
  return fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query + ' trailer')}&key=${YOUTUBE_API_KEY}`
  )
    .then(res => res.json())
    .then(data => {
      if (data.items && data.items.length > 0) {
        return data.items[0].id.videoId;
      }
      return null;
    })
    .catch(() => null);
}

function getTMDBOverview(query) {
  return fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
  )
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        return data.results[0].overview;
      }
      return null;
    })
    .catch(() => null);
}

const WatchPage = () => {
  const { movieName } = useParams();
  const navigate = useNavigate();
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState('');

  useEffect(() => {
    setLoading(true);
    getYouTubeTrailerId(movieName).then(id => {
      setVideoId(id || '6ZfuNTqbHE8'); // fallback: Avengers trailer
      setLoading(false);
    });
    getTMDBOverview(cleanMovieTitle(movieName)).then(desc => {
      setOverview(desc || 'Không có mô tả cho phim này.');
    });
  }, [movieName]);

  const opts = {
    width: '100%',
    height: '500',
    playerVars: { autoplay: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181c24] to-black flex flex-col items-center justify-center p-2 sm:p-6">
      <div className="w-full max-w-4xl bg-[#232526] rounded-3xl shadow-2xl p-0 sm:p-8 flex flex-col items-center border-2 border-yellow-400">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
          <button onClick={() => navigate(-1)} className="text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-2 text-lg transition-colors bg-transparent border-none outline-none cursor-pointer">
            <FaArrowLeft /> <span className="hidden sm:inline">Quay lại trang trước</span>
          </button>
          <div className="flex items-center gap-2 text-2xl font-extrabold text-yellow-400 font-movie-title drop-shadow-lg">
            <FaFilm />
            <span className="text-white">Đang phát:</span>
            <span className="text-yellow-400">{decodeURIComponent(movieName)}</span>
          </div>
        </div>
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden mb-6 shadow-lg border border-yellow-400 flex items-center justify-center">
          {loading ? (
            <div className="text-yellow-400 text-lg">Đang tìm trailer...</div>
          ) : (
            <YouTube videoId={videoId} opts={opts} className="w-full h-full" />
          )}
        </div>
        <div className="w-full text-gray-300 text-base mb-2 px-2 text-center">
          <span className="font-bold text-yellow-400">Mô tả phim:</span> {overview}
        </div>
      </div>
    </div>
  );
};

export default WatchPage; 