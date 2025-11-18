import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles/ListingStyles';
import { useNavigate } from 'react-router-dom';
import { PageBody } from '../styles/mainStyles';
import { ErrorContext } from '../context';

import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';

function ViewListing () {
  const navigate = useNavigate();
  const setShowErrorPopup = useContext(ErrorContext);

  const [list, setList] = useState("LOADING");
  const [filteredList, setFilteredList] = useState([]);
  const [sortOrder, setSortOrder] = useState('ascending');
  const [filterSearchTerm, setFilterSearchTerm] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      const data = await getListings();

      if (data) {
        const fetchedList = [];

        for (const listing of data) {
          const listingInfo = await getListingInfo(listing.id);
          fetchedList.push({ ...listing, ...listingInfo });
        }
        
        console.log(fetchedList);
        
        // TODO: set only published listing
        setList(fetchedList);
        setFilteredList([...fetchedList]);
      }      
    }

    fetchListings();
  }, []);

  const getListings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}listings`);
      if (response.data?.listings) return response.data.listings;
    } catch (error) {
      setShowErrorPopup(error.response.data.error);
    }
  }

  const getListingInfo = async (listingId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}listings/${listingId}`);
      if (response.data?.listing) return response.data?.listing;
    } catch (error) {
      setShowErrorPopup(error.response.data.error);
    }
  }

  const filterListing = (e) => {
    let listing = [...list];

    // search filter
    listing = listing.filter(l => l.title.includes(filterSearchTerm));

    setFilteredList(listing);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') filterListing();
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
    <PageBody>
      {list === "LOADING" ? (
        <p style={styles.loadingText}>Loading listings...</p>
      ) : (
        <>
          {filteredList.length === 0 ? (
            <p>No listings found</p>
          ) : (
            <>
              <Box
                sx={{
                  borderRadius: 3,
                  bgcolor: '#f3f3f3ff',
                  padding: '15px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <h2>Search Filter</h2>
                <TextField
                  id="filter-search-input"
                  placeholder="Search Listing"
                  type="search"
                  variant="outlined"
                  value={filterSearchTerm}
                  onChange={e => setFilterSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <br />

                <h2>Bedroom Filter (Min-Max)</h2>
                {/* TODO: prevent no. from decreasing beyond 0 */}
                <TextField
                  id="min-bedroom-filter-input"
                  label="Minimum Bedroom"
                  type="number"
                  onChange={filterListing}
                  name="minBedroomFilter"
                  slotProps={{ input: { min: 0 } }}
                />
                <br />

                {/* TODO: prevent no. from decreasing beyond 0 */}
                <TextField
                  id="max-bedroom-filter-input"
                  label="Maximum Bedroom"
                  type="number"
                  onChange={filterListing}
                  name="maxBedroomFilter"
                  slotProps={{ input: { min: 0 } }}
                />
                <br />

                <h2>Price Filter (Min-Max)</h2>
                {/* TODO: prevent no. from decreasing beyond 0 */}
                <TextField
                  id="min-price-filter-input"
                  label="Minimum Price"
                  type="number"
                  onChange={filterListing}
                  name="minPriceFilter"
                  slotProps={{ input: { min: 0 } }}
                />
                <br />

                {/* TODO: prevent no. from decreasing beyond 0 */}
                <TextField
                  id="max-price-filter-input"
                  label="Maximum Price"
                  type="number"
                  onChange={filterListing}
                  name="maxPriceFilter"
                  slotProps={{ input: { min: 0 } }}
                />
                <br />

                <Button
                  onClick={clearFilter}
                >Clear Filter</Button>
                <br />

                <Button
                  variant="contained"
                  onClick={filterListing}
                >Search</Button>
              </Box>
              <br />

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
                    <p style={styles.address}>{`${listing.metadata?.bedrooms.length} Bedrooms`}</p>
                    <p style={styles.address}>{`${listing.metadata?.bathroomCount} Bathrooms`}</p>                    
                    <p style={styles.address}>{`${listing.reviews.length} reviews`}</p>
                    <p style={styles.price}>${listing.price}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </PageBody>
  );
}
export default ViewListing;