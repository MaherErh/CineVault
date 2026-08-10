// storage.js - alles wat met localStorage te maken heeft

// favorieten ophalen uit localStorage
export function getFavourites() {
  const data = localStorage.getItem('cinevault_favourites')
  if (data) {
    return JSON.parse(data)
  }
  return []
}

// film toevoegen aan favorieten
export function addFavourite(movie) {
  const favs = getFavourites()

  // checken of film al in favorieten zit
  const alreadyAdded = favs.some(f => f.id === movie.id)
  if (alreadyAdded) return false

  favs.unshift(movie)
  localStorage.setItem('cinevault_favourites', JSON.stringify(favs))
  return true
}

// film verwijderen uit favorieten
export function removeFavourite(movieId) {
  const favs = getFavourites().filter(f => f.id !== movieId)
  localStorage.setItem('cinevault_favourites', JSON.stringify(favs))
}

// checken of een film al in favorieten zit
export function isFavourite(movieId) {
  const favs = getFavourites()
  return favs.some(f => f.id === movieId)
}

// alle favorieten verwijderen
export function clearFavourites() {
  localStorage.removeItem('cinevault_favourites')
}

// gebruikersvoorkeuren ophalen
export function getPreferences() {
  const data = localStorage.getItem('cinevault_preferences')
  if (data) {
    return JSON.parse(data)
  }
  // standaard waarden
  return {
    theme: 'light',
    viewMode: 'grid',
    lastSort: 'popularity.desc'
  }
}

// gebruikersvoorkeuren opslaan
export function savePreferences(updates) {
  const current = getPreferences()
  const newPrefs = { ...current, ...updates }
  localStorage.setItem('cinevault_preferences', JSON.stringify(newPrefs))
}

// genres cachen zodat we ze niet elke keer opnieuw hoeven op te halen
export function getCachedGenres() {
  const data = localStorage.getItem('cinevault_genres')
  if (!data) return null

  const parsed = JSON.parse(data)
  const oneHour = 1000 * 60 * 60

  // cache vervalt na 1 uur
  if (Date.now() - parsed.timestamp > oneHour) return null

  return parsed.genres
}

// genres opslaan in cache
export function setCachedGenres(genres) {
  const data = {
    genres: genres,
    timestamp: Date.now()
  }
  localStorage.setItem('cinevault_genres', JSON.stringify(data))
}