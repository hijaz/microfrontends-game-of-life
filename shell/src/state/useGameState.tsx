import * as React from "react";
import { initiateBoard, tick } from "./engine";
import { StateType, ActionType } from "./types";

const initialState: StateType = {
  tick: 0,
  width: 0,
  height: 0,
  cells: [],
};

const GameStateContext = React.createContext<{
  state: StateType;
  dispatch: React.Dispatch<ActionType>;
} | null>(null);
GameStateContext.displayName = "GameStateContext";

function gameStateReducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case "init": {
      const { width, height } = action.payload;
      if (!width || !height) throw "width and height must be provided";
      return {
        ...state,
        width,
        height,
        cells: initiateBoard(width, height),
      };
    }
    case "click": {
      const { idx, idy } = action.payload;
      if (!idx || !idy) throw "idx and idy must be provided";
      const toggledCellState = !state.cells[idx][idy];
      const newCellsState = [...state.cells];
      newCellsState[idx][idy] = toggledCellState;
      return {
        ...state,
        cells: newCellsState,
      };
    }
    case "tick": {
      const { width, height, cells } = state;
      return {
        ...state,
        tick: state.tick + 1,
        cells: tick({ width, height, cells }),
      };
    }
    case "reset": {
      return initialState;
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export function GameStateProvider({ children }) {
  const [state, dispatch] = React.useReducer(gameStateReducer, initialState);
  const value = { state, dispatch };
  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

function useGameState() {
  const context = React.useContext(GameStateContext);
  if (context === undefined) {
    throw new Error(`useGameState must be used within a GameStateProvider`);
  }
  return context;
}

export default useGameState;