import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap"
import { login, clearError } from "../store/slices/authSlice"

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

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
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login(formData))
  }

  return (
    <Container className="auth-container">
      <Card className="auth-card" style={{ maxWidth: "450px", width: "100%" }}>
        <Card.Body className="p-5">
          <div className="text-center mb-5">
            <h2 className="mb-2">WELCOME BACK!</h2>
            <p className="text-muted mb-0">Login to continue reviewing games</p>
          </div>

          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => dispatch(clearError())}
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="auth-form-label">Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                className="auth-form-input"
              />
            </Form.Group>

            <Form.Group className="mb-5">
              <Form.Label className="auth-form-label">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
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
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <div className="text-center auth-link-container">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
