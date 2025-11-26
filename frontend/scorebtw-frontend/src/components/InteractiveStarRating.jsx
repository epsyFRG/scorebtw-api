import { useState, useEffect } from "react"
import { FaStar, FaRegStar } from "react-icons/fa"

const InteractiveStarRating = ({
  rating: initialRating = 0,
  maxRating = 10,
  size = "1.5rem",
  onRatingChange,
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  const [rating, setRating] = useState(initialRating)

  useEffect(() => {
    setRating(initialRating)
  }, [initialRating])

  // Converti da scala 0-10 a 0-5 stelle (ogni stella = 2 punti)
  const getStarValue = (starIndex) => {
    return (starIndex + 1) * 2 // Stella 0 = 2, Stella 1 = 4, Stella 2 = 6, etc.
  }

  const handleStarClick = (starIndex) => {
    const newRating = getStarValue(starIndex)
    setRating(newRating)
    if (onRatingChange) {
      onRatingChange(newRating)
    }
  }

  const handleStarHover = (starIndex) => {
    const newHoverRating = getStarValue(starIndex)
    setHoverRating(newHoverRating)
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  const displayRating = hoverRating || rating
  const normalizedRating = (displayRating / maxRating) * 5

  return (
    <div
      className="interactive-star-rating d-flex align-items-center gap-2"
      onMouseLeave={handleMouseLeave}
    >
      <div className="d-flex align-items-center">
        {[0, 1, 2, 3, 4].map((starIndex) => {
          const isFilled = normalizedRating >= starIndex + 1
          const isHovered = hoverRating > 0 && normalizedRating >= starIndex + 1

          return (
            <FaStar
              key={starIndex}
              style={{
                fontSize: size,
                color: isFilled || isHovered ? "#ffd166" : "rgba(255, 255, 255, 0.3)",
                filter: isFilled || isHovered ? "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" : "none",
                cursor: "pointer",
                transition: "color 0.2s ease, filter 0.2s ease",
                marginRight: "0.25rem",
              }}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
            />
          )
        })}
      </div>
      <span
        className="text-muted"
        style={{ fontSize: "0.9rem", minWidth: "60px" }}
      >
        {displayRating.toFixed(1)}/{maxRating}
      </span>
    </div>
  )
}

export default InteractiveStarRating

