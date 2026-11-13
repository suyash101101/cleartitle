"use client";

import { useApp } from "@/lib/store";

const ACTORS = ["organizer.near", "ada.near", "priya.near", "fan.near"];

export function ActorBar() {
  const actor = useApp((s) => s.actor);
  const setActor = useApp((s) => s.setActor);
  return (
    <div className="actor-bar" role="group" aria-label="Film cast">
      <span className="meta">Film cast</span>
      {ACTORS.map((a) => (
        <button
          key={a}
          type="button"
          className={actor === a ? "active" : "ghost"}
          onClick={() => setActor(a)}
        >
          {a}
        </button>
      ))}
    </div>
  );
}
