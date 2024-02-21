import { useState, useEffect } from "react"
import Loader from "./Loader"
import StarRating from "./StarRating"

const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY

export default function SelectedMovie({
    selectedId,
    onCloseMovie,
    onAddWatched,
    watched,
}) {
    const [movie, setMovie] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [userRating, setUserRating] = useState("")

    const isWatched = watched.some((movie) => movie.imdbID === selectedId)
    const watchedUserRating = watched.find(
        (movie) => movie.imdbId === selectedId,
    )?.userRating

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

    function handleAdd() {
        const newWatchedMovie = {
            imdbID: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: Number(runtime.split(" ").at(0)),
            userRating,
        }

        onAddWatched(newWatchedMovie)
        onCloseMovie()
    }

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
                            {!isWatched ? (
                                <>
                                    <StarRating
                                        maxRating={10}
                                        size={24}
                                        onSetRating={setUserRating}
                                    />
                                    {userRating > 0 && (
                                        <button
                                            className="btn-add"
                                            onClick={handleAdd}
                                        >
                                            + Add To List
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p>
                                    You have rated this movie
                                    {watchedUserRating}
                                </p>
                            )}
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
