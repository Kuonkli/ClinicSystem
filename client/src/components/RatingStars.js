import React from 'react';
import '../styles/StarsRatingStyles.css';

const RatingStars = ({ rating }) => {
    return (
        <svg width="110" height="24" viewBox="0 0 120 24">
            <defs>
                <clipPath id="star-clip">
                    <path d="M12 17.3l6.18 3.7-1.64-7.19L21 9.24l-7.27-.61L12 2 10.27 8.63 3 9.24l5.46 4.57L6.82 21z"/>
                </clipPath>
            </defs>

            {[...Array(5)].map((_, i) => (
                <g key={i} transform={`translate(${i * 24}, 0)`}>
                    <path fill="#aaa" clipPath="url(#star-clip)" d="M12 17.3l6.18 3.7-1.64-7.19L21 9.24l-7.27-.61L12 2 10.27 8.63 3 9.24l5.46 4.57L6.82 21z"/>
                    <rect
                        x="0" y="0"
                        width={Math.min(1, rating - i) * 24}
                        height="24"
                        fill="#ffc107"
                        clipPath="url(#star-clip)"
                    />
                </g>
            ))}
        </svg>
    );
};

export default RatingStars;