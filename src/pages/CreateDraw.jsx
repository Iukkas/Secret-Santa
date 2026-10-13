import { useState } from "react";

function CreateDraw() {
  const [participant, setParticipant] = useState("");
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);

  function addParticipant() {
    const name = participant.trim();

    if (!name) return;

    if (participants.includes(name)) {
      alert("Esse participante já foi adicionado.");
      return;
    }

    setParticipants([...participants, name]);
    setParticipant("");
  }

  function removeParticipant(name) {
    setParticipants(
      participants.filter((p) => p !== name)
    );
  }

  function shuffle(array) {
    const newArray = [...array];

    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(
        Math.random() * (i + 1)
      );

      [newArray[i], newArray[j]] = [
        newArray[j],
        newArray[i],
      ];
    }

    return newArray;
  }

  function generateDraw() {
    if (participants.length < 2) {
      alert("Adicione pelo menos 2 participantes.");
      return;
    }

    let shuffled = shuffle(participants);

    while (
      shuffled.some(
        (person, index) =>
          person === participants[index]
      )
    ) {
      shuffled = shuffle(participants);
    }

    const drawResults = participants.map(
      (person, index) => ({
        giver: person,
        receiver: shuffled[index],
      })
    );

    setResults(drawResults);
  }

  return (
    <div className="createPage">
      <h1>Criar Sorteio 🎁</h1>

      <div className="inputGroup">
        <input
          type="text"
          placeholder="Nome do participante"
          value={participant}
          onChange={(e) =>
            setParticipant(e.target.value)
          }
        />

        <button onClick={addParticipant}>
          Adicionar
        </button>
      </div>

      <div className="participantList">
        {participants.map((person) => (
          <div
            className="participantCard"
            key={person}
          >
            <span>{person}</span>

            <button
              onClick={() =>
                removeParticipant(person)
              }
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      <button
        className="drawButton"
        onClick={generateDraw}
      >
        🎲 Realizar Sorteio
      </button>

      {results.length > 0 && (
        <div className="results">
          <h2>🎁 Descubra seu Amigo Secreto</h2>

          <div className="revealList">
            {results.map((result) => (
              <button
                key={result.giver}
                className="personButton"
                onClick={() =>
                  setSelectedPerson(result)
                }
              >
                {result.giver}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedPerson && (
        <div className="modalOverlay">
          <div className="modal">
            <h2>{selectedPerson.giver}</h2>

            <p>Seu amigo secreto é:</p>

            <h1>
              🎁 {selectedPerson.receiver}
            </h1>

            <button
              onClick={() =>
                setSelectedPerson(null)
              }
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateDraw;