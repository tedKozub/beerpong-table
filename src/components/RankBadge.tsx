import React from "react";

export function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="badge badge-warning badge-sm font-black whitespace-nowrap shadow-sm">
        <span className="relative">
          1<span className="absolute">.</span>
        </span>
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="badge badge-neutral badge-sm font-bold whitespace-nowrap opacity-90">
        <span className="relative">
          2<span className="absolute">.</span>
        </span>
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="badge badge-outline badge-sm font-bold whitespace-nowrap opacity-80">
        <span className="relative">
          3<span className="absolute">.</span>
        </span>
      </span>
    );
  }
  return (
    <span className="badge badge-ghost badge-sm text-base-content/70 whitespace-nowrap font-medium">
      <span className="relative">
        {rank}
        <span className="absolute">.</span>
      </span>
    </span>
  );
}
