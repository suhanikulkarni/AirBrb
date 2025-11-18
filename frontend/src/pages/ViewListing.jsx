import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles/ListingStyles';
import { useNavigate } from 'react-router-dom';
import { PageBody } from '../styles/mainStyles';
import { ErrorContext } from '../context';

import { Modal } from '@mui/material';



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

  const [list, setList] = useState("LOADING");
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

  const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
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

  useEffect(() => {
    if (acceptedBookings.length > 0) {
      handleOpen();
    }
  }, [acceptedBookings])

  return (
    <PageBody>
      {list === "LOADING" ? (
        <p style={styles.loadingText}>Loading listings...</p>
      ) : (
        <div style={styles.grid} >
          {list.map((listing, index) => (
            <div key={index} style={styles.card} onClick={() => navigate(`/viewListings/${listing.id}`)}>
              <img src={listing.thumbnail} alt={listing.title} style={styles.thumbnail} />
              <h3 style={styles.title}>{listing.title}</h3>
              <p style={styles.price}>${listing.price}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={handleClose}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "pink",
            padding: 20,
            borderRadius: 8
          }}
        >
          fgdgffgfdgfgfdgwert4yrtjhnd
        </div>
      </Modal>

    </PageBody>
    

  );
}

export default ViewListing;