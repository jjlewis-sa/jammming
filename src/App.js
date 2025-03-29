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
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're returning from Spotify auth
    const loadUserProfile = async () => {
      try {
        const userProfile = await Spotify.getUserProfile();
        setUser(userProfile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Add track to playlist
  const addTrack = (track) => {
    if (playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }
    setPlaylistTracks([...playlistTracks, track]);
  };

  // Remove track from playlist
  const removeTrack = (track) => {
    setPlaylistTracks(playlistTracks.filter(savedTrack => savedTrack.id !== track.id));
  };

  // Update playlist name
  const updatePlaylistName = (name) => {
    setPlaylistName(name);
  };

  // Save playlist to Spotify
  const savePlaylist = async () => {
    const trackURIs = playlistTracks.map(track => track.uri);
    const success = await Spotify.savePlaylist(playlistName, trackURIs);
    
    if (success) {
      setPlaylistName('New Playlist');
      setPlaylistTracks([]);
      alert('Playlist saved successfully!');
    } else {
      alert('Failed to save playlist. Please try again.');
    }
  };

  // Search Spotify
  const search = async (term) => {
    if (!term.trim()) return;
    
    try {
      const results = await Spotify.search(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tracks:', error);
      setSearchResults([]);
    }
  };

  if (isLoading) {
    return <div className="App"><h1>Loading...</h1></div>;
  }

  return (
    <div className="App">
      <h1>Jammming</h1>
      {user && (
        <div className="user-profile">
          <p>Welcome, {user.display_name}!</p>
          {user.images && user.images.length > 0 && (
            <img 
              src={user.images[0].url} 
              alt="Profile" 
              className="profile-image"
              width="40"
              height="40"
            />
          )}
        </div>
      )}
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
  );
}

export default App;
