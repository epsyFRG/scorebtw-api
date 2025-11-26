import { useState, useEffect, useRef } from "react"
import { Modal, Form, Button } from "react-bootstrap"
import { FaSearch, FaTimes, FaArrowLeft, FaUser } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import userService from "../services/userService"

const UserSearchModal = ({ show, onHide }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)

  // Debounce per la ricerca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Esegui ricerca quando la query debounced cambia
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim()) {
        setIsLoading(true)
        try {
          const results = await userService.searchUsers(
            debouncedQuery.trim(),
            1,
            20
          )
          setSearchResults(results || [])
        } catch (error) {
          console.error("Error searching users:", error)
          setSearchResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSearchResults([])
      }
    }

    performSearch()
  }, [debouncedQuery])

  // Focus sull'input quando il modal si apre
  useEffect(() => {
    if (show && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setSearchQuery("")
      setSearchResults([])
    }
  }, [show])

  const handleClear = () => {
    setSearchQuery("")
    setSearchResults([])
    inputRef.current?.focus()
  }

  const handleUserClick = (user) => {
    onHide()
    navigate(`/profile/${user.id}`)
  }

  const getAvatarUrl = (user) => {
    // L'avatar potrebbe non essere disponibile nella risposta della ricerca
    // In quel caso usiamo un placeholder
    if (user.profile?.avatarUrl) {
      return user.profile.avatarUrl
    }
    // Fallback a un'icona o placeholder
    return null
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      fullscreen
      className="user-search-modal"
      backdrop={true}
      keyboard={true}
    >
      <Modal.Body className="user-search-modal__body">
        <div className="user-search-modal__header">
          <Button
            variant="link"
            className="user-search-modal__back"
            onClick={onHide}
          >
            <FaArrowLeft />
          </Button>
          <Form className="user-search-modal__form">
            <Form.Control
              ref={inputRef}
              type="text"
              placeholder="Search for a user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="user-search-modal__input"
            />
            <div className="user-search-modal__input-actions">
              {searchQuery && (
                <Button
                  variant="link"
                  className="user-search-modal__clear"
                  onClick={handleClear}
                >
                  <FaTimes />
                </Button>
              )}
              <FaSearch className="user-search-modal__search-icon" />
            </div>
          </Form>
        </div>

        <div className="user-search-modal__content">
          {searchQuery && (
            <div className="user-search-modal__results-header">
              <div className="user-search-modal__results-header-left">
                <span>
                  Results for <strong>{searchQuery}</strong>
                </span>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="user-search-modal__loading">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {!isLoading && searchResults.length > 0 && (
            <div className="user-search-modal__results">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="user-search-modal__result-item"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="user-search-modal__result-avatar">
                    {getAvatarUrl(user) ? (
                      <img
                        src={getAvatarUrl(user)}
                        alt={user.username}
                        loading="lazy"
                      />
                    ) : (
                      <div className="user-search-modal__result-avatar-placeholder">
                        <FaUser />
                      </div>
                    )}
                  </div>
                  <div className="user-search-modal__result-content">
                    <div className="user-search-modal__result-username">
                      {user.username}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading &&
            searchQuery &&
            debouncedQuery &&
            searchResults.length === 0 && (
              <div className="user-search-modal__empty">
                <div className="user-search-modal__empty-icon">
                  <FaSearch />
                </div>
                <p>No users found for "{searchQuery}"</p>
              </div>
            )}

          {!searchQuery && (
            <div className="user-search-modal__placeholder">
              <div className="user-search-modal__placeholder-icon">
                <FaSearch />
              </div>
              <p>Start typing to search for users...</p>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default UserSearchModal

