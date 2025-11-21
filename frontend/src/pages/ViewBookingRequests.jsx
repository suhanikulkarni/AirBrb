import { useContext, useEffect, useState } from "react";
import { ErrorContext } from '../context';
import axios from "axios";
import { API_BASE_URL } from "../constants";
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import { Box, Input, InputLabel } from "@mui/material";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

function ViweBookingRequest({ token, owner }) {

  const [bookingRequests, setBookingRequests] = useState([]);
  const [listings, setListings] = useState([]);
  const setShowErrorPopup = useContext(ErrorContext);
  const [totalDaysBooked, setTotalDaysBooked] = useState(0);
  const [profit, setProfit] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let profit1 = 0;
    // only if acceptef

    bookingRequests.map(booking => {
      profit1 += booking.totalPrice;
    })

    console.log(profit1)
    setProfit(profit1);
  }, [bookingRequests])

useEffect(() => {
    let daysBooked = 0;

    bookingRequests
      .filter(booking => booking.status === 'accepted')
      .forEach(booking => {
        // Parse dates with the correct format: DD-MM-YYYY
        const start1 = dayjs(booking.dateRange.start, 'DD-MM-YYYY');
        const end1 = dayjs(booking.dateRange.end, 'DD-MM-YYYY');

        if (!start1.isValid() || !end1.isValid()) {
          console.warn("Invalid date range:", booking.dateRange);
          return;
        }

        console.log("Formatted start1:", start1.format('YYYY-MM-DD'));
        console.log("Formatted end1:", end1.format('YYYY-MM-DD'));

        const nights = end1.diff(start1, 'day');
        daysBooked += nights;
      });

    console.log("Total days booked:", daysBooked);
    setTotalDaysBooked(daysBooked);
  }, [listings, bookingRequests]);

  useEffect(() => {
    if (token === 'LOADING' || !token) navigate('/login');
  }, [token]);


  const getListingInfo = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}listings/${id}`);
      if (res) return res.data.listing;
    }
    catch (error) {
      setShowErrorPopup(error.response.data.error);
    }
  }

  const getAllListings = async () => {
    let hostedListings = [];
    try {
      const res = await axios.get(`${API_BASE_URL}listings`);
      if (res) {
        const listingData = res.data.listings;
        listingData.forEach(element => {
          if (element.owner === owner) {
            hostedListings.push(element.id)
          }
        });
        return hostedListings;
      }
    }
    catch (error) {
      setShowErrorPopup(error.response.data.error);
      return [];
    }
  }

  useEffect(() => {
    const getFetch = async () => {
      try {
        const listingIds = await getAllListings();
        if (!listingIds || listingIds.length === 0) {
          setListings([]);
          return;
        }
        const detailedListings = await Promise.all(
          listingIds.map(async (id) => {
            const listing = await getListingInfo(id);
            if (listing) {
              return { ...listing, id };
            }
            return null;
          })
        );
        setListings(detailedListings.filter(Boolean));
      }
      catch (error) {
        console.log("ngregnjkgnrek")
        setShowErrorPopup(error.response.data.error);
      }
    }
    getFetch();
  }, [owner]);


  useEffect(() => {
    if (listings.length > 0) {
      getBookingRequests();
    }
  }, [listings]);

  const getBookingRequests = async () => {
    let bookingRequests = [];
    try {
      const res = await axios.get(`${API_BASE_URL}bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res) {
        const requestData = res.data.bookings;
        const listingIds = listings.map(listing => String(listing.id));
        //console.log("Listing IDs:", listingIds);
        bookingRequests = requestData.filter(booking => {
          const match = listingIds.includes(String(booking.listingId));
          //console.log(`Comparing ${booking.listingId} with myListingIds:`, match);
          return match;
        });

        console.log("Filtered Booking Requests:", bookingRequests);
        setBookingRequests(bookingRequests);
      }
    } catch (error) {
      setShowErrorPopup(error.response?.data?.error || "Requests Failed To Show.");
    }
  }

  const acceptRequest = async (bookingId) => {
    console.log("accepted");
    try {
      console.log("accepted!!!!!!!!!");

      const response = await axios.put(
        `${API_BASE_URL}bookings/accept/${bookingId}`, {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response) { console.log(response); getBookingRequests(); }
    }
    catch (error) {
      setShowErrorPopup(error.response?.data?.error || "Failed to Accept Bookng Request");
    }
  }

  const declineRequest = async (bookingId) => {
    console.log("decline");
    try {
      const response = await axios.put(
        `${API_BASE_URL}bookings/decline/${bookingId}`, {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log("Decline response:", response);
      getBookingRequests();
    }

    catch (error) {
      setShowErrorPopup(error.response?.data?.error || "Failed to Decline Bookng Request");
    }
  }

  return (
    <div>
      <h3>Booking Requests</h3>
      {bookingRequests.length === 0 ? (
        <p>No booking requests </p>
      ) : (
        bookingRequests.map((request) => (
          <>
            {request.status === "pending" && (
              <div key={request.id}>
                <h3>Request Id: {request.id}</h3>
                <p>Start Date: {request.dateRange.start}</p>
                <p>End Date: {request.dateRange.end}</p>
                <Button
                  onClick={() => { acceptRequest(request.id) }}
                >Accept
                </Button>

                <Button
                  onClick={() => { declineRequest(request.id) }}
                >Decline
                </Button>

              </div>
            )}
          </>
        ))
      )}

      <Box>
        <InputLabel>Suhani</InputLabel>

        {bookingRequests.map((request) => (
          <>
            <h4>Request Id: {request.id}</h4>
            <p>Start Date: {request.dateRange.start}</p>
            <p>End Date: {request.dateRange.end}</p>
            <p>Status: {request.status}</p>
          </>
        ))}

        <InputLabel>Profit Made: ${profit}</InputLabel>
        <InputLabel>Days booked: {totalDaysBooked}</InputLabel>

      </Box>
    </div>
  )


}

export default ViweBookingRequest