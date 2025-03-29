import React from 'react';
import './Track.css';
import AudioPreview from '../AudioPreview/AudioPreview';

function Track(props) {
  const addTrack = () => {
    props.onAdd(props.track);
  };

  const removeTrack = () => {
    props.onRemove(props.track);
  };

  const renderAction = () => {
    if (props.isRemoval) {
      return <button className="Track-action" onClick={removeTrack}>-</button>;
    } else {
      return <button className="Track-action" onClick={addTrack}>+</button>;
    }
  };

  return (
    <div className="Track">
      <div className="Track-information">
        <div className="Track-preview-container">
          <AudioPreview previewUrl={props.track.previewUrl} />
          <h3>{props.track.name}</h3>
        </div>
        <p>{props.track.artist} | {props.track.album}</p>
      </div>
      {renderAction()}
    </div>
  );
}

export default Track;
