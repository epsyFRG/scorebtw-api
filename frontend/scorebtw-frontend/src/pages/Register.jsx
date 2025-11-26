import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap"
import { register, clearError } from "../store/slices/authSlice"

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [validationError, setValidationError] = useState("")

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setValidationError("")
  }

  const validateForm = () => {
    if (formData.username.length < 3) {
      setValidationError("Username must be at least 3 characters")
      return false
    }
    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const { username, email, password } = formData
    dispatch(register({ username, email, password }))
  }

  return (
    <Container className="auth-container">
      <Card className="auth-card" style={{ maxWidth: "450px", width: "100%" }}>
        <Card.Body className="p-5">
          <div className="text-center mb-5">
            <h2 className="mb-2">JOIN ScoreBTW</h2>
            <p className="text-muted mb-0">
              Create an account to start reviewing
            </p>
          </div>

          {(error || validationError) && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => {
                dispatch(clearError())
                setValidationError("")
              }}
            >
              {validationError || error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="auth-form-label">Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                className="auth-form-input"
              />
              <Form.Text className="text-muted auth-form-hint">
                At least 3 characters
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="auth-form-label">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="auth-form-input"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="auth-form-label">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="auth-form-input"
              />
              <Form.Text className="text-muted auth-form-hint">
                At least 6 characters
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-5">
              <Form.Label className="auth-form-label">
                Confirm Password
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="auth-form-input"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mb-4 auth-submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            <div className="text-center auth-link-container">
              <span className="text-muted">Already have an account? </span>
              <Link to="/login" className="auth-link">
                Login here
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
