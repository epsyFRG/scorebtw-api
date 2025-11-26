import { Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaUser, FaTrash, FaEdit } from "react-icons/fa"
import StarRating from "./StarRating"

const ReviewCard = ({ review, canDelete, onDelete, showGameInfo, canEdit = false, onEdit }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card className="review-card mb-3">
      <Card.Body>
        {/* Game info section - only show if showGameInfo is true and game data exists */}
        {showGameInfo && review.game && (
          <div className="review-card__game-info mb-3">
            <div className="d-flex align-items-center gap-3">
              {review.game.coverImageUrl && (
                <Link to={`/game/${review.game.id}`}>
                  <img
                    src={review.game.coverImageUrl}
                    alt={review.game.title}
                    className="review-card__game-cover"
                  />
                </Link>
              )}
              <div className="flex-grow-1">
                <Link
                  to={`/game/${review.game.id}`}
                  className="review-card__game-title"
                >
                  {review.game.title}
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="review-card__heading">
          <div className="review-card__info">
            {review.user.avatarUrl ? (
              <img
                src={review.user.avatarUrl}
                alt={review.user.username}
                className="review-card__avatar"
              />
            ) : (
              <span className="review-card__fallback">
                <FaUser />
              </span>
            )}
            <div>
              <Link
                to={`/profile/${review.user.id}`}
                className="fw-semibold text-white"
              >
                {review.user.username}
              </Link>
              <div className="review-card__meta">
                {formatDate(review.createdAt)}
              </div>
            </div>
          </div>

          <div className="review-card__actions d-flex align-items-center gap-2">
            <StarRating rating={parseFloat(review.rating)} />

            {canEdit && onEdit && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => onEdit(review)}
                title="Modifica review"
              >
                <FaEdit />
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(review.id)}
                title="Elimina review"
              >
                <FaTrash />
              </Button>
            )}
          </div>
        </div>

        {review.title && (
          <Card.Title as="h3" className="h5 mb-2">
            {review.title}
          </Card.Title>
        )}

        <Card.Text className="mb-0">{review.content}</Card.Text>

        {review.updatedAt !== review.createdAt && (
          <div className="review-card__meta d-flex align-items-center gap-2 mt-2">
            <FaEdit />
            <span>Modified on {formatDate(review.updatedAt)}</span>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default ReviewCard
