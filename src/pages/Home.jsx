import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <main className="hero">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Organize seu Amigo Secreto
          de forma moderna
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Crie sorteios, convide participantes e envie
          os resultados automaticamente.
        </motion.p>

        <motion.div
          className="heroButtons"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button className="btnPrimary" onClick={() => navigate("/create")}>
            Criar Sorteio
          </button>

          <button className="btnSecondary">
            Ver Demonstração
          </button>
        </motion.div>
      </main>

      <section className="features">
        <div className="card">
          <h3>🎲 Sorteio Inteligente</h3>
          <p>Ninguém tira a si mesmo.</p>
        </div>

        <div className="card">
          <h3>📧 Envio Automático</h3>
          <p>Cada participante recebe seu resultado.</p>
        </div>

        <div className="card">
          <h3>📱 Mobile First</h3>
          <p>Funciona perfeitamente no celular.</p>
        </div>
      </section>
    </>
  );
}

export default Home;