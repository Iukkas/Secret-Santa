import { useState } from "react";
import { motion } from "framer-motion";

function CreateDraw() {
  const [name, setName] = useState("");
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState([]);

  const [selectedPerson, setSelectedPerson] = useState("");
  const [revealedFriend, setRevealedFriend] = useState(null);

  const addParticipant = () => {
    const trimmedName = name.trim();

    if (!trimmedName) return;

    // restante da função...

    const alreadyExists = participants.some(
      (participant) => participant.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (alreadyExists) {
      alert("Este participante já foi adicionado.");
      return;
    }

    setParticipants([...participants, trimmedName]);

    setResults([]);
    setName("");
  };

  const removeParticipant = (index) => {
    setParticipants(participants.filter((_, i) => i !== index));

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
        const random = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[random]] = [shuffled[random], shuffled[i]];
      }

      // Garante que ninguém tire a si mesmo
      validDraw = participants.every(
        (participant, index) => participant !== shuffled[index],
      );
    }

    const drawResults = participants.map((participant, index) => ({
      giver: participant,
      receiver: shuffled[index],
    }));

    setResults(drawResults);
  };

  const revealFriend = () => {
    const result = results.find((item) => item.giver === selectedPerson);

    if (result) {
      setRevealedFriend(result.receiver);
    }
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

        <button onClick={addParticipant}>Adicionar</button>
      </div>

      <p>Participantes: {participants.length}</p>

      <div className="participantsList">
        {participants.map((person, index) => (
          <motion.div
            key={index}
            className="participantCard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span>{person}</span>

            <button onClick={() => removeParticipant(index)}>❌</button>
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
        <div className="revealSection">
          <h2>Revelar Amigo Secreto 🎁</h2>

          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
          >
            <option value="">Selecione seu nome</option>

            {participants.map((participant) => (
              <option key={participant} value={participant}>
                {participant}
              </option>
            ))}
          </select>

          <button
            className="revealButton"
            onClick={revealFriend}
            disabled={!selectedPerson}
          >
            Revelar Meu Amigo
          </button>
        </div>
      )}
      {revealedFriend && (
        <div className="modalOverlay" onClick={() => setRevealedFriend(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🎉 Seu Amigo Secreto é:</h2>

            <h1>{revealedFriend}</h1>

            <button onClick={() => setRevealedFriend(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateDraw;
