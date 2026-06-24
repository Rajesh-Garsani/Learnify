import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, InputGroup } from 'react-bootstrap';
// Assuming you have your debounce utility exported from utils
import debounce from '../utils/debounce';

function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // BUG 4 FIX: Wrap the debounced API call in useCallback.
  // This prevents the debouncer from re-instantiating on every keystroke render.
  const handleDebouncedSearch = useCallback(
    debounce((searchVal) => {
      if (searchVal.trim().length > 1) {
        navigate(`/search?q=${encodeURIComponent(searchVal)}`);
      }
    }, 400),
    [navigate]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    handleDebouncedSearch(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="d-flex w-100">
      <InputGroup>
        <InputGroup.Text className="bg-white border-end-0">
          <i className="bi bi-search text-muted"></i>
        </InputGroup.Text>
        <Form.Control
          type="search"
          placeholder="Search courses, topics, categories..."
          value={query}
          onChange={handleChange}
          className="border-start-0 ps-0 shadow-none"
          style={{ borderRadius: '0 8px 8px 0' }}
        />
      </InputGroup>
    </Form>
  );
}

export default SearchBar;