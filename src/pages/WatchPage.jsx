import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFilm } from 'react-icons/fa';
import YouTube from 'react-youtube';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Kiểm tra API keys
if (!YOUTUBE_API_KEY || !TMDB_API_KEY) {
  console.error('Missing API keys! Please check your .env file');
}

function cleanMovieTitle(title) {
  if (!title) return '';
  return title.replace(/\s*\(\d{4}\)/, '').trim();
}

async function getYouTubeTrailerId(query) {
  try {
    if (!query) {
      console.error('Search query is required');
      return null;
    }

    console.log('Searching for trailer:', query);
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query + ' official trailer')}&key=${YOUTUBE_API_KEY}`;
    console.log('Fetching from URL:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('YouTube API Response:', data);

    if (data.error) {
      throw new Error(`YouTube API Error: ${data.error.message}`);
    }

    if (!data.items || data.items.length === 0) {
      console.log('No trailer found for:', query);
      return null;
    }

    const videoId = data.items[0].id.videoId;
    console.log('Found video ID:', videoId);
    return videoId;

  } catch (error) {
    console.error('Error fetching YouTube trailer:', error);
    return null;
  }
}

async function getTMDBOverview(query) {
  try {
    if (!query) {
      console.error('Search query is required for TMDB');
      return null;
    }

    console.log('Searching TMDB for:', query);
    
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('TMDB API Response:', data);

    if (data.results && data.results.length > 0) {
      return data.results[0].overview;
    }
    return null;
  } catch (error) {
    console.error('Error fetching TMDB overview:', error);
    return null;
  }
}

const WatchPage = () => {
  const { movieName } = useParams();
  const navigate = useNavigate();
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        if (!movieName) {
          throw new Error('Movie name is required');
        }

        console.log('Processing movie:', movieName);
        const cleanTitle = cleanMovieTitle(decodeURIComponent(movieName));
        
        // Fetch trailer and overview in parallel
        const [trailerId, movieOverview] = await Promise.all([
          getYouTubeTrailerId(cleanTitle),
          getTMDBOverview(cleanTitle)
        ]);

        if (trailerId) {
          setVideoId(trailerId);
        } else {
          setError('Không tìm thấy trailer cho phim này');
        }

        setOverview(movieOverview || 'Không có mô tả cho phim này.');
      } catch (error) {
        console.error('Error in WatchPage:', error);
        setError(`Đã xảy ra lỗi: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [movieName]);

  const opts = {
    width: '100%',
    height: '500',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      controls: 1,
      origin: window.location.origin
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181c24] to-black flex flex-col items-center justify-center p-2 sm:p-6">
      <div className="w-full max-w-4xl bg-[#232526] rounded-3xl shadow-2xl p-0 sm:p-8 flex flex-col items-center border-2 border-yellow-400">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
          <button 
            onClick={() => navigate(-1)} 
            className="text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-2 text-lg transition-colors bg-transparent border-none outline-none cursor-pointer"
          >
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
            <div className="text-yellow-400 text-lg animate-pulse">Đang tìm trailer...</div>
          ) : error ? (
            <div className="text-red-400 text-lg text-center px-4">{error}</div>
          ) : videoId ? (
            <YouTube
              videoId={videoId}
              opts={opts}
              className="w-full h-full"
              onError={(e) => {
                console.error('YouTube Player Error:', e);
                setError('Không thể phát trailer. Vui lòng thử lại sau.');
              }}
            />
          ) : (
            <div className="text-yellow-400 text-lg">Không tìm thấy trailer</div>
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