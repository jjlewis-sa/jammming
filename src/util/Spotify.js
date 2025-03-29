const clientId = "YOUR_CLIENT_ID"; // Replace with your Spotify client ID
const redirectUri = window.location.origin; // Uses the current origin as redirect URI

let accessToken;

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    // Check for access token match
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const storedState = localStorage.getItem("spotify_auth_state");
    const state = params.get("state");

    if (code && state === storedState) {
      return this.exchangeCodeForToken(code);
    } else {
      const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
      const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

      if (accessTokenMatch && expiresInMatch) {
        accessToken = accessTokenMatch[1];
        const expiresIn = Number(expiresInMatch[1]);
        
        // Clear the parameters from the URL to avoid grabbing the token after it expires
        window.setTimeout(() => accessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
        
        return accessToken;
      } else {
        this.redirectToAuthCodeFlow();
      }
    }
  },

  async redirectToAuthCodeFlow() {
    const verifier = this.generateCodeVerifier(128);
    const challenge = await this.generateCodeChallenge(verifier);
    const state = this.generateCodeVerifier(16);

    localStorage.setItem("verifier", verifier);
    localStorage.setItem("spotify_auth_state", state);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri);
    params.append("scope", "user-read-private user-read-email playlist-modify-public");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);
    params.append("state", state);

    window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
  },

  async exchangeCodeForToken(code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("code_verifier", verifier);

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
      });

      const data = await response.json();
      if (data.access_token) {
        accessToken = data.access_token;
        const expiresIn = data.expires_in;
        
        window.setTimeout(() => accessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
        
        return accessToken;
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return null;
    }
  },

  generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },

  async generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);    
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  },
  async getUserProfile() {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return null;

    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async search(term) {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return [];

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const jsonResponse = await response.json();
      if (!jsonResponse.tracks) {
        return [];
      }
      
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return false;
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) return false;

    const headers = { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    try {
      // Get the user's ID
      const userResponse = await fetch('https://api.spotify.com/v1/me', { headers });
      const user = await userResponse.json();
      const userId = user.id;
      
      // Create a new playlist
      const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        headers,
        method: 'POST',
        body: JSON.stringify({ name })
      });
      
      const playlist = await playlistResponse.json();
      const playlistId = playlist.id;
      
      // Add tracks to the playlist
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers,
        method: 'POST',
        body: JSON.stringify({ uris: trackUris })
      });
      
      return true;
    } catch (error) {
      console.error('Error saving playlist:', error);
      return false;
    }
  }
};

export default Spotify;
