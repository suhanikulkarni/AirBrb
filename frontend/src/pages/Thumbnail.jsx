import { useState, useEffect } from 'react';
import { styles } from '../styles/ListingStyles';

function Thumbnail({ thumbnail, listingTitle }) {
  const [thumbnailType, setThumbnailType] = useState('image');
  const [youtubeId, setYoutubeId] = useState('');

  useEffect(() => {
    if (thumbnail.startsWith("https://www.youtube.com/")) {
      setThumbnailType('youtube');
      setYoutubeId((thumbnail.split('='))[1]);
    }
  }, []);

  return (
    <>
      {thumbnailType === 'image' &&
        <img src={thumbnail} alt={listingTitle} style={styles.thumbnail} />
      }
      {thumbnailType === 'youtube' &&
        <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${youtubeId}`} />
      }
    </>
  )
}

export default Thumbnail;
