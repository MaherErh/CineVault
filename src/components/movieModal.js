// movieModal.js - toont de volledige details van een film

import { getBackdropUrl, getPosterUrl } from '../js/api.js'
import { isFavourite, addFavourite, removeFavourite } from '../js/storage.js'

export function renderModal(movie, onFavToggle) {
  const backdrop = getBackdropUrl(movie.backdrop_path)
  const poster = getPosterUrl(movie.poster_path)
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '—'
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '—'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'
  const isFav = isFavourite(movie.id)

  // eerste 6 acteurs ophalen
  const cast = movie.credits?.cast?.slice(0, 6) ?? []
  const castHtml = cast.map(person => `
    <div class="cast-member">
      ${person.profile_path
        ? `<img class="cast-photo" src="https://image.tmdb.org/t/p/w92${person.profile_path}" alt="${person.name}" loading="lazy" />`
        : `<div class="cast-photo cast-photo--placeholder">👤</div>`
      }
      <span class="cast-name">${person.name}</span>
      <span class="cast-role">${person.character}</span>
    </div>
  `).join('')

  // trailer zoeken
  const trailer = movie.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')
  const trailerHtml = trailer
    ? `<a class="trailer-link" href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank">▶ Watch Trailer</a>`
    : ''

  // genres
  const genres = movie.genres?.map(g => `<span class="genre-chip">${g.name}</span>`).join('') ?? ''

  // gerelateerde films
  const similar = movie.similar?.results?.slice(0, 4) ?? []
  const similarHtml = similar.map(m => `
    <button type="button" class="similar-card" data-id="${m.id}">
      ${m.poster_path
        ? `<img src="https://image.tmdb.org/t/p/w154${m.poster_path}" alt="${m.title}" loading="lazy" />`
        : `<div class="similar-placeholder">🎬</div>`
      }
      <span class="similar-title">${m.title}</span>
    </button>
  `).join('')

  const modalBody = document.getElementById('modal-body')
  modalBody.innerHTML = `
    ${backdrop ? `<div class="modal-backdrop" style="background-image: url('${backdrop}')"></div>` : ''}
    <div class="modal-content">
      <div class="modal-hero">
        ${poster ? `<img class="modal-poster" src="${poster}" alt="${movie.title}" />` : ''}
        <div class="modal-hero-info">
          <h2 class="modal-title">${movie.title}</h2>
          ${movie.tagline ? `<p class="modal-tagline">"${movie.tagline}"</p>` : ''}
          <div class="modal-meta">
            <span>📅 ${year}</span>
            <span>⏱ ${runtime}</span>
            <span class="modal-rating">★ ${rating}/10</span>
            <span>(${movie.vote_count?.toLocaleString()} votes)</span>
          </div>
          <div class="modal-genres">${genres}</div>
          <div class="modal-actions">
            <button type="button" class="btn-fav-modal ${isFav ? 'btn-fav-modal--active' : ''}" id="modal-fav-btn" data-id="${movie.id}">
              ${isFav ? '❤️ In Favourites' : '🤍 Add to Favourites'}
            </button>
            ${trailerHtml}
          </div>
        </div>
      </div>

      <div class="modal-section">
        <h3 class="modal-section-title">Overview</h3>
        <p class="modal-overview">${movie.overview || 'No description available.'}</p>
      </div>

      ${cast.length > 0 ? `
        <div class="modal-section">
          <h3 class="modal-section-title">Cast</h3>
          <div class="cast-grid">${castHtml}</div>
        </div>
      ` : ''}

      ${similar.length > 0 ? `
        <div class="modal-section">
          <h3 class="modal-section-title">Similar movies</h3>
          <div class="similar-grid">${similarHtml}</div>
        </div>
      ` : ''}

      <div class="modal-footer">
        <a class="modal-tmdb-link" href="https://www.themoviedb.org/movie/${movie.id}" target="_blank">
          View on TMDB →
        </a>
      </div>
    </div>
  `

  // favoriet knop in de modal
  document.getElementById('modal-fav-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('modal-fav-btn')
    if (isFavourite(movie.id)) {
      removeFavourite(movie.id)
      btn.textContent = '🤍 Add to Favourites'
      btn.classList.remove('btn-fav-modal--active')
    } else {
      addFavourite(movie)
      btn.textContent = '❤️ In Favourites'
      btn.classList.add('btn-fav-modal--active')
    }
    onFavToggle?.(movie.id)
  })
}