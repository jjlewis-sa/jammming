import React, { useState, useRef } from 'react';
import './AudioPreview.css';

function AudioPreview({ previewUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Handle cases where preview URL is null (some tracks don't have previews)
  if (!previewUrl) {
    return <span className="preview-unavailable">Preview unavailable</span>;
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Stop any other playing audio elements first
      document.querySelectorAll('audio').forEach(audio => {
        if (audio !== audioRef.current) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="audio-preview">
      <button 
        className={`preview-button ${isPlaying ? 'playing' : ''}`} 
        onClick={togglePlay}
      >
        {isPlaying ? '❚❚' : '▶'}
      </button>
      <audio 
        ref={audioRef}
        src={previewUrl}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}

export default AudioPreview;
