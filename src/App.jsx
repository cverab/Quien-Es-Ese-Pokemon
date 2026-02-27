import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [pokemon, setPokemon] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("leaderboard");
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  useEffect(() => {
    if (gameStarted) {
      loadNewPokemon();
    }
  }, [gameStarted]);

  const loadNewPokemon = () => {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
      .then(res => {
        const correctName = res.data.name;
        setPokemon(res.data);

        const fakeIds = Array.from({ length: 3 }, () => Math.floor(Math.random() * 898) + 1);
        Promise.all(fakeIds.map(id => axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)))
          .then(results => {
            const fakeNames = results.map(r => r.data.name);
            const allOptions = [correctName, ...fakeNames];
            setOptions(allOptions.sort(() => Math.random() - 0.5));
          });
      });
  };

  const handleAnswer = (name) => {
    setSelectedOption(name);
    setAnswered(true);

    if (name === pokemon.name) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setAnswered(false);
      setSelectedOption(null);
      loadNewPokemon();
    }, 500);
  };

  const handleGameOver = () => {
    const newEntry = { name: playerName, score };
    const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score);
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem("leaderboard", JSON.stringify(updatedLeaderboard));
    setGameStarted(false);
    setTimeLeft(60);
    setScore(0);
  };

  return (
    <div className="main">
      <div><img src="./assets/pday.png" alt="Pokemon Day 2027" className="side-image left" /></div>
      <div className="container">
        {!gameStarted ? (
          <div className="start-screen">
            <h1>¿Quién es ese Pokémon?</h1>
            <input
              type="text"
              placeholder="Ingresa tu nombre"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <button onClick={() => setGameStarted(true)} disabled={!playerName}>
              Iniciar Juego
            </button>

            <h2>Tabla de Calificación</h2>
            <table>
              <thead>
                <tr>
                  <th>Jugador</th>
                  <th>Puntaje</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.name}</td>
                    <td>{entry.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="game-screen">
            <h1>¿Quién es ese Pokémon?</h1>
            <div className="status-bar">
              <p className="time-left">Tiempo restante: {timeLeft} segundos</p>
              <p>Puntaje: {score}</p>
            </div>
            {timeLeft <= 0 ? (
              <div className="game-over">
                <h2>¡Tiempo terminado!</h2>
                <button onClick={handleGameOver}>Guardar resultado</button>
              </div>
            ) : (
              pokemon && (
                <div className="game-layout">
                  <div className="image-area">
                    <img
                      src={pokemon.sprites.other["official-artwork"].front_default}
                      alt={pokemon.name}
                      className={`pokemon-img ${answered && selectedOption === pokemon.name ? "reveal" : "silhouette"}`}
                    />
                  </div>
                  <div className="options-area">
                    {options.map(opt => {
                      let className = "option-button";
                      if (answered) {
                        if (opt === pokemon.name) {
                          className += " correct";
                        } else if (opt === selectedOption) {
                          className += " incorrect";
                        }
                      }
                      return (
                        <button
                          key={opt}
                          className={className}
                          onClick={() => !answered && handleAnswer(opt)}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
      <div><img src="./assets/logo.png" alt="Logo" className="side-image right" /></div>
    </div>
  );
}

export default App;