import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles/ListingStyles';
import { useNavigate } from 'react-router-dom';
import { PageBody } from '../styles/mainStyles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const getListings = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}listings`)
    console.log(response)
    if (response.data?.listings) {
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

  const [list, setList] = useState([]);
  const [listOrder, setListOrder] = useState('ascending');
  
  useEffect(() => {
    const fetchListings = async () => {
      const data = await getListings();
      if (data) setList(data);
    };
    fetchListings();
  }, []);
  
  const handleListOrder = (event, newListOrder) => {
    if (newListOrder !== null) {
      setListOrder(newListOrder);
    }

    const sortedList = list.sort((a, b) => a.title.localeCompare(b.title));
    
    if (newListOrder === 'descending') {
      setList(sortedList.reverse());
    }
  };

  return (
    <div style={styles.container}>
      {list.length === 0 ? (
        <p style={styles.loadingText}>Loading listings...</p>
      ) : (
        <PageBody>
          <ToggleButtonGroup
            value={listOrder}
            exclusive
            onChange={handleListOrder}
            aria-label="list order"
          >
            <ToggleButton value="ascending" aria-label="ascending order">
              <p>Ascending</p>
            </ToggleButton>
            <ToggleButton value="descending" aria-label="descending order">
              <p>Descending</p>
            </ToggleButton>
          </ToggleButtonGroup>

          <br />
          <div style={styles.grid} >
            {list.map((listing, index) => (
              <div key={index} style={styles.card} onClick={() => navigate(`/viewListings/${listing.id}`)}>
                <img src={listing.thumbnail} alt={listing.title} style={styles.thumbnail} />
                <h4 style={styles.address}>
                  {`
                    ${listing.address?.state},
                    ${listing.address?.country}
                  `}
                </h4>
                <h3 style={styles.title}>{listing.title}</h3>
                <p style={styles.address}>
                  {`
                    ${listing.address?.streetAddress},
                    ${listing.address?.suburb},
                    ${listing.address?.postcode}
                  `}
                </p>
                <p style={styles.address}>{`reviews [${listing.reviews.length}]`}</p>
                <p style={styles.price}>${listing.price}</p>
              </div>
            ))}
          </div>
        </PageBody>
      )}
    </div>
  );
}
export default ViewListing;