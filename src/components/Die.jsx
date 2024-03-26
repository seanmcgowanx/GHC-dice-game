import React from "react"

export default function Die(props) {
    const { value, isHeld, holdDice } = props;
    
    // Define positions of dots for each die value
    const dotPositions = [
        [],            // 0 (unused)
        [4],           // 1
        [6, 2],        // 2
        [6, 4, 2],     // 3
        [1, 2, 6, 7], // 4
        [1, 2, 4, 6, 7], // 5
        [1, 3, 6, 2, 5, 7] // 6
      ];

    // Map dot positions to JSX elements for rendering dots
    const dots = dotPositions[value].map((position, index) => (
    <div key={index} className={`dot pos${position}`} />
    ));

    // Return JSX for rendering
    return (
        <div className="die-face" onClick={holdDice} style={isHeld === true ? {backgroundColor: "#59E391"} : {}}>
            {dots}
        </div>
    )
}