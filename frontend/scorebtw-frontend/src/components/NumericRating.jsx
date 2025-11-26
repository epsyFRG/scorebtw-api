import { useState, useEffect } from "react"

const NumericRating = ({
  rating: initialRating = 0,
  maxRating = 10,
  onRatingChange,
  size = "default",
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  const [rating, setRating] = useState(initialRating)

  useEffect(() => {
    setRating(initialRating)
  }, [initialRating])

  const handleRatingClick = (value) => {
    setRating(value)
    if (onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value) => {
    setHoverRating(value)
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  const displayRating = hoverRating || rating

  const sizeClasses = {
    small: "numeric-rating--small",
    default: "numeric-rating--default",
    large: "numeric-rating--large",
  }

  return (
    <div
      className={`numeric-rating ${sizeClasses[size] || sizeClasses.default}`}
      onMouseLeave={handleMouseLeave}
    >
      <div className="numeric-rating__numbers">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((value) => {
          const isSelected = value <= rating
          const isHovered = hoverRating > 0 && value <= hoverRating
          const isActive = isSelected || isHovered

          return (
            <button
              key={value}
              type="button"
              className={`numeric-rating__button ${
                isActive ? "numeric-rating__button--active" : ""
              }`}
              onClick={() => handleRatingClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
            >
              {value}
            </button>
          )
        })}
      </div>
      {displayRating > 0 && (
        <span className="numeric-rating__display">
          {displayRating}/{maxRating}
        </span>
      )}
    </div>
  )
}

export default NumericRating

