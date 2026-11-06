// Guia de passos reutilizável.
// steps: [{ title: "Código e senha", hint: "Texto que aparece quando este passo está ativo" }]
// current: índice do passo atual (começa em 0)
function StepGuide({ steps, current }) {
  return (
    <div className="stepGuide">
      <ol className="stepGuideList">
        {steps.map((step, index) => {
          const status =
            index < current ? "done" : index === current ? "active" : "todo";

          return (
            <li key={step.title} className={`stepGuideItem ${status}`}>
              <span className="stepGuideDot">
                {status === "done" ? (
                  <i className="bi bi-check-lg"></i>
                ) : (
                  index + 1
                )}
              </span>

              <span className="stepGuideLabel">{step.title}</span>
            </li>
          );
        })}
      </ol>

      <p className="stepGuideHint" key={current}>
        <i className="bi bi-lightbulb-fill me-2"></i>
        {steps[current].hint}
      </p>
    </div>
  );
}

export default StepGuide;