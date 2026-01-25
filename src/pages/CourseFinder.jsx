import React, { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_BASE_URL || "https://api.aloeducation.co.uk";

export default function CourseFinder() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/courses`)
      .then(r => r.json())
      .then(j => setCount(j?.count ?? (j?.data?.length ?? 0)))
      .catch(() => setCount("error"));
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24, fontFamily: "Arial" }}>
      <h1 style={{ margin: 0 }}>Course Finder ✅</h1>
      <p style={{ color: "#555" }}>API: <b>{API}</b></p>
      <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 12 }}>
        <div><b>Total Courses:</b> {count === null ? "Loading..." : String(count)}</div>
        <div style={{ marginTop: 8, color: "#666" }}>URL: <b>/course-finder</b></div>
      </div>
    </div>
  );
}
