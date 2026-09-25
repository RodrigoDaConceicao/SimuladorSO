// ProcessCard.js
import React from "react";
import { MEMORY_CAPACITY } from "../../memory/memory";

import "./style.css";

function ProcessCard({ process, index, onChange, algorithm, disabled }) {
  const disableTime = disabled;
  const disablePages = disabled;
  const disableDeadline = disabled || (algorithm != "edf");
  const disableArrival = disabled || index === 0;

  return (
    <div className="process-config-card">
      <h4>Processo {process.id}:</h4>
      <div className="card-labels">
        <label className={`process-config-label ${disableTime ? "disabled" : ""}`}>
          Tempo:
          <input
            type="number"
            min="1"
            max="20"
            value={process.tempo}
            onChange={(e) => onChange(index, "tempo", e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className={`process-config-label ${disablePages ? "disabled" : ""}`}>
          Páginas:
          <input
            type="number"
            min="1"
            max="10"
            value={process.paginas}
            onChange={(e) => onChange(index, "paginas", e.target.value)}
            disabled={disabled}
          />
        </label>
        <label  className={`process-config-label ${disableDeadline ? "disabled" : ""}`}>
          Deadline:
          <input
            type="number"
            min="0"
            value={process.deadline}
            onChange={(e) => onChange(index, "deadline", e.target.value)}
            disabled={disabled || (algorithm != "edf") }
          />
        </label>
        <label className={`process-config-label ${disableArrival ? "disabled" : ""}`}>
          Chegada:
          <input
            type="number"
            min="0"
            value={process.chegada}
            onChange={(e) => onChange(index, "chegada", e.target.value)}
            disabled={disabled || index === 0}
          />
        </label>
      </div>
    </div>
  );
}

export default ProcessCard;
