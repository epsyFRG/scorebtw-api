import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Modal, Form, Button } from "react-bootstrap"
import { FaSearch, FaTimes, FaArrowLeft, FaPlus, FaStar, FaCalendar } from "react-icons/fa"
import { searchGames, clearSearchResults } from "../store/slices/gamesSlice"
import GameReviewModal from "./GameReviewModal"

const GameSearchModal = ({ show, onHide }) => {
  const dispatch = useDispatch()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [sortFilter, setSortFilter] = useState(null) // 'popularity' o 'release-date'
  const inputRef = useRef(null)

  const { searchResults, isLoading } = useSelector((state) => state.games)

  // Debounce per la ricerca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Esegui ricerca quando la query debounced cambia
  useEffect(() => {
    if (debouncedQuery.trim()) {
      dispatch(searchGames({ query: debouncedQuery.trim(), page: 1, pageSize: 20 }))
    } else {
      dispatch(clearSearchResults())
    }
  }, [debouncedQuery, dispatch])

  // Focus sull'input quando il modal si apre
  useEffect(() => {
    if (show && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setSearchQuery("")
      setSortFilter(null)
      dispatch(clearSearchResults())
    }
  }, [show, dispatch])

  // Filtra i risultati in base al filtro selezionato
  const getSortedResults = () => {
    if (!searchResults || searchResults.length === 0) return []
    
    const results = [...searchResults]
    
    if (sortFilter === 'popularity') {
      // Ordina per rating (popolarità) - più alto prima
      return results.sort((a, b) => {
        const ratingA = a.rating || a.metacriticScore || a.metacritic || 0
        const ratingB = b.rating || b.metacriticScore || b.metacritic || 0
        return ratingB - ratingA
      })
    } else if (sortFilter === 'release-date') {
      // Ordina per data di uscita (più recenti prima)
      return results.sort((a, b) => {
        const dateA = a.released ? new Date(a.released).getTime() : 0
        const dateB = b.released ? new Date(b.released).getTime() : 0
        // Gestisci date non valide mettendole alla fine
        if (dateA === 0 && dateB === 0) return 0
        if (dateA === 0) return 1
        if (dateB === 0) return -1
        return dateB - dateA
      })
    }
    
    return results
  }
  
  const sortedResults = getSortedResults()

  const handleClear = () => {
    setSearchQuery("")
    dispatch(clearSearchResults())
    inputRef.current?.focus()
  }

  const handleGameClick = (game, e) => {
    // Se il click proviene dal pulsante +, non fare nulla (già gestito da handleAddClick)
    if (e?.target?.closest?.('.game-search-modal__result-add')) {
      return
    }
    
    // Apri il modal per aggiungere la recensione (stesso comportamento del +)
    setSelectedGame(game)
    setShowReviewModal(true)
  }

  const handleAddClick = (game, e) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedGame(game)
    setShowReviewModal(true)
  }

  const handleReviewModalClose = () => {
    setShowReviewModal(false)
    setSelectedGame(null)
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).getFullYear()
  }

  const getGenres = (game) => {
    if (!game.genres || game.genres.length === 0) return null
    return game.genres.slice(0, 3).map((g) => g.name || g).join(", ")
  }

  const getImageUrl = (game) => {
    return (
      game.background_image ||
      game.backgroundImage ||
      "https://via.placeholder.com/64x64?text=Game"
    )
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      fullscreen
      className="game-search-modal"
      backdrop={true}
      keyboard={true}
    >
      <Modal.Body className="game-search-modal__body">
        <div className={`game-search-modal__header ${showReviewModal ? 'game-search-modal__header--blurred' : ''}`}>
          <Button
            variant="link"
            className="game-search-modal__back"
            onClick={onHide}
          >
            <FaArrowLeft />
          </Button>
          <Form className="game-search-modal__form">
            <Form.Control
              ref={inputRef}
              type="text"
              placeholder="Search for a game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="game-search-modal__input"
            />
            <div className="game-search-modal__input-actions">
              {searchQuery && (
                <Button
                  variant="link"
                  className="game-search-modal__clear"
                  onClick={handleClear}
                >
                  <FaTimes />
                </Button>
              )}
              <FaSearch className="game-search-modal__search-icon" />
            </div>
          </Form>
        </div>

        <div className={`game-search-modal__content ${showReviewModal ? 'game-search-modal__content--blurred' : ''}`}>
          {searchQuery && (
            <div className="game-search-modal__results-header">
              <div className="game-search-modal__results-header-left">
                <span>Results for <strong>{searchQuery}</strong></span>
              </div>
              <div className="game-search-modal__filter-buttons">
                <Button
                  variant={sortFilter === 'popularity' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  className="game-search-modal__filter-button"
                  onClick={() => setSortFilter(sortFilter === 'popularity' ? null : 'popularity')}
                >
                  <FaStar className="me-1" />
                  Popolarità
                </Button>
                <Button
                  variant={sortFilter === 'release-date' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  className="game-search-modal__filter-button"
                  onClick={() => setSortFilter(sortFilter === 'release-date' ? null : 'release-date')}
                >
                  <FaCalendar className="me-1" />
                  Data d'uscita
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="game-search-modal__loading">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {!isLoading && sortedResults.length > 0 && (
            <div className="game-search-modal__results">
              {sortedResults.map((game) => (
                <div
                  key={game.id}
                  className="game-search-modal__result-item"
                  onClick={(e) => handleGameClick(game, e)}
                >
                  <div className="game-search-modal__result-image">
                    <img
                      src={getImageUrl(game)}
                      alt={game.name || game.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="game-search-modal__result-content">
                    <div className="game-search-modal__result-title">
                      {game.name || game.title}
                    </div>
                    <div className="game-search-modal__result-details">
                      {getGenres(game) && (
                        <span className="game-search-modal__result-genres">
                          {getGenres(game)}
                        </span>
                      )}
                      {formatDate(game.released) && (
                        <>
                          {getGenres(game) && " • "}
                          <span className="game-search-modal__result-year">
                            {formatDate(game.released)}
                          </span>
                        </>
                      )}
                      {(game.added || game.added_by_status) && (
                        <>
                          {getGenres(game) || formatDate(game.released)
                            ? " • "
                            : ""}
                          <span className="game-search-modal__result-tag">
                            {game.added > 0 ? "Mod" : "DLC"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="game-search-modal__result-add"
                    onClick={(e) => handleAddClick(game, e)}
                  >
                    <FaPlus />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!isLoading &&
            searchQuery &&
            debouncedQuery &&
            searchResults.length === 0 && (
              <div className="game-search-modal__empty">
                <div className="game-search-modal__empty-icon">
                  <FaSearch />
                </div>
                <p>No games found for "{searchQuery}"</p>
              </div>
            )}

          {!searchQuery && (
            <div className="game-search-modal__placeholder">
              <div className="game-search-modal__placeholder-icon">
                <FaSearch />
              </div>
              <p>Start typing to search for games...</p>
            </div>
          )}
        </div>
      </Modal.Body>

      <GameReviewModal
        show={showReviewModal}
        onHide={handleReviewModalClose}
        game={selectedGame}
      />
    </Modal>
  )
}

export default GameSearchModal

