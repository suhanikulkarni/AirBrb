import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles/ListingStyles';
import { useNavigate } from 'react-router-dom'; 
import ListingInfo from './ListingInfo';

import { ErrorContext } from '../context';
import { Modal } from '@mui/material';
import ReviewModal from './ReviewModal';
const getListings = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}listings`)
    //console.log(response)
    if (response.data?.listings) {
      //console.log(response.data.listings)
      return response.data.listings;
    }
  }
  catch (error) {
    //console.log("in the catch, there is an error", error.message);
  }
}
function ViewListing ({token}) {
  const setShowErrorPopup = useContext(ErrorContext); 
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const navigate = useNavigate();
  const [list, setLists] = useState([]);
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
      if (data) setLists(data);
    };
    fetchListings();
  }, [])

const getBookingRequests = async () => {
  if (!token) {
    setShowErrorPopup("You need to be logged in the view booking requests");
    return;
  }

  try {
    const res = await axios.get(`${API_BASE_URL}bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res) {
      const requests = res.data.bookings;

      console.log("All bookings:", requests);
      const acceptedBookings = requests.filter((booking) => {
        const accepted = booking.status === "accepted";
        const listings = list.some(
          (listing) => String(listing.id) === String(booking.listingId)
        );
        return accepted && listings;
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
    console.log("ERROR", error.response);
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
    <div style={styles.container}>
      

      {list.length === 0 ? (
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

    </div>
    
    
  );
}
export default ViewListing;