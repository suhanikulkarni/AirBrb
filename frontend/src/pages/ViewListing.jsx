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
import { Box } from '@mui/material';

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

  const [list, setList] = useState("LOADING");
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

              <Box
                sx={{
                  borderRadius: 3,
                  bgcolor: '#f3f3f3ff',
                  padding: '15px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
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
                            onClick={filterListing}
                          >Search</Button>
                        </InputAdornment>,
                    },
                  }}
                />
                <br />

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
                  variant="contained"
                  onClick={clearFilter}
                >Clear Filter</Button>
              </Box>
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
            </>
          )}
        </>
      )}
    </PageBody>
  );
}
export default ViewListing;