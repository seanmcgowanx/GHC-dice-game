import React from 'react'

export default function Leaderboard({highScores, displayDate}) {
    return(
        <div className="leaderboard-container">
            <h1 className='leaderboard-title'>Leaderboard</h1>
            {highScores.map((score, index) => (
                <div key={index} className="score">
                    <div className="header">
                        <h3 className="score-username">{score.username}</h3>
                        <h3 className="score-date">{displayDate(score.createdAt)}</h3>
                    </div>
                    <h2 className="score-value">{score.body}</h2>
                </div>
            ))}
        </div>
 )
}