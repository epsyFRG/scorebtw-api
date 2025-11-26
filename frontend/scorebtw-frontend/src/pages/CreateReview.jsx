import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap"
import { createReview } from "../store/slices/reviewsSlice"
import { getGameDetails } from "../store/slices/gamesSlice"
import ElasticSlider from "../components/ElasticSlider"

export default function CreateReview() {
  const { id: gameId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    content: "",
  })

  const { currentGame } = useSelector((state) => state.games)
  const { isLoading, error } = useSelector((state) => state.reviews)

  useEffect(() => {
    dispatch(getGameDetails(gameId))
  }, [gameId, dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.rating === 0) {
      alert("Please select a rating")
      return
    }

    const result = await dispatch(
      createReview({
        gameId: parseInt(gameId),
        rating: formData.rating,
        title: formData.title,
        content: formData.content,
      })
    )

    if (!result.error) {
      navigate(`/game/${gameId}`)
    }
  }


  if (!currentGame) {
    return (
      <Container className="container-main">
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  return (
    <Container className="container-main">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Body className="p-4">
              <div className="mb-4">
                <h2>Write a Review</h2>
                <p className="text-muted">
                  Reviewing: <strong>{currentGame.title}</strong>
                </p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* Rating */}
                <Form.Group className="mb-4">
                  <Form.Label className="h5">Your Rating *</Form.Label>
                  <div className="d-flex justify-content-center">
                    <ElasticSlider
                      defaultValue={formData.rating || 5}
                      startingValue={1}
                      maxValue={10}
                      isStepped={true}
                      stepSize={1}
                      onValueChange={(value) =>
                        setFormData({ ...formData, rating: value })
                      }
                    />
                  </div>
                </Form.Group>

                {/* Title */}
                <Form.Group className="mb-4">
                  <Form.Label>Review Title (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="Sum up your thoughts in a few words"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={200}
                  />
                  <Form.Text className="text-muted">
                    {formData.title.length}/200 characters
                  </Form.Text>
                </Form.Group>

                {/* Content */}
                <Form.Group className="mb-4">
                  <Form.Label>Your Review (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    name="content"
                    placeholder="Share your experience with this game. What did you like? What could be improved?"
                    value={formData.content}
                    onChange={handleChange}
                    maxLength={5000}
                  />
                  <Form.Text className="text-muted">
                    {formData.content.length}/5000 characters
                  </Form.Text>
                </Form.Group>

                {/* Buttons */}
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isLoading || formData.rating === 0}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/game/${gameId}`)}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
