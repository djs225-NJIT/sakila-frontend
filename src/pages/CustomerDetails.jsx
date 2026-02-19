import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function CustomerDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then((res) => res.json())
      .then((d) => setData(d));
  }, [id]);

  if (!data) return null;

  const c = data.customer;

  return (
    <div style={{ textAlign: "left" }}>
      <Link to="/customers">Back</Link>

      <h1>
        {c.first_name} {c.last_name}
      </h1>

      <p>ID: {c.customer_id}</p>
      <p>Email: {c.email}</p>
      <p>Active: {c.active}</p>

      <h3>Rentals</h3>
      <ul>
        {data.rentals.map((r) => (
          <li key={r.rental_id}>{r.title}</li>
        ))}
      </ul>
    </div>
  );
}