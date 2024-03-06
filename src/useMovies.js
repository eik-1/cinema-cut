import { useEffect, useState } from "react"

const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY

export function useMovies(query) {
    const [movies, setMovies] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        //callback?.()    Calling the callback function if it exists
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

        //handleCloseMovie()
        fetchMovies()

        return () => {
            controller.abort()
        }
    }, [query])

    return { movies, isLoading, error }
}
