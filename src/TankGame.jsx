import { useState, useEffect } from "react";

export default function TankGame() {
  const [level, setLevel] = useState(1);
  const [encounter, setEncounter] = useState(1);
  const [playerTanks, setPlayerTanks] = useState([
    { id: 1, hp: 100, atk: 10, def: 5, upgrades: [], cooldown: 0 },
    { id: 2, hp: 100, atk: 10, def: 5, upgrades: [], cooldown: 0 }
  ]);
  const [enemyTanks, setEnemyTanks] = useState([]);
  const [mode, setMode] = useState("shop");
  const [gold, setGold] = useState(50);
  const [log, setLog] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  useEffect(() => {
    if (mode === "battle" && !isPlayerTurn && enemyTanks.length > 0 && enemyTanks[0].hp > 0) {
      const timeout = setTimeout(() => {
        doEnemyTurn();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [mode, isPlayerTurn, enemyTanks]);

  function generateEnemy() {
    const difficulty = Math.pow(encounter + level * 2, 1.3);
    return [{
      id: 1,
      hp: Math.floor(65 + difficulty * 7),
      atk: Math.floor(11 + difficulty * 1.2),
      def: 5 + Math.floor(difficulty * 0.8)
    }];
  }

  function resetGame() {
    setLevel(1);
    setEncounter(1);
    setPlayerTanks([
      { id: 1, hp: 100, atk: 10, def: 5, upgrades: [], cooldown: 0 },
      { id: 2, hp: 100, atk: 10, def: 5, upgrades: [], cooldown: 0 }
    ]);
    setGold(50);
    setEnemyTanks([]);
    setLog([]);
    setMode("shop");
    setTurnIndex(0);
    setIsPlayerTurn(true);
  }

  function buyUpgrade(tankId, stat) {
    if (gold < 20) return;
    setGold(gold - 20);
    setPlayerTanks(prev =>
      prev.map(t =>
        t.id === tankId ? { ...t, [stat]: t[stat] + 5, upgrades: [...t.upgrades, stat] } : t
      )
    );
  }

  function hasUpgrade(tank, stat) {
    return tank.upgrades.filter(s => s === stat).length;
  }

  function startBattle() {
    const enemies = generateEnemy();
    setEnemyTanks(enemies);
    setMode("battle");
    setLog([`Level ${level} - Encounter ${encounter}: Battle begins!`]);
    const firstAliveIndex = playerTanks.findIndex(t => t.hp > 0);
    setTurnIndex(firstAliveIndex === -1 ? 0 : firstAliveIndex);
    setIsPlayerTurn(false);
  }

  function attack(attacker, defender, multiplier = 1) {
    const damage = Math.max(attacker.atk * multiplier - defender.def, 0);
    return { ...defender, hp: Math.max(defender.hp - damage, 0) };
  }

  function handlePlayerAttack(enemyIndex, weaponType) {
    if (playerTanks[turnIndex].hp <= 0) {
      let nextIndex = turnIndex + 1;
      while (nextIndex < playerTanks.length && playerTanks[nextIndex].hp <= 0) {
        nextIndex++;
      }
      if (nextIndex >= playerTanks.length) {
        setIsPlayerTurn(false);
        setTurnIndex(0);
        return;
      }
      setTurnIndex(nextIndex);
      return;
    }

    const attacker = playerTanks[turnIndex];
    if (weaponType === "cannon" && attacker.cooldown > 0) return;

    const multiplier = weaponType === "cannon" ? 1.5 : 1;
    const target = enemyTanks[enemyIndex];
    if (!target || target.hp <= 0) return;

    const updatedEnemies = [...enemyTanks];
    updatedEnemies[enemyIndex] = attack(attacker, target, multiplier);
    setEnemyTanks(updatedEnemies);

    const updatedPlayers = [...playerTanks];
    if (weaponType === "cannon") updatedPlayers[turnIndex].cooldown = 2;
    setPlayerTanks(updatedPlayers);

    setLog(prev => [
      `🟢 Tank ${attacker.id} uses ${weaponType} on 🔴 Enemy ${target.id}!`,
      ...prev
    ]);

    const enemyAlive = updatedEnemies[0]?.hp > 0;

    if (!enemyAlive) {
      const nextEncounter = encounter + 1;
      const nextLevel = nextEncounter > level * 5 ? level + 1 : level;
      setGold(g => g + 50);
      setEncounter(nextEncounter);
      setLevel(nextLevel);
      setPlayerTanks(prev => restoreTanks(prev));
      setLog(prev => ["🏆 Victory! +50g. Tanks restored. Returning to shop...", ...prev]);
      setTimeout(() => setMode("shop"), 1500);
      return;
    }

    let followingIndex = turnIndex + 1;
    while (followingIndex < playerTanks.length && playerTanks[followingIndex].hp <= 0) {
      followingIndex++;
    }

    if (followingIndex < playerTanks.length) {
      setTurnIndex(followingIndex);
    } else {
      setIsPlayerTurn(false);
      setTurnIndex(0);
    }
  }

  function restoreTanks(tanks) {
    return tanks.map(t => ({
      ...t,
      hp: Math.min(t.hp + 30, 100),
      cooldown: 0
    }));
  }

  function doEnemyTurn() {
    let newPlayers = [...playerTanks];
    let logs = [];

    const enemy = enemyTanks[0];
    const candidates = newPlayers
      .map((tank, i) => ({ ...tank, index: i }))
      .filter(tank => tank.hp > 0);

    if (enemy.hp > 0 && candidates.length > 0) {
      const target = candidates.reduce((lowest, t) => t.def < lowest.def ? t : lowest);
      newPlayers[target.index] = attack(enemy, newPlayers[target.index]);
      logs.unshift(`🔴 Enemy ${enemy.id} hits 🟢 Tank ${newPlayers[target.index].id}!`);
    }

    newPlayers = newPlayers.map(p => ({ ...p, cooldown: Math.max(0, p.cooldown - 1) }));
    setPlayerTanks(newPlayers);
    setLog(prev => [...logs, ...prev]);

    const allPlayersDead = newPlayers.every(p => p.hp <= 0);
    const enemyAlive = enemyTanks[0]?.hp > 0;

    if (allPlayersDead) {
      setLog(prev => ["💀 Game Over", ...prev]);
      setMode("gameover");
      return;
    }

    if (!enemyAlive) {
      const nextEncounter = encounter + 1;
      const nextLevel = nextEncounter > level * 5 ? level + 1 : level;
      setGold(g => g + 50);
      setEncounter(nextEncounter);
      setLevel(nextLevel);
      setPlayerTanks(prev => restoreTanks(prev));
      setLog(prev => ["🏆 Victory! +50g. Tanks restored. Returning to shop...", ...prev]);
      setTimeout(() => setMode("shop"), 1500);
      return;
    }

    const firstAliveIndex = newPlayers.findIndex(p => p.hp > 0);
    setTurnIndex(firstAliveIndex);
    setIsPlayerTurn(true);
  }

  return (
    <div className="p-4 text-white bg-black min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">🛡️ Tank Game</h1>
      <p className="mb-2">Level {level} – Encounter {encounter}</p>
      <p className="mb-2">Gold: {gold}</p>

      {mode === "shop" && (
        <div className="text-center max-w-md w-full space-y-4">
          <h2 className="text-xl mb-2">💰 Upgrade Shop</h2>
          {playerTanks.map(tank => (
            <div key={tank.id} className="p-4 bg-gray-800 rounded-lg shadow">
              <p className="mb-2 font-semibold">Tank {tank.id}</p>
              <p className="text-sm mb-1">HP: {tank.hp} | ATK: {tank.atk} | DEF: {tank.def}</p>
              <div className="flex justify-center gap-4 my-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${i < hasUpgrade(tank, "atk") ? "bg-yellow-400" : "bg-gray-600"}`}></div>
                  ))}
                  <span className="text-xs text-blue-300 ml-1">ATK</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${i < hasUpgrade(tank, "def") ? "bg-yellow-400" : "bg-gray-600"}`}></div>
                  ))}
                  <span className="text-xs text-green-300 ml-1">DEF</span>
                </div>
              </div>
              <div className="flex justify-center space-x-2">
                <button
                  disabled={hasUpgrade(tank, "atk") >= 5 || gold < 20}
                  className={`px-3 py-1 rounded text-sm transition ${
                    hasUpgrade(tank, "atk") >= 5 ? "opacity-50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={() => buyUpgrade(tank.id, "atk")}
                >
                  +5 ATK (20g)
                </button>
                <button
                  disabled={hasUpgrade(tank, "def") >= 5 || gold < 20}
                  className={`px-3 py-1 rounded text-sm transition ${
                    hasUpgrade(tank, "def") >= 5 ? "opacity-50 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                  }`}
                  onClick={() => buyUpgrade(tank.id, "def")}
                >
                  +5 DEF (20g)
                </button>
              </div>
            </div>
          ))}
          <button
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded font-bold"
            onClick={startBattle}
          >
            Start Battle
          </button>
        </div>
      )}

      {mode === "battle" && (
        <div className="w-full max-w-md">
          <h2 className="text-xl mb-4 text-center">⚔️ Battle</h2>
          <div className="flex justify-between mb-6">
            <div className="flex flex-col items-center space-y-2">
              {playerTanks.map(t => (
                <div key={t.id} className="text-center">
                  <div className="text-4xl">●</div>
                  <p>Tank {t.id}</p>
                  <p className="text-xs">ATK: {t.atk} | DEF: {t.def} | CD: {t.cooldown}</p>
                  <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${t.hp}%` }}></div>
                  </div>
                  <p className="text-sm">HP: {t.hp}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center space-y-2">
              {enemyTanks.map(e => (
                <div key={e.id} className="text-center">
                  <div className="text-4xl">●</div>
                  <p>Enemy {e.id}</p>
                  <p className="text-xs">ATK: {e.atk.toFixed(1)} | DEF: {e.def}</p>
                  <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${e.hp}%` }}></div>
                  </div>
                  <p className="text-sm">HP: {e.hp}</p>
                </div>
              ))}
            </div>
          </div>

          {isPlayerTurn ? (
            playerTanks[turnIndex]?.hp > 0 ? (
              <div className="text-center mb-4">
                <p className="mb-2">🎯 Tank {playerTanks[turnIndex].id}'s turn</p>
                <div className="mb-2">
                  <p className="mb-1">Target Enemy {enemyTanks[0].id}</p>
                  <div className="flex justify-center space-x-2">
                    <button
                      disabled={playerTanks[turnIndex].cooldown > 0}
                      onClick={() => handlePlayerAttack(0, "cannon")}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50"
                    >
                      💥 Cannon
                    </button>
                    <button
                      onClick={() => handlePlayerAttack(0, "machinegun")}
                      className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded text-sm"
                    >
                      🔫 Machine Gun
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center">⛔ Tank {playerTanks[turnIndex].id} is destroyed</p>
            )
          ) : (
            <p className="text-center">⏳ Enemy Turn...</p>
          )}

          <div className="bg-gray-800 p-4 rounded mt-4 max-h-60 overflow-y-auto text-sm">
            {log.map((entry, i) => <p key={i}>{entry}</p>)}
          </div>
        </div>
      )}

      {mode === "gameover" && (
        <div className="text-center">
          <h2 className="text-xl text-red-500 mb-2">Game Over</h2>
          <p className="mb-4">You reached Level {level}, Encounter {encounter}</p>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            🔄 Restart Game
          </button>
        </div>
      )}
    </div>
  );
}

