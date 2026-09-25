import React, { useEffect, useRef, useState } from "react";
import ProcessCard from "../ProcessCard";
import { IoIosClose } from "react-icons/io";
import Simulation from "../../algorithms/Simulation";

import "./style.css";

function Main() {
  const [numProcesses, setNumProcesses] = useState(1);
  const [algorithm, setAlgorithm] = useState("fifo");
  const [quantum, setQuantum] = useState(1);
  const [overhead, setOverhead] = useState(1);
  const [pagination, setPagination] = useState("fifo");
  const [processData, setProcessData] = useState([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false); // Estado para controle de execução
  const SimDialog = useRef(null);
  const FileInput = useRef(null);
  const FileDownload = useRef(null);
  useEffect(() => {
    fillProcesses(numProcesses);
  }, [numProcesses]);

  const handleNumProcessesChange = (n) => {
    const newNum = Math.max(1, Number(n));
    setNumProcesses(newNum);
  };

  function fillProcesses(newNum) {
    const offset = newNum - processData.length;
    if (offset >= 0) {
      const newProcesses = Array.from({ length: offset }, (_, index) => ({
        id: processData.length + index + 1,
        tempo: 1,
        paginas: 1,
        deadline: 0,
        chegada: 0,
      }));
      setProcessData(processData.concat(newProcesses));
    }
    else if (offset < 0) {
      setProcessData(processData.slice(0, processData.length + offset));
    }
  }

  function handleExport() {
    const headConfig = {
      algorithm: algorithm,
      quantum: quantum,
      overhead: overhead,
      pagination: pagination,
      processData: processData
    }

    FileDownload.current?.setAttribute('href', 'data:application/json;charset=utf-8,' + JSON.stringify(headConfig));

    FileDownload.current?.click();
  }

  function handleImport() {
    FileInput.current?.click();
  }

  function handleUpload() {
    const file = FileInput.current?.files[0];
    if (file == null || file === "")
      return;

    const reader = new FileReader();

    reader.onload = function (event) {
      const obj = JSON.parse(event.target.result);
      if (obj.algorithm)
        setAlgorithm(obj.algorithm)
      if (obj.quantum)
        setQuantum(obj.quantum)
      if (obj.overhead)
        setOverhead(obj.overhead)
      if (obj.pagination)
        setPagination(obj.pagination)
      if (obj.processData)
        setProcessData(obj.processData)
    };

    reader.readAsText(file);
  }

  const handleProcessDataChange = (index, field, value) => {
    if (index === 0 && field === "chegada") {
      value = 0; // Garante que o tempo de chegada do Processo 1 seja sempre 0
      alert("Não podemos alterar a chegada do primeiro processo")
    }
    const updatedProcesses = [...processData];
    updatedProcesses[index][field] = Number(value);
    setProcessData(updatedProcesses);
  };

  const handleSimulationReset = () => {
    setAlgorithm("fifo");
    setQuantum(1);
    setOverhead(1);
    setPagination("fifo");
    setProcessData([]);
    setNumProcesses(1);
    setIsSimulationRunning(false); // Simulação não está mais em execução
  };

  function handleModalClose() {
    setIsSimulationRunning(false); // Simulação não está mais em execução
  }

  const handleStartSimulation = () => {
    setIsSimulationRunning(true); // Inicia a simulação
  };

  return (
    <section className="config-section">
      <form className="config-form">
        <div className="config-form-options">
          <label>
            Número de Processos:
            <input
              type="number"
              min="1"
              value={numProcesses}
              onChange={(e) => handleNumProcessesChange(e.target.value)}
              disabled={isSimulationRunning}

            />
          </label>
          <label>
            Método:
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >

              <option value="fifo">FIFO</option>
              <option value="sjf">SJF</option>
              <option value="edf">EDF</option>
              <option value="round_robin">Round Robin</option>
            </select>
          </label>
          <label>
            Quantum:
            <input
              type="number"
              min="0"
              value={quantum}
              onChange={(e) => setQuantum(Number(e.target.value))}
              disabled={algorithm !== "round_robin" && algorithm !== "edf"}
            />
          </label>
          <label>
            Sobrecarga:
            <input
              type="number"
              min="0"
              value={overhead}
              onChange={(e) => setOverhead(Number(e.target.value))}
            />
          </label>
          <label>
            Paginação:
            <select
              value={pagination}
              onChange={(e) => setPagination(e.target.value)}
            >
              <option value="fifo">FIFO</option>
              <option value="lru">LRU</option>
            </select>
          </label>
        </div>

        <div className="process-config">
          <h3 style={{ marginBottom: "1rem" }}>Configuração dos Processos</h3>
          <div className="process-config-cards_container">
            {processData.map((process, index) => (
              <ProcessCard
                key={process.id}
                process={process}
                index={index}
                onChange={handleProcessDataChange}
                algorithm={algorithm}
                disabled={isSimulationRunning}
              />
            ))}
          </div>
        </div>

        <div className="config-form-button-group">
          <button type="button" onClick={handleStartSimulation}>
            Rodar Simulação
          </button>
          <button type="button" onClick={handleImport}>
            Importar Configuração
          </button>
          <button type="button" onClick={handleExport}>
            Exportar Configuração
          </button>
          <button type="button" onClick={handleSimulationReset}>
            Resetar
          </button>
          <a ref={FileDownload} download="simulador.json" style={{ display: 'none' }} />
          <input ref={FileInput} type="file" style={{ display: 'none' }} accept="application/JSON" onChange={handleUpload} />
        </div>
      </form>

      <dialog className="simulation-modal" ref={SimDialog}>
        <div className="simulation-modal-header">
          <button className="simulation-button" type="button" onClick={handleModalClose}>
            <IoIosClose size={32} />
          </button>
        </div>
        {/* Renderiza o componente de simulação somente se a simulação estiver rodando */}
        {isSimulationRunning && (
          <Simulation {...{algorithm, processData, quantum, overhead, pagination}} />
        )}

      </dialog>
      {isSimulationRunning ? SimDialog.current?.showModal() : SimDialog.current?.close()}
    </section>
  );
}

export default Main;
