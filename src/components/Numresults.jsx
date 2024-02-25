export default function Numresults({ movies }) {
    return (
        <p className="num-results">
            <strong>{movies.length}</strong> results
        </p>
    )
}
