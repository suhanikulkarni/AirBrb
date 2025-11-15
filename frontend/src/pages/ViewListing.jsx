import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles/ListingStyles';
import { useNavigate } from 'react-router-dom'; 
import ListingInfo from './ListingInfo';

const getListings = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}listings`)
    console.log(response)
    if (response) {
      console.log(response.data.listings)
      return response.data.listings;
    }
  }
  catch (error) {
    console.log("in the catch, there is an error", error.message);
  }
}
function ViewListing () {
  const navigate = useNavigate();
  const [list, setLists] = useState([]);
  
  useEffect(() => {
    const fetchListings = async () => {
      const data = await getListings();
      if (data) setLists(data);
    };
    fetchListings();
  }, [])
  return (
    <div style={styles.container}>
      {list.length === 0 ? (
        <p style={styles.loadingText}>Loading listings...</p>
      ) : (
        <div style={styles.grid} >
          {list.map((listing, index) => (
            <div key={index} style={styles.card} onClick={() => navigate(`/viewListings/${listing.id}`)}>
              <img src={listing.thumbnail} alt={listing.title} style={styles.thumbnail} />
              <h3 style={styles.title}>{listing.title}</h3>
              <p style={styles.address}>{listing.address?.value}</p>
              <p style={styles.price}>${listing.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default ViewListing;