import { styles } from '../styles/ListingStyles';

function Thumbnail({ thumbnail, listingTitle }) {
  return (
    <img src={thumbnail} alt={listingTitle} style={styles.thumbnail} />
  )
}

export default Thumbnail;
