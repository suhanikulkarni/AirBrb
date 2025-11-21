import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../constants';
import { ErrorContext } from '../context';
import Thumbnail from './Thumbnail';

import styles from '../styles/listingStyles.module.css';
import { PageBody } from '../styles/mainStyles';

import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Filter from './Filter';
import { Modal, Rating, Typography } from '@mui/material';

function ViewListing({ token, owner }) {
  const navigate = useNavigate();
  const setShowErrorPopup = useContext(ErrorContext);

  const [list, setList] = useState('LOADING');
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
  const [reviewComment, setReviewComment] = useState('');
  const [acceptedBookings, setAcceptedBookings] = useState([]);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const handleClose = () => {
    setReviewOpen(false);
    setSelectedListingId(null);
    setSelectedBookingId(null);
    setReviewRating(null);
    setReviewRating(0);
    setReviewComment('');
  };

  const handleOpen = (listingId, bookingId) => {
    console.log('Opennign')
    setSelectedListingId(listingId);
    setSelectedBookingId(bookingId);
    setReviewOpen(true);
  };

  const uploadReview = async () => {
    console.log('Uploading review:', reviewComment, reviewRating);
    const review = {
      rating: reviewRating,
      comment: reviewComment
    };
    
    const body = { review };

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
        console.log('Review uploaded successfully');
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
        const userBookings = response.data.bookings.filter(
          booking => booking.owner === owner
        );
        setAllBookings(userBookings);
        const accepted = userBookings.filter(
          booking => booking.status === 'accepted'
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
        fetchedList.sort((a, b) => a.title.localeCompare(b.title));
        setList(fetchedList);
        setFilteredList([...fetchedList]);
      }
    }

    fetchListings();
    if (token) {
      fetchAcceptedBookings();
    } else {
      setAllBookings([]);
      setAcceptedBookings([]);
    }
  }, [reviewComment, reviewRating, token]);

  // Sort listings when bookings are loaded
  useEffect(() => {
    if (list !== 'LOADING') {
      const sortedList = [...list].sort((a, b) => {
        const aHasBooking = allBookings.some(booking => Number(booking.listingId) === Number(a.id));
        const bHasBooking = allBookings.some(booking => Number(booking.listingId) === Number(b.id));

        console.log(`Listing ${a.id} (${a.title}): has booking = ${aHasBooking}`);
        console.log(`Listing ${b.id} (${b.title}): has booking = ${bHasBooking}`);

        if (aHasBooking && !bHasBooking) return -1;
        if (!aHasBooking && bHasBooking) return 1;

        return a.title.localeCompare(b.title);
      });

      setFilteredList(sortedList);
    }
  }, [allBookings, list]);

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
    const { name, value } = e.target;

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
    if (filter.dateFilter !== '') {
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
    }

    // sort listing alphabetically
    // TODO: sort based on booking status
    listing.sort((a, b) => a.title.localeCompare(b.title));

    // TODO: sort based on individual filter

    setFilteredList(listing);
  };

  const orderList = () => {
    if (sortOrder === 'descending') return filteredList.toReversed();
    return filteredList;
  }

  return (
    <>
    <PageBody>
      <Modal
        open={reviewOpen}
        onClose={handleClose}
        style={{
          position: 'absolute',
          border: '2px solid #000',
          backgroundColor: 'pink',
          height: 200,
          width: 240,
          margin: 'auto',
          padding: '2%',
          color: 'white',
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

      <Filter filter={filter} setFilter={setFilter} filterListing={filterListing}/>
      <br />

      <ToggleButtonGroup
        value={sortOrder}
        exclusive
        onChange={(e, newSortOrder) => {
          if (newSortOrder !== null) setSortOrder(newSortOrder);
        }}
        aria-label='listing order'
        size='small'
      >
        <ToggleButton value='ascending' aria-label='ascending order'>
          <p>Ascending</p>
        </ToggleButton>
        <ToggleButton value='descending' aria-label='descending order'>
          <p>Descending</p>
        </ToggleButton>
      </ToggleButtonGroup>
      <br />


      {list === 'LOADING' ? (
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
                <div className={styles.grid}>
                  {orderList().map((listing, index) => {
                    const booking = acceptedBookings.find(
                      b => Number(b.listingId) === Number(listing.id)
                    );

                    return (
                      <div key={index} className={styles.card}>
                        <div key={listing.id} onClick={() => navigate(`/viewListings/${listing.id}`)}>
                          <Thumbnail thumbnail={listing.thumbnail} listingTitle={listing.title} />
                          <p className={styles.reviews}>
                            ★ 
                            {listing.reviews.length > 0 ? (
                              <>{listing.reviews.reduce((a, b) => a + b.rating, 0) / listing.reviews.length}</>
                            ) : (
                              <>0</>
                            )}
                            {` (${listing.reviews.length})`}
                          </p>
                          <h4 className={styles.address}>
                            {`
                              ${listing.address?.suburb},
                              ${listing.address?.state},
                              ${listing.address?.country}
                            `}
                          </h4>
                          <h3 className={styles.title}>{listing.title}</h3>
                          <p className={styles.subInfo}>{`${listing.metadata?.bedrooms.length} Bedrooms`}</p>
                          <p className={styles.subInfo}>{`${listing.metadata?.bathroomCount} Bathrooms`}</p>
                          <p className={styles.subInfo}>
                            {listing.availability[0].start.replaceAll('-', '/')}
                            {' - '}
                            {listing.availability[0].end.replaceAll('-', '/')}
                            </p>
                          <p className={styles.price}>${listing.price} per night</p>
                        </div>

                        {booking && (
                          <Typography
                            variant="body1"
                            style={{
                              marginTop: '8px',
                              fontWeight: 'bold',
                              color: booking.status === 'accepted' ? 'green' :
                                booking.status === 'pending' ? 'orange' :
                                  booking.status === 'declined' ? 'red' : 'pink'
                            }}
                          >
                            Booking Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Typography>
                        )}

                        {booking && (
                          <Button variant="contained" onClick={() => handleOpen(listing.id, booking.id)}>
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
    </>
  );
}

export default ViewListing;