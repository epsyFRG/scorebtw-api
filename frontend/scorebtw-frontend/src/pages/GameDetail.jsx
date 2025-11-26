import { useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap"
import { FaPlus, FaStar, FaCalendar } from "react-icons/fa"
import { getGameDetails, clearCurrentGame } from "../store/slices/gamesSlice"
import { getReviewsByGame } from "../store/slices/reviewsSlice"
import ReviewCard from "../components/ReviewCard"
import StarRating from "../components/StarRating"

export default function GameDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentGame, isLoading: gameLoading } = useSelector(
    (state) => state.games
  )
  const { gameReviews, isLoading: reviewsLoading } = useSelector(
    (state) => state.reviews
  )
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(getGameDetails(id))
    dispatch(getReviewsByGame(id))

    return () => {
      dispatch(clearCurrentGame())
    }
  }, [id, dispatch])

  if (gameLoading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (!currentGame) {
    return (
      <Container className="container-main">
        <Alert variant="warning">Game not found</Alert>
      </Container>
    )
  }

  const backgroundImage =
    currentGame.coverImageUrl || currentGame.backgroundImage
  const averageRating = currentGame.averageRating || 0
  const canReview =
    isAuthenticated && !gameReviews.some((r) => r.user.id === user?.id)

  return (
    <>
      {/* Header con immagine di sfondo */}
      <div
        className="game-detail-header"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="game-detail-overlay">
          <Container>
            <Row>
              <Col lg={8}>
                <h1 className="display-4 fw-bold text-white mb-3">
                  {currentGame.title}
                </h1>

                <div className="d-flex flex-wrap gap-3 align-items-center mb-3">
                  {averageRating > 0 && (
                    <div className="bg-dark bg-opacity-75 px-3 py-2 rounded">
                      <StarRating rating={averageRating} />
                    </div>
                  )}

                  {currentGame.releaseYear && (
                    <div className="bg-dark bg-opacity-75 px-3 py-2 rounded text-white">
                      <FaCalendar className="me-2" />
                      {currentGame.releaseYear}
                    </div>
                  )}

                  <div className="bg-dark bg-opacity-75 px-3 py-2 rounded text-white">
                    <FaStar className="me-2" />
                    {gameReviews.length} Reviews
                  </div>
                </div>

                {currentGame.genres && currentGame.genres.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {currentGame.genres.map((genre) => (
                      <Badge key={genre.id} bg="light" text="dark">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      {/* Contenuto */}
      <Container className="py-5">
        <Row>
          <Col lg={8}>
            {/* Descrizione */}
            {currentGame.description && (
              <div className="mb-5">
                <h3 className="mb-3">About</h3>
                <div
                  className="text-muted"
                  dangerouslySetInnerHTML={{ __html: currentGame.description }}
                />
              </div>
            )}

            {/* Recensioni */}
            <div className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Reviews ({gameReviews.length})</h3>
                {canReview && (
                  <Link to={`/game/${id}/review`}>
                    <Button variant="primary">
                      <FaPlus className="me-2" />
                      Write a Review
                    </Button>
                  </Link>
                )}
              </div>

              {reviewsLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : gameReviews.length === 0 ? (
                <Alert variant="info">
                  No reviews yet. Be the first to review this game!
                </Alert>
              ) : (
                gameReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    canDelete={user?.id === review.user.id}
                  />
                ))
              )}
            </div>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <div className="bg-light rounded p-4 mb-4">
              <h5 className="mb-3">Details</h5>

              {currentGame.developer && (
                <div className="mb-3">
                  <strong>Developer:</strong>
                  <div className="text-muted">{currentGame.developer}</div>
                </div>
              )}

              {currentGame.publisher && (
                <div className="mb-3">
                  <strong>Publisher:</strong>
                  <div className="text-muted">{currentGame.publisher}</div>
                </div>
              )}

              {currentGame.platforms && currentGame.platforms.length > 0 && (
                <div className="mb-3">
                  <strong>Platforms:</strong>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {currentGame.platforms.map((platform) => (
                      <Badge key={platform.id} bg="secondary">
                        {platform.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}
