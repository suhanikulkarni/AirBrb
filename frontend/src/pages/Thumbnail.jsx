import { useState, useEffect } from 'react';
import styles from '../styles/listingStyles.module.css';

function Thumbnail({ thumbnail, listingTitle }) {
  const [thumbnailType, setThumbnailType] = useState('image');
  const [youtubeId, setYoutubeId] = useState('');

  useEffect(() => {
    if (thumbnail.startsWith('https://www.youtube.com/')) {
      setThumbnailType('youtube');
      setYoutubeId((thumbnail.split('='))[1]);
    }
  }, []);

  return (
    <>
      {thumbnailType === 'image' &&
        <img src={thumbnail} alt={`${listingTitle} thumbnail image`} className={styles.thumbnail} />
      }
      {thumbnailType === 'youtube' &&
        <iframe
          className={styles.thumbnail}
          src={`https://www.youtube.com/embed/${youtubeId}`}
          alt={`${listingTitle} thumbnail video`}
        />
      }
    </>
  )
}

export default Thumbnail;
