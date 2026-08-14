// movieCard.js - bouwt een film kaart op als HTML

import { getPosterUrl } from '../js/api.js'
import { isFavourite } from '../js/storage.js'

export function buildMovieCard(movie, genreMap, mode = 'grid') {
  const poster = getPosterUrl(movie.poster_path)
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '—'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'
  const isFav = isFavourite(movie.id)

  // genres ophalen via de genreMap
  const genres = (movie.genre_ids ?? [])
    .slice(0, 3)
    .map(id => genreMap.get(id))
    .filter(Boolean)

  const genreHtml = genres.map(g => `<span class="genre-chip">${g}</span>`).join('')

  const posterHtml = poster
    ? `<img class="card-poster" src="${poster}" alt="${movie.title}" loading="lazy" />`
    : `<div class="card-poster card-poster--placeholder">🎬</div>`

  // lijstweergave
  if (mode === 'list') {
    return `
      <article class="movie-card movie-card--list" data-id="${movie.id}" tabindex="0">
        ${posterHtml}
        <div class="card-info card-info--list">
          <div class="card-top">
            <h3 class="card-title">${movie.title}</h3>
            <button type="button" class="fav-btn ${isFav ? 'fav-btn--active' : ''}" data-id="${movie.id}">
              ${isFav ? '❤️' : '🤍'}
            </button>
          </div>
          <div class="card-meta">
            <span class="card-year">${year}</span>
            <span class="card-rating">★ ${rating}</span>
            <span class="card-votes">${movie.vote_count ?? 0} votes</span>
          </div>
          <div class="card-genres">${genreHtml}</div>
          <p class="card-overview">${movie.overview ? movie.overview.slice(0, 200) + '…' : 'No description available.'}</p>
        </div>
      </article>
    `
  }

  // gridweergave
  return `
    <article class="movie-card" data-id="${movie.id}" tabindex="0">
      <div class="card-poster-wrap">
        ${posterHtml}
        <button type="button" class="fav-btn ${isFav ? 'fav-btn--active' : ''}" data-id="${movie.id}">
          ${isFav ? '❤️' : '🤍'}
        </button>
        <span class="card-rating">★ ${rating}</span>
      </div>
      <div class="card-info">
        <h3 class="card-title">${movie.title}</h3>
        <div class="card-meta">
          <span class="card-year">${year}</span>
          <span class="card-votes">${movie.vote_count ?? 0} votes</span>
        </div>
        <div class="card-genres">${genreHtml}</div>
      </div>
    </article>
  `
}