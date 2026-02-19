import { useState } from "react";
import { apiGet } from "../api";
import "./Landing.css";

export default function Landing() {
  // Top films list
  const [films, setFilms] = useState([]);
  const [filmsLoaded, setFilmsLoaded] = useState(false);
  const [loadingFilms, setLoadingFilms] = useState(false);
  const [filmsErr, setFilmsErr] = useState("");

  // Film detail drawer
  const [selectedFilmId, setSelectedFilmId] = useState(null);
  const [filmDetail, setFilmDetail] = useState(null);
  const [filmDetailOpen, setFilmDetailOpen] = useState(false);
  const [filmDetailLoading, setFilmDetailLoading] = useState(false);
  const [filmDetailErr, setFilmDetailErr] = useState("");

  // Top actors list
  const [actors, setActors] = useState([]);
  const [actorsLoaded, setActorsLoaded] = useState(false);
  const [loadingActors, setLoadingActors] = useState(false);
  const [actorsErr, setActorsErr] = useState("");

  // Actor detail drawer
  const [selectedActorId, setSelectedActorId] = useState(null);
  const [actorDetail, setActorDetail] = useState(null);
  const [actorDetailOpen, setActorDetailOpen] = useState(false);
  const [actorDetailLoading, setActorDetailLoading] = useState(false);
  const [actorDetailErr, setActorDetailErr] = useState("");

  async function loadTopFilms() {
    try {
      setFilmsErr("");
      setLoadingFilms(true);
      const rows = await apiGet("/api/films/top-rented?limit=5");
      setFilms(rows);
      setFilmsLoaded(true);
    } catch (e) {
      setFilmsErr(e.message || String(e));
    } finally {
      setLoadingFilms(false);
    }
  }

  async function onFilmClick(filmId) {
    try {
      setFilmDetailErr("");
      setSelectedFilmId(filmId);
      setFilmDetailOpen(true);
      setFilmDetailLoading(true);
      const detail = await apiGet(`/api/films/${filmId}`);
      setFilmDetail(detail);
    } catch (e) {
      setFilmDetailErr(e.message || String(e));
      setFilmDetail(null);
    } finally {
      setFilmDetailLoading(false);
    }
  }

  async function loadTopActors() {
    try {
      setActorsErr("");
      setLoadingActors(true);
      const rows = await apiGet("/api/actors/top?limit=5");
      setActors(rows);
      setActorsLoaded(true);
    } catch (e) {
      setActorsErr(e.message || String(e));
    } finally {
      setLoadingActors(false);
    }
  }

  async function onActorClick(actorId) {
    try {
      setActorDetailErr("");
      setSelectedActorId(actorId);
      setActorDetailOpen(true);
      setActorDetailLoading(true);
      const detail = await apiGet(`/api/actors/${actorId}`);
      setActorDetail(detail);
    } catch (e) {
      setActorDetailErr(e.message || String(e));
      setActorDetail(null);
    } finally {
      setActorDetailLoading(false);
    }
  }

  function closeFilmDrawer() {
    setFilmDetailOpen(false);
    setFilmDetailErr("");
    setFilmDetailLoading(false);
    setFilmDetail(null);
    setSelectedFilmId(null);
  }

  function closeActorDrawer() {
    setActorDetailOpen(false);
    setActorDetailErr("");
    setActorDetailLoading(false);
    setActorDetail(null);
    setSelectedActorId(null);
  }

  return (
    <div className="page">
      <div className="card">
        <div className="header">
          <h1 className="h1">Landing</h1>
          <div className="muted">Sakila — Landing User Stories</div>
        </div>

        {/* Films */}
        <div className="section">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <h2 className="sectionTitle">Top 5 Rented Films</h2>

            <button
              className="primaryBtn"
              onClick={loadTopFilms}
              disabled={loadingFilms}
            >
              {loadingFilms
                ? "Loading..."
                : filmsLoaded
                ? "Reload Top Films"
                : "Show Top Films"}
            </button>
          </div>

          {filmsErr && <p className="error">Error: {filmsErr}</p>}
          {!filmsLoaded && (
            <p className="muted">Click “Show Top Films” to load the list.</p>
          )}

          {filmsLoaded && (
            <ul className="list">
              {films.map((f) => (
                <li key={f.film_id} className="item">
                  <button
                    className="itemBtn"
                    onClick={() => onFilmClick(f.film_id)}
                    title="Click for details"
                  >
                    {f.title}
                  </button>
                  <div className="pill">
                    {f.category} — rented {f.rented}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actors */}
        <div className="section">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <h2 className="sectionTitle">Top 5 Actors</h2>

            <button
              className="primaryBtn"
              onClick={loadTopActors}
              disabled={loadingActors}
            >
              {loadingActors
                ? "Loading..."
                : actorsLoaded
                ? "Reload Top Actors"
                : "Show Top Actors"}
            </button>
          </div>

          {actorsErr && <p className="error">Error: {actorsErr}</p>}
          {!actorsLoaded && (
            <p className="muted">Click “Show Top Actors” to load the list.</p>
          )}

          {actorsLoaded && (
            <ul className="list">
              {actors.map((a) => (
                <li key={a.actor_id} className="item">
                  <button
                    className="itemBtn"
                    onClick={() => onActorClick(a.actor_id)}
                    title="Click for details"
                  >
                    {a.first_name} {a.last_name}
                  </button>
                  {/* updated: film_count (not rental_count) */}
                  <div className="pill">films {a.film_count}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Film Drawer */}
        {filmDetailOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              justifyContent: "flex-end",
              zIndex: 50,
            }}
            onClick={closeFilmDrawer}
          >
            <div
              style={{
                width: "min(520px, 92vw)",
                height: "100%",
                background: "#0f1526",
                borderLeft: "1px solid rgba(255,255,255,0.12)",
                padding: 16,
                overflow: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <h2 style={{ margin: 0 }}>Film Details</h2>
                <button className="primaryBtn" onClick={closeFilmDrawer}>
                  Close
                </button>
              </div>

              {filmDetailLoading && <p className="muted">Loading...</p>}
              {filmDetailErr && <p className="error">Error: {filmDetailErr}</p>}

              {!filmDetailLoading && filmDetail && (
                <div style={{ marginTop: 12 }}>
                  <h3 style={{ margin: "0 0 6px 0" }}>{filmDetail.title}</h3>
                  <p className="muted" style={{ marginTop: 0 }}>
                    {filmDetail.category} • {filmDetail.release_year} •{" "}
                    {filmDetail.rating} • {filmDetail.length} min
                  </p>
                  <p style={{ whiteSpace: "pre-wrap" }}>
                    {filmDetail.description}
                  </p>

                  <h4 style={{ marginTop: 16 }}>Actors</h4>
                  <ul className="list">
                    {filmDetail.actors.map((a) => (
                      <li key={a.actor_id} className="item">
                        <button
                          className="itemBtn"
                          onClick={() => onActorClick(a.actor_id)}
                          title="Open actor details"
                        >
                          {a.first_name} {a.last_name}
                        </button>
                        <div className="pill">view</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!filmDetailLoading && !filmDetailErr && !filmDetail && (
                <p className="muted">
                  No film data loaded. (film_id: {String(selectedFilmId)})
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actor Drawer */}
        {actorDetailOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              justifyContent: "flex-end",
              zIndex: 60,
            }}
            onClick={closeActorDrawer}
          >
            <div
              style={{
                width: "min(520px, 92vw)",
                height: "100%",
                background: "#0f1526",
                borderLeft: "1px solid rgba(255,255,255,0.12)",
                padding: 16,
                overflow: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <h2 style={{ margin: 0 }}>Actor Details</h2>
                <button className="primaryBtn" onClick={closeActorDrawer}>
                  Close
                </button>
              </div>

              {actorDetailLoading && <p className="muted">Loading...</p>}
              {actorDetailErr && <p className="error">Error: {actorDetailErr}</p>}

              {!actorDetailLoading && actorDetail && (
                <div style={{ marginTop: 12 }}>
                  <h3 style={{ margin: "0 0 6px 0" }}>
                    {actorDetail.first_name} {actorDetail.last_name}
                  </h3>

                  {/* updated: show more actor info */}
                  <p className="muted" style={{ marginTop: 0 }}>
                    films: {actorDetail.film_count ?? "—"} • total rentals:{" "}
                    {actorDetail.total_rentals ?? "—"} • last update:{" "}
                    {actorDetail.last_update ? String(actorDetail.last_update) : "—"}
                  </p>

                  <h4 style={{ marginTop: 16 }}>Top 5 Rented Films</h4>
                  <ul className="list">
                    {actorDetail.top_films.map((f) => (
                      <li key={f.film_id} className="item">
                        <button
                          className="itemBtn"
                          onClick={() => onFilmClick(f.film_id)}
                          title="Open film details"
                        >
                          {f.title}
                        </button>
                        <div className="pill">
                          {f.category} — rented {f.rented}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!actorDetailLoading && !actorDetailErr && !actorDetail && (
                <p className="muted">
                  No actor data loaded. (actor_id: {String(selectedActorId)})
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}