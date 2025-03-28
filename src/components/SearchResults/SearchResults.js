import React from 'react';
import './SearchResults.css';
import TrackList from '../../components/TrackList/TrackList.js';

function SearchResults(props) {
  return (
    <div className="SearchResults">
      <h2>Results</h2>
      <TrackList 
        tracks={props.searchResults} 
        onAdd={props.onAdd} 
        isRemoval={false} 
      />
    </div>
  );
}

export default SearchResults;
