// main.js - hoofdbestand van de applicatie

import '../css/global.css'
import '../css/components.css'
import '../css/modal.css'

import { getMovies, searchMovies, getMovieDetails, getGenres } from './api.js'
import { getFavourites, addFavourite, removeFavourite, isFavourite, clearFavourites, getPreferences, savePreferences, getCachedGenres, setCachedGenres } from './storage.js'
import { buildMovieCard } from '../components/movieCard.js'
import { renderModal } from '../components/movieModal.js'

// ============================================================
// STATE - huidige toestand van de app
// ============================================================
const prefs = getPreferences()

let movies = []
let currentPage = 1
let totalPages = 1
let totalResults = 0
let searchQuery = ''
let genreId = ''
let year = ''
let minRating = ''
let sortBy = prefs.lastSort
let viewMode = prefs.viewMode
let currentView = 'discover'
let genreMap = new Map()

// ============================================================
// DOM ELEMENTEN SELECTEREN
// ============================================================
const movieGrid = document.getElementById('movie-grid')
const favGrid = document.getElementById('fav-grid')
const favEmpty = document.getElementById('fav-empty')
const resultsCount = document.getElementById('results-count')
const paginationEl = document.getElementById('pagination')
const searchInput = document.getElementById('search-input')
const searchClear = document.getElementById('search-clear')
const genreFilter = document.getElementById('genre-filter')
const yearFilter = document.getElementById('year-filter')
const ratingFilter = document.getElementById('rating-filter')
const sortSelect = document.getElementById('sort-select')
const resetBtn = document.getElementById('reset-filters')
const activeFiltersEl = document.getElementById('active-filters')
const favCount = document.getElementById('fav-count')
const themeToggle = document.getElementById('theme-toggle')
const gridViewBtn = document.getElementById('grid-view-btn')
const listViewBtn = document.getElementById('list-view-btn')
const modalOverlay = document.getElementById('modal-overlay')
const modalClose = document.getElementById('modal-close')
const toast = document.getElementById('toast')
const clearAllBtn = document.getElementById('clear-all-favs')

// ============================================================
// APP STARTEN
// ============================================================
async function init() {
  // thema toepassen
  if (prefs.theme === 'dark') {
    document.body.classList.add('dark')
    themeToggle.textContent = '☀️'
  }

  // sortering instellen
  sortSelect.value = sortBy

  // weergavemodus instellen
  applyViewMode(viewMode)

  // genres ophalen (eerst uit cache)
  let genres = getCachedGenres()
  if (!genres) {
    genres = await getGenres()
    setCachedGenres(genres)
  }

  // genres in dropdown zetten
  genres.forEach(g => {
    genreMap.set(g.id, g.name)
    const option = document.createElement('option')
    option.value = g.id
    option.textContent = g.name
    genreFilter.appendChild(option)
  })

  // jaren in dropdown zetten
  const currentYear = new Date().getFullYear()
  for (let y = currentYear; y >= currentYear - 30; y--) {
    const option = document.createElement('option')
    option.value = y
    option.textContent = y
    yearFilter.appendChild(option)
  }

  // favorieten tellen
  updateFavCount()

  // intersection observer instellen voor animaties
  setupObserver()

  // films laden
  await loadMovies()
}

// ============================================================
// FILMS LADEN
// ============================================================
async function loadMovies() {
  showLoading()

  try {
    let data

    if (searchQuery.trim()) {
      data = await searchMovies(searchQuery, currentPage)
    } else {
      data = await getMovies(currentPage, sortBy, genreId, year, minRating)
    }

    movies = data.results ?? []
    totalPages = Math.min(data.total_pages ?? 1, 500)
    totalResults = data.total_results ?? 0

    renderMovies()
    renderPagination()
    renderResultsCount()
    renderActiveFilters()

  } catch (err) {
    console.error('Fout bij laden films:', err)
    movieGrid.innerHTML = `
      <div class="error-state">
        <span>😕</span>
        <p class="empty-title">Kon films niet laden</p>
        <p class="empty-text">Controleer je internetverbinding en probeer opnieuw.</p>
      </div>
    `
  }
}

// ============================================================
// FILMS WEERGEVEN
// ============================================================
function renderMovies() {
  if (movies.length === 0) {
    movieGrid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🎬</span>
        <p class="empty-title">Geen films gevonden</p>
        <p class="empty-text">Pas je filters aan of zoek op een andere term.</p>
      </div>
    `
    return
  }

  movieGrid.innerHTML = movies.map(movie => buildMovieCard(movie, genreMap, viewMode)).join('')
  movieGrid.className = viewMode === 'list' ? 'movie-grid movie-grid--list' : 'movie-grid'

  // events koppelen aan kaarten
  attachCardEvents(movieGrid)
}

function attachCardEvents(container) {
  // klik op kaart opent modal
  container.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.fav-btn')) return
      openModal(parseInt(card.dataset.id))
    })
  })

  // klik op favoriet knop
  container.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      toggleFavourite(parseInt(btn.dataset.id))
    })
  })
}

// ============================================================
// FAVORIETEN
// ============================================================
function toggleFavourite(movieId) {
  const movie = movies.find(m => m.id === movieId) ?? getFavourites().find(f => f.id === movieId)

  if (isFavourite(movieId)) {
    removeFavourite(movieId)
    showToast('Verwijderd uit favorieten')
  } else if (movie) {
    addFavourite(movie)
    showToast('Toegevoegd aan favorieten ❤️')
  }

  // alle favoriet knoppen updaten
  document.querySelectorAll(`.fav-btn[data-id="${movieId}"]`).forEach(btn => {
    btn.textContent = isFavourite(movieId) ? '❤️' : '🤍'
    btn.classList.toggle('fav-btn--active', isFavourite(movieId))
  })

  updateFavCount()

  if (currentView === 'favourites') renderFavourites()
}

function renderFavourites() {
  const favs = getFavourites()

  if (favs.length === 0) {
    favGrid.innerHTML = ''
    favEmpty.classList.remove('hidden')
    return
  }

  favEmpty.classList.add('hidden')
  favGrid.innerHTML = favs.map(movie => buildMovieCard(movie, genreMap, viewMode)).join('')
  favGrid.className = viewMode === 'list' ? 'movie-grid movie-grid--list' : 'movie-grid'

  attachCardEvents(favGrid)
}

function updateFavCount() {
  const count = getFavourites().length
  favCount.textContent = count
  favCount.classList.toggle('hidden', count === 0)
}

// ============================================================
// MODAL
// ============================================================
async function openModal(movieId) {
  modalOverlay.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
  document.getElementById('modal-body').innerHTML = `<div class="modal-loading">Laden...</div>`

  try {
    const movie = await getMovieDetails(movieId)
    renderModal(movie, (id) => {
      document.querySelectorAll(`.fav-btn[data-id="${id}"]`).forEach(btn => {
        btn.textContent = isFavourite(id) ? '❤️' : '🤍'
        btn.classList.toggle('fav-btn--active', isFavourite(id))
      })
      updateFavCount()
    })

    // klik op gerelateerde film
    document.querySelectorAll('.similar-card').forEach(card => {
      card.addEventListener('click', () => openModal(parseInt(card.dataset.id)))
    })

  } catch (err) {
    document.getElementById('modal-body').innerHTML = `<p class="modal-loading">Kon details niet laden.</p>`
  }
}

function closeModal() {
  modalOverlay.classList.add('hidden')
  document.body.style.overflow = ''
}

// ============================================================
// ZOEKEN
// ============================================================
let searchTimeout = null

searchInput.addEventListener('input', () => {
  searchClear.classList.toggle('hidden', !searchInput.value)

  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchQuery = searchInput.value.trim()
    currentPage = 1
    loadMovies()
  }, 400)
})

searchClear.addEventListener('click', () => {
  searchInput.value = ''
  searchClear.classList.add('hidden')
  searchQuery = ''
  currentPage = 1
  loadMovies()
})

// ============================================================
// FILTERS EN SORTERING
// ============================================================
genreFilter.addEventListener('change', () => {
  genreId = genreFilter.value
  currentPage = 1
  loadMovies()
})

yearFilter.addEventListener('change', () => {
  year = yearFilter.value
  currentPage = 1
  loadMovies()
})

ratingFilter.addEventListener('change', () => {
  minRating = ratingFilter.value
  currentPage = 1
  loadMovies()
})

sortSelect.addEventListener('change', () => {
  sortBy = sortSelect.value
  currentPage = 1
  savePreferences({ lastSort: sortBy })
  loadMovies()
})

resetBtn.addEventListener('click', () => {
  genreId = ''
  year = ''
  minRating = ''
  sortBy = 'popularity.desc'
  searchQuery = ''
  currentPage = 1
  genreFilter.value = ''
  yearFilter.value = ''
  ratingFilter.value = ''
  sortSelect.value = 'popularity.desc'
  searchInput.value = ''
  searchClear.classList.add('hidden')
  loadMovies()
})

function renderResultsCount() {
  resultsCount.textContent = searchQuery
    ? `${totalResults.toLocaleString()} resultaten voor "${searchQuery}"`
    : `${totalResults.toLocaleString()} films gevonden`
}

function renderActiveFilters() {
  const chips = []

  if (genreId) {
    chips.push({
      label: `Genre: ${genreMap.get(parseInt(genreId))}`,
      clear: () => { genreId = ''; genreFilter.value = '' }
    })
  }
  if (year) {
    chips.push({
      label: `Jaar: ${year}`,
      clear: () => { year = ''; yearFilter.value = '' }
    })
  }
  if (minRating) {
    chips.push({
      label: `Rating: ${minRating}+`,
      clear: () => { minRating = ''; ratingFilter.value = '' }
    })
  }

  activeFiltersEl.innerHTML = chips.map((c, i) =>
    `<button type="button" class="active-filter-chip" data-index="${i}">${c.label} ✕</button>`
  ).join('')

  activeFiltersEl.querySelectorAll('.active-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      chips[parseInt(btn.dataset.index)].clear()
      currentPage = 1
      loadMovies()
    })
  })
}

// ============================================================
// PAGINERING
// ============================================================
function renderPagination() {
  if (totalPages <= 1) {
    paginationEl.innerHTML = ''
    return
  }

  const prev = currentPage > 1
  const next = currentPage < totalPages

  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, start + 4)

  let html = `<button type="button" class="page-btn" data-page="${currentPage - 1}" ${!prev ? 'disabled' : ''}>←</button>`

  if (start > 1) html += `<button type="button" class="page-btn" data-page="1">1</button><span class="page-ellipsis">…</span>`

  for (let i = start; i <= end; i++) {
    html += `<button type="button" class="page-btn ${i === currentPage ? 'page-btn--active' : ''}" data-page="${i}">${i}</button>`
  }

  if (end < totalPages) html += `<span class="page-ellipsis">…</span><button type="button" class="page-btn" data-page="${totalPages}">${totalPages}</button>`

  html += `<button type="button" class="page-btn" data-page="${currentPage + 1}" ${!next ? 'disabled' : ''}>→</button>`

  paginationEl.innerHTML = html

  paginationEl.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      loadMovies()
    })
  })
}

// ============================================================
// WEERGAVE WISSELEN (discover / favorieten)
// ============================================================
document.querySelectorAll('[data-view]').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view))
})

function switchView(view) {
  currentView = view

  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'))
  document.getElementById(`view-${view}`)?.classList.remove('hidden')

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('nav-btn--active'))
  document.querySelector(`.nav-btn[data-view="${view}"]`)?.classList.add('nav-btn--active')

  if (view === 'favourites') renderFavourites()
}

clearAllBtn.addEventListener('click', () => {
  if (confirm('Alle favorieten verwijderen?')) {
    clearFavourites()
    updateFavCount()
    renderFavourites()
    showToast('Alle favorieten verwijderd')
  }
})

// ============================================================
// GRID / LIJST WEERGAVE
// ============================================================
gridViewBtn.addEventListener('click', () => applyViewMode('grid'))
listViewBtn.addEventListener('click', () => applyViewMode('list'))

function applyViewMode(mode) {
  viewMode = mode
  savePreferences({ viewMode: mode })
  gridViewBtn.classList.toggle('view-btn--active', mode === 'grid')
  listViewBtn.classList.toggle('view-btn--active', mode === 'list')

  if (currentView === 'discover') renderMovies()
  else renderFavourites()
}

// ============================================================
// DARK MODE
// ============================================================
themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark')
  themeToggle.textContent = isDark ? '☀️' : '🌙'
  savePreferences({ theme: isDark ? 'dark' : 'light' })
})

// ============================================================
// MODAL EVENTS
// ============================================================
modalClose.addEventListener('click', closeModal)

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal()
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal()
})

// ============================================================
// TOAST MELDING
// ============================================================
let toastTimeout = null

function showToast(message) {
  toast.textContent = message
  toast.classList.remove('hidden')
  clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => toast.classList.add('hidden'), 2500)
}

// ============================================================
// SKELETON LOADING
// ============================================================
function showLoading() {
  movieGrid.innerHTML = Array(8).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton--poster"></div>
      <div class="skeleton skeleton--line"></div>
      <div class="skeleton skeleton--line skeleton--short"></div>
    </div>
  `).join('')
}

// ============================================================
// INTERSECTION OBSERVER - animatie bij scrollen
// ============================================================
function setupObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('card-visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  const gridObserver = new MutationObserver(() => {
    document.querySelectorAll('.movie-card:not(.card-visible)').forEach(card => {
      observer.observe(card)
    })
  })

  gridObserver.observe(movieGrid, { childList: true })
}

// ============================================================
// LOGO KLIK - terug naar discover
// ============================================================
document.getElementById('logo-link').addEventListener('click', (e) => {
  e.preventDefault()
  switchView('discover')
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// app starten
init()