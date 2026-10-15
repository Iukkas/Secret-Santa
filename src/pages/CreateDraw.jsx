import { useState } from "react";
import { motion } from "framer-motion";

function CreateDraw() {
  const [name, setName] = useState("");
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState([]);

  const addParticipant = () => {
  const trimmedName = name.trim();

  if (!trimmedName) return;

  const alreadyExists = participants.some(
    (participant) =>
      participant.toLowerCase() ===
      trimmedName.toLowerCase()
  );

  if (alreadyExists) {
    alert("Este participante já foi adicionado.");
    return;
  }

  setParticipants([
    ...participants,
    trimmedName,
  ]);

  setResults([]);
  setName("");
};

  const removeParticipant = (index) => {
    setParticipants(
      participants.filter((_, i) => i !== index)
    );

    setResults([]);
  };

  const performDraw = () => {
    if (participants.length < 2) return;

    let shuffled = [];
    let validDraw = false;

    while (!validDraw) {
      shuffled = [...participants];

      // Fisher-Yates Shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const random = Math.floor(
          Math.random() * (i + 1)
        );

        [shuffled[i], shuffled[random]] = [
          shuffled[random],
          shuffled[i],
        ];
      }

      // Garante que ninguém tire a si mesmo
      validDraw = participants.every(
        (participant, index) =>
          participant !== shuffled[index]
      );
    }

    const drawResults = participants.map(
      (participant, index) => ({
        giver: participant,
        receiver: shuffled[index],
      })
    );

    setResults(drawResults);
  };

  return (
    <div className="createContainer">
      <h1>Criar Sorteio 🎁</h1>

      <div className="inputArea">
        <input
          type="text"
          placeholder="Nome do participante"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addParticipant();
            }
          }}
        />

        <button onClick={addParticipant}>
          Adicionar
        </button>
      </div>

      <p>
        Participantes: {participants.length}
      </p>

      <div className="participantsList">
        {participants.map((person, index) => (
          <motion.div
            key={index}
            className="participantCard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span>{person}</span>

            <button
              onClick={() => removeParticipant(index)}
            >
              ❌
            </button>
          </motion.div>
        ))}
      </div>

      <button
        className="drawButton"
        disabled={participants.length < 2}
        onClick={performDraw}
      >
        Realizar Sorteio
      </button>

      {results.length > 0 && (
        <div className="resultsContainer">
          <h2>Resultado</h2>

          {results.map((result, index) => (
            <div
              key={index}
              className="resultCard"
            >
              <strong>{result.giver}</strong>
              {" → "}
              {result.receiver}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CreateDraw;