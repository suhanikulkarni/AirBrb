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
import { Box, Modal, Rating } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import DatePicker from "react-multi-date-picker";
import Thumbnail from './Thumbnail';

function ViewListing ( {token, owner}) {
  const navigate = useNavigate();
  const setShowErrorPopup = useContext(ErrorContext);

  const [list, setList] = useState("LOADING");
  const [filteredList, setFilteredList] = useState([]);
  const [sortOrder, setSortOrder] = useState('ascending');
  const [filter, setFilter] = useState({
    'searchFilter': '',
    'minBedroomFilter': '',
    'maxBedroomFilter': '',
    'minPriceFilter': '',
    'maxPriceFilter': '',
    'reviewFilter': '',
    'dateFilter': ''
  });


  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [acceptedBookings, setAcceptedBookings] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const handleClose = () => {
    setOpen(false);
    setSelectedListingId(null);
    setSelectedBookingId(null);
    setReviewRating(null);
    setReviewRating(0);
    setReviewComment('');
  };

  const handleOpen = (listingId, bookingId) => {
    console.log("Opennign")
    setSelectedListingId(listingId);
    setSelectedBookingId(bookingId);
    setOpen(true);
  };


  const uploadReview = async () => {
    console.log("Uploading review:", reviewComment, reviewRating);
    const review = {
      rating: reviewRating,
      comment: reviewComment
    }
    const body = { review }
    try {
      const response = await axios.put(
        `${API_BASE_URL}listings/${selectedListingId}/review/${selectedBookingId}`, 
        body, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (response) {
        console.log("Review uploaded successfully");
        handleClose();
      }
    } catch (error) {
      setShowErrorPopup(error.response.data.error);
    }
  }

  const fetchAcceptedBookings = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data?.bookings) {
        const accepted = response.data.bookings.filter(
          booking => booking.status === 'accepted' && booking.owner === owner
        );
        setAcceptedBookings(accepted);
      }
    } catch (error) {
      setShowErrorPopup(error.response.data.error);

    }
  };

  useEffect(() => {
    const fetchListings = async () => {
      const data = await getListings();

      if (data) {
        const fetchedList = [];

        for (const listing of data) {
          const listingInfo = await getListingInfo(listing.id);
          if (listingInfo.published) {
            fetchedList.push({ ...listing, ...listingInfo });
          }
        }
        
        // TODO: sort list based on booked listing
        setList(fetchedList);
        setFilteredList([...fetchedList]);
      }      
    }

    fetchListings();
    fetchAcceptedBookings();
  }, [reviewComment, reviewRating]);

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

  const handleFilter = (e) => {
    const {name, value} = e.target;

    setFilter((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }

  const filterListing = (e) => {
    let listing = [...list];

    // search filter
    listing = listing.filter(l => l.title.includes(filter.searchFilter));

    // bedroom filter
    if (filter.minBedroomFilter !== '') {
      listing = listing.filter(l => l.metadata?.bedrooms.length >= filter.minBedroomFilter);
    }

    if (filter.maxBedroomFilter !== '') {
      listing = listing.filter(l => l.metadata?.bedrooms.length <= filter.maxBedroomFilter);
    }

    // price filter
    if (filter.minPriceFilter !== '') {
      listing = listing.filter(l => l.price >= filter.minPriceFilter);
    }

    if (filter.maxPriceFilter !== '') {
      listing = listing.filter(l => l.price <= filter.maxPriceFilter);
    }

    // review filter
    if (filter.reviewFilter !== '') {
      listing = listing.filter(l => {
        if (!l.reviews.length) return false;
        
        const average = l.reviews.reduce((a, b) => a + b.rating) / l.reviews.length;
        if (average >= filter.reviewFilter) return true;

        return false;
      });
    }

    // date filter
    listing = listing.filter(l => {
      const [filterStart, filterEnd] = filter.dateFilter;
      const [listingAvailability] = l.availability;

      const filterStartEpoch = new Date(filterStart).getTime() / 1000;
      const filterEndEpoch = new Date(filterEnd).getTime() / 1000;
      
      const listingStartParts = listingAvailability.start.split('-');
      const listingEndParts = listingAvailability.end.split('-');
      
      const listingStartEpoch = new Date(listingStartParts[2], listingStartParts[1] - 1, listingStartParts[0]).getTime() / 1000;
      const listingEndEpoch = new Date(listingEndParts[2], listingEndParts[1] - 1, listingEndParts[0]).getTime() / 1000;

      if (filterStartEpoch < listingStartEpoch) return false;
      if (filterEndEpoch > listingEndEpoch) return false;
      return true;
    });

    // sort listing alphabetically
    listing.sort((a, b) => a.title.localeCompare(b.title));

    // TODO: sort based on individual filter

    setFilteredList(listing);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') filterListing();
  };

  const clearFilter = () => {
    setFilter({
      'searchFilter': '',
      'minBedroomFilter': '',
      'maxBedroomFilter': '',
      'minPriceFilter': '',
      'maxPriceFilter': '',
      'reviewFilter': '',
      'dateFilter': ''
    });
    setFilteredList([...list]);
  };

  const orderList = () => {
    if (sortOrder === 'descending') return filteredList.toReversed();
    return filteredList;
  }

  return (
    <PageBody>
      <Modal 
        open={open} 
        onClose={handleClose} 
        style={{
          position: "absolute",
          border: "2px solid #000",
          backgroundColor: "pink",
          height: 200,
          width: 240,
          margin: "auto",
          padding: "2%",
          color: "white",
        }}
      >
        <div>
          <div>Review</div>
          <Rating
            value={reviewRating}
            onChange={(event, newValue) => setReviewRating(newValue)}
          />
          <TextField
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
          <Button 
            onClick={uploadReview} 
            variant='contained'
          >
            Submit Review
          </Button>
        </div>
      </Modal>

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
          value={filter.searchFilter}
          name='searchFilter'
          onChange={handleFilter}
          onKeyDown={handleKeyDown}
        />
        <br />

        <h2>Bedroom Filter (Min-Max)</h2>
        {/* TODO: prevent no. from decreasing beyond 0 */}
        <TextField
          id="min-bedroom-filter-input"
          label="Minimum Bedroom"
          type="number"
          value={filter.minBedroomFilter}
          onChange={handleFilter}
          name="minBedroomFilter"
          slotProps={{ input: { min: 0 } }}
        />
        <br />

        {/* TODO: prevent no. from decreasing beyond 0 */}
        <TextField
          id="max-bedroom-filter-input"
          label="Maximum Bedroom"
          type="number"
          value={filter.maxBedroomFilter}
          onChange={handleFilter}
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
          value={filter.minPriceFilter}
          onChange={handleFilter}
          name="minPriceFilter"
          slotProps={{ input: { min: 0 } }}
        />
        <br />

        {/* TODO: prevent no. from decreasing beyond 0 */}
        <TextField
          id="max-price-filter-input"
          label="Maximum Price"
          type="number"
          value={filter.maxPriceFilter}
          onChange={handleFilter}
          name="maxPriceFilter"
          slotProps={{ input: { min: 0 } }}
        />
        <br />

        <h2>Review Filter</h2>
        <FormControl fullWidth>
          <InputLabel id="review-filter-select-label">Review</InputLabel>
          <Select
            labelId="review-filter-select-label"
            id="review-filter-select"
            name="reviewFilter"
            value={filter.reviewFilter}
            onChange={handleFilter}
          >
            <MenuItem value={'5'}>5</MenuItem>
            <MenuItem value={'4'}>4+</MenuItem>
            <MenuItem value={'3'}>3+</MenuItem>
            <MenuItem value={'2'}>2+</MenuItem>
            <MenuItem value={'1'}>1+</MenuItem>
            <MenuItem value={'0'}>0+</MenuItem>
          </Select>
        </FormControl>
        <br />

        <h2>Date Filter</h2>
        <DatePicker 
          range 
          value={filter.dateFilter} 
          onChange={(e, dateRange) => {
            setFilter((prevData) => ({
              ...prevData,
              'dateFilter': dateRange.validatedValue
            }));
          }}
          placeholder="Filter available dates"
        />

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
      

      {list === "LOADING" ? (
        <p>LOADING...</p>
      ) : (
        <>
          {list.length === 0 ? (
            <div>No listings available</div>
          ) : (
            <>
              {!filteredList.length ? (
                <p>No listings found</p>
              ) : (
                <div style={styles.grid} >
                  {orderList().map((listing, index) => {
                    const booking = acceptedBookings.find(
                      b => Number(b.listingId) === Number(listing.id)
                    );
                    
                    return (
                      <div key={index} style={styles.card}>
                        <div  onClick={() => navigate(`/viewListings/${listing.id}`)}>
                          <Thumbnail thumbnail={listing.thumbnail} listingTitle={listing.title} />
                          <h4 style={styles.address}>
                            {`
                              ${listing.address?.suburb},
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
                        {booking && (
                          <Button variant="contained"onClick={() => handleOpen(listing.id, booking.id)}>
                            Leave a Review
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </PageBody>
  );

}

export default ViewListing;