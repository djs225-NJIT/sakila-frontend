import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filterType, setFilterType] = useState("none");
  const [filterValue, setFilterValue] = useState("");

  function loadCustomers(pageNumber) {
    let url = `/api/customers?page=${pageNumber}`;

    if (filterType !== "none" && filterValue !== "") {
      url += `&${filterType}=${filterValue}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.items);
        setPage(data.page);
        setTotalPages(data.total_pages);
      });
  }

  useEffect(() => {
    loadCustomers(1);
  }, []);

  function nextPage() {
    if (page < totalPages) {
      loadCustomers(page + 1);
    }
  }

  function prevPage() {
    if (page > 1) {
      loadCustomers(page - 1);
    }
  }

  function search(e) {
    e.preventDefault();
    loadCustomers(1);
  }

  return (
    <div>
      <h1>Customers</h1>

      <form onSubmit={search}>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="none">No Filter</option>
          <option value="customer_id">ID</option>
          <option value="first_name">First Name</option>
          <option value="last_name">Last Name</option>
        </select>

        <input
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      <ul>
        {customers.map((c) => (
          <li key={c.customer_id}>
            <Link to={`/customers/${c.customer_id}`}>
              {c.customer_id} - {c.first_name} {c.last_name}
            </Link>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        <button onClick={prevPage} disabled={page === 1}>
          Previous
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>

        <button onClick={nextPage} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}