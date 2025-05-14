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
  return (
    <div className="w-full max-w-md">
      <h2 className="text-xl mb-4 text-center">⚔️ Battle</h2>
      <div className="flex justify-between mb-6">
        <div className="flex flex-col items-center space-y-2">
          {playerTanks.map(tank => (
            <TankDisplay key={tank.id} tank={tank} showCooldown />
          ))}
        </div>
        <div className="flex flex-col items-center space-y-2">
          {enemyTanks.map(enemy => (
            <TankDisplay key={enemy.id} tank={enemy} isEnemy />
          ))}
        </div>
      </div>

      {isPlayerTurn ? (
        playerTanks[turnIndex]?.hp > 0 ? (
          <div className="text-center mb-4">
            <p className="mb-2">🎯 Tank {playerTanks[turnIndex].id}'s turn</p>

            <p className="mb-1">Target:</p>
            <div className="flex justify-center gap-2 mb-3">
              {enemyTanks.map((enemy, i) =>
                enemy.hp > 0 ? (
                  <button
                    key={i}
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
              <button
                disabled={playerTanks[turnIndex].cooldown > 0}
                onClick={() => handlePlayerAttack(selectedEnemyIndex, "cannon")}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50"
              >
                💥 Cannon
              </button>
              <button
                onClick={() => handlePlayerAttack(selectedEnemyIndex, "machinegun")}
                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded text-sm"
              >
                🔫 Machine Gun
              </button>
              {isFullyUpgraded(playerTanks[turnIndex]) &&
                !playerTanks[turnIndex].missileUsed && (
                  <button
                    onClick={() => handlePlayerAttack(selectedEnemyIndex, "missile")}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                  >
                    🚀 Missile
                  </button>
                )}
            </div>
          </div>
        ) : (
          <p className="text-center">⛔ Tank {playerTanks[turnIndex].id} is destroyed</p>
        )
      ) : (
        <p className="text-center">⏳ Enemy Turn...</p>
      )}

      <div className="bg-gray-800 p-4 rounded mt-4 max-h-60 overflow-y-auto text-sm">
        {log.map((entry, i) => (
          <p key={i}>{entry}</p>
        ))}
      </div>
    </div>
  );
}

