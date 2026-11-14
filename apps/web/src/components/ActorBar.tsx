"use client";

import { useApp } from "@/lib/store";

const FILM = ["organizer.near", "seller.near", "buyer.near", "fan.near"];

export function ActorBar() {
  const actor = useApp((s) => s.actor);
  const setActor = useApp((s) => s.setActor);
  const cast = FILM.includes(actor) ? FILM : [...FILM, actor];

  return (
    <div className="actor-bar" role="group" aria-label="Scenario cast">
      <span className="badge scenario">Scenario</span>
      {cast.map((a) => {
        const live = !FILM.includes(a);
        return (
          <button
            key={a}
            type="button"
            className={actor === a ? "active" : "ghost"}
            onClick={() => setActor(a)}
            title={live ? "Live RPC owner" : undefined}
          >
            {live ? `live · ${a}` : a}
          </button>
        );
      })}
    </div>
  );
}
