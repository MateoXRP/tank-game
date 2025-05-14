import React from "react";
import TankDisplay from "./TankDisplay";

export default function Battle({
  playerTanks,
  enemyTanks,
  turnIndex,
  isPlayerTurn,
  handlePlayerAttack,
  log,
  isFullyUpgraded,
  selectedEnemyIndex,
  setSelectedEnemyIndex
}) {
  const currentTank = playerTanks[turnIndex];

  function handleAttackWithEffect(type) {
    handlePlayerAttack(selectedEnemyIndex, type);
  }

  return (
    <div className="w-full max-w-md text-white">
      <h2 className="text-xl mb-4 text-center">⚔️ Battle</h2>

      <div className="flex justify-between mb-6">
        <div className="flex flex-col items-center space-y-2">
          {playerTanks.map((tank) => (
            <TankDisplay key={tank.uid} tank={tank} />
          ))}
        </div>

        <div className="flex flex-col items-center space-y-2">
          {enemyTanks.map((enemy) => (
            <TankDisplay key={enemy.uid} tank={enemy} isEnemy />
          ))}
        </div>
      </div>

      {isPlayerTurn && currentTank.hp > 0 ? (
        <div className="text-center mb-4">
          <p className="mb-2">🎯 Tank {currentTank.id}'s turn</p>

          <p className="mb-1">Target:</p>
          <div className="flex justify-center gap-2 mb-3">
            {enemyTanks.map((enemy, i) =>
              enemy.hp > 0 ? (
                <button
                  key={enemy.uid}
                  onClick={() => setSelectedEnemyIndex(i)}
                  className={`px-2 py-1 rounded text-sm ${
                    selectedEnemyIndex === i ? "bg-red-500" : "bg-gray-600"
                  }`}
                >
                  Enemy {enemy.id}
                </button>
              ) : null
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {/* 💥 Cannon */}
            <button
              onClick={() => handleAttackWithEffect("cannon")}
              disabled={currentTank.cooldown > 0}
              className={`px-3 py-1 rounded text-sm ${
                currentTank.cooldown > 0
                  ? "bg-gray-500 opacity-50 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              💥 Cannon {currentTank.cooldown > 0 ? `(CD: ${currentTank.cooldown})` : ""}
            </button>

            {/* 🔫 Machine Gun */}
            <button
              onClick={() => handleAttackWithEffect("machinegun")}
              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded text-sm"
            >
              🔫 Machine Gun
            </button>

            {/* 🚀 Missile */}
            {isFullyUpgraded(currentTank) && !currentTank.missileUsed && (
              <button
                onClick={() => handleAttackWithEffect("missile")}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
              >
                🚀 Missile
              </button>
            )}
          </div>
        </div>
      ) : isPlayerTurn ? (
        <p className="text-center mb-4">⛔ Tank {currentTank.id} is destroyed</p>
      ) : (
        <p className="text-center mb-4">⏳ Enemy Turn...</p>
      )}

      <div className="bg-gray-800 p-4 rounded max-h-60 overflow-y-auto text-sm">
        {log.map((entry, i) => (
          <p key={i}>{entry}</p>
        ))}
      </div>
    </div>
  );
}

