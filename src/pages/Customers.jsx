import { useEffect, useState } from "react";
import { apiGet } from "../api";
import "./Customers.css";

export default function Customers() {
  // list
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // paging
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // filter
  const [filterType, setFilterType] = useState("none");
  const [filterValue, setFilterValue] = useState("");

  // drawer (details)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState("");

  // edit
  const [editOpen, setEditOpen] = useState(false);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editErr, setEditErr] = useState("");
  const [editOk, setEditOk] = useState("");

  // deactivate
  const [deactLoading, setDeactLoading] = useState(false);
  const [deactErr, setDeactErr] = useState("");
  const [deactOk, setDeactOk] = useState("");

  // create
  const [createOpen, setCreateOpen] = useState(false);
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newStoreId, setNewStoreId] = useState("1");
  const [newAddressId, setNewAddressId] = useState("1");
  const [createLoading, setCreateLoading] = useState(false);
  const [createErr, setCreateErr] = useState("");
  const [createOk, setCreateOk] = useState("");

  function buildListUrl(nextPage) {
    let url = `/api/customers?page=${nextPage}`;

    const t = filterType;
    const v = filterValue.trim();

    if (t !== "none" && v) {
      url += `&${encodeURIComponent(t)}=${encodeURIComponent(v)}`;
    }

    return url;
  }

  async function loadCustomers(nextPage = 1) {
    try {
      setErr("");
      setLoading(true);
      const data = await apiGet(buildListUrl(nextPage));
      setItems(data.items || []);
      setPage(data.page || nextPage);
      setTotalPages(data.total_pages || 0);
      setLoaded(true);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function openCustomer(customerId) {
    try {
      setDetailErr("");
      setDetailLoading(true);
      setDrawerOpen(true);
      setSelectedCustomerId(customerId);
      setDetail(null);

      // reset action UI
      setEditOpen(false);
      setEditErr("");
      setEditOk("");
      setDeactErr("");
      setDeactOk("");

      const data = await apiGet(`/api/customers/${customerId}`);
      setDetail(data);

      // prefill edit form
      const c = data?.customer;
      setEditFirst(c?.first_name ?? "");
      setEditLast(c?.last_name ?? "");
      setEditEmail(c?.email ?? "");
    } catch (e) {
      setDetailErr(e.message || String(e));
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedCustomerId(null);
    setDetail(null);
    setDetailErr("");
    setDetailLoading(false);

    setEditOpen(false);
    setEditErr("");
    setEditOk("");
    setEditLoading(false);

    setDeactErr("");
    setDeactOk("");
    setDeactLoading(false);
  }

  async function saveEdits() {
    if (!selectedCustomerId) return;

    try {
      setEditErr("");
      setEditOk("");
      setEditLoading(true);

      const res = await fetch(`/api/customers/${selectedCustomerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: editFirst.trim() || null,
          last_name: editLast.trim() || null,
          email: editEmail.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Update failed (${res.status})`);

      setEditOk("Saved.");
      // refresh detail
      const refreshed = await apiGet(`/api/customers/${selectedCustomerId}`);
      setDetail(refreshed);
    } catch (e) {
      setEditErr(e.message || String(e));
    } finally {
      setEditLoading(false);
    }
  }

  async function deactivateCustomer() {
    if (!selectedCustomerId) return;

    try {
      setDeactErr("");
      setDeactOk("");
      setDeactLoading(true);

      const res = await fetch(`/api/customers/${selectedCustomerId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Deactivate failed (${res.status})`);

      setDeactOk("Customer deactivated.");
      // refresh detail + list
      const refreshed = await apiGet(`/api/customers/${selectedCustomerId}`);
      setDetail(refreshed);
      await loadCustomers(page);
    } catch (e) {
      setDeactErr(e.message || String(e));
    } finally {
      setDeactLoading(false);
    }
  }

  async function createCustomer() {
    try {
      setCreateErr("");
      setCreateOk("");
      setCreateLoading(true);

      const res = await fetch(`/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: newFirst.trim(),
          last_name: newLast.trim(),
          email: newEmail.trim(),
          store_id: Number(newStoreId),
          address_id: Number(newAddressId),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Create failed (${res.status})`);

      setCreateOk(`Created customer_id: ${data.customer_id}`);
      // reload list from page 1 so you can find them easily
      await loadCustomers(1);
    } catch (e) {
      setCreateErr(e.message || String(e));
    } finally {
      setCreateLoading(false);
    }
  }

  function nextPage() {
    if (page < totalPages) loadCustomers(page + 1);
  }
  function prevPage() {
    if (page > 1) loadCustomers(page - 1);
  }

  function onSearchSubmit(e) {
    e.preventDefault();
    loadCustomers(1);
  }

  useEffect(() => {
    loadCustomers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="custPage">
      <div className="custCard">
        <div className="custHeader">
          <h1 className="custH1">Customers</h1>
          <div className="custMuted">List • Filter • Details • Edit • Deactivate</div>
        </div>

        {/* Search */}
        <div className="custSection">
          <div className="custRow">
            <h2 className="custSectionTitle">Search / Filter</h2>

            <button className="custBtn" onClick={() => setCreateOpen(true)}>
              Add Customer
            </button>
          </div>

          <form className="custSearchRow" onSubmit={onSearchSubmit}>
            <select
              className="custSelect"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="none">No filter</option>
              <option value="customer_id">ID</option>
              <option value="first_name">First name</option>
              <option value="last_name">Last name</option>
            </select>

            <input
              className="custInput"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder="Filter value..."
            />

            <button className="custBtn" type="submit" disabled={loading}>
              {loading ? "Loading..." : "Search"}
            </button>

            <button
              className="custBtn"
              type="button"
              onClick={() => loadCustomers(page)}
              disabled={loading}
            >
              Refresh
            </button>
          </form>

          {err && <p className="custError">Error: {err}</p>}
          {!loaded && !err && <p className="custMutedNote">Loading customers...</p>}
        </div>

        {/* List */}
        <div className="custSection">
          <h2 className="custSectionTitle">Results</h2>

          {items.length === 0 && loaded && !loading && !err && (
            <p className="custMutedNote">No customers found.</p>
          )}

          {items.length > 0 && (
            <>
              <ul className="custList">
                {items.map((c) => (
                  <li key={c.customer_id} className="custItem">
                    <button
                      className="custItemBtn"
                      onClick={() => openCustomer(c.customer_id)}
                      title="Open customer details"
                    >
                      {c.customer_id} — {c.first_name} {c.last_name}
                    </button>
                    <div className="custPill">view</div>
                  </li>
                ))}
              </ul>

              <div className="custPager">
                <button className="custBtn" onClick={prevPage} disabled={page <= 1 || loading}>
                  Prev
                </button>
                <div className="custMuted">
                  Page {page} of {totalPages || 1}
                </div>
                <button
                  className="custBtn"
                  onClick={nextPage}
                  disabled={page >= totalPages || loading}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* Create Drawer */}
        {createOpen && (
          <div className="custOverlay" onClick={() => setCreateOpen(false)}>
            <div className="custDrawer" onClick={(e) => e.stopPropagation()}>
              <div className="custDrawerHeader">
                <h2 className="custDrawerTitle">Add Customer</h2>
                <button className="custBtn" onClick={() => setCreateOpen(false)}>
                  Close
                </button>
              </div>

              <div className="custDrawerBody">
                <div className="custFormRow">
                  <input
                    className="custInput"
                    value={newFirst}
                    onChange={(e) => setNewFirst(e.target.value)}
                    placeholder="first_name"
                  />
                  <input
                    className="custInput"
                    value={newLast}
                    onChange={(e) => setNewLast(e.target.value)}
                    placeholder="last_name"
                  />
                </div>

                <input
                  className="custInput"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email"
                />

                <div className="custFormRow">
                  <input
                    className="custInput"
                    value={newStoreId}
                    onChange={(e) => setNewStoreId(e.target.value)}
                    placeholder="store_id"
                  />
                  <input
                    className="custInput"
                    value={newAddressId}
                    onChange={(e) => setNewAddressId(e.target.value)}
                    placeholder="address_id"
                  />
                </div>

                <button className="custBtn" onClick={createCustomer} disabled={createLoading}>
                  {createLoading ? "Creating..." : "Create"}
                </button>

                {createErr && <p className="custError">Error: {createErr}</p>}
                {createOk && <p className="custMutedNote">{createOk}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Detail Drawer */}
        {drawerOpen && (
          <div className="custOverlay" onClick={closeDrawer}>
            <div className="custDrawer" onClick={(e) => e.stopPropagation()}>
              <div className="custDrawerHeader">
                <h2 className="custDrawerTitle">Customer Details</h2>
                <button className="custBtn" onClick={closeDrawer}>
                  Close
                </button>
              </div>

              {detailLoading && <p className="custMutedNote">Loading...</p>}
              {detailErr && <p className="custError">Error: {detailErr}</p>}

              {!detailLoading && detail && (
                <div className="custDrawerBody">
                  <div className="custRow">
                    <div>
                      <div className="custBig">
                        {detail.customer.first_name} {detail.customer.last_name}
                      </div>
                      <div className="custMuted">
                        id: {detail.customer.customer_id} • active: {detail.customer.active}
                      </div>
                      <div className="custMuted">{detail.customer.email}</div>
                    </div>

                    <button
                      className="custBtn"
                      onClick={() => setEditOpen((v) => !v)}
                      disabled={detail.customer.active === 0}
                      title={detail.customer.active === 0 ? "Inactive customer" : "Edit customer"}
                    >
                      {editOpen ? "Hide Edit" : "Edit"}
                    </button>
                  </div>

                  {/* Deactivate */}
                  <div className="custRow" style={{ marginTop: 10 }}>
                    <button
                      className="custBtn danger"
                      onClick={deactivateCustomer}
                      disabled={deactLoading || detail.customer.active === 0}
                      title={detail.customer.active === 0 ? "Already inactive" : "Deactivate customer"}
                    >
                      {deactLoading ? "Working..." : "Deactivate"}
                    </button>
                    <div>
                      {deactErr && <div className="custError">Error: {deactErr}</div>}
                      {deactOk && <div className="custMutedNote">{deactOk}</div>}
                    </div>
                  </div>

                  {/* Edit */}
                  {editOpen && (
                    <div className="custEditBox">
                      <div className="custFormRow">
                        <input
                          className="custInput"
                          value={editFirst}
                          onChange={(e) => setEditFirst(e.target.value)}
                          placeholder="first_name"
                        />
                        <input
                          className="custInput"
                          value={editLast}
                          onChange={(e) => setEditLast(e.target.value)}
                          placeholder="last_name"
                        />
                      </div>

                      <input
                        className="custInput"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="email"
                      />

                      <button className="custBtn" onClick={saveEdits} disabled={editLoading}>
                        {editLoading ? "Saving..." : "Save"}
                      </button>

                      {editErr && <p className="custError">Error: {editErr}</p>}
                      {editOk && <p className="custMutedNote">{editOk}</p>}
                    </div>
                  )}

                  {/* Rentals */}
                  <h3 className="custH3">Rentals</h3>
                  {(detail.rentals || []).length === 0 && (
                    <p className="custMutedNote">No rentals for this customer.</p>
                  )}

                  {(detail.rentals || []).length > 0 && (
                    <ul className="custList">
                      {detail.rentals.map((r) => (
                        <li key={r.rental_id} className="custItem">
                          <div className="custRentalLeft">
                            <div className="custRentalTitle">{r.title}</div>
                            <div className="custMuted">
                              rental_id {r.rental_id} • film_id {r.film_id}
                            </div>
                            <div className="custMuted">
                              rented: {String(r.rental_date)} • returned:{" "}
                              {r.return_date ? String(r.return_date) : "NOT RETURNED"}
                            </div>
                          </div>
                          <div className="custPill">{r.return_date ? "done" : "open"}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {!detailLoading && !detailErr && !detail && (
                <p className="custMutedNote">
                  No customer data loaded. (customer_id: {String(selectedCustomerId)})
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}