import { useLocalStorage } from './hooks/useLocalStorage';
import Coin from './components/coin';
import './App.css';

function App() {
  const [flips, setFlips] = useLocalStorage('flipmaster:flips', 0);
  const [wins, setWins] = useLocalStorage('flipmaster:wins', 0);
  
  const handleFlipResult = (result, prediction) => {
    setFlips(flips + 1);
    if (result === prediction) {
      setWins(wins + 1);
    }
  };

  // Calculate losses based on total flips and wins
  const losses = flips - wins;

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <span className="coin-icon">🪙</span>
          <h1>FlipMaster</h1>
        </div>
        <nav>
          <ul>
            <li><a href="#game">Game</a></li>
            <li><a href="#stats">Stats</a></li>
            <li><a href="#testimonials">Reviews</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <h2>Test Your Luck!</h2>
          <p className="tagline">Are you feeling lucky today? Can you predict the future?</p>
        </section>

        <section id="game" className="game-section">
          <div className="game-instructions">
            <h3>How to Play</h3>
            <ol>
              <li>Select heads or tails to make your prediction</li>
              <li>Click the "Flip" button to flip the coin</li>
              <li>Wait for the coin to stop spinning</li>
              <li>See if your prediction was correct!</li>
            </ol>
            <div id="stats" className="stats-container">
              <div className="stat-box">
                <span className="stat-number">{flips}</span>
                <span className="stat-label">Total Flips</span>
              </div>
              <div className="stat-box win-stat">
                <span className="stat-number">{wins}</span>
                <span className="stat-label">Wins</span>
              </div>
              <div className="stat-box lose-stat">
                <span className="stat-number">{losses}</span>
                <span className="stat-label">Losses</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{flips > 0 ? Math.round((wins/flips)*100) : 0}%</span>
                <span className="stat-label">Win Rate</span>
              </div>
              {flips > 0 && (
                <button
                  className="reset-stats-btn"
                  onClick={() => {
                    setFlips(0);
                    setWins(0);
                  }}
                  aria-label="Reset statistics"
                >
                  Reset Stats
                </button>
              )}
            </div>
          </div>
          
          <div className="coin-game">
            <Coin onFlipResult={handleFlipResult} />
          </div>
        </section>
        
        <section id="testimonials" className="testimonials">
          <h3>What Players Say</h3>
          <div className="testimonial-grid">
            <div className="testimonial">
              <p>"I was skeptical at first, but I'm now addicted to this simple yet thrilling game!"</p>
              <span className="author">- Mike T.</span>
            </div>
            <div className="testimonial">
              <p>"My lucky streak of 7 correct guesses in a row was incredible!"</p>
              <span className="author">- Sarah L.</span>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} FlipMaster. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </footer>
    </div>
  )
}

export default App;