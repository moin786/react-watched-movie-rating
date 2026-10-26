import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "9a9c3197";
const tempQuery = "interstellar";

function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Loading...
    </div>
  );
}

function Error({ message }) {
  return <div>⛔️ {message}</div>;
}

export default function App() {
  const [query, setQuery] = useState("interstellar");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [userRating, setUserRating] = useState(0);

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleMovieUserRating(rating) {
    setUserRating(rating);
  }

  function handleAddWatchedMovie(movie) {
    const newMovie = {
      ...movie,
      imdbRating: Number(movie.imdbRating),
      Runtime: Number(movie.Runtime.split(" ").at(0)),
      userRating,
    };

    setWatched((watched) =>
      watched.some((watch) => watch.imdbID === movie.imdbID)
        ? watched
        : [...watched, newMovie],
    );
    setUserRating(0);
    handleCloseMovie();
  }

  function handleWatchedMovieDelete(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      const controller = new AbortController();
      async function imbdMovieList() {
        try {
          setError("");
          setIsLoading(true);
          const res = await fetch(
            `http://omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal },
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movies Not Found");

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      imbdMovieList();
      setWatched([]);

      return function () {
        return controller.abort();
      };
    },
    [query],
  );

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loading /> : <MovieList movies={movies} />} */}
          {isLoading && <Loading />}
          {!error && !isLoading && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <Error message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onMovieClose={handleCloseMovie}
              onAddWatchedMovie={handleAddWatchedMovie}
              onMovieUserRating={handleMovieUserRating}
              userRating={userRating}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummery watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onMovieDelete={handleWatchedMovieDelete}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🎬</span>
      <h1>watchedMovie</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function MovieDetails({
  selectedId,
  onMovieClose,
  onAddWatchedMovie,
  onMovieUserRating,
  userRating,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId,
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Actors: actors,
    Director: director,
    Plot: plot,
    Poster: poster,
    Released: released,
    Runtime: runtime,
    imdbRating,
    Genre: genre,
  } = movie;

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          console.log("CLOSING");
          onMovieClose();
        }
      }
      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onMovieClose],
  );

  useEffect(
    function () {
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "Watched Movie Rating";
      };
    },
    [title],
  );

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://omdbapi.com/?apikey=${KEY}&i=${selectedId}`,
        );

        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }

      getMovieDetails();
    },
    [selectedId],
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onMovieClose}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                <span> {imdbRating} IMDb rating</span>
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
                    onMovieRating={onMovieUserRating}
                  />
                  {userRating > 0 && (
                    <button
                      className="btn-add"
                      onClick={() => onAddWatchedMovie(movie)}
                    >
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>You rated this movie {watchedUserRating}</p>
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
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

/*function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedSummery watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>
      )}
    </div>
  );
}
  */

function WatchedSummery({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.Runtime));

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
          <span>{Math.floor(avgImdbRating)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{Number(avgUserRating).toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Number(avgRuntime).toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onMovieDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onMovieDelete={onMovieDelete}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onMovieDelete }) {
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
          <span>{Number(movie.Runtime)} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onMovieDelete(movie.imdbID)}
        >
          ❌
        </button>
      </div>
    </li>
  );
}
