import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Badge,
  Button,
} from "react-bootstrap"
import { FaUser, FaGamepad, FaStar, FaCamera } from "react-icons/fa"
import { getReviewsByUser, deleteReview } from "../store/slices/reviewsSlice"
import { updateUser } from "../store/slices/authSlice"
import ReviewCard from "../components/ReviewCard"
import SpotlightCard from "../components/SpotlightCard"
import GameReviewModal from "../components/GameReviewModal"
import userService from "../services/userService"

export default function Profile() {
  const { userId } = useParams()
  const dispatch = useDispatch()
  const { userReviews, isLoading } = useSelector((state) => state.reviews)
  const { user: currentUser } = useSelector((state) => state.auth)
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingReview, setEditingReview] = useState(null)

  const isOwnProfile = currentUser?.id === parseInt(userId)

  const loadProfile = async () => {
    try {
      setProfile(null) // Reset del profilo quando cambia l'utente
      const profileData = await userService.getUserProfile(userId)
      setProfile(profileData)
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  useEffect(() => {
    dispatch(getReviewsByUser(userId))
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, dispatch])

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validazione file
    if (!file.type.startsWith("image/")) {
      alert("Per favore seleziona un'immagine valida")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("L'immagine deve essere più piccola di 10MB")
      return
    }

    try {
      setAvatarUploading(true)
      const response = await userService.uploadAvatar(file)

      // Aggiorna il profilo con il nuovo avatar
      setProfile((prev) => ({
        ...prev,
        avatarUrl: response.avatarUrl,
      }))

      // Aggiorna anche lo stato dell'utente corrente se è il proprio profilo
      if (isOwnProfile && currentUser) {
        dispatch(
          updateUser({
            ...currentUser,
            profile: {
              ...currentUser.profile,
              avatarUrl: response.avatarUrl,
            },
          })
        )
      }

      alert("Avatar aggiornato con successo!")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      alert(
        "Errore durante l'upload dell'avatar: " +
          (error.response?.data?.message ||
            error.message ||
            "Errore sconosciuto")
      )
    } finally {
      setAvatarUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Calcola statistiche
  const totalReviews = userReviews.length
  const averageRating =
    totalReviews > 0
      ? (
          userReviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) /
          totalReviews
        ).toFixed(1)
      : 0

  const username =
    profile?.username ||
    userReviews[0]?.user?.username ||
    currentUser?.username ||
    "User"
  const avatarUrl = profile?.avatarUrl || userReviews[0]?.user?.avatarUrl

  return (
    <>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div className="mb-3 position-relative d-inline-block">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="rounded-circle avatar-large"
                    style={{
                      cursor: isOwnProfile ? "pointer" : "default",
                      opacity: avatarUploading ? 0.6 : 1,
                    }}
                    onClick={handleAvatarClick}
                  />
                ) : (
                  <div
                    className="rounded-circle avatar-large bg-white text-primary d-inline-flex align-items-center justify-content-center"
                    style={{
                      cursor: isOwnProfile ? "pointer" : "default",
                      opacity: avatarUploading ? 0.6 : 1,
                    }}
                    onClick={handleAvatarClick}
                  >
                    <FaUser size={50} />
                  </div>
                )}
                {isOwnProfile && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      className="position-absolute bottom-0 end-0 rounded-circle"
                      style={{
                        width: "40px",
                        height: "40px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "3px solid white",
                      }}
                      onClick={handleAvatarClick}
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaCamera />
                      )}
                    </Button>
                  </>
                )}
              </div>

              <h1 className="display-5 fw-bold mb-3">{username}</h1>

              {isOwnProfile && (
                <Badge className="profile-badge">Your Profile</Badge>
              )}
            </Col>
          </Row>
        </div>
      </div>

      {/* Profile Content */}
      <Container className="py-5 profile-content">
        <Row>
          <Col lg={8} className="mx-auto">
            {/* Stats */}
            <Row className="mb-5">
              <Col md={4} className="mb-3">
                <SpotlightCard
                  className="custom-spotlight-card"
                  spotlightColor="rgba(0, 229, 255, 0.2)"
                >
                  <Card className="text-center h-100 profile-stats-card">
                    <Card.Body>
                      <div className="mb-2">
                        <FaGamepad size={32} className="text-primary" />
                      </div>
                      <h3 className="mb-1 fw-bold">{totalReviews}</h3>
                      <p className="text-muted mb-0 small">Reviews</p>
                    </Card.Body>
                  </Card>
                </SpotlightCard>
              </Col>

              <Col md={4} className="mb-3">
                <SpotlightCard
                  className="custom-spotlight-card"
                  spotlightColor="rgba(0, 229, 255, 0.2)"
                >
                  <Card className="text-center h-100 profile-stats-card">
                    <Card.Body>
                      <div className="mb-2">
                        <FaStar size={32} className="text-warning" />
                      </div>
                      <h3 className="mb-1 fw-bold">{averageRating}</h3>
                      <p className="text-muted mb-0 small">Avg Rating</p>
                    </Card.Body>
                  </Card>
                </SpotlightCard>
              </Col>

              <Col md={4} className="mb-3">
                <SpotlightCard
                  className="custom-spotlight-card"
                  spotlightColor="rgba(0, 229, 255, 0.2)"
                >
                  <Card className="text-center h-100 profile-stats-card">
                    <Card.Body>
                      <div className="mb-2">
                        <FaGamepad size={32} className="text-success" />
                      </div>
                      <h3 className="mb-1 fw-bold">{totalReviews}</h3>
                      <p className="text-muted mb-0 small">Games Played</p>
                    </Card.Body>
                  </Card>
                </SpotlightCard>
              </Col>
            </Row>

            {/* Reviews */}
            <div className="profile-reviews-section">
              <h3 className="mb-4 profile-section-title">
                {isOwnProfile ? "Your Reviews" : `${username}'s Reviews`}
              </h3>

              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : userReviews.length === 0 ? (
                <Alert variant="info">
                  {isOwnProfile
                    ? "You haven't written any reviews yet. Start exploring games and share your thoughts!"
                    : "This user hasn't written any reviews yet."}
                </Alert>
              ) : (
                userReviews.map((review) => (
                  <div key={review.id} className="profile-review-item mb-4">
                    <SpotlightCard
                      className="custom-spotlight-card"
                      spotlightColor="rgba(0, 229, 255, 0.2)"
                    >
                      <ReviewCard
                        review={review}
                        canDelete={isOwnProfile}
                        canEdit={isOwnProfile}
                        showGameInfo={true}
                        onEdit={(reviewToEdit) => {
                          setEditingReview(reviewToEdit)
                          setShowEditModal(true)
                        }}
                        onDelete={async (reviewId) => {
                          if (
                            window.confirm(
                              "Sei sicuro di voler eliminare questa review?"
                            )
                          ) {
                            try {
                              await dispatch(deleteReview(reviewId)).unwrap()
                              // Refresh reviews after deletion
                              dispatch(getReviewsByUser(userId))
                            } catch (error) {
                              alert(
                                "Errore nell'eliminazione della review: " +
                                  (error || "Errore sconosciuto")
                              )
                            }
                          }
                        }}
                      />
                    </SpotlightCard>
                  </div>
                ))
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Edit Review Modal */}
      {editingReview && editingReview.game && (
        <GameReviewModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false)
            setEditingReview(null)
            // Refresh reviews after editing
            dispatch(getReviewsByUser(userId))
          }}
          game={editingReview.game}
          review={editingReview}
        />
      )}
    </>
  )
}
