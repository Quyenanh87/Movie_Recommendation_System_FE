const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Loại bỏ năm "(1999)" nếu có
function cleanTitle(title) {
  return title.replace(/\s*\(\d{4}\)/, '').trim();
}

export async function fetchPosterUrl(movieTitle) {
  const clean = cleanTitle(movieTitle);
  const query = encodeURIComponent(clean);

  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`
  );
  const data = await res.json();

  if (data.results && data.results.length > 0) {
    const posterPath = data.results[0].poster_path;
    if (posterPath) {
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    }
  }

  return null;
}
