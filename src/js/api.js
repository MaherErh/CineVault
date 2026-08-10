// api.js - alle calls naar de TMDB API

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4YTkzNzY3NjZiNzUyNDYxZTg4ZGM2NGNmNjNmMTQwMiIsIm5iZiI6MTc0ODYyNzAyMy4xNzgsInN1YiI6IjY4MzUwMzNmOGM3MzZmYzJmOTk0OWZiMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.cWmYkY1H0vFWCkKpRHPjMXZ7kBkVLkfJ3gDPJq9W1C4'

export const IMAGE_URL = 'https://image.tmdb.org/t/p'

// films ophalen met filters
export async function getMovies(page = 1, sortBy = 'popularity.desc', genreId = '', year = '', minRating = '') {
  let url = `${BASE_URL}/discover/movie?page=${page}&sort_by=${sortBy}&language=en-US`

  if (genreId) url += `&with_genres=${genreId}`
  if (year) url += `&primary_release_year=${year}`
  if (minRating) url += `&vote_average.gte=${minRating}&vote_count.gte=100`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  })

  const data = await response.json()
  return data
}

// films zoeken op naam
export async function searchMovies(query, page = 1) {
  const url = `${BASE_URL}/search/movie?query=${query}&page=${page}&language=en-US`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  })

  const data = await response.json()
  return data
}

// details van één film ophalen
export async function getMovieDetails(movieId) {
  const url = `${BASE_URL}/movie/${movieId}?append_to_response=credits,videos,similar&language=en-US`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  })

  const data = await response.json()
  return data
}

// alle genres ophalen
export async function getGenres() {
  const url = `${BASE_URL}/genre/movie/list?language=en-US`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  })

  const data = await response.json()
  return data.genres
}

// poster url maken
export function getPosterUrl(path) {
  if (!path) return null
  return `${IMAGE_URL}/w500${path}`
}

// backdrop url maken
export function getBackdropUrl(path) {
  if (!path) return null
  return `${IMAGE_URL}/w1280${path}`
}