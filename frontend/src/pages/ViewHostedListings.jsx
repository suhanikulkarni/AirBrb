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

function ViewHostedListings({ owner, token }) {
  const [listings, setListings] = useState("LOADING");
  const setShowErrorPopup = useContext(ErrorContext); 

  const [bookingRequests, setBookingRequests] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeListing, setActiveListing] = useState(null);
  const [currentRange, setCurrentRange] = useState([]);
  const [allRanges, setAllRanges] = useState({});
  const navigate = useNavigate();

  const deleteListing = async (listingId) => {

    let isPublished= await getListingInfo(listingId);
    isPublished = isPublished.published;

    console.log("isPublished", isPublished)
    if (isPublished) {
      try {
        const res = await axios.put(
          `${API_BASE_URL}listings/unpublish/${listingId}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      }
      catch (error){
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
    }
    catch (error){
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
    catch (error){
      setShowErrorPopup(error.response.data.error);
      return [];
    }
  }

  const getListingInfo = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}listings/${id}`);
      if (res) return res.data.listing;
    }
    catch (error){
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
      }
      catch (error) {
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
    }
    catch (error){
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
    try{
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
    }
    catch(error){
      setShowErrorPopup(error.response?.data?.error || "Failed to Accept Bookng Request");
    }
  }

  const declineRequest = async (bookingId) => {
    console.log("decline");

    try{
      const response = await axios.put(
        `${API_BASE_URL}bookings/decline/${bookingId}`, {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log("Decline response:", response);
      getBookingRequests();
    }

    catch(error){
      setShowErrorPopup(error.response?.data?.error || "Failed to Decline Bookng Request");
    }
  }

  return (
    <div>
      <h2>Hosted Listings</h2>
      {listings === "LOADING" ? (
        <p>Loading...</p>
      ) : (
        <>
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
          {listings.length === 0 ? (
            <p>No hosted listings found</p>
          ) : (
            listings.map((listing) => (
              <div key={listing.id} >
                <h3>{listing.title}</h3>
                <p>${listing.price}</p>
                <p>Number of Bedrooms: {listing.metadata?.bedroomCount}</p>
                <Button 
                  aria-describedby={listing.id} 
                  variant="contained" 
                  onClick={(e) => handleClick(e, listing)}
                >
                  Manage Availability
                </Button>
                <Button
                  name={listing.id} 
                  variant="contained" 
                  onClick={() => deleteListing(listing.id)}>

                Delete Listing
                </Button>
              </div>
            ))
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
                  variant="contained"
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