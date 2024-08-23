import React, { useState, useEffect } from "react";
import './App.css'

const generateRandomNumbers = (count) => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
};

const getRandomPosition = (maxWidth, maxHeight, radius, positions) => {
  const maxAttempts = 100; // Giới hạn số lần thử
  let attempt = 0;
  let position;

  while (attempt < maxAttempts) {
    const x = Math.floor(Math.random() * (maxWidth - 2 * radius));
    const y = Math.floor(Math.random() * (maxHeight - 2 * radius));
    position = { x, y };

    let overlap = false;
    for (let pos of positions) {
      const distance = Math.sqrt(
        (x - pos.x) * (x - pos.x) + (y - pos.y) * (y - pos.y)
      );
      if (distance < 2 * radius) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      return position;
    }

    attempt++;
  }

  // Nếu không tìm được vị trí hợp lệ, cho phép chồng chéo
  return position;
};


const Game = () => {
  const [numberCount, setNumberCount] = useState(10);
  const [targetCount, setTargetCount] = useState(10);
  const [randomNumbers, setRandomNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [message, setMessage] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [positions, setPositions] = useState([]);
  const [clickedNumbers, setClickedNumbers] = useState([]);
  const [fadeNumbers, setFadeNumbers] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [inputValue, setInputValue] = useState(10);

  const startGame = () => {
    const numbers = generateRandomNumbers(numberCount);
    setRandomNumbers(numbers);
    setCurrentNumber(1);
    setMessage("");
    setGameStarted(true);
    setClickedNumbers([]);
    setFadeNumbers([]);
    setElapsedTime(0);

    if (timerInterval) clearInterval(timerInterval);
    const interval = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 0.1);
    }, 100);
    setTimerInterval(interval);

    const newPositions = [];
    const radius = 25;
    for (let i = 0; i < targetCount; i++) {
      const newPosition = getRandomPosition(500, 400, radius, newPositions);
      newPositions.push(newPosition);
    }
    setPositions(newPositions);
  };


  const resetGame = () => {
    setRandomNumbers([]);
    setCurrentNumber(1);
    setMessage("");
    setGameStarted(false);
    setPositions([]);
    setClickedNumbers([]);
    setFadeNumbers([]);
    setElapsedTime(0);

    if (timerInterval) clearInterval(timerInterval);
  };

  const handleNumberClick = (number) => {
    if (!gameStarted) return;

    if (number === currentNumber) {
      setCurrentNumber((prev) => prev + 1);
      setClickedNumbers((prevClicked) => [...prevClicked, number]);
      setFadeNumbers((prevFade) => [...prevFade, number]);
    } else {
      setMessage("Game Over");
      setGameStarted(false);
      if (timerInterval) clearInterval(timerInterval);
    }
  };

  useEffect(() => {
    if (currentNumber > targetCount) {
      setMessage(`Congratulations! You have found all the numbers. Completion time: ${elapsedTime.toFixed(1)} seconds.`);
      setGameStarted(false);
      if (timerInterval) clearInterval(timerInterval);
    }
  }, [currentNumber, targetCount, elapsedTime, timerInterval]);

  useEffect(() => {
    if (fadeNumbers.length > 0) {
      const timeoutId = setTimeout(() => {
        setRandomNumbers((prevNumbers) =>
          prevNumbers.filter((num) => !fadeNumbers.includes(num))
        );
        setPositions((prevPositions) =>
          prevPositions.filter((_, index) => !fadeNumbers.includes(randomNumbers[index]))
        );
        setFadeNumbers([]);
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [fadeNumbers, randomNumbers]);

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    setInputValue(value);
    setNumberCount(value);
    setTargetCount(value);
  };

  let headerStyle = { color: "black" };
  let headerText = "LET'S PLAY";

  if (!gameStarted) {
    if (message === "Game Over") {
      headerStyle = { color: "red" };
      headerText = "GAME OVER";
    } else if (currentNumber > targetCount) {
      headerStyle = { color: "green" };
      headerText = "ALL CLEARED";
    }
  } else if (gameStarted) {
    headerText = "LET'S PLAY";
  }

  return (
    <div className="container" >
      <h1 style={headerStyle}>{headerText}</h1>
      <div className="container__title">
        <div>
          <label>
            Point:
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              min="1"
              max="1000"
              style={{ width: "200px" }}
            />
          </label>
        </div>
        <div>

          <p>{message}</p>
          <p>Time: {elapsedTime.toFixed(1)} s</p>
        </div>
        <button
          onClick={gameStarted ? resetGame : startGame}
          disabled={gameStarted && message === "Game Over"}
        >
          {gameStarted ? "Restart" : "Play"}
        </button>

      </div>
      <div className="container__AreaGame" >
        {randomNumbers.map((number, index) => (
          <div
            className="container__btn"
            key={number}
            onClick={() => handleNumberClick(number)}
            style={{
              position: "absolute",
              left: `${positions[index]?.x || 0}px`,
              top: `${positions[index]?.y || 0}px`,
              width: "50px",
              height: "50px",
              backgroundColor: clickedNumbers.includes(number) ? "#FF0000" : "#FFFFFF",
              color: "black",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: gameStarted ? "pointer" : "default",
              fontSize: "20px",
              border: "2px solid black",
              opacity: fadeNumbers.includes(number) ? 0 : 1,
              transition: "opacity 1s ease",
              zIndex: numberCount - number
            }}
          >
            {number}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;
