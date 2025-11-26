import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSearchParams, Link } from "react-router-dom"
import { Container, Spinner, Alert, Row, Col } from "react-bootstrap"
import { FaUser } from "react-icons/fa"
import { searchGames, clearSearchResults } from "../store/slices/gamesSlice"
import GameCard from "../components/GameCard"
import SpotlightCard from "../components/SpotlightCard"
import ReviewCard from "../components/ReviewCard"

export default function Home() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get("search")

  const dispatch = useDispatch()
  const { searchResults, isLoading, error } = useSelector(
    (state) => state.games
  )

  useEffect(() => {
    if (searchQuery) {
      dispatch(searchGames({ query: searchQuery, page: 1, pageSize: 20 }))
    } else {
      dispatch(clearSearchResults())
    }
  }, [searchQuery, dispatch])

  return (
    <Container className="container-main">
      <section className="hero-section">
        <Row className="justify-content-center">
          <Col md={10} lg={8} className="mx-auto">
            <div className="hero-copy">
              <span className="hero-eyebrow">Welcome to ScoreBTW</span>
              <h1 className="hero-title">Rate your favorite games!</h1>
              <p className="hero-subtitle">
                Discover, rate and share your favorite titles with everyone!
              </p>
            </div>
          </Col>
        </Row>
      </section>

      {/* Featured review section */}
      {!searchQuery && (
        <section className="featured-review-section my-5">
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <SpotlightCard
                className="custom-spotlight-card"
                spotlightColor="rgba(0, 229, 255, 0.2)"
              >
                <ReviewCard
                  review={{
                    id: 1,
                    title: "An absolute masterpiece",
                    content:
                      "After hundreds of hours played, I can say without a doubt that The Witcher 3 is one of the best RPGs ever made. The narrative is engaging and the characters are memorable.",
                    rating: 9.5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    user: {
                      id: 1,
                      username: "GameMaster99",
                      avatarUrl: null,
                    },
                    game: {
                      id: 3328,
                      title: "The Witcher 3: Wild Hunt",
                      coverImageUrl:
                        "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
                      averageRating: 9.5,
                    },
                  }}
                  showGameInfo={true}
                  canDelete={false}
                  onDelete={() => {}}
                />
              </SpotlightCard>
            </Col>
          </Row>
        </section>
      )}

      {searchQuery && (
        <>
          <Alert variant="info" className="mb-4">
            Showing results for: <strong>{searchQuery}</strong>
          </Alert>

          {isLoading ? (
            <div className="loading-container">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : searchResults.length === 0 ? (
            <Alert variant="warning">No games found for "{searchQuery}"</Alert>
          ) : (
            <div className="games-grid">
              {searchResults.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </>
      )}
    </Container>
  )
}
