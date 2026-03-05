import { useState } from "react";
import { apiGet } from "../api";
import "./Films.css";

export default function Films() {
  // search
  const [mode, setMode] = useState("any");
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // drawer
  const [filmDetailOpen, setFilmDetailOpen] = useState(false);
  const [filmDetailLoading, setFilmDetailLoading] = useState(false);
  const [filmDetailErr, setFilmDetailErr] = useState("");
  const [filmDetail, setFilmDetail] = useState(null);
  const [selectedFilmId, setSelectedFilmId] = useState(null);

  // rent
  const [customerId, setCustomerId] = useState("");
  const [rentLoading, setRentLoading] = useState(false);
  const [rentErr, setRentErr] = useState("");
  const [rentOk, setRentOk] = useState("");

  async function runSearch(nextPage = 1) {
    const query = q.trim();
    if (!query) {
      setItems([]);
      setTotalPages(0);
      setPage(1);
      return;
    }

    try {
      setErr("");
      setLoading(true);
      const data = await apiGet(
        `/api/films/search?q=${encodeURIComponent(query)}&mode=${encodeURIComponent(
          mode
        )}&page=${nextPage}&page_size=20`
      );
      setItems(data.items || []);
      setPage(data.page || nextPage);
      setTotalPages(data.total_pages || 0);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onFilmClick(filmId) {
    try {
      setFilmDetailErr("");
      setFilmDetailLoading(true);
      setSelectedFilmId(filmId);
      setFilmDetailOpen(true);
      setFilmDetail(null);

      // reset rent UI
      setCustomerId("");
      setRentErr("");
      setRentOk("");

      const detail = await apiGet(`/api/films/${filmId}`);
      setFilmDetail(detail);
    } catch (e) {
      setFilmDetailErr(e.message || String(e));
      setFilmDetail(null);
    } finally {
      setFilmDetailLoading(false);
    }
  }

  function closeDrawer() {
    setFilmDetailOpen(false);
    setFilmDetail(null);
    setSelectedFilmId(null);
    setFilmDetailErr("");
    setFilmDetailLoading(false);
    setRentErr("");
    setRentOk("");
    setRentLoading(false);
  }

  async function rentFilm() {
    if (!filmDetail?.film_id) return;

    const cid = customerId.trim();
    if (!cid) {
      setRentErr("Enter a customer_id.");
      return;
    }

    try {
      setRentErr("");
      setRentOk("");
      setRentLoading(true);

      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          film_id: filmDetail.film_id,
          customer_id: Number(cid),
          // optional:
          // staff_id: 1,
          // store_id: 1,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Rent failed (${res.status})`);
      }

      setRentOk(`Rented! rental_id: ${data?.rental?.rental_id ?? "—"}`);

      // refresh availability
      const refreshed = await apiGet(`/api/films/${filmDetail.film_id}`);
      setFilmDetail(refreshed);
    } catch (e) {
      setRentErr(e.message || String(e));
    } finally {
      setRentLoading(false);
    }
  }

  function nextPage() {
    if (page < totalPages) runSearch(page + 1);
  }

  function prevPage() {
    if (page > 1) runSearch(page - 1);
  }

  return (
    <div className="filmsPage">
      <div className="filmsCard">
        <div className="filmsHeader">
          <h1 className="filmsH1">Films</h1>
          <div className="filmsMuted">Search • Details • Rent</div>
        </div>

        <div className="filmsSection">
          <h2 className="filmsSectionTitle">Search</h2>

          <div className="filmsSearchRow">
            <select
              className="filmsSelect"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="any">Any</option>
              <option value="title">Title</option>
              <option value="actor">Actor</option>
              <option value="genre">Genre</option>
            </select>

            <input
              className="filmsInput"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search text..."
            />

            <button
              className="filmsBtn"
              onClick={() => runSearch(1)}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {err && <p className="filmsError">Error: {err}</p>}
          {!err && items.length === 0 && q.trim() && !loading && (
            <p className="filmsMutedNote">No results.</p>
          )}

          {items.length > 0 && (
            <>
              <ul className="filmsList">
                {items.map((f) => (
                  <li key={f.film_id} className="filmsItem">
                    <button
                      className="filmsItemBtn"
                      onClick={() => onFilmClick(f.film_id)}
                      title="Click for details"
                    >
                      {f.title}
                    </button>
                    <div className="filmsPill">
                      {f.category} • {f.release_year ?? "—"} • {f.rating ?? "—"}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="filmsPager">
                <button
                  className="filmsBtn"
                  onClick={prevPage}
                  disabled={page <= 1 || loading}
                >
                  Prev
                </button>
                <div className="filmsMuted">
                  Page {page} of {totalPages || 1}
                </div>
                <button
                  className="filmsBtn"
                  onClick={nextPage}
                  disabled={page >= totalPages || loading}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* Drawer */}
        {filmDetailOpen && (
          <div className="filmsOverlay" onClick={closeDrawer}>
            <div className="filmsDrawer" onClick={(e) => e.stopPropagation()}>
              <div className="filmsDrawerHeader">
                <h2 className="filmsDrawerTitle">Film Details</h2>
                <button className="filmsBtn" onClick={closeDrawer}>
                  Close
                </button>
              </div>

              {filmDetailLoading && <p className="filmsMutedNote">Loading...</p>}
              {filmDetailErr && (
                <p className="filmsError">Error: {filmDetailErr}</p>
              )}

              {!filmDetailLoading && filmDetail && (
                <div className="filmsDrawerBody">
                  <h3 className="filmsH3">{filmDetail.title}</h3>
                  <p className="filmsMuted">
                    {filmDetail.category} • {filmDetail.release_year} •{" "}
                    {filmDetail.rating} • {filmDetail.length} min
                  </p>

                  <p className="filmsMuted">
                    available: {filmDetail.available_copies ?? "—"} /{" "}
                    {filmDetail.total_copies ?? "—"}
                  </p>

                  <p className="filmsDescription">{filmDetail.description}</p>

                  <h4 className="filmsH4">Actors</h4>
                  <ul className="filmsList">
                    {(filmDetail.actors || []).map((a) => (
                      <li key={a.actor_id} className="filmsItem">
                        <div className="filmsActorName">
                          {a.first_name} {a.last_name}
                        </div>
                        <div className="filmsPill">actor_id {a.actor_id}</div>
                      </li>
                    ))}
                  </ul>

                  <h4 className="filmsH4">Rent this film</h4>
                  <div className="filmsRentRow">
                    <input
                      className="filmsInput"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      placeholder="customer_id"
                    />
                    <button
                      className="filmsBtn"
                      onClick={rentFilm}
                      disabled={rentLoading}
                    >
                      {rentLoading ? "Renting..." : "Rent"}
                    </button>
                  </div>

                  {rentErr && <p className="filmsError">Error: {rentErr}</p>}
                  {rentOk && <p className="filmsMutedNote">{rentOk}</p>}
                </div>
              )}

              {!filmDetailLoading && !filmDetailErr && !filmDetail && (
                <p className="filmsMutedNote">
                  No film data loaded. (film_id: {String(selectedFilmId)})
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}