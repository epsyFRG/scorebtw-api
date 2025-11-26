import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Modal, Button, Form } from "react-bootstrap"
import {
  FaTimes,
  FaCheck,
  FaGamepad,
  FaTrash,
  FaPlus,
  FaHandPaper,
} from "react-icons/fa"
import { createReview, updateReview } from "../store/slices/reviewsSlice"
import ElasticSlider from "./ElasticSlider"

const GameReviewModal = ({ show, onHide, game, review = null }) => {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { isLoading, error } = useSelector((state) => state.reviews)

  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [gameStatus, setGameStatus] = useState(null)

  const MAX_CHARACTERS = 5000
  const isEditMode = !!review

  useEffect(() => {
    if (show && game) {
      if (review) {
        // Modal in modalità modifica - precompila i campi
        setRating(parseFloat(review.rating) || 0)
        setTitle(review.title || "")
        setContent(review.content || "")
        setGameStatus(null)
      } else {
        // Modal in modalità creazione - resetta i campi
        setRating(0)
        setTitle("")
        setContent("")
        setGameStatus(null)
      }
    }
  }, [show, game, review])

  // Aggiungi/rimuovi classe al body per lo sfocamento del backdrop
  useEffect(() => {
    if (show) {
      document.body.classList.add("game-review-modal-open")
    } else {
      document.body.classList.remove("game-review-modal-open")
    }
    
    // Cleanup quando il componente viene smontato
    return () => {
      document.body.classList.remove("game-review-modal-open")
    }
  }, [show])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      // Redirect al login
      return
    }

    if (!rating || rating === 0) {
      alert("Please select a rating")
      return
    }

    if (content.trim().length === 0) {
      alert("Please write a review")
      return
    }

    try {
      // Assicurati che rating sia un numero
      const ratingValue = typeof rating === "number" ? rating : parseFloat(rating)
      
      if (isNaN(ratingValue) || ratingValue <= 0) {
        alert("Please select a valid rating")
        return
      }

      // Assicurati che gameId sia un numero intero
      const gameId = typeof game.id === "number" ? game.id : parseInt(game.id)
      
      if (isNaN(gameId)) {
        alert("Invalid game ID")
        return
      }

      // Debug: verifica il token e lo stato di autenticazione
      const token = localStorage.getItem("token")
      console.log("=== Review Creation Debug ===")
      console.log("Token exists:", !!token)
      console.log("Token value:", token ? `${token.substring(0, 20)}...` : "none")
      console.log("Is authenticated (Redux):", isAuthenticated)
      console.log("User (Redux):", user)
      console.log("Creating review with:", {
        gameId,
        rating: ratingValue,
        title: title.trim() || null,
        contentLength: content.trim().length,
      })
      
      // Verifica che il token esista prima di procedere
      if (!token) {
        alert("No authentication token found. Please log in again.")
        onHide()
        window.location.href = "/login"
        return
      }
      
      // Verifica che l'utente sia autenticato in Redux
      if (!isAuthenticated || !user) {
        alert("You are not authenticated. Please log in again.")
        onHide()
        window.location.href = "/login"
        return
      }

      let result
      if (isEditMode && review) {
        // Modifica review esistente
        result = await dispatch(
          updateReview({
            reviewId: review.id,
            gameId: gameId,
            rating: ratingValue,
            title: title.trim() || null,
            content: content.trim(),
          })
        ).unwrap()
        console.log("Review updated successfully:", result)
      } else {
        // Crea nuova review
        result = await dispatch(
          createReview({
            gameId: gameId,
            rating: ratingValue,
            title: title.trim() || null,
            content: content.trim(),
          })
        ).unwrap()
        console.log("Review created successfully:", result)
      }

      // Reset form e chiudi modal
      setRating(0)
      setTitle("")
      setContent("")
      setGameStatus(null)
      onHide()
    } catch (error) {
      console.error("Error creating review:", error)
      console.error("Error type:", typeof error)
      console.error("Error string:", String(error))
      console.error("Error details:", {
        error,
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
      })
      
      // Estrai il messaggio di errore specifico
      // Quando Redux thunk rigetta, l'errore è il valore passato a rejectWithValue
      let errorMessage = "An error occurred while saving the review. Please try again."
      
      // L'errore da unwrap() potrebbe essere direttamente il messaggio di errore (stringa)
      // oppure un oggetto error
      if (typeof error === "string") {
        errorMessage = error
      } else if (error?.payload) {
        // Se l'errore ha un payload (da rejectWithValue)
        errorMessage = error.payload
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.status === 401 || error?.response?.status === 403) {
        errorMessage = "You are not authenticated. Please log in and try again."
      } else if (error?.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid request. Please check your input."
      }
      
      // Mostra l'errore
      alert(`Error: ${errorMessage}`)
      
      // Non chiudere il modal se c'è un errore, così l'utente può correggere
    }
  }

  const wordCount = content.trim().split(/\s+/).filter((word) => word.length > 0)
    .length

  const getImageUrl = () => {
    if (!game) return "https://via.placeholder.com/200x300?text=Game"
    
    // Per GameSimpleDTO (da review) usa coverImageUrl
    if (game.coverImageUrl) {
      return game.coverImageUrl
    }
    
    // Per oggetti game completi (da search) usa background_image
    return (
      game?.background_image ||
      game?.backgroundImage ||
      "https://via.placeholder.com/200x300?text=Game"
    )
  }

  const gameTitle = game?.name || game?.title || "Unknown Game"

  const statusButtons = [
    { id: "finished", label: "Finished", icon: FaCheck },
    { id: "playing", label: "Playing", icon: FaGamepad },
    { id: "dropped", label: "Dropped", icon: FaTrash },
    { id: "want", label: "Want", icon: FaPlus },
    { id: "on-hold", label: "On-hold", icon: FaHandPaper },
  ]

  if (!game) return null

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="game-review-modal"
      backdrop={true}
      keyboard={true}
    >
      <Modal.Body className="game-review-modal__body">
        <Button
          variant="link"
          className="game-review-modal__close"
          onClick={onHide}
        >
          <FaTimes />
        </Button>

        <div className="game-review-modal__header">
          <div className="game-review-modal__game-image">
            <img src={getImageUrl()} alt={gameTitle} />
          </div>
          <div className="game-review-modal__game-info">
            <h3 className="game-review-modal__game-title">{gameTitle}</h3>
            <div className="game-review-modal__rating-section">
              <ElasticSlider
                defaultValue={rating || 5}
                startingValue={1}
                maxValue={10}
                isStepped={true}
                stepSize={1}
                onValueChange={setRating}
              />
            </div>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="game-review-modal__login-prompt">
            <p className="text-center mb-4">
              Please sign in to write a review
            </p>
            <Button
              variant="primary"
              className="game-review-modal__login-button"
              onClick={() => {
                onHide()
                window.location.href = "/login"
              }}
            >
              Please log in
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <div className="game-review-modal__status-buttons">
              {statusButtons.map((status) => {
                const Icon = status.icon
                return (
                  <Button
                    key={status.id}
                    variant={
                      gameStatus === status.id ? "primary" : "outline-secondary"
                    }
                    className="game-review-modal__status-button"
                    onClick={(e) => {
                      e.preventDefault()
                      setGameStatus(
                        gameStatus === status.id ? null : status.id
                      )
                    }}
                  >
                    <Icon className="me-2" />
                    {status.label}
                  </Button>
                )
              })}
            </div>

            <div className="game-review-modal__review-section">
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Review title (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="game-review-modal__title-input"
                  maxLength={200}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={8}
                  placeholder="Please sign in to write a review"
                  value={content}
                  onChange={(e) => {
                    const newContent = e.target.value
                    if (newContent.length <= MAX_CHARACTERS) {
                      setContent(newContent)
                    }
                  }}
                  className="game-review-modal__content-textarea"
                />
                <div className="game-review-modal__textarea-footer">
                  <span className="game-review-modal__character-count">
                    {content.length}/{MAX_CHARACTERS} characters
                  </span>
                  <span className="game-review-modal__word-count">
                    {wordCount} words
                  </span>
                </div>
              </Form.Group>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="game-review-modal__actions">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading || !rating || content.trim().length === 0}
                  className="game-review-modal__submit-button"
                >
                  {isLoading ? "Saving..." : isEditMode ? "Update Review" : "Save Review"}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default GameReviewModal

