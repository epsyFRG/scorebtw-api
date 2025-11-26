import { Card } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaStar } from "react-icons/fa"

const GameCard = ({ game }) => {
  const imageUrl =
    game.backgroundImage ||
    game.background_image ||
    "https://via.placeholder.com/500x300?text=Nessuna+Immagine"

  const rating = game.rating ? game.rating.toFixed(1) : null
  const releaseYear = game.released
    ? new Date(game.released).getFullYear()
    : null
  const metaScore = game.metacritic ? `Metacritic ${game.metacritic}` : null
  const ratingCount =
    game.ratings_count || game.ratingsCount
      ? `${game.ratings_count || game.ratingsCount} valutazioni`
      : null
  const genres = (game.genres || []).slice(0, 3)

  return (
    <Link to={`/game/${game.id}`} className="game-card-link">
      <Card className="game-card">
        <div className="game-card__media">
          <img
            src={imageUrl}
            alt={game.name || game.title}
            className="game-card__image"
            loading="lazy"
          />

          {rating && (
            <span className="game-card__rating">
              <FaStar />
              {rating}
            </span>
          )}
        </div>

        <Card.Body className="game-card__body">
          <div className="game-card__header">
            <h3 className="game-card__title">{game.name || game.title}</h3>
            {releaseYear && <span className="game-card__year">{releaseYear}</span>}
          </div>

          <div className="game-card__meta">
            {ratingCount && <span>{ratingCount}</span>}
            {metaScore && <span>{metaScore}</span>}
          </div>

          {genres.length > 0 && (
            <div className="game-card__genres">
              {genres.map((genre) => (
                <span key={genre.id || genre} className="game-card__genre">
                  {genre.name || genre}
                </span>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </Link>
  )
}

export default GameCard
