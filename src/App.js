import { useEffect, useState } from "react"

import Loader from "./components/Loader.jsx"
import ErrorMessage from "./components/ErrorMessage.jsx"
import Navbar from "./components/Navbar.jsx"
import Logo from "./components/Logo.jsx"
import Search from "./components/Search.jsx"
import Numresults from "./components/Numresults.jsx"
import Main from "./components/Main.jsx"
import Box from "./components/Box.jsx"
import Movielist from "./components/MovieList.jsx"
import SelectedMovie from "./components/SelectedMovie.jsx"
import WatchedMoviesList from "./components/WatchedMoviesList.jsx"
import WatchedSummary from "./components/WatchedSummary.jsx"

const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY

export default function App() {
    const [query, setQuery] = useState("")
    const [movies, setMovies] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedId, setSelectedId] = useState(null)
    const [error, setError] = useState(null)

    //const [watched, setWatched] = useState([])
    const [watched, setWatched] = useState(function () {
        const storedWatched = localStorage.getItem("watched")
        return JSON.parse(storedWatched) || []
    })

    useEffect(() => {
        const controller = new AbortController() //Browser API
        async function fetchMovies() {
            try {
                setIsLoading(true)
                setError(null)
                const res = await fetch(
                    `https://www.omdbapi.com/?s=${query}&apikey=${REACT_APP_API_KEY}`,
                    { signal: controller.signal },
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
                setError(null)
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message)
                }
            } finally {
                setIsLoading(false)
            }
        }
        if (query.length < 3) {
            setMovies([])
            setError("")
            return
        }

        handleCloseMovie()
        fetchMovies()

        return () => {
            controller.abort()
        }
    }, [query])

    useEffect(() => {
        localStorage.setItem("watched", JSON.stringify(watched))
    }, [watched])

    function handleSelectedId(id) {
        setSelectedId((selectedId) => (selectedId === id ? null : id))
    }

    function handleCloseMovie() {
        setSelectedId(null)
    }

    function handleAddWatched(movie) {
        setWatched((watched) => [...watched, movie])
        //localStorage.setItem("watched", JSON.stringify([...watched, movie]))
    }

    function handleDeleteWatched(id) {
        setWatched((watched) => watched.filter((movie) => movie.imdbID !== id))
    }

    return (
        <>
            <Navbar>
                <Logo />
                <Search query={query} setQuery={setQuery} />
                <Numresults movies={movies} />
            </Navbar>
            <Main>
                <Box id="movie-list">
                    {isLoading && <Loader />}
                    {!isLoading && !error && (
                        <Movielist
                            movies={movies}
                            onSelectMovie={handleSelectedId}
                        />
                    )}
                    {error && <ErrorMessage message={error} />}
                </Box>
                <Box id="watched">
                    {selectedId ? (
                        <SelectedMovie
                            selectedId={selectedId}
                            onCloseMovie={handleCloseMovie}
                            onAddWatched={handleAddWatched}
                            watched={watched}
                        />
                    ) : (
                        <>
                            <WatchedSummary watched={watched} />
                            <WatchedMoviesList
                                watched={watched}
                                onDeleteWatched={handleDeleteWatched}
                            />
                        </>
                    )}
                </Box>
            </Main>
        </>
    )
}
