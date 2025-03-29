import React, { useState, useEffect } from 'react';
import './SearchBar.css';
import Spotify from '../../util/Spotify.js';

function SearchBar(props) {
  const [term, setTerm] = useState('');

  useEffect(() => {
    // Check for a saved search term when the component mounts
    const savedSearchTerm = Spotify.getSavedSearchTerm();
    if (savedSearchTerm) {
      setTerm(savedSearchTerm);
    }
  }, []);

  const search = () => {
    props.onSearch(term);
  };

  const handleTermChange = (event) => {
    setTerm(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      search();
    }
  };

  return (
    <div className="SearchBar">
      <input 
        placeholder="Enter A Song, Album, or Artist" 
        onChange={handleTermChange} 
        onKeyPress={handleKeyPress}
        value={term}
      />
      <button className="SearchButton" onClick={search}>SEARCH</button>
    </div>
  );
}

export default SearchBar;