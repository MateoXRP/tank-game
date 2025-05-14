import React from "react";

export default function TankDisplay({ tank, isEnemy = false, showCooldown = false }) {
  const barColor = isEnemy ? "bg-red-500" : "bg-green-500";
  const textColor = isEnemy ? "text-red-300" : "text-green-300";

  return (
    <div className="text-center">
      <div className="text-4xl">●</div>
      <p className={textColor}>
        {isEnemy ? `Enemy ${tank.id}` : `Tank ${tank.id}`}
      </p>
      <p className="text-xs">
        ATK: {tank.atk} | DEF: {tank.def}
        {showCooldown ? ` | CD: ${tank.cooldown}` : ""}
      </p>
      <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
        <div
          className={`${barColor} h-2 rounded-full`}
          style={{ width: `${tank.hp}%` }}
        ></div>
      </div>
      <p className="text-sm">HP: {tank.hp}</p>
    </div>
  );
}

