import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import StepGuide from "../components/StepGuide";
import GiftIcon from "../components/GiftIcon";

const createSteps = [
  {
    title: "Crie a sala",
    hint: "Dê um nome à sala e escolha uma senha. Você vai receber um código para compartilhar.",
  },
  {
    title: "Adicione a galera",
    hint: "Digite o nome de cada participante e clique em Adicionar. São necessárias pelo menos 2 pessoas.",
  },
  {
    title: "Faça o sorteio",
    hint: "Tudo pronto? Clique em Realizar Sorteio. Se alguém entrar ou sair depois, será preciso sortear de novo.",
  },
  {
    title: "Compartilhe",
    hint: "Envie o código e a senha da sala para os convidados. Eles entram em “Entrar em uma Sala”, escolhem o nome e veem o amigo secreto.",
  },
];

function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

function CreateDraw() {
  const [name, setName] = useState("");

  const [room, setRoom] = useState(() => {
    const saved = localStorage.getItem("currentRoom");

    return saved ? JSON.parse(saved) : null;
  });

  const [roomName, setRoomName] = useState("");

  const [roomPassword, setRoomPassword] = useState("");

  const [loadingRoom, setLoadingRoom] = useState(false);

  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem("participants");

    return saved ? JSON.parse(saved) : [];
  });

  const [showWishlist, setShowWishlist] = useState(false);

  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const [wish, setWish] = useState("");

  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem("results");

    return saved ? JSON.parse(saved) : [];
  });

  const [showConfirmation, setShowConfirmation] = useState(false);

  const [selectedPerson, setSelectedPerson] = useState("");

  const [revealedFriend, setRevealedFriend] = useState(null);

  const [revealedPeople, setRevealedPeople] = useState(() => {
    const saved = localStorage.getItem("revealedPeople");

    return saved ? JSON.parse(saved) : [];
  });

  const [copied, setCopied] = useState(false);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.room_code);
    } catch {
      // Plano B para navegadores sem a Clipboard API
      const input = document.createElement("input");
      input.value = room.room_code;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Salva participantes automaticamente
  useEffect(() => {
    localStorage.setItem("participants", JSON.stringify(participants));
  }, [participants]);

  // Salva resultados automaticamente
  useEffect(() => {
    localStorage.setItem("results", JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem("revealedPeople", JSON.stringify(revealedPeople));
  }, [revealedPeople]);

  // Apaga o sorteio salvo no banco (os convidados deixam de ver o resultado antigo)
  const clearSavedDraw = async () => {
    if (!room?.id) return;

    const { error } = await supabase.rpc("save_draw", {
      p_room_id: room.id,
      p_owner_token: localStorage.getItem("ownerToken"),
      p_pairs: [],
    });

    if (error) {
      console.error(error);
    }
  };

  const addParticipant = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) return;

    const { data, error } = await supabase
      .from("participants")
      .insert([
        {
          room_id: room.id,
          name: trimmedName,
          invite_token: crypto.randomUUID(),
        },
      ])
      .select();

    if (error) {
      alert(error.message);
      return;
    }

    await loadParticipants();

    // A lista mudou: o sorteio anterior não vale mais
    setResults([]);
    setRevealedPeople([]);
    setSelectedPerson("");
    await clearSavedDraw();

    setName("");
  };

  const loadParticipants = async () => {
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("room_id", room.id);

    if (error) {
      console.error(error);
      return;
    }

    setParticipants(data);
  };

  useEffect(() => {
    if (room?.id) {
      loadParticipants();
    }
  }, [room]);

  const removeParticipant = async (participantId) => {
    if (!room?.id) return;

    try {
      const { data: deleted, error } = await supabase
        .from("participants")
        .delete()
        .eq("id", participantId)
        .eq("room_id", room.id)
        .select("id");

      if (error) throw error;

      // O Supabase pode não retornar erro quando uma política RLS impede a exclusão.
      if (!deleted || deleted.length === 0) {
        alert(
          "O participante não foi removido. Verifique as permissões de exclusão da tabela participants no Supabase."
        );
        return;
      }

      await loadParticipants();

      setResults([]);
      setRevealedPeople([]);
      setSelectedPerson("");
      setRevealedFriend(null);
      setShowWishlist(false);

      if (selectedParticipant?.id === participantId) {
        setSelectedParticipant(null);
      }

      await clearSavedDraw();
    } catch (error) {
      console.error("Erro ao remover participante:", error);
      alert(`Não foi possível remover o participante: ${error.message}`);
    }
  };

  const performDraw = async () => {
    if (participants.length < 2) return;

    let shuffled = [];
    let validDraw = false;

    while (!validDraw) {
      shuffled = [...participants];

      for (let i = shuffled.length - 1; i > 0; i--) {
        const random = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[random]] = [shuffled[random], shuffled[i]];
      }

      // Compara por id (nomes repetidos não travam mais o sorteio)
      validDraw = participants.every(
        (participant, index) => participant.id !== shuffled[index].id,
      );
    }

    // Salva o sorteio no banco para os convidados verem
    const { error } = await supabase.rpc("save_draw", {
      p_room_id: room.id,
      p_owner_token: localStorage.getItem("ownerToken"),
      p_pairs: participants.map((participant, index) => ({
        giver_id: participant.id,
        receiver_id: shuffled[index].id,
      })),
    });

    if (error) {
      console.error(error);
      alert(`Não foi possível salvar o sorteio: ${error.message}`);
      return;
    }

    const drawResults = participants.map((participant, index) => ({
      giver_id: participant.id,
      receiver_id: shuffled[index].id,
      giver: participant.name,
      receiver: shuffled[index].name,
    }));

    setRevealedPeople([]);
    setResults(drawResults);
    setSelectedPerson("");
    setRevealedFriend(null);
    setShowWishlist(false);
  };

  const revealFriend = () => {
    if (revealedPeople.includes(selectedPerson)) {
      alert("Este participante já revelou seu amigo secreto.");
      return;
    }

    const result = results.find((item) => item.giver_id === selectedPerson);

    if (!result) {
      alert(
        "Faça o sorteio novamente: este participante não está no resultado atual.",
      );
      return;
    }

    setRevealedFriend(result.receiver);

    setRevealedPeople((previous) => [...previous, selectedPerson]);
  };

  const resetDraw = async () => {
    try {
      await clearSavedDraw();

      if (room?.id) {
        const { error } = await supabase
          .from("participants")
          .delete()
          .eq("room_id", room.id);

        if (error) throw error;
      }

      setParticipants([]);
      setResults([]);
      setSelectedPerson("");
      setRevealedFriend(null);
      setRevealedPeople([]);
      setShowWishlist(false);
      setSelectedParticipant(null);
      setRoom(null);

      localStorage.removeItem("participants");
      localStorage.removeItem("results");
      localStorage.removeItem("revealedPeople");
      localStorage.removeItem("currentRoom");
      localStorage.removeItem("ownerToken");
    } catch (error) {
      console.error("Erro ao limpar a sala:", error);
      alert(`Não foi possível limpar a sala: ${error.message}`);
    }
  };

  const addWish = () => {
    if (!wish.trim() || !selectedParticipant) return;

    const updatedParticipants = participants.map((participant) => {
      if (participant.name === selectedParticipant.name) {
        return {
          ...participant,
          wishlist: [...(participant.wishlist || []), wish.trim()],
        };
      }

      return participant;
    });

    setParticipants(updatedParticipants);
    setWish("");
  };

  const removeWish = (participantName, wishIndex) => {
    const updatedParticipants = participants.map((participant) => {
      if (participant.name === participantName) {
        return {
          ...participant,
          wishlist: (participant.wishlist || []).filter(
            (_, index) => index !== wishIndex,
          ),
        };
      }

      return participant;
    });

    setParticipants(updatedParticipants);
  };

  const createRoom = async () => {
    if (!roomName.trim()) {
      alert("Informe o nome da sala.");
      return;
    }

    if (!roomPassword.trim()) {
      alert("Informe uma senha.");
      return;
    }

    try {
      setLoadingRoom(true);

      const roomCode = generateRoomCode();
      const ownerToken = crypto.randomUUID();

      const { data, error } = await supabase
        .from("rooms")
        .insert([
          {
            name: roomName,
            room_code: roomCode,
            password_hash: roomPassword,
            owner_token: ownerToken,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      localStorage.setItem("ownerToken", ownerToken);

      localStorage.setItem("currentRoom", JSON.stringify(data));

      setRoom(data);

      alert(`Sala criada!\nCódigo: ${roomCode}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao criar sala.");
    } finally {
      setLoadingRoom(false);
    }
  };

  if (!room) {
    return (
      <div className="createContainer">
        <h1>
          Criar Sala <GiftIcon size={38} className="giftTitle" />
        </h1>

        <StepGuide steps={createSteps} current={0} />

        <div className="inputArea">
          <input
            type="text"
            placeholder="Nome da sala"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha da sala"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
          />

          <button onClick={createRoom} disabled={loadingRoom}>
            {loadingRoom ? "Criando..." : "Criar Sala"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="createContainer">
      <h1>
        Criar Sorteio <GiftIcon size={38} className="giftTitle" />
      </h1>

      <StepGuide
        steps={createSteps}
        current={results.length > 0 ? 3 : participants.length >= 2 ? 2 : 1}
      />

      <div
        style={{
          background: "#1e293b",
          padding: "15px",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        <p>
          <strong>Sala:</strong> {room.name}
        </p>

        <div className="codeRow">
          <p>
            <strong>Código:</strong>{" "}
            <span className="roomCode">{room.room_code}</span>
          </p>

          <button
            className={`copyButton ${copied ? "copied" : ""}`}
            onClick={copyRoomCode}
          >
            <i
              className={`bi ${copied ? "bi-check-lg" : "bi-clipboard"} me-1`}
            ></i>
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>

        <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
          Convidados entram em /entrar com o código e a senha da sala.
        </p>
      </div>

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
        {participants.map((person) => (
          <motion.div
            key={person.id}
            className="participantCard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <button
                className="wishButton"
                onClick={() => setSelectedParticipant(person)}
              >
                <i className="bi bi-gift-fill giftInline"></i>
              </button>
            </div>
            <div>
              <strong>{person.name}</strong>

              <p
                style={{
                  fontSize: "12px",
                  marginTop: "4px",
                  opacity: 0.7,
                }}
              >
                {person.wishlist?.length ?? 0} desejos
              </p>
            </div>

            <button onClick={() => removeParticipant(person.id)}>❌</button>
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

      <button className="resetButton" onClick={resetDraw}>
        Limpar Tudo
      </button>

      {results.length > 0 && (
        <div className="revealSection">
          <h2>
            Revelar Amigo Secreto{" "}
            <i className="bi bi-gift-fill giftInline"></i>
          </h2>

          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
          >
            <option value="">Selecione seu nome</option>

            {participants.map((participant) => (
              <option
                key={participant.id}
                value={participant.id}
                disabled={revealedPeople.includes(participant.id)}
              >
                {revealedPeople.includes(participant.id)
                  ? `${participant.name} ✅`
                  : participant.name}
              </option>
            ))}
          </select>

          <button
            className="revealButton"
            onClick={() => setShowConfirmation(true)}
            disabled={!selectedPerson}
          >
            Revelar Meu Amigo
          </button>
        </div>
      )}

      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            className="modalOverlay"
            onClick={() => setShowConfirmation(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="drawModal"
              onClick={(e) => e.stopPropagation()}
              initial={{
                opacity: 0,
                scale: 0.8,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                y: 30,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <h2>⚠️ Atenção</h2>

              <p>Tem certeza que ninguém está olhando para a tela?</p>

              <div className="confirmButtons">
                <button
                  className="cancelButton"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancelar
                </button>

                <button
                  className="confirmButton"
                  onClick={() => {
                    setShowConfirmation(false);
                    revealFriend();
                  }}
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedParticipant && (
        <div
          className="modalOverlay"
          onClick={() => setSelectedParticipant(null)}
        >
          <div className="drawModal" onClick={(e) => e.stopPropagation()}>
            <h2>Desejos de {selectedParticipant.name}</h2>

            <input
              type="text"
              placeholder="Novo desejo"
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addWish();
                }
              }}
            />

            <button
              className="confirmButton"
              onClick={addWish}
              style={{
                width: "100%",
                marginTop: "10px",
              }}
            >
              Adicionar Desejo
            </button>

            <div className="wishlistContainer">
              {participants
                .find((p) => p.name === selectedParticipant.name)
                ?.wishlist?.map((item, index) => (
                  <div key={index} className="wishItem">
                    <span>
                      <i className="bi bi-gift-fill giftInline"></i> {item}
                    </span>
                  </div>
                ))}
            </div>

            <button onClick={() => setSelectedParticipant(null)}>Fechar</button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {revealedFriend && (
          <motion.div
            className="modalOverlay"
            onClick={() => setRevealedFriend(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="drawModal"
              onClick={(e) => e.stopPropagation()}
              initial={{
                opacity: 0,
                scale: 0.8,
                rotateX: -20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateX: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <h2>🎉 Seu Amigo Secreto é:</h2>

              <motion.h1
                initial={{
                  scale: 0,
                  rotate: -10,
                }}
                animate={{
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 15,
                }}
              >
                {revealedFriend}
              </motion.h1>

              <button
                className="confirmButton"
                style={{
                  width: "100%",
                  marginBottom: "10px",
                }}
                onClick={() => setShowWishlist(true)}
              >
                <i className="bi bi-gift-fill giftInline"></i> Ver Wishlist
              </button>

              <button onClick={() => setRevealedFriend(null)}>Fechar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showWishlist && revealedFriend && (
        <div className="modalOverlay" onClick={() => setShowWishlist(false)}>
          <div className="drawModal" onClick={(e) => e.stopPropagation()}>
            <h2>
              <i className="bi bi-gift-fill giftInline"></i> Wishlist de{" "}
              {revealedFriend}
            </h2>

            <div className="wishlistContainer">
              {participants
                .find((p) => p.name === revealedFriend)
                ?.wishlist?.map((item, index) => (
                  <div key={`${item}-${index}`} className="wishItem">
                    <i className="bi bi-gift-fill giftInline"></i> {item}
                  </div>
                ))}
            </div>

            {(participants.find((p) => p.name === revealedFriend)?.wishlist
              ?.length ?? 0) === 0 && (
              <p>Esta pessoa ainda não cadastrou desejos.</p>
            )}

            <button onClick={() => setShowWishlist(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateDraw;