import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ErrorContext } from '../context';
import { API_BASE_URL } from '../constants';
import Button from '@mui/material/Button';
import styles from '../styles/bookingRequest.module.css';

dayjs.extend(customParseFormat);

function ViweBookingRequest({ token, owner }) {
  const setShowErrorPopup = useContext(ErrorContext);
  const navigate = useNavigate();

  const [bookingRequests, setBookingRequests] = useState([]);
  const [listings, setListings] = useState([]);
  const [totalDaysBooked, setTotalDaysBooked] = useState(0);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    let profit1 = 0;

    bookingRequests.map(booking => {
      profit1 += booking.totalPrice;
    })

    setProfit(profit1);
  }, [bookingRequests]);

  useEffect(() => {
    let daysBooked = 0;

    bookingRequests
      .filter(booking => booking.status === 'accepted')
      .forEach(booking => {
        const start1 = dayjs(booking.dateRange.start, 'DD-MM-YYYY');
        const end1 = dayjs(booking.dateRange.end, 'DD-MM-YYYY');

        if (!start1.isValid() || !end1.isValid()) {
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
    } catch (error) {
      setShowErrorPopup(error.response.data.error);
    }
  };

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
    } catch (error) {
      setShowErrorPopup(error.response.data.error);
      return [];
    }
  };

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
      } catch (error) {
        setShowErrorPopup(error.response.data.error);
      }
    };

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
      setShowErrorPopup(error.response?.data?.error || 'Requests Failed To Show.');
    }
  };

  const acceptRequest = async (bookingId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}bookings/accept/${bookingId}`, {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response) getBookingRequests();
    } catch (error) {
      setShowErrorPopup(error.response?.data?.error || 'Failed to Accept Bookng Request');
    }
  }

  const declineRequest = async (bookingId) => {
    try {
      await axios.put(
        `${API_BASE_URL}bookings/decline/${bookingId}`, {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      getBookingRequests();
    } catch (error) {
      setShowErrorPopup(error.response?.data?.error || 'Failed to Decline Bookng Request');
    }
  };

  const pendingRequests = bookingRequests.filter(r => r.status === 'pending');

  const getStatusClass = (status) => {
    if (status === 'accepted') return styles.statusAccepted;
    if (status === 'declined') return styles.statusDeclined;
    return styles.statusPending;
  };

  return (
    <div className={styles.container}>
      <div className={styles.pendingSection}>
        <h3 className={styles.title}>Booking Requests</h3>

        {pendingRequests.length === 0 ? (
          <p className={styles.noRequests}>No pending booking requests</p>
        ) : (
          <div className={styles.requestsGrid}>
            {pendingRequests.map((request) => (
              <div key={request.id} className={styles.requestCard}>
                <h3 className={styles.requestTitle}>Request ID: {request.id}</h3>
                <p className={styles.requestInfo}>
                  <span className={styles.requestInfoLabel}>Start Date:</span> {request.dateRange.start}
                </p>
                <p className={styles.requestInfo}>
                  <span className={styles.requestInfoLabel}>End Date:</span> {request.dateRange.end}
                </p>
                <div className={styles.buttonGroup}>
                  <Button
                    variant='contained'
                    color='success'
                    onClick={() => acceptRequest(request.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant='contained'
                    color='error'
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

      <div className={styles.statsBox}>
        <h4 className={styles.statsTitle}>Booking Statistics</h4>
        <div className={styles.statsContainer}>
          {bookingRequests.length === 0 ? (
            <p className={styles.noRequests}>No bookings to display</p>
          ) : (
            bookingRequests.map((request) => (
              <div key={request.id} className={styles.statsRequestCard}>
                <h4 className={styles.statsRequestTitle}>Request ID: {request.id}</h4>
                <div className={styles.statsRequestInfo}>
                  <div>
                    <span className={styles.statsRequestInfoLabel}>Start:</span> {request.dateRange.start}
                  </div>
                  <div>
                    <span className={styles.statsRequestInfoLabel}>End:</span> {request.dateRange.end}
                  </div>
                  <div>
                    <span className={styles.statsRequestInfoLabel}>Status:</span>{' '}
                    <span className={`${styles.statusBadge} ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className={styles.summaryStats}>
          <div className={`${styles.statCard} ${styles.profitCard}`}>
            <div className={styles.statLabel}>Total Profit</div>
            <div className={`${styles.statValue} ${styles.profitValue}`}>
              ${profit.toFixed(2)}
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.daysCard}`}>
            <div className={styles.statLabel}>Days Booked</div>
            <div className={`${styles.statValue} ${styles.daysValue}`}>
              {totalDaysBooked}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViweBookingRequest