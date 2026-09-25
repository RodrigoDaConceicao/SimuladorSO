import { useEffect, useState, useRef } from "react";
import TimelineBlock from "../../components/TimelineBlock/";
import { IoMdPlay, IoMdPause } from "react-icons/io";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import { RiResetLeftFill } from "react-icons/ri";
import { AiFillThunderbolt } from "react-icons/ai";
import { Memory, MEMORY_SIZE, PAGE_SIZE } from "../../memory/memory.js";

import "../style.css";

export default function Simulation({ algorithm, processData, quantum = 1, overhead = 1, pagination }) {
    const [simulationData, setSimulationData] = useState([]);
    const moment = useRef(0);
    const lastTick = useRef(Date.now());
    const [majorTime, setMajorTime] = useState(0);
    const [minorTime, setMinorTime] = useState(0);
    const [finalTime, setFinalTime] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [simulationState, setSimulationState] = useState('paused');

    const diskLength = processData.reduce((sum, p) => sum + p.paginas, 0);
    const memory = useRef(new Memory(pagination, diskLength));
    const currentMemory = memory.current.history[majorTime];

    useEffect(() => {
        memory.current = new Memory(pagination, diskLength);
    }, [processData.length])

    useEffect(() => {
        const interval = setInterval(() => {
            if (finalTime === majorTime)
                setSimulationState('paused');
            if (simulationState != 'running')
                return;

            moment.current += (Date.now() - lastTick.current) * speed / 1000;
            lastTick.current = Date.now();

            var mj = Math.floor(moment.current);
            setMinorTime(moment.current - mj);
            if (mj != majorTime) {
                setMajorTime(mj);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [finalTime, majorTime, simulationState, speed])

    useEffect(() => {
        var time = 0;
        processData.forEach(p => {
            p.remainTime = p.tempo;
            p.timeline = [];
            p.marked = false;
            p.pageFaults = 0;
            p.waitTime = 0
        });
        var remainQuantum = quantum;
        var currentProcess = null;
        var lastCurrentProcess = null;
        var remainOverhead = 0;
        var maxLength = 0;

        memory.current.clearHistory();

        while (true) {
            var activeProcesses = processData.filter(p => p.remainTime > 0);
            var idleProcesses = processData.filter(p => p.chegada > time);

            if (currentProcess?.remainTime <= 0) {
                memory.current.unload(currentProcess.id);
            }

            if (remainQuantum === quantum && remainOverhead <= 0 || !currentProcess?.remainTime) {
                activeProcesses = activeProcesses.filter(p => p.chegada <= time);

                if (activeProcesses.length) {
                    if (algorithm === "fifo" ) {
                        currentProcess = activeProcesses.sort((p, q) => p.chegada - q.chegada)[0];
                    }

                    else if(algorithm === "round_robin"){
                        // Ordena pelo maior tempo de espera (prioriza quem esperou mais tempo)
                        currentProcess = activeProcesses.sort((p, q) => q.waitTime - p.waitTime)[0];
                    
                    }
                
                    else if (algorithm === "sjf") {
                        currentProcess = activeProcesses.sort((p, q) => p.tempo - q.tempo)[0];
                    }
                    else if (algorithm === "edf") {
                        currentProcess = activeProcesses.sort((p, q) => p.deadline - q.deadline)[0];
                    }

                    if (currentProcess && currentProcess.id !== lastCurrentProcess?.id) {
                        currentProcess.pageFaults = memory.current.load(currentProcess.id, currentProcess.paginas);
                    }
                }
                else {
                    currentProcess = null;
                    memory.current.saveHistory();
                }
            }

            processData.forEach(p => {
                if (p.remainTime == 0) {
                    p.timeline.push('end');
                } else if (p.chegada > time) {
                    p.timeline.push('idle');
                } else if (p.id === currentProcess?.id) {
                    if (p.pageFaults > 0) {
                        p.timeline.push('loading');
                        p.pageFaults--;
                    } else if (remainQuantum > 0) {
                        p.timeline.push('exe');
                        p.remainTime--;
                        remainOverhead = overhead;
                        memory.current.saveHistory(p.id);
                        p.waitTime = 0;
                        
                    } else {
                        p.timeline.push('over');
                        p.marked = true;
                        remainOverhead--;
                        memory.current.saveHistory(p.id);
                    
                    }
                } else {
                    p.timeline.push('wait');
                    p.waitTime++;
                }
            });

            maxLength = Math.max(maxLength, time);
            lastCurrentProcess = currentProcess;

            if (algorithm === "edf" || algorithm === "round_robin") remainQuantum--;
            if (remainQuantum < 0 && remainOverhead <= 0 || currentProcess?.remainTime <= 0) remainQuantum = quantum;

            time++;
            if (!activeProcesses.length && !idleProcesses.length) break;
            if (time > 1000) break;
        }

        memory.current.saveHistory();

        processData.forEach(p => {
            if (maxLength > p.timeline.length) p.timeline.push(...Array(maxLength - p.timeline.length).fill('end'));
        });

        setSimulationData(processData);
        setFinalTime(time);
    }, [])

    function getAVGTurnaround(time) {
        var turnaround = 0;

        simulationData.map(p => {
            for (var i = 0; i < time && i < p.timeline.length; i++) {
                if (['wait', 'over', 'exe', 'loading'].includes(p.timeline[i]))
                    turnaround++;
            }
        });

        return turnaround / processData.length;
    }

    function getStatus(process, time) {
        var index = minorTime === 0 ? time - 1 : time;
        if (index < 0)
            return '';
        else if (index >= finalTime)
            return 'Finalizado';

        switch (process.timeline[index]) {
            case 'exe':
                return "Em Execução";
            case 'wait':
                return "Em Espera";
            case 'loading':
                return "Falha de página";
            case 'over':
                return "Sobrecarga";
            case 'idle':
                return "Não carregado";
            case 'end':
                return "Finalizado";
        }
    }

    function handleChangeSpeed(e) {
        setSpeed(e.target.value);
    }
    function handleTogglePlay() {
        if (simulationState === 'running') {
            setSimulationState('paused');
        }
        else {
            lastTick.current = Date.now();
            setSimulationState('running');
        }
    }
    function handlePrevious() {
        if (majorTime > 0) {
            moment.current = majorTime - 1;
            setMajorTime(majorTime - 1);
        } else {
            moment.current = 0;
        }
        setMinorTime(0);
    }
    function handleNext() {
        if (majorTime < finalTime) {
            moment.current = majorTime + 1;
            setMajorTime(majorTime + 1);
        } else {
            moment.current = finalTime;
        }
        setMinorTime(0);
    }
    function handleReset() {
        moment.current = 0;
        setMajorTime(0);
        setMinorTime(0);
        setSimulationState("paused");
    }
    function handleFinish() {
        moment.current = finalTime;
        setMajorTime(finalTime);
        setMinorTime(0);
        setSimulationState("paused");
    }

    const ramUsageText = currentMemory ? 
        `(${currentMemory.pages.filter(p => p).length * PAGE_SIZE} KB / ${MEMORY_SIZE} KB)` 
        : '';

    const diskUsageText = currentMemory ?
        `(${currentMemory.disk.filter(p => p).length * PAGE_SIZE} KB / ${memory.current.diskLength * PAGE_SIZE} KB)`
        : '';

    return (
        <>
            <h3>Simulação {algorithm.toUpperCase()}</h3>
            <div>
                <button className="simulation-controller-button" onClick={handleReset}>
                    <RiResetLeftFill size={32} />
                </button>
                <button
                    className="simulation-controller-button"
                    disabled={simulationState !== 'paused' || majorTime === 0 && minorTime === 0}
                    onClick={handlePrevious}>
                    <MdSkipPrevious size={32} />
                </button>
                <button
                    className="simulation-controller-button"
                    onClick={handleTogglePlay}
                    disabled={majorTime === finalTime}>
                    {simulationState !== 'running' && (<IoMdPlay size={32} />)}
                    {simulationState !== 'paused' && (<IoMdPause size={32} />)}
                </button>
                <button
                    className="simulation-controller-button"
                    disabled={simulationState !== 'paused' || majorTime === finalTime}
                    onClick={handleNext}>
                    <MdSkipNext size={32} />
                </button>
                <button className="simulation-controller-button" onClick={handleFinish}>
                    <AiFillThunderbolt size={32} />
                </button>
            </div>
            <div className="simulation-speed">
                <div>
                    <input disabled={simulationState !== 'paused'} type="range" id="speed" name="speed" min="0.1" max="4" step="0.1" value={speed} onChange={handleChangeSpeed} />
                    <label htmlFor="speed">Clock Speed: {parseFloat(speed).toFixed(1)}</label>
                </div>
                <span>
                    Tempo: {majorTime}
                </span>
            </div>
            <div className="simulation-container">

                {simulationData.map((p) => (
                    <div key={p.id} className="process-row">
                        <h4>
                            <strong>Processo {p.id}</strong>
                            <br></br>
                            {getStatus(p, majorTime)}
                        </h4>
                        <div className="process-timeline">
                            {p.timeline.map((state, index) => (
                                <TimelineBlock key={index} {...{ state, index, majorTime, minorTime }} />
                            ))}
                        </div>
                    </div>
                ))}

            </div>
            <div className="turnaround-info">
                <h4>Turnaround Médio: {getAVGTurnaround(majorTime).toFixed(2)}</h4>
            </div>
            {currentMemory && <div className="memory-info">
                <div className="memory-container">
                    <div className="memory-state">
                        <div>Memória {`${ramUsageText}`}</div>
                        <div className="memory-row">
                            {currentMemory.pages.map((page, index) => (
                                <div key={index} className={
                                    `memory-page ${page ? 'filled' : ''} 
                                    ${page?.using ? 'using' : ''} 
                                    ${page?.loading ? 'loading' : ''}
                                    ${page?.victim ? 'victim' : ''}
                                `}>
                                    {page?.name ?? " "}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="memory-state">
                        <div>Disco {`${diskUsageText}`}</div>
                        <div className="memory-row">
                            {currentMemory.disk.map((page, index) => (
                                <div key={index} className={
                                    `memory-page ${page ? 'filled' : ''} 
                                `}>
                                    {page?.name ?? " "}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>}
        </>
    );
}