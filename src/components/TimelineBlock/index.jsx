import React from "react";
import "./style.css";

const TimelineBlock = ({ state, index, majorTime, minorTime }) => {
  function getClassName(state) {
    switch (state) {
      case "exe":
        return "green";
      case "wait":
        return "yellow";
      case "loading":
        return "orange";
      case "idle":
        return "light-gray";
      case "end":
        return "dark-gray";
      case "over":
        return "red";
      default:
        return "";
    }
  };

  function getColor(state) {
    switch (state) {
      case "exe":
        return "green";
      case "wait":
        return "yellow";
      case "loading":
        return "orange";
      case "idle":
        return "lightgray";
      case "end":
        return "#5F5F5F";
      case "over":
        return "red";
      default:
        return "";
    }
  }

  return (
    <div
      key={index}
      className={`timeline-block ${getClassName(state)} ${index >= majorTime ? "invisible" : ""} ${index === majorTime ? "progress" : ""}`}
    >
      {index === majorTime && (<div className={`timeline-progress ${getClassName(state)}`} style={{ height: "100%", width: `${minorTime * 100}%` }}></div>)}
      <p >
      {index}
      </p>
      
    </div>
  );
};

export default TimelineBlock;
