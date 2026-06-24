import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import axios from '../axiosConfig';

function useQuery() {
  const { search } = useLocation();
  return queryString.parse(search);
}

export default function SearchResults() {
  const q = useQuery().q || "";
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (!q) {
      setResults([]);
      setCount(0);
      return;
    }
    fetchResults(q, page);
  }, [q, page]);

  const fetchResults = async (query, pageNum=1) => {
    try {
      const res = await axios.get(`/api/search/?q=${encodeURIComponent(query)}&page=${pageNum}&page_size=12`);
      setResults(res.data.results || []);
      setCount(res.data.count || 0);
    } catch (err) {
      setResults([]);
      setCount(0);
    }
  };

  const openResult = (r) => {
    if (r.type === "course") navigate(`/course/${r.id}`);
    else if (r.type === "topic") navigate(`/topic/${r.id}`);
    else if (r.type === "category") navigate(`/category/${r.id}`);
    else if (r.type === "subcategory") navigate(`/subcategory/${r.id}`);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Search results for “{q}” ({count})</h2>
      <div>
        {results.length === 0 && <div>No results found.</div>}
        {results.map((r) => (
          <div key={`${r.type}-${r.id}`} style={{ padding: 12, borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => openResult(r)}>
            <div style={{ fontWeight: 700 }}>{r.title} <small style={{ marginLeft: 8, fontWeight: 500 }}>{r.subtitle}</small></div>
            <div style={{ color: "#666" }}>{r.snippet}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>{r.type}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        {page > 1 && <button onClick={() => setPage(p => p - 1)}>Previous</button>}
        {results.length > 0 && <button style={{ marginLeft: 8 }} onClick={() => setPage(p => p + 1)}>Next</button>}
      </div>
    </div>
  );
}
