import { useEffect, useState } from "react"

import Loader from "./components/Loader.jsx"
import ErrorMessage from "./components/ErrorMessage.jsx"
import Navbar from "./components/Navbar.jsx"
import Logo from "./components/Logo.jsx"
import Search from "./components/Search.jsx"
import Numresults from "./components/Numresults.jsx"
import StarRating from "./components/StarRating.jsx"

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0)

const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY

export default function App() {
    const [query, setQuery] = useState("Inception")
    const [movies, setMovies] = useState([])
    const [watched, setWatched] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedId, setSelectedId] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchMovies() {
            try {
                setIsLoading(true)
                setError(null)
                const res = await fetch(
                    `https://www.omdbapi.com/?s=${query}&apikey=${REACT_APP_API_KEY}`,
                )
                if (!res.ok) {
                    throw new Error(
                        "Something went wrong while fetching movies",
                    )
                }
                const data = await res.json()
                if (data.Response === "False") {
                    throw new Error("Movie not found")
                }
                setMovies(data.Search)
            } catch (err) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        if (query.length < 3) {
            setMovies([])
            setError("")
            return
        }

        fetchMovies()
    }, [query])

    function handleSelectedId(id) {
        setSelectedId((selectedId) => (selectedId === id ? null : id))
    }

    function handleCloseMovie() {
        setSelectedId(null)
    }

    return (
        <>
            <Navbar>
                <Logo />
                <Search query={query} setQuery={setQuery} />
                <Numresults movies={movies} />
            </Navbar>
            <Main>
                <Box>
                    {isLoading && <Loader />}
                    {!isLoading && !error && (
                        <Movielist
                            movies={movies}
                            onSelectMovie={handleSelectedId}
                        />
                    )}
                    {error && <ErrorMessage message={error} />}
                </Box>
                <Box>
                    {selectedId ? (
                        <SelectedMovie
                            selectedId={selectedId}
                            onCloseMovie={handleCloseMovie}
                        />
                    ) : (
                        <>
                            <WatchedSummary watched={watched} />
                            <WatchedMoviesList watched={watched} />
                        </>
                    )}
                </Box>
            </Main>
        </>
    )
}

function Main({ children }) {
    return <main className="main">{children}</main>
}

function Box({ children }) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="box">
            <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? "–" : "+"}
            </button>
            {isOpen && children}
        </div>
    )
}

function Movielist({ movies, onSelectMovie }) {
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <Movie
                    key={movie.imdbID}
                    movie={movie}
                    onSelectMovie={onSelectMovie}
                />
            ))}
        </ul>
    )
}

function Movie({ movie, onSelectMovie }) {
    return (
        <li onClick={() => onSelectMovie(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    )
}

function SelectedMovie({ selectedId, onCloseMovie }) {
    const [movie, setMovie] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre,
    } = movie

    console.log(title, year, genre)

    useEffect(() => {
        async function fetchMovieDetails() {
            setIsLoading(true)
            const res = await fetch(
                `https://www.omdbapi.com/?i=${selectedId}&apikey=${REACT_APP_API_KEY}`,
            )
            const data = await res.json()
            setMovie(data)
            setIsLoading(false)
        }
        fetchMovieDetails()
    }, [selectedId])

    return (
        <div className="details">
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <header>
                        <button
                            className="btn-back"
                            onClick={() => onCloseMovie()}
                        >
                            &larr;
                        </button>
                        <img src={poster} alt={`Poster of ${title} movie`} />
                        <div className="details-overview">
                            <h2>{title}</h2>
                            <p>
                                {released} &bull; {runtime}
                            </p>
                            <p>{genre}</p>
                            <p>
                                <span>⭐</span>
                                {imdbRating} IMDb rating
                            </p>
                        </div>
                    </header>
                    <section>
                        <div className="rating">
                            <StarRating maxRating={10} size={24} />
                        </div>
                        <p>
                            <em>{plot}</em>
                        </p>
                        <p>Starring {actors}</p>
                        <p>Directed by {director}</p>
                    </section>
                </>
            )}
        </div>
    )
}

function WatchedMoviesList({ watched }) {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <WatchedMovie key={movie.imdbID} movie={movie} />
            ))}
        </ul>
    )
}

function WatchedMovie({ key, movie }) {
    return (
        <li key={movie.imdbID}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>
            </div>
        </li>
    )
}

function WatchedSummary({ watched }) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating))
    const avgUserRating = average(watched.map((movie) => movie.userRating))
    const avgRuntime = average(watched.map((movie) => movie.runtime))
    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                </p>
            </div>
        </div>
    )
}
