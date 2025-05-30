import React, { useState, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlay, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

async function getYouTubeTrailerId(query) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query + ' trailer')}&key=${YOUTUBE_API_KEY}`
  );
  const data = await res.json();
  if (data.items && data.items.length > 0) {
    return data.items[0].id.videoId;
  }
  return null;
}

const MovieGridCarousel = ({ title, movies, icon, autoSlide = false }) => {
  const [page, setPage] = useState(0);
  const moviesPerPage = 5;
  const totalPages = Math.ceil(movies.length / moviesPerPage);
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
    if (!autoSlide || totalPages <= 1) return;
    const interval = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoSlide, totalPages]);

  const handlePrev = () => {
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };
  const handleNext = () => {
    setPage((prev) => (prev + 1) % totalPages);
  };

  // Mở modal trailer
  const handleOpenTrailer = async (movieTitle) => {
    const movie = movies.find(m => m.title === movieTitle);
    setShowModal(true);
    setModalTitle(movieTitle);
    setModalOverview(movie?.overview || 'Không có mô tả cho phim này.');
    setModalPoster(movie?.poster || 'https://placehold.co/300x450?text=No+Poster&font=roboto');
    setLoadingTrailer(true);
    const trailerId = await getYouTubeTrailerId(movieTitle);
    setModalTrailerId(trailerId || '6ZfuNTqbHE8'); // fallback: Avengers trailer
    setLoadingTrailer(false);
    setModalYear(movie?.year || '');
    setModalCountry(movie?.country || '');
    setModalRating(movie?.rating ? movie.rating.toFixed(1) : '');
    setModalGenres(movie?.genres || []);
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

  // Tạo mảng các trang (mỗi trang là 1 mảng 5 phim)
  const pages = Array.from({ length: totalPages }, (_, i) =>
    movies.slice(i * moviesPerPage, i * moviesPerPage + moviesPerPage)
  );

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl text-yellow-400">{icon}</span>
        <h2 className="text-xl font-movie-section text-yellow-300 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="relative flex items-center">
        {totalPages > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-0 z-10 bg-black/60 text-yellow-300 p-2 rounded-full hover:bg-yellow-400 hover:text-black transition-all"
            style={{ transform: 'translateY(-50%)', top: '50%' }}
          >
            <FaChevronLeft size={20} />
          </button>
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
                {moviesInPage.map((movie, idx) => (
                  <div
                    key={idx}
                    className="bg-[#181c24] rounded-xl shadow-lg overflow-hidden flex flex-col hover:scale-105 hover:shadow-2xl transition-all border border-[#232526] group relative"
                  >
                    <div className="relative w-full h-64">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-64 object-cover"
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/300x450?text=No+Poster&font=roboto';
                        }}
                      />
                      {/* Nút xem phim */}
                      <button
                        onClick={() => handleOpenTrailer(movie.title)}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <span className="bg-yellow-400 text-black px-4 py-2 rounded-full flex items-center gap-2 font-bold text-lg shadow-lg hover:bg-yellow-500">
                          <FaPlay /> Xem trailer
                        </span>
                      </button>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div className="text-base font-bold text-white truncate mb-1" title={movie.title}>{movie.title}</div>
                      <div className="flex items-center gap-2 mb-1">
                        {movie.rating && (
                          <span className="text-yellow-400 text-sm font-bold">{movie.rating.toFixed(1)} / 10</span>
                        )}
                        {movie.year && (
                          <span className="text-gray-400 text-xs">{movie.year}</span>
                        )}
                        {movie.country && (
                          <span className="text-gray-500 text-xs">({movie.country})</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {movie.genres && movie.genres.length > 0 && movie.genres.slice(0, 3).map((g, i) => (
                          <span key={i} className="bg-yellow-300 text-black text-xs px-2 py-0.5 rounded-full font-semibold mr-1 mb-1">{g}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {totalPages > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-0 z-10 bg-black/60 text-yellow-300 p-2 rounded-full hover:bg-yellow-400 hover:text-black transition-all"
            style={{ transform: 'translateY(-50%)', top: '50%' }}
          >
            <FaChevronRight size={20} />
          </button>
        )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#232526] rounded-2xl shadow-2xl p-0 max-w-2xl w-full relative flex flex-col items-center border-4 border-yellow-400 animate-fadeIn">
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-200 text-2xl font-bold">×</button>
            <div className="flex flex-col md:flex-row items-center w-full p-4 gap-4">
              <img src={modalPoster} alt={modalTitle} className="w-32 h-48 object-cover rounded-xl shadow-lg border-2 border-yellow-300 mb-2 md:mb-0" />
              <div className="flex-1 flex flex-col items-center md:items-start justify-center gap-2">
                <div className="text-2xl font-extrabold text-yellow-300 mb-1 text-center md:text-left drop-shadow-lg">{modalTitle}</div>
                <div className="flex flex-wrap gap-3 mb-1 text-sm">
                  {modalYear && <span className="bg-gray-700 text-yellow-200 px-2 py-0.5 rounded font-semibold">Năm: {modalYear}</span>}
                  {modalCountry && <span className="bg-gray-700 text-yellow-200 px-2 py-0.5 rounded font-semibold">Quốc gia: {modalCountry}</span>}
                  {modalRating && <span className="bg-yellow-400 text-black px-2 py-0.5 rounded font-bold">★ {modalRating} / 10</span>}
                </div>
                <div className="flex flex-wrap gap-2 mb-1">
                  {modalGenres && modalGenres.length > 0 && modalGenres.map((g, i) => (
                    <span key={i} className="bg-yellow-300 text-black text-xs px-2 py-0.5 rounded-full font-semibold mb-1">{g}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full rounded-xl overflow-hidden flex items-center justify-center mb-4 px-2" style={{height: 400}}>
              {loadingTrailer ? (
                <div className="text-yellow-400 text-lg">Đang tìm trailer...</div>
              ) : (
                <YouTube videoId={modalTrailerId} opts={{ width: '100%', height: '400', playerVars: { autoplay: 1 } }} className="w-full h-full" />
              )}
            </div>
            <div className="w-full text-gray-200 text-base mb-4 px-4 text-center">
              <span className="font-bold text-yellow-300">Mô tả phim:</span> {modalOverview || 'Không có mô tả cho phim này.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieGridCarousel; 