import React, { useState, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlay, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Kiểm tra API key
if (!YOUTUBE_API_KEY) {
  console.error('YouTube API Key is missing! Please check your .env file');
}

async function getYouTubeTrailerId(movieTitle) {
  try {
    if (!movieTitle) {
      console.error('Movie title is required');
      return null;
    }

    // Log để debug
    console.log('Searching trailer for:', movieTitle);
    console.log('Using API Key:', YOUTUBE_API_KEY ? 'API Key exists' : 'API Key missing');

    const searchQuery = `${movieTitle} official trailer`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(searchQuery)}&key=${YOUTUBE_API_KEY}`;
    
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
      console.log('No trailer found for:', movieTitle);
      return null;
    }

    const videoId = data.items[0].id.videoId;
    console.log('Found video ID:', videoId);
    return videoId;

  } catch (error) {
    console.error('Error fetching YouTube trailer:', error);
    throw error;
  }
}

const MovieGridCarousel = ({ title, movies, icon, autoSlide = false }) => {
  const [page, setPage] = useState(0);
  const moviesPerPage = 5;
  const totalMovies = movies?.length || 0;
  
  // Nếu có đúng 5 phim, chỉ có 1 trang
  const totalPages = totalMovies === 5 ? 1 : Math.max(1, Math.ceil(totalMovies / moviesPerPage));
  
  // Disable auto-slide nếu chỉ có 1 trang
  const shouldAutoSlide = autoSlide && totalPages > 1;
  
  const trackRef = useRef(null);
  const navigate = useNavigate();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTrailerId, setModalTrailerId] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalOverview, setModalOverview] = useState('');
  const [modalPoster, setModalPoster] = useState('');
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [modalYear, setModalYear] = useState('');
  const [modalCountry, setModalCountry] = useState('');
  const [modalRating, setModalRating] = useState('');
  const [modalGenres, setModalGenres] = useState([]);

  React.useEffect(() => {
    if (!shouldAutoSlide) return;
    const interval = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, 3000);
    return () => clearInterval(interval);
  }, [shouldAutoSlide, totalPages]);

  const handlePrev = () => {
    if (totalPages <= 1) return; // Prevent navigation if only 1 page
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    if (totalPages <= 1) return; // Prevent navigation if only 1 page
    setPage((prev) => (prev + 1) % totalPages);
  };

  // Mở modal trailer
  const handleOpenTrailer = async (movie) => {
    try {
      console.log('Movie data received:', movie); // Debug log

      if (!movie || typeof movie !== 'object') {
        throw new Error('Invalid movie object');
      }

      // Chuẩn hóa dữ liệu phim
      const movieData = {
        title: movie.title || movie.name || 'Không có tiêu đề',
        overview: movie.overview || movie.description || 'Không có mô tả cho phim này.',
        poster: movie.poster || movie.poster_path || movie.image || 'https://placehold.co/300x450?text=No+Poster&font=roboto',
        year: movie.year || movie.release_date?.substring(0, 4) || 'N/A',
        country: movie.country || movie.origin_country || 'N/A',
        rating: parseFloat(movie.rating) || movie.vote_average || 0,
        genres: Array.isArray(movie.genres) ? movie.genres : []
      };

      setShowModal(true);
      setLoadingTrailer(true);
      setModalTitle(movieData.title);
      setModalOverview(movieData.overview);
      setModalPoster(movieData.poster);
      setModalYear(movieData.year);
      setModalCountry(movieData.country);
      setModalRating(movieData.rating.toFixed(1));
      setModalGenres(movieData.genres);

      // Tìm trailer
      const cleanTitle = movieData.title
        .replace(/\([^)]*\)/, '')
        .replace(/\[.*?\]/, '')
        .trim();

      const trailerId = await getYouTubeTrailerId(cleanTitle);
      
      if (trailerId) {
        setModalTrailerId(trailerId);
      } else {
        setModalOverview(prev => `${prev}\n\nKhông thể tìm thấy trailer cho phim này.`);
      }

    } catch (error) {
      console.error('Error in handleOpenTrailer:', error);
      setModalOverview(`Đã xảy ra lỗi: ${error.message}`);
    } finally {
      setLoadingTrailer(false);
    }
  };

  // Đóng modal
  const handleCloseModal = () => {
    setShowModal(false);
    setModalTrailerId(null);
    setModalTitle('');
    setModalOverview('');
    setModalPoster('');
    setModalYear('');
    setModalCountry('');
    setModalRating('');
    setModalGenres([]);
  };

  // Tạo mảng các trang
  const pages = React.useMemo(() => {
    if (!Array.isArray(movies) || movies.length === 0) return [];
    
    // Nếu có đúng 5 phim hoặc ít hơn, chỉ tạo 1 trang
    if (movies.length <= 5) {
      return [movies];
    }
    
    return Array.from({ length: totalPages }, (_, i) =>
      movies.slice(i * moviesPerPage, i * moviesPerPage + moviesPerPage)
    );
  }, [movies, moviesPerPage, totalPages]);

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl text-yellow-400">{icon}</span>
        <h2 className="text-xl font-movie-section text-yellow-300 uppercase tracking-wider">{title || 'Không có tiêu đề'}</h2>
      </div>
      <div className="relative flex items-center">
        {totalPages > 1 && totalMovies > moviesPerPage && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 z-10 bg-black/60 text-yellow-300 p-2 rounded-full hover:bg-yellow-400 hover:text-black transition-all"
              style={{ transform: 'translateY(-50%)', top: '50%' }}
            >
              <FaChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 z-10 bg-black/60 text-yellow-300 p-2 rounded-full hover:bg-yellow-400 hover:text-black transition-all"
              style={{ transform: 'translateY(-50%)', top: '50%' }}
            >
              <FaChevronRight size={20} />
            </button>
          </>
        )}
        <div className="w-full overflow-hidden">
          <div
            ref={trackRef}
            className="flex transition-transform duration-500"
            style={{
              width: `${100 * totalPages}%`,
              transform: `translateX(-${page * (100 / totalPages)}%)`,
            }}
          >
            {pages.map((moviesInPage, pageIdx) => (
              <div
                key={pageIdx}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full"
                style={{ width: `${100 / totalPages}%` }}
              >
                {moviesInPage.map((movie, idx) => {
                  // Chuẩn hóa dữ liệu cho mỗi phim
                  const movieData = {
                    title: movie?.title || movie?.name || 'Không có tiêu đề',
                    poster: movie?.poster || movie?.poster_path || movie?.image || 'https://placehold.co/300x450?text=No+Poster&font=roboto',
                    rating: parseFloat(movie?.rating) || movie?.vote_average || 0,
                    year: movie?.year || movie?.release_date?.substring(0, 4) || 'N/A',
                    country: movie?.country || movie?.origin_country || 'N/A',
                    genres: Array.isArray(movie?.genres) ? movie.genres : []
                  };

                  return (
                    <div
                      key={idx}
                      className="bg-[#181c24] rounded-xl shadow-lg overflow-hidden flex flex-col hover:scale-105 hover:shadow-2xl transition-all border border-[#232526] group relative"
                    >
                      <div className="relative w-full h-64">
                        <img
                          src={movieData.poster}
                          alt={movieData.title}
                          className="w-full h-64 object-cover"
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/300x450?text=No+Poster&font=roboto';
                          }}
                        />
                        <button
                          onClick={() => handleOpenTrailer(movie)}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <span className="bg-yellow-400 text-black px-4 py-2 rounded-full flex items-center gap-2 font-bold text-lg shadow-lg hover:bg-yellow-500">
                            <FaPlay /> Xem trailer
                          </span>
                        </button>
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div className="text-base font-bold text-white truncate mb-1" title={movieData.title}>
                          {movieData.title}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          {movieData.rating > 0 && (
                            <span className="text-yellow-400 text-sm font-bold">{movieData.rating.toFixed(1)} / 10</span>
                          )}
                          {movieData.year !== 'N/A' && (
                            <span className="text-gray-400 text-xs">{movieData.year}</span>
                          )}
                          {movieData.country !== 'N/A' && (
                            <span className="text-gray-500 text-xs">({movieData.country})</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {movieData.genres.slice(0, 3).map((genre, i) => (
                            <span key={i} className="bg-yellow-300 text-black text-xs px-2 py-0.5 rounded-full font-semibold mr-1 mb-1">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                page === idx ? 'bg-yellow-400 w-4' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
      {/* Modal trailer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#232526] rounded-2xl shadow-2xl p-4 max-w-4xl w-full relative flex flex-col items-center border-4 border-yellow-400 animate-fadeIn">
            <button 
              onClick={handleCloseModal} 
              className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-200 text-2xl font-bold z-10"
            >
              ×
            </button>
            
            <div className="flex flex-col md:flex-row items-start w-full gap-4 mb-4">
              <div className="w-full md:w-1/3">
                <img 
                  src={modalPoster} 
                  alt={modalTitle} 
                  className="w-full h-auto object-cover rounded-xl shadow-lg border-2 border-yellow-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/300x450?text=No+Poster&font=roboto';
                  }}
                />
              </div>
              
              <div className="flex-1 flex flex-col gap-3">
                <h3 className="text-2xl font-bold text-yellow-400">{modalTitle}</h3>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {modalYear && (
                    <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full text-sm">
                      {modalYear}
                    </span>
                  )}
                  {modalCountry && (
                    <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full text-sm">
                      {modalCountry}
                    </span>
                  )}
                  {modalRating && (
                    <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      {modalRating}/10
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {modalGenres.map((genre, idx) => (
                    <span 
                      key={idx}
                      className="bg-yellow-400 text-black px-2 py-1 rounded-full text-sm font-semibold"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-300 mt-2">{modalOverview}</p>
              </div>
            </div>
            
            <div className="w-full aspect-video rounded-xl overflow-hidden border-2 border-yellow-400">
              {loadingTrailer ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <div className="text-yellow-400 text-lg animate-pulse">Đang tải trailer...</div>
                </div>
              ) : modalTrailerId ? (
                <YouTube
                  videoId={modalTrailerId}
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 1,
                      modestbranding: 1,
                      controls: 1,
                      origin: window.location.origin
                    }
                  }}
                  onReady={(event) => {
                    console.log('YouTube Player Ready:', event);
                  }}
                  onError={(error) => {
                    console.error('YouTube Player Error:', error);
                    setModalOverview('Không thể phát trailer. Vui lòng thử lại sau.');
                  }}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <div className="text-yellow-400 text-lg">Không tìm thấy trailer</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieGridCarousel; 