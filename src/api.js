export async function apiGet(path) {
    const res = await fetch(path);
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
  
    const body = isJson ? await res.json() : await res.text();
  
    if (!res.ok) {
      const msg = isJson && body?.error ? body.error : `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.body = body;
      throw err;
    }
  
    return body;
  }