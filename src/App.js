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
import { useMovies } from "./useMovies.js"

export default function App() {
    const [query, setQuery] = useState("")
    const [selectedId, setSelectedId] = useState(null)
    const { movies, isLoading, error } = useMovies(query, handleCloseMovie) //custom hook

    //const [watched, setWatched] = useState([])
    const [watched, setWatched] = useState(function () {
        const storedWatched = localStorage.getItem("watched")
        return JSON.parse(storedWatched) || []
    })

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
