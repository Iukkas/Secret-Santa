import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import StepGuide from "../components/StepGuide";
import GiftIcon from "../components/GiftIcon";

const SESSION_KEY = "guestSession";

const joinSteps = [
  {
    title: "Código e senha",
    hint: "Digite o código da sala e, depois, a senha. Os dois foram enviados pelo organizador.",
  },
  {
    title: "Escolha seu nome",
    hint: "Encontre o seu nome na lista e clique em “Sou eu”.",
  },
  {
    title: "Wishlist e sorteio",
    hint: "Cadastre seus desejos. Quando o organizador fizer o sorteio, revele o seu amigo secreto.",
  },
];

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function JoinRoom() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Resposta do join_room (usada na etapa "escolha seu nome")
  const [roomInfo, setRoomInfo] = useState(null);

  // { code, password, participantId } guardado só na aba atual
  const [session, setSession] = useState(readSession);

  const [state, setState] = useState(null);
  const [wish, setWish] = useState("");
  const [showGiftee, setShowGiftee] = useState(false);

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
    setState(null);
    setRoomInfo(null);
    setShowGiftee(false);
    setPassword("");
  };

  const loadState = useCallback(async () => {
    if (!session) return;

    const { data, error } = await supabase.rpc("guest_state", {
      p_code: session.code,
      p_password: session.password,
      p_participant_id: session.participantId,
    });

    if (error) {
      console.error(error);
      logout();
      return;
    }

    setState(data);
  }, [session]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const handleJoin = async () => {
    if (!code.trim() || !password.trim()) {
      alert("Informe o código e a senha da sala.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.rpc("join_room", {
      p_code: code,
      p_password: password,
    });

    setLoading(false);

    if (error) {
      alert("Código ou senha inválidos.");
      return;
    }

    setRoomInfo(data);
  };

  const pickName = (participant) => {
    const newSession = {
      code: code.trim().toUpperCase(),
      password,
      participantId: participant.id,
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  };

  const addWish = async () => {
    if (!wish.trim()) return;

    const { error } = await supabase.rpc("guest_add_wish", {
      p_code: session.code,
      p_password: session.password,
      p_participant_id: session.participantId,
      p_text: wish,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setWish("");
    loadState();
  };

  const removeWish = async (wishId) => {
    const { error } = await supabase.rpc("guest_remove_wish", {
      p_code: session.code,
      p_password: session.password,
      p_participant_id: session.participantId,
      p_wish_id: wishId,
    });

    if (error) {
      alert(error.message);
      return;
    }

    loadState();
  };

  const revealGiftee = () => {
    if (window.confirm("Tem certeza que ninguém está olhando para a tela?")) {
      setShowGiftee(true);
    }
  };

  // ETAPA 1: código + senha
  if (!session && !roomInfo) {
    return (
      <div className="createContainer joinContainer">
        <h1>Entrar na Sala 🔑</h1>

        <StepGuide steps={joinSteps} current={0} />

        <div className="inputArea">
          <input
            type="text"
            placeholder="Código da sala"
            value={code}
            maxLength={6}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />

          <input
            type="password"
            placeholder="Senha da sala"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />

          <button onClick={handleJoin} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    );
  }

  // ETAPA 2: escolher o próprio nome
  if (!session && roomInfo) {
    return (
      <div className="createContainer joinContainer">
        <h1>
          {roomInfo.room.name} <GiftIcon size={38} className="giftTitle" />
        </h1>

        <StepGuide steps={joinSteps} current={1} />
        <p className="joinSubtitle">Quem é você?</p>

        <div className="participantsList">
          {roomInfo.participants.length === 0 && (
            <p className="joinEmpty">
              O organizador ainda não adicionou participantes.
            </p>
          )}

          {roomInfo.participants.map((p) => (
            <div key={p.id} className="participantCard">
              <strong>{p.name}</strong>
              <button className="pickButton" onClick={() => pickName(p)}>
                Sou eu ➜
              </button>
            </div>
          ))}
        </div>

        <button className="resetButton" onClick={logout}>
          Voltar
        </button>
      </div>
    );
  }

  // ETAPA 3: painel do convidado
  if (!state) {
    return (
      <div className="createContainer joinContainer">
        <p style={{ textAlign: "center" }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="createContainer joinContainer">
      <h1>
        Olá, {state.me.name}! <GiftIcon size={38} className="giftTitle" />
      </h1>

      <StepGuide steps={joinSteps} current={2} />

      <h2 className="joinSectionTitle">Minha wishlist</h2>

      <div className="inputArea">
        <input
          type="text"
          placeholder="Novo desejo"
          value={wish}
          maxLength={200}
          onChange={(e) => setWish(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addWish()}
        />

        <button onClick={addWish}>Adicionar</button>
      </div>

      <div className="wishlistContainer">
        {state.my_wishes.length === 0 && (
          <p>Você ainda não cadastrou desejos.</p>
        )}

        {state.my_wishes.map((item) => (
          <div key={item.id} className="wishItem">
            <span>
              <i className="bi bi-gift-fill giftInline"></i> {item.text}
            </span>

            <button
              className="deleteWishButton"
              onClick={() => removeWish(item.id)}
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      <div className="revealSection">
        <h2>Meu Amigo Secreto</h2>

        {!state.giftee && (
          <p>O sorteio ainda não foi realizado. Volte mais tarde!</p>
        )}

        {state.giftee && !showGiftee && (
          <button className="revealButton" onClick={revealGiftee}>
            Revelar Meu Amigo
          </button>
        )}
      </div>

      <button className="resetButton" onClick={logout}>
        Sair
      </button>

      {state.giftee && showGiftee && (
        <div className="modalOverlay" onClick={() => setShowGiftee(false)}>
          <div className="drawModal" onClick={(e) => e.stopPropagation()}>
            <h2>🎉 Seu Amigo Secreto é:</h2>

            <h1>{state.giftee.name}</h1>

            <h2 style={{ fontSize: "18px" }}>Wishlist</h2>

            <div className="wishlistContainer">
              {state.giftee.wishes.map((item) => (
                <div key={item.id} className="wishItem">
                  <i className="bi bi-gift-fill giftInline"></i> {item.text}
                </div>
              ))}
            </div>

            {state.giftee.wishes.length === 0 && (
              <p>Esta pessoa ainda não cadastrou desejos.</p>
            )}

            <button onClick={() => setShowGiftee(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default JoinRoom;