import React from "react";

export default function Shop({ playerTanks, gold, buyUpgrade, hasUpgrade, startBattle }) {
  return (
    <div className="text-center max-w-md w-full space-y-4">
      <h2 className="text-xl mb-2">💰 Upgrade Shop</h2>
      {playerTanks.map(tank => (
        <div key={tank.id} className="p-4 bg-gray-800 rounded-lg shadow">
          <p className="mb-2 font-semibold">Tank {tank.id}</p>
          <p className="text-sm mb-1">HP: {tank.hp} | ATK: {tank.atk} | DEF: {tank.def}</p>
          <div className="flex justify-center gap-4 my-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${i < hasUpgrade(tank, "atk") ? "bg-yellow-400" : "bg-gray-600"}`}
                ></div>
              ))}
              <span className="text-xs text-blue-300 ml-1">ATK</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${i < hasUpgrade(tank, "def") ? "bg-yellow-400" : "bg-gray-600"}`}
                ></div>
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
  );
}

