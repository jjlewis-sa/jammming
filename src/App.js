import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar/SearchBar.js';
import SearchResults from './components/SearchResults/SearchResults.js';
import Playlist from './components/Playlist/Playlist.js';
import Spotify from './util/Spotify.js';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState('New Playlist');
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for a saved search term when the component mounts
    const savedSearchTerm = Spotify.getSavedSearchTerm();
    if (savedSearchTerm) {
      search(savedSearchTerm);
    }
  }, []);

  const addTrack = (track) => {
    if (playlistTracks.some(savedTrack => savedTrack.id === track.id)) {
      return;
    }
    setPlaylistTracks([...playlistTracks, track]);
  };

  const removeTrack = (track) => {
    setPlaylistTracks(playlistTracks.filter(savedTrack => savedTrack.id !== track.id));
  };

  const updatePlaylistName = (name) => {
    setPlaylistName(name);
  };

  const savePlaylist = async () => {
    const trackUris = playlistTracks.map(track => track.uri);
    if (trackUris.length) {
      setIsLoading(true);
      const success = await Spotify.savePlaylist(playlistName, trackUris);
      setIsLoading(false);
      if (success) {
        setPlaylistName('New Playlist');
        setPlaylistTracks([]);
      }
    }
  };

  const search = async (term) => {
    setIsLoading(true);
    const results = await Spotify.search(term);
    setSearchResults(results);
    setIsLoading(false);
  };

  return (
    <div>
      <h1>Ja<span className="highlight">mmm</span>ing</h1>
      <div className="App">
        <SearchBar onSearch={search} />
        <div className="App-playlist">
          <SearchResults searchResults={searchResults} onAdd={addTrack} />
          <Playlist 
            playlistName={playlistName} 
            playlistTracks={playlistTracks} 
            onRemove={removeTrack} 
            onNameChange={updatePlaylistName} 
            onSave={savePlaylist} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
