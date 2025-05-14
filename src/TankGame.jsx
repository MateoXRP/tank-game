import { useState, useEffect } from "react";
import Shop from "./components/Shop";
import Battle from "./components/Battle";
import GameOver from "./components/GameOver";

export default function TankGame() {
  const [level, setLevel] = useState(1);
  const [encounter, setEncounter] = useState(1);
  const [playerTanks, setPlayerTanks] = useState([
    { id: 1, hp: 100, atk: 10, def: 5, upgrades: [], cooldown: 0, missileUsed: false },
    { id: 2, hp: 100, atk: 10, def: 5, upgrades: [], cooldown: 0, missileUsed: false }
  ]);
  const [enemyTanks, setEnemyTanks] = useState([]);
  const [mode, setMode] = useState("shop");
  const [gold, setGold] = useState(50);
  const [log, setLog] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [selectedEnemyIndex, setSelectedEnemyIndex] = useState(0);

  useEffect(() => {
    if (mode === "battle" && !isPlayerTurn && enemyTanks.some(e => e.hp > 0)) {
      const timeout = setTimeout(() => doEnemyTurn(), 500);
      return () => clearTimeout(timeout);
    }
  }, [mode, isPlayerTurn, enemyTanks]);

  function generateEnemies() {
    const difficulty = Math.pow(encounter + level * 2, 1.3);
    const count = Math.random() < 0.5 ? 1 : 2;
    const enemies = [];

    for (let i = 0; i < count; i++) {
      const isLight = Math.random() < 0.5;
      enemies.push({
        id: i + 1,
        type: isLight ? "light" : "med",
        hp: isLight ? Math.floor((65 + difficulty * 7) * 0.5) : Math.floor(65 + difficulty * 7),
        atk: isLight ? Math.floor((11 + difficulty * 1.2) * 0.5) : Math.floor(11 + difficulty * 1.2),
        def: isLight ? Math.floor((5 + difficulty * 0.8) * 0.5) : Math.floor(5 + difficulty * 0.8)
      });
    }

    return enemies;
  }

  function resetGame() {
    setLevel(1);
    setEncounter(1);
    setPlayerTanks([
      { id: 1, hp: 100, atk: 10, def: 5, upgrades: [], cooldown: 0, missileUsed: false },
      { id: 2, hp: 100, atk: 10, def: 5, upgrades: [], cooldown: 0, missileUsed: false }
    ]);
    setGold(50);
    setEnemyTanks([]);
    setLog([]);
    setMode("shop");
    setTurnIndex(0);
    setIsPlayerTurn(true);
    setSelectedEnemyIndex(0);
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

  function isFullyUpgraded(tank) {
    return hasUpgrade(tank, "atk") === 5 && hasUpgrade(tank, "def") === 5;
  }

  function startBattle() {
    const enemies = generateEnemies();
    setEnemyTanks(enemies);
    setMode("battle");
    setLog([`Level ${level} - Encounter ${encounter}: Battle begins!`]);
    const firstAliveIndex = playerTanks.findIndex(t => t.hp > 0);
    setTurnIndex(firstAliveIndex === -1 ? 0 : firstAliveIndex);
    setIsPlayerTurn(false);
    setSelectedEnemyIndex(0);
  }

  function attack(attacker, defender, multiplier = 1) {
    const damage = Math.max(attacker.atk * multiplier - defender.def, 0);
    return { ...defender, hp: Math.max(defender.hp - damage, 0) };
  }

  function handlePlayerAttack(enemyIndex, weaponType) {
    if (!enemyTanks[enemyIndex] || enemyTanks[enemyIndex].hp <= 0) return;
    if (playerTanks[turnIndex].hp <= 0) return;

    const attacker = playerTanks[turnIndex];
    if (weaponType === "cannon" && attacker.cooldown > 0) return;
    if (weaponType === "missile" && attacker.missileUsed) return;

    let multiplier = 1;
    if (weaponType === "cannon") multiplier = 1.5;
    if (weaponType === "missile") multiplier = 3;

    const updatedEnemies = [...enemyTanks];
    updatedEnemies[enemyIndex] = attack(attacker, updatedEnemies[enemyIndex], multiplier);
    setEnemyTanks(updatedEnemies);

    const updatedPlayers = [...playerTanks];
    if (weaponType === "cannon") updatedPlayers[turnIndex].cooldown = 2;
    if (weaponType === "missile") updatedPlayers[turnIndex].missileUsed = true;
    setPlayerTanks(updatedPlayers);

    setLog(prev => [
      `🟢 Tank ${attacker.id} uses ${weaponType} on 🔴 Enemy ${enemyTanks[enemyIndex].id}!`,
      ...prev
    ]);

    const allEnemiesDefeated = updatedEnemies.every(e => e.hp <= 0);
    if (allEnemiesDefeated) {
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

    let nextIndex = turnIndex + 1;
    while (nextIndex < playerTanks.length && playerTanks[nextIndex].hp <= 0) {
      nextIndex++;
    }

    if (nextIndex < playerTanks.length) {
      setTurnIndex(nextIndex);
    } else {
      setIsPlayerTurn(false);
      setTurnIndex(0);
    }
  }

  function restoreTanks(tanks) {
    return tanks.map(t => ({
      ...t,
      hp: Math.min(t.hp + 30, 100),
      cooldown: 0,
      missileUsed: false
    }));
  }

  function doEnemyTurn() {
    let newPlayers = [...playerTanks];
    let logs = [];

    enemyTanks.forEach(enemy => {
      if (enemy.hp > 0) {
        const targets = newPlayers
          .map((tank, i) => ({ ...tank, index: i }))
          .filter(tank => tank.hp > 0);

        if (targets.length > 0) {
          const target = targets.reduce((a, b) => a.def < b.def ? a : b);
          newPlayers[target.index] = attack(enemy, newPlayers[target.index]);
          logs.unshift(`🔴 Enemy ${enemy.id} hits 🟢 Tank ${target.index + 1}!`);
        }
      }
    });

    newPlayers = newPlayers.map(p => ({
      ...p,
      cooldown: Math.max(0, p.cooldown - 1)
    }));

    setPlayerTanks(newPlayers);
    setLog(prev => [...logs, ...prev]);

    const allPlayersDefeated = newPlayers.every(p => p.hp <= 0);
    const allEnemiesDefeated = enemyTanks.every(e => e.hp <= 0);

    if (allPlayersDefeated) {
      setLog(prev => ["💀 Game Over", ...prev]);
      setMode("gameover");
      return;
    }

    if (allEnemiesDefeated) {
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

    const nextTank = newPlayers.findIndex(p => p.hp > 0);
    setTurnIndex(nextTank);
    setIsPlayerTurn(true);
  }

  return (
    <div className="p-4 text-white bg-black min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">🪖 Tank Game</h1>
      <p className="mb-2">Level {level} – Encounter {encounter}</p>
      <p className="mb-2">Gold: {gold}</p>

      {mode === "shop" && (
        <Shop
          playerTanks={playerTanks}
          gold={gold}
          buyUpgrade={buyUpgrade}
          hasUpgrade={hasUpgrade}
          startBattle={startBattle}
        />
      )}

      {mode === "battle" && (
        <Battle
          playerTanks={playerTanks}
          enemyTanks={enemyTanks}
          turnIndex={turnIndex}
          isPlayerTurn={isPlayerTurn}
          handlePlayerAttack={handlePlayerAttack}
          log={log}
          isFullyUpgraded={isFullyUpgraded}
          selectedEnemyIndex={selectedEnemyIndex}
          setSelectedEnemyIndex={setSelectedEnemyIndex}
        />
      )}

      {mode === "gameover" && (
        <GameOver
          level={level}
          encounter={encounter}
          onRestart={resetGame}
        />
      )}
    </div>
  );
}

