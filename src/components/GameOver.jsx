import React from "react";

export default function GameOver({ level, encounter, onRestart }) {
  return (
    <div className="text-center">
      <h2 className="text-xl text-red-500 mb-2">Game Over</h2>
      <p className="mb-4">You reached Level {level}, Encounter {encounter}</p>
      <button
        onClick={onRestart}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        🔄 Restart Game
      </button>
    </div>
  );
}

