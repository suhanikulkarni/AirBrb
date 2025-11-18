import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles/ListingStyles';
import { useNavigate } from 'react-router-dom';
import { PageBody } from '../styles/mainStyles';

import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';

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
  const [filteredList, setFilteredList] = useState([]);
  const [sortOrder, setSortOrder] = useState('ascending');
  const [filterSearchTerm, setFilterSearchTerm] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      const data = await getListings();
      if (data) {
        setList(data);
        setFilteredList([...data]);
      }
    };
    fetchListings();
  }, []);

  const searchListing = () => {
    setFilteredList([...list].filter(l => l.title.includes(filterSearchTerm)));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') searchListing();
  };

  const clearFilter = () => {
    setFilterSearchTerm('');
    setFilteredList([...list]);
  };

  const orderList = () => {
    if (sortOrder === 'descending') return filteredList.toReversed();
    return filteredList;
  }

  return (
    <div style={styles.container}>
      {list.length === 0 ? (
        <p style={styles.loadingText}>Loading listings...</p>
      ) : (
        <PageBody>
          <ToggleButtonGroup
            value={sortOrder}
            exclusive
            onChange={(e, newSortOrder) => {
              if (newSortOrder !== null) setSortOrder(newSortOrder); 
            }}
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

          <TextField
            id="filter-search-input"
            placeholder="Search Listing"
            type="search"
            variant="outlined"
            value={filterSearchTerm}
            onChange={e => setFilterSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            slotProps={{
              input: {
                endAdornment: 
                  <InputAdornment position="end">
                    <Button
                      variant="contained"
                      onClick={searchListing}
                    >Search</Button>
                  </InputAdornment>,
              },
            }}
          />
          <br />

          <Button
            variant="contained"
            onClick={clearFilter}
          >Clear Filter</Button>
          <br />

          <div style={styles.grid} >
            {orderList().map((listing, index) => (
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