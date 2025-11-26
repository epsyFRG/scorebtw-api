import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"

const StarRating = ({ rating, maxRating = 10, size = "1rem" }) => {
  // Converti rating da 0-10 a 0-5 per le stelle
  const normalizedRating = (rating / maxRating) * 5
  const stars = []

  for (let i = 1; i <= 5; i++) {
    if (normalizedRating >= i) {
      stars.push(<FaStar key={i} style={{ fontSize: size }} />)
    } else if (normalizedRating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} style={{ fontSize: size }} />)
    } else {
      stars.push(<FaRegStar key={i} style={{ fontSize: size }} />)
    }
  }

  return (
    <div className="star-rating d-inline-flex align-items-center">
      {stars}
      <span className="ms-2 text-muted" style={{ fontSize: "0.9rem" }}>
        {rating.toFixed(1)}/{maxRating}
      </span>
    </div>
  )
}

export default StarRating
