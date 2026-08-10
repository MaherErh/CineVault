# 🎬 CineVault — Movie Explorer

Interactieve Single Page Applicatie gebouwd met Vite en Vanilla JavaScript die gebruik maakt van de TMDB API.

---

## 1. Projectbeschrijving en functionaliteiten

CineVault laat gebruikers films ontdekken, filteren en opslaan als favoriet.

- 🔍 Zoeken op filmtitel
- 🎭 Filteren op genre, jaar en minimale beoordeling
- 🔃 Sorteren op populariteit, rating of datum
- ❤️ Films opslaan als favoriet (blijft bewaard)
- 🌙 Dark mode (wordt onthouden)
- ⊞ Grid of lijstweergave
- 🎬 Filmdetails met cast, trailer en gerelateerde films
- 📄 Paginering door resultaten

---

## 2. Gebruikte API

**The Movie Database (TMDB)**
- Website: https://www.themoviedb.org
- Docs: https://developer.themoviedb.org/docs

Gebruikte endpoints:
- `GET /discover/movie` — films ophalen met filters
- `GET /search/movie` — zoeken op naam
- `GET /movie/{id}` — filmdetails met cast en trailer
- `GET /genre/movie/list` — lijst van alle genres

---

## 3. Technische vereisten

| Vereiste | Bestand | Lijn | Uitleg |
|---|---|---|---|
| **Elementen selecteren** | `src/js/main.js` | 44 | `document.getElementById` voor alle UI elementen |
| **Elementen manipuleren** | `src/js/main.js` | 120 | `.innerHTML` voor movieGrid en pagination |
| **Events koppelen** | `src/js/main.js` | 160 | `addEventListener` op filters, knoppen en kaarten |
| **Constanten** | `src/js/api.js` | 1 | `const BASE_URL` en `const API_KEY` |
| **Template literals** | `src/components/movieCard.js` | 20 | HTML opbouwen met backticks en `${}` |
| **Iteratie over arrays** | `src/js/main.js` | 125 | `.map()` over movies array |
| **Array methodes** | `src/js/storage.js` | 35 | `.filter()`, `.find()`, `.some()`, `.unshift()` |
| **Arrow functions** | `src/js/main.js` | overal | Alle callbacks geschreven als arrow functions |
| **Ternary operator** | `src/components/movieCard.js` | 17 | `rating ? rating.toFixed(1) : 'N/A'` |
| **Callback functions** | `src/js/main.js` | 159 | `setTimeout(() => loadMovies(), 400)` debounce |
| **Promises** | `src/js/api.js` | 28 | `fetch()` geeft een Promise terug |
| **Async & Await** | `src/js/main.js` | 80 | `async function loadMovies()` met `await` |
| **Observer API** | `src/js/main.js` | 253 | `IntersectionObserver` voor kaart animaties bij scrollen |
| **Fetch** | `src/js/api.js` | 28 | Data ophalen van TMDB met Authorization header |
| **JSON** | `src/js/api.js` | 43 | `.json()` parsen van API response |
| **LocalStorage** | `src/js/storage.js` | 1 | Favorieten, thema en voorkeuren bewaren |
| **Formulier validatie** | `src/js/main.js` | 140 | Lege zoekopdracht wordt geblokkeerd |
| **Flexbox** | `src/css/global.css` | 120 | Header en filters layout |
| **CSS Grid** | `src/css/components.css` | 10 | Movie grid layout |
| **Vite** | `package.json` | — | Build tool en development server |

---

## 4. Installatiehandleiding

```bash
# Clone de repository
git clone https://github.com/MaherErh/CineVault.git

# Ga naar de map
cd CineVault

# Installeer dependencies
npm install

# Start de app
npm run dev
```

Open daarna **http://localhost:5173** in je browser.

---

## 5. Screenshots

> Worden toegevoegd na voltooiing van de applicatie.

---

## 6. Bronnen

- TMDB API documentatie: https://developer.themoviedb.org/docs
- MDN Web Docs: https://developer.mozilla.org
- Vite documentatie: https://vitejs.dev
- Google Fonts: https://fonts.google.com
- AI hulp: Claude (Anthropic) — hulp bij projectstructuur en code
- Chatlog: https://claude.ai/share (link toevoegen na voltooiing)