import axios from "axios";
import { API_BASE_URL } from "../constants";
import { useContext, useEffect, useState } from "react";
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DatePicker from "react-multi-date-picker";
import { Box } from '@mui/material';
import { ErrorContext } from '../context';
import { useNavigate } from "react-router-dom";
import Thumbnail from "./Thumbnail";
import styles from '../styles/listingStyles.module.css';

function ViewHostedListings({ owner, token }) {
  const setShowErrorPopup = useContext(ErrorContext); 
  const navigate = useNavigate();
  
  const [listings, setListings] = useState("LOADING");
  const [bookingRequests, setBookingRequests] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeListing, setActiveListing] = useState(null);
  const [currentRange, setCurrentRange] = useState([]);
  const [allRanges, setAllRanges] = useState({});

  const deleteListing = async (listingId) => {
    let isPublished= await getListingInfo(listingId);
    isPublished = isPublished.published;

    console.log("isPublished", isPublished)
    if (isPublished) {
      try {
        await axios.put(
          `${API_BASE_URL}listings/unpublish/${listingId}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      } catch (error) {
        setShowErrorPopup(error.response.data.error);
      }
    }

    try {
      const res = await axios.delete(`${API_BASE_URL}listings/${listingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res) {
        setListings(prevListings => prevListings.filter(listing => listing.id !== listingId))
      } 
    } catch (error) {
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
    } catch (error) {
      setShowErrorPopup(error.response.data.error);
      return [];
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
        console.log('listings', detailedListings.filter(Boolean))
      } catch (error) {
        setShowErrorPopup(error.response.data.error);

      }
    } 

    getFetch();
  }, [owner]);

  useEffect(() => {
    if (listings !== "LOADING" && listings.length > 0) {
      getBookingRequests();
    }
  }, [listings]);

  const handleClick = (event, listing) => {
    console.log("clicked", listing.id);
    setAnchorEl(event.currentTarget);
    setActiveListing(listing);
    setCurrentRange([]);
  };

  const publishDates = async () => {
    if (!activeListing) return;

    const listingId = activeListing.id;
    const ranges = allRanges[listingId] || [];

    if (ranges.length === 0) {
      alert("Please add at least one availability range before publishing");
      return;
    }
    const availability = ranges.map(range => ({
      start: range[0].format("DD-MM-YYYY"),
      end: range[1].format("DD-MM-YYYY")
    }));

    const body = { availability };
    try {
      const res = await axios.put(
        `${API_BASE_URL}listings/publish/${listingId}`,
        body,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res) {
        console.log("this si resdata",res);
        navigate('/')
      }
    } catch (error) {
      setShowErrorPopup(error.response.data.error);

    } 
  }
  const addingRanges = () => {
    // TODO: only allow dates past today's date
    const listingId = activeListing?.id;

    if (!currentRange || currentRange.length !== 2) {
      alert("Please select a full date range (start and end date)");
      return;
    }

    setAllRanges(prev => {
      const updatedRanges = {
        ...prev,
        [listingId]: [
          ...(prev[listingId] || []),
          currentRange
        ]
      };
      console.log("Updated allRanges:", updatedRanges);
      return updatedRanges;
    });
    
    setCurrentRange([]);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setActiveListing(null);
    setCurrentRange([]);
  };
  
  const open = Boolean(anchorEl);

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
      if (response) {
        console.log(response);
        getBookingRequests();
      }
    } catch (error) {
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
    } catch (error) {
      setShowErrorPopup(error.response?.data?.error || "Failed to Decline Bookng Request");
    }
  }

  return (
    <div>
      {listings === "LOADING" ? (
        <p>Loading...</p>
      ) : (
        <>
          <Box
            sx={{
              borderRadius: 3,
              bgcolor: '#f3f3f3ff',
              padding: '15px',
              marginBottom: '15px'
            }}
          >
            <h3>Booking Requests</h3>
            {bookingRequests.length ? (
              <p>No booking requests</p>
            ) : (
              bookingRequests.map((request) => (
                <>
                  {request.status === "pending" && (
                    <div key={request.id}>
                      <h3>Request Id: {request.id}</h3>
                      <p>Start Date: {request.dateRange.start}</p>
                      <p>End Date: {request.dateRange.end}</p>
                      <Button
                        onClick = {() => {acceptRequest(request.id)}}
                      >Accept
                      </Button>

                      <Button
                        onClick = {() => {declineRequest(request.id)}}
                      >Decline
                      </Button>

                    </div>
                  )}
                </>
              ))
            )}
          </Box>

          {listings.length === 0 ? (
            <p>No hosted listings found</p>
          ) : (
            <Box
              sx={{
                border: '1px solid #e0e0e0ff',
                padding: '15px',
                borderRadius: '15px'
              }}
            >
              {listings.map((listing) => (
                <Box
                  key={listing.id} 
                  sx={{
                    padding: '15px',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    borderBottom: '1px solid #e0e0e0ff',
                  }}
                >
                  <Thumbnail thumbnail={listing.thumbnail} listingTitle={listing.title} />
                  <Box
                    key={listing.id} 
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      margin: '10px',
                    }}
                  >
                    <h3 className={styles.title}>{listing.title}</h3>
                    <p className={styles.subInfo}>Rating:</p>
                    <p className={styles.price}>${listing.price} per night</p>
                    <p className={styles.subInfo}>Property Type: {listing.metadata?.bedroomCount}</p>
                    <p className={styles.subInfo}>Number of Beds: {listing.metadata?.bedroomCount}</p>
                    <p className={styles.subInfo}>Number of Bathrooms: {listing.metadata?.bathroomCount}</p>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        marginTop: '10px'
                      }}
                    >
                      <Button 
                        aria-describedby={listing.id} 
                        variant="outlined" 
                        onClick={(e) => handleClick(e, listing)}
                        sx={{
                          marginRight: '5px'
                        }}
                      >
                        Manage Availability
                      </Button>
                      <Button
                        variant="outlined" 
                        onClick={() => navigate(`edit-listing/${listing.id}`)}
                        sx={{
                          marginRight: '5px'
                        }}
                      >
                        Edit Listing
                      </Button>
                      <Button
                        name={listing.id} 
                        variant="outlined" 
                        onClick={() => deleteListing(listing.id)}
                      >
                        Delete Listing
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          <Popover
            id={activeListing?.id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            {activeListing && (
              <Box
                sx={{
                  padding: '10px',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Set Availability for: {activeListing.title}
                </Typography>

                <DatePicker 
                  range 
                  value={currentRange} 
                  onChange={setCurrentRange} 
                  placeholder="Select availability date range"
                />
                
                <Button
                  variant="outlined"
                  onClick={addingRanges}
                  fullWidth
                >
                  Add Availability
                </Button>

                <div >
                  <strong>Current Availability:</strong>

                  {(allRanges[activeListing.id] || []).length === 0 ? (
                    <p>No ranges added yet.</p>
                  ) : (
                    <div>
                      {(allRanges[activeListing.id] || []).map((range, index) => (
                        <p key={index} >
                          {range[0].format("DD/MM/YYYY")} to {range[1].format("DD/MM/YYYY")}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={publishDates}
                >
                  Publish Listing
                </Button>
              </Box>
            )}
          </Popover>
        </>
      )}
    </div>
  );
}

export default ViewHostedListings;