
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GiftIcon from "../components/GiftIcon";

const features = [
  {
    icon: "bi-shuffle",
    title: "Sorteio Inteligente",
    text: "Ninguém tira a si mesmo, e cada pessoa vê só o seu amigo secreto.",
  },
  {
    icon: "bi-lock-fill",
    title: "Sala Privada",
    text: "Convide a galera com um código e uma senha. Só quem foi convidado entra.",
  },
  {
    icon: "bi-gift-fill",
    title: "Wishlist",
    text: "Cada participante cadastra seus desejos e o amigo secreto consulta na hora de comprar.",
  },
  {
    icon: "bi-phone-fill",
    title: "Funciona no Celular",
    text: "Layout pensado para telas pequenas: é só abrir o link e participar.",
  },
];

const steps = [
  {
    icon: "bi-door-open-fill",
    title: "Crie a sala",
    text: "Dê um nome, defina uma senha e receba o código da sala.",
  },
  {
    icon: "bi-people-fill",
    title: "Adicione a galera",
    text: "Cadastre os participantes e compartilhe o código e a senha.",
  },
  {
    icon: "bi-stars",
    title: "Sorteie e revele",
    text: "Faça o sorteio e cada convidado revela o seu amigo secreto.",
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <header className="container siteNav">
        <span className="brand">
          <GiftIcon size={30} />
          Amigo Secreto
        </span>

        <button className="navLink" onClick={() => navigate("/entrar")}>
          <i className="bi bi-key-fill me-2"></i>
          Entrar em uma sala
        </button>
      </header>

      <main className="hero container">
        <motion.span
          className="heroBadge"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎄 Prepare o seu Natal
        </motion.span>

        <motion.div
          className="giftFloat"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 12 }}
        >
          <GiftIcon size={96} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Organize seu Amigo Secreto{" "}
          <span className="gradientText">sem complicação</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Crie uma sala privada, convide os participantes com código e senha e
          deixe o sorteio com a gente.
        </motion.p>

        <motion.div
          className="heroButtons"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button className="btnPrimary" onClick={() => navigate("/create")}>
            <i className="bi bi-gift me-2"></i>
            Criar Sorteio
          </button>

          <button className="btnSecondary" onClick={() => navigate("/entrar")}>
            <i className="bi bi-key me-2"></i>
            Entrar em uma Sala
          </button>
        </motion.div>
      </main>

      <section className="container sectionBlock">
        <h2 className="sectionTitle">
          Tudo para um amigo secreto sem estresse
        </h2>

        <div className="row g-4">
          {features.map((item, index) => (
            <div key={item.title} className="col-12 col-md-6 col-lg-3">
              <motion.div
                className="featureCard"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="featureIcon">
                  <i
                    className={`bi ${item.icon}`}
                    aria-hidden="true"
                  ></i>
                </div>

                <h3>{item.title}</h3>

                <p>{item.text}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      <section className="container sectionBlock">
        <h2 className="sectionTitle">Como funciona</h2>

        <div className="row g-4">
          {steps.map((step, index) => (
            <div key={step.title} className="col-12 col-md-4">
              <motion.div
                className="stepCard"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <span className="stepNumber">{index + 1}</span>

                <i
                  className={`bi ${step.icon} stepIcon`}
                  aria-hidden="true"
                ></i>

                <h3>{step.title}</h3>

                <p>{step.text}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      <section className="container sectionBlock">
        <motion.div
          className="ctaBox"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2>Pronto para começar?</h2>

          <p>Leva menos de um minuto para criar a sua sala.</p>

          <button className="btnGold" onClick={() => navigate("/create")}>
            <i className="bi bi-stars me-2"></i>
            Criar minha sala
          </button>
        </motion.div>
      </section>

      <footer className="siteFooter">
        Feito com 💚 e ❤️ para o seu Natal
      </footer>
    </>
  );
}

export default Home;
