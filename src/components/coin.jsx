import React, { useState, useEffect } from 'react';
import './coin.css';

function Coin({ onFlipResult }) {
    const [side, setSide] = useState("heads");
    const [spinning, setSpinning] = useState(false);
    const [displayedSide, setDisplayedSide] = useState("heads");
    const [prediction, setPrediction] = useState(null);

    // Toggle between heads and tails rapidly while spinning
    useEffect(() => {
        let interval;
        if (spinning) {
            interval = setInterval(() => {
                setDisplayedSide(prev => prev === "heads" ? "tails" : "heads");
            }, 250); // Switch every 250ms for a realistic flip effect
        } else {
            setDisplayedSide(side); // When not spinning, display the actual result
        }
        
        return () => clearInterval(interval);
    }, [spinning, side]);

    function flip() {
        if (prediction === null) {
            alert("Please select heads or tails first!");
            return;
        }
        
        setSpinning(true);
        setTimeout(() => {
            const result = Math.random() > 0.5 ? "heads" : "tails";
            setSpinning(false);
            setSide(result);
            
            // Notify the parent component about the result after state update
            setTimeout(() => {
                if (onFlipResult) {
                    onFlipResult(result, prediction);
                }
                
                // Reset prediction for next round
                setPrediction(null);
            },0); // Ensure state is updated before calling the callback
        }, 10000); // 1 second
    }
    
    function makePrediction(choice) {
        setPrediction(choice);
        setSide(choice);
    }

    return (
        <div className="coin-game">
            <h1>Heads or Tails?</h1>
            <div className="prediction-buttons">
                <button 
                    onClick={() => makePrediction("heads")} 
                    className={prediction === "heads" ? "selected" : ""}
                    disabled={spinning}
                >
                    Heads
                </button>
                <button 
                    onClick={() => makePrediction("tails")} 
                    className={prediction === "tails" ? "selected" : ""}
                    disabled={spinning}
                >
                    Tails
                </button>
            </div>
            <div className="coin-container">
                <div className={`coin ${spinning ? "spin" : ""}`}>
                    <img
                        src={displayedSide === "heads" ? "/images/coin-10-head.png" : "/images/coin-10-tail.png"}
                        alt="coin"
                        className="coin-image"
                    />
                </div>
            </div>
            <div>
                <button 
                    onClick={flip} 
                    disabled={spinning || prediction === null}
                    className="flip-button"
                >
                    Flip
                </button>
            </div>
            {prediction && <p>Your prediction: <span className="prediction-display">{prediction}</span></p>}
            
        </div>
    );
}

export default Coin;