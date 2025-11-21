
import { useContext, useEffect, useState } from "react";
import { ErrorContext } from '../context';
import axios from "axios";
import { API_BASE_URL } from "../constants";
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import { Box, Chip } from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import styles from '../styles/listingStyles.module.css';
dayjs.extend(customParseFormat);

function ViewBookingRequest({ token, owner }) {

  const [bookingRequests, setBookingRequests] = useState([]);
  const [listings, setListings] = useState([]);
  const setShowErrorPopup = useContext(ErrorContext);
  const [totalDaysBooked, setTotalDaysBooked] = useState(0);
  const [profit, setProfit] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let profit1 = 0;
    bookingRequests.map(booking => {
      profit1 += booking.totalPrice;
    })
    setProfit(profit1);
  }, [bookingRequests])

  useEffect(() => {
    let daysBooked = 0;

    bookingRequests
      .filter(booking => booking.status === 'accepted')
      .forEach(booking => {
        const start1 = dayjs(booking.dateRange.start, 'DD-MM-YYYY');
        const end1 = dayjs(booking.dateRange.end, 'DD-MM-YYYY');

        if (!start1.isValid() || !end1.isValid()) {
          console.warn("Invalid date range:", booking.dateRange);
          return;
        }

        const nights = end1.diff(start1, 'day');
        daysBooked += nights;
      });

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
        bookingRequests = requestData.filter(booking => {
          const match = listingIds.includes(String(booking.listingId));
          return match;
        });

        setBookingRequests(bookingRequests);
      }
    } catch (error) {
      setShowErrorPopup(error.response?.data?.error || "Requests Failed To Show.");
    }
  }

  const acceptRequest = async (bookingId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}bookings/accept/${bookingId}`, {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response) { getBookingRequests(); }
    }
    catch (error) {
      setShowErrorPopup(error.response?.data?.error || "Failed to Accept Booking Request");
    }
  }

  const declineRequest = async (bookingId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}bookings/decline/${bookingId}`, {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      getBookingRequests();
    }
    catch (error) {
      setShowErrorPopup(error.response?.data?.error || "Failed to Decline Booking Request");
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'declined':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  }

  const pendingRequests = bookingRequests.filter(req => req.status === 'pending');

  return (
    <div className="container">
      <div className="banner">
        <div className="bannerContent">
          <h1 className="title">Booking Dashboard</h1>
          <p className="subtitle">Manage and track your property bookings</p>
          
          <div className="statsContainer">
            <div className="statBox">
              <h4>${profit}</h4>
              <p>Total Profit</p>
            </div>
            <div className="statBox">
              <h4>{totalDaysBooked}</h4>
              <p>Days Booked</p>
            </div>
            <div className="statBox">
              <h4>{pendingRequests.length}</h4>
              <p>Pending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mainContent">
        <div className="gridLayout">
          
          {/* Left Column - Pending Requests */}
          <div>
            <div className="sectionHeader">
              <h2 className="sectionTitle">Action Required</h2>
              {pendingRequests.length > 0 && (
                <Chip 
                  label={`${pendingRequests.length} pending`} 
                  color="warning" 
                  sx={{ fontWeight: 600 }}
                />
              )}
            </div>

            {pendingRequests.length === 0 ? (
              <div className="emptyCard">
                <h3 className="emptyTitle">✅ All caught up!</h3>
                <p className="emptyText">No pending requests to review</p>
              </div>
            ) : (
              <div>
                {pendingRequests.map((request) => (
                  <div key={request.id} className="requestCard pendingCard">
                    <h3 className="requestTitle">Request #{request.id}</h3>
                    
                    <div className="dateRow">
                      <CalendarTodayIcon sx={{ fontSize: 16 }} />
                      <span>{request.dateRange.start} → {request.dateRange.end}</span>
                    </div>

                    {request.totalPrice && (
                      <p className="price">${request.totalPrice}</p>
                    )}

                    <div className="buttonRow">
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        onClick={() => acceptRequest(request.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={() => declineRequest(request.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Booking History */}
          <div>
            <div className="sectionHeader">
              <h2 className="sectionTitle">Booking History</h2>
            </div>

            {bookingRequests.length === 0 ? (
              <div className="emptyCard">
                <h3 className="emptyTitle">📋 No bookings yet</h3>
                <p className="emptyText">Your booking history will appear here</p>
              </div>
            ) : (
              <div>
                {bookingRequests.map((request) => (
                  <div key={request.id} className="historyCard">
                    <div className="historyHeader">
                      <div className="historyLeft">
                        <h6>Request #{request.id}</h6>
                        <Chip 
                          label={request.status.toUpperCase()} 
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </div>
                      {request.totalPrice && (
                        <h6 className="historyPrice">${request.totalPrice}</h6>
                      )}
                    </div>

                    <div className="dateRow">
                      <CalendarTodayIcon sx={{ fontSize: 14 }} />
                      <span style={{ fontSize: '0.875rem' }}>
                        {request.dateRange.start} → {request.dateRange.end}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewBookingRequest