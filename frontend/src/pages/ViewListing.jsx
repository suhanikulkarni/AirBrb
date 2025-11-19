import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles/ListingStyles';
import { useNavigate } from 'react-router-dom';
import { PageBody } from '../styles/mainStyles';
import { ErrorContext } from '../context';

import { Button, Modal, Rating, TextField } from '@mui/material';



const getListings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}listings`);
    if (response.data?.listings) return response.data.listings;
  } catch (error) {
    setShowErrorPopup(error.response.data.error);
  }
}

function ViewListing ({token}) {
  const setShowErrorPopup = useContext(ErrorContext); 
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const navigate = useNavigate();

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");


  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [sortOrder, setSortOrder] = useState('ascending');
  const [filter, setFilter] = useState({
    'searchFilter': '',
    'minBedroomFilter': '',
    'maxBedroomFilter': '',
    'minPriceFilter': '',
    'maxPriceFilter': '',
    'reviewFilter': ''
  });
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
      console.log(error.response)
      setShowErrorPopup(error.response.data.error);
    }
  }

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
  }, []);


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
        
        const average = l.reviews.reduce((a, b) => a + b) / l.length;
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


  const getBookingRequests = async () => {
    if (!token) {
      setShowErrorPopup("You need to be logged in the view booking requests");
      return;
    }

    const publishedListings = await getListings();
    console.log("published listings", publishedListings)

    try {
      const res = await axios.get(`${API_BASE_URL}bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res) {
        const requests = res.data.bookings;

        console.log("All bookings:", requests);
        const acceptedBookings = requests.filter((booking) => {
          const accepted = booking.status === "accepted";
          const listings = publishedListings.filter(
            (listing) => String(listing.id) === String(booking.listingId)
          );
          console.log(listings)
          return accepted && listings.length > 0;
        });

        const uniqueAcceptedBookings = Object.values(
          acceptedBookings.reduce((acc, booking) => {
            acc[booking.listingId] = booking; 
            return acc;
          }, {})
        );

        console.log("Unique bookings:", uniqueAcceptedBookings);

        setAcceptedBookings(uniqueAcceptedBookings);
      }
    } catch (error) {
      console.log("ERROR123 FULL:", error.toJSON?.() || error);
      console.log("ERROR123", error.response);
      setShowErrorPopup(error.response?.data?.error || "Requests Failed To Show.");
    }
  };


  useEffect (() => {
    if (list.length > 0) {
      getBookingRequests();
    }
    console.log("fgdf",acceptedBookings)
  }, [list])


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

      {list.length === 0 ? (
        <div>No listings available</div>
      ) : (
        list.map((listing, index) => {
          const booking = acceptedBookings.find(
            b => Number(b.listingId) === Number(listing.id)
          );
          return (
            <div key={index}>
              <div onClick={() => navigate(`/viewListings/${listing.id}`)}>
                <div>{listing.title}</div>
                <div>${listing.price}</div>
              </div>
              {booking && (
                <Button onClick={() => handleOpen(listing.id, booking.id)}>
                  Leave a Review
                </Button>
              )}
            </div>
          );
        })
      )}
    </PageBody>
  );

}

export default ViewListing;