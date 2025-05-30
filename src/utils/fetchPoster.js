const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Loại bỏ năm "(1999)" nếu có
function cleanTitle(title) {
  return title.replace(/\s*\(\d{4}\)/, '').trim();
}

// Lấy danh sách genres từ TMDB (có thể cache lại)
let genreMap = null;
async function getGenreMap() {
  if (genreMap) return genreMap;
  const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`);
  const data = await res.json();
  genreMap = {};
  if (data.genres) {
    data.genres.forEach(g => { genreMap[g.id] = g.name; });
  }
  return genreMap;
}

export async function fetchMovieInfo(movieTitle) {
  const clean = cleanTitle(movieTitle);
  const query = encodeURIComponent(clean);

  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`
  );
  const data = await res.json();

  if (data.results && data.results.length > 0) {
    const m = data.results[0];
    
    // Lấy thêm thông tin chi tiết của phim để có production_countries
    const detailRes = await fetch(
      `https://api.themoviedb.org/3/movie/${m.id}?api_key=${API_KEY}`
    );
    const detailData = await detailRes.json();
    
    const poster = m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://placehold.co/300x450?text=No+Poster&font=roboto';
    const rating = m.vote_average || null;
    const year = m.release_date ? m.release_date.slice(0, 4) : null;
    const genreIds = m.genre_ids || [];
    // Lấy mã quốc gia từ production_countries
    const country = detailData.production_countries && detailData.production_countries.length > 0 
      ? detailData.production_countries[0].iso_3166_1 
      : null;
    const overview = m.overview || '';
    const genres = [];
    const genreMap = await getGenreMap();
    genreIds.forEach(id => { if (genreMap[id]) genres.push(genreMap[id]); });
    return { poster, rating, genres, year, country, overview };
  }

  // Trả về placeholder nếu không có
  return { poster: 'https://placehold.co/300x450?text=No+Poster&font=roboto', rating: null, genres: [], year: null, country: null, overview: '' };
}
