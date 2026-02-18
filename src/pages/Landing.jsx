import { useEffect, useState } from "react";
import { apiGet } from "../api";

export default function Landing() {
  const [films, setFilms] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    apiGet("/api/films/top-rented?limit=5")
      .then((rows) => {
        if (!alive) return;
        setFilms(rows);
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e.message || String(e));
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h1>Landing</h1>

      {err && <p style={{ color: "red" }}>Error: {err}</p>}

      <h2>Top 5 Rented Films</h2>
      <ol>
        {films.map((f) => (
          <li key={f.film_id}>
            {f.title}{" "}
            <span style={{ opacity: 0.7 }}>
              ({f.category}) — rented {f.rented}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}