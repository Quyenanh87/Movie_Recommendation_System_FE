import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const MovieCarousel = ({ title, movies, posters }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const moviesPerPage = 4;
  const totalPages = Math.ceil(movies.length / moviesPerPage);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= totalPages ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? totalPages - 1 : prevIndex - 1
    );
  };

  const visibleMovies = movies.slice(
    currentIndex * moviesPerPage,
    (currentIndex + 1) * moviesPerPage
  );

  return (
    <div className="mb-10 relative">
      <h3 className="text-2xl font-movie-section text-yellow-300 mb-3 flex items-center gap-2">
        {title}
      </h3>
      
      <div className="relative group">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
        >
          <FaChevronLeft size={20} />
        </button>

        {/* Movies Grid */}
        <div className="grid grid-cols-4 gap-4 px-8">
          {visibleMovies.map((movie, index) => (
            <div
              key={index}
              className="bg-white border-2 border-transparent rounded-xl shadow-xl hover:shadow-2xl transition-all p-3 flex flex-col items-center transform hover:scale-105 hover:border-yellow-300 duration-300"
            >
              {posters[movie] ? (
                <img
                  src={posters[movie]}
                  alt={movie}
                  className="w-full h-64 object-cover rounded-lg mb-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-gray-500">No Poster</span>
                </div>
              )}
              <span className="text-center text-sm font-medium mt-2 line-clamp-2">{movie}</span>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
        >
          <FaChevronRight size={20} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === index ? 'bg-blue-600 w-4' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MovieCarousel; 