import React, { useState, useEffect, useRef } from 'react';
import './coin.css';

// Sound effects using Web Audio API
const SoundManager = {
    audioContext: null,
    gainNode: null,

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
        }
    },

    playSpinningSound() {
        this.init();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 2);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.05, this.audioContext.currentTime + 2);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 2);

        return oscillator;
    },

    playLandingSound() {
        this.init();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    },

    playClickSound() {
        this.init();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
};

function Coin({ onFlipResult }) {
    const [side, setSide] = useState("heads");
    const [spinning, setSpinning] = useState(false);
    const [displayedSide, setDisplayedSide] = useState("heads");
    const [prediction, setPrediction] = useState(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [supportsWebP, setSupportsWebP] = useState(false);
    const spinningSoundRef = useRef(null);

    // Check WebP support
    useEffect(() => {
        const checkWebPSupport = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            const dataURL = canvas.toDataURL('image/webp');
            setSupportsWebP(dataURL.indexOf('data:image/webp') === 0);
        };
        checkWebPSupport();
    }, []);

    // Get optimized image path
    const getImagePath = (sideType) => {
        if (imageError) return null;
        
        const extension = supportsWebP ? 'webp' : 'png';
        return `/images/optimized/coin-${sideType}.${extension}`;
    };

    // Preload images for better performance
    useEffect(() => {
        const preloadImages = async () => {
            const imagePromises = [
                new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = getImagePath('head');
                }),
                new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = getImagePath('tail');
                })
            ];

            try {
                await Promise.all(imagePromises);
                setImagesLoaded(true);
            } catch (error) {
                console.error("Failed to load optimized coin images:", error);
                setImageError(true);
                setImagesLoaded(true); // Still allow game to work with fallback
            }
        };

        if (supportsWebP !== null) {
            preloadImages();
        }
    }, [supportsWebP]);

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
            // Better UX: highlight the prediction buttons instead of ugly alert
            const buttons = document.querySelectorAll('.prediction-buttons button');
            buttons.forEach(btn => {
                btn.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => btn.style.animation = '', 500);
            });
            return;
        }

        // Play click sound
        SoundManager.playClickSound();

        // Play spinning sound effect
        spinningSoundRef.current = SoundManager.playSpinningSound();

        setSpinning(true);
        setTimeout(() => {
            const result = Math.random() > 0.5 ? "heads" : "tails";
            setSpinning(false);

            // Play landing sound effect
            SoundManager.playLandingSound();

            setSide(result);

            // Notify the parent component about the result after state update
            setTimeout(() => {
                if (onFlipResult) {
                    onFlipResult(result, prediction);
                }

                // Reset prediction for next round
                setPrediction(null);
            }, 100); // Small delay to ensure smooth state update
        }, 2000); // 2 seconds - much better UX!
    }
    
    function makePrediction(choice) {
        SoundManager.playClickSound();
        setPrediction(choice);
        setSide(choice);
    }

    // Fallback when images fail to load
    const renderCoinContent = () => {
        if (!imagesLoaded) {
            return <div className="coin-loading">🪙</div>;
        }
        
        if (imageError) {
            return <div className="coin-fallback">{displayedSide === "heads" ? "H" : "T"}</div>;
        }

        const imagePath = getImagePath(displayedSide === "heads" ? "head" : "tail");
        
        return (
            <img
                src={imagePath}
                alt={`coin showing ${displayedSide}`}
                className="coin-image"
                loading="lazy"
                decoding="async"
                onError={() => setImageError(true)}
            />
        );
    };

    return (
        <div className="coin-game">
            <h1>Heads or Tails?</h1>
            <div className="prediction-buttons">
                <button 
                    onClick={() => makePrediction("heads")} 
                    className={prediction === "heads" ? "selected" : ""}
                    disabled={spinning || !imagesLoaded}
                >
                    Heads
                </button>
                <button 
                    onClick={() => makePrediction("tails")} 
                    className={prediction === "tails" ? "selected" : ""}
                    disabled={spinning || !imagesLoaded}
                >
                    Tails
                </button>
            </div>
            <div className="coin-container">
                <div className={`coin ${spinning ? "spin" : ""} ${!imagesLoaded ? "loading" : ""}`}>
                    {renderCoinContent()}
                </div>
            </div>
            <div>
                <button 
                    onClick={flip} 
                    disabled={spinning || prediction === null || !imagesLoaded}
                    className="flip-button"
                >
                    {!imagesLoaded ? "Loading..." : "Flip"}
                </button>
            </div>
            {prediction && <p>Your prediction: <span className="prediction-display">{prediction}</span></p>}
            
            {/* Performance indicator for developers */}
            {process.env.NODE_ENV === 'development' && (
                <div className="dev-info">
                    <small>
                        Using: {supportsWebP ? 'WebP' : 'PNG'} | 
                        Total size: {supportsWebP ? '14.3KB' : '99.4KB'}
                    </small>
                </div>
            )}
        </div>
    );
}

export default Coin;