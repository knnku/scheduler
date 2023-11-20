import { useState } from "react";

function useVisualMode(initial) {
  const [mode, setMode] = useState(initial);

  function transition(newMode) {
    setMode(newMode);
  }

  return {
    mode,
    transition,
  };
}
export default useVisualMode;
