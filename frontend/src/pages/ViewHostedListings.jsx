import axios from "axios";
import { API_BASE_URL } from "../constants";
import { useEffect, useState } from "react";
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DatePicker from "react-multi-date-picker";

const getAllListings = async (owner) => {
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
  catch {
    console.log("ERROR")
  }
}

const getListingInfo = async (id) => {
  try {
    const res = await axios.get(`${API_BASE_URL}listings/${id}`);
    if (res) return res.data.listing;
    
  }
  catch {
    console.log("ERRORROR");
    return;
  }
}

function ViewHostedListings({ owner }) {
  const [listings, setListings] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeListing, setActiveListing] = useState(null);
  const [currentRange, setCurrentRange] = useState([]);
  const [allRanges, setAllRanges] = useState({});

  useEffect(() => {
    const getFetch = async () => {
      try {
        const listingIds = await getAllListings(owner);
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
        console.error("Error fetching listings:", error);
      }
    } 
    getFetch();
  }, [owner]);

  const handleClick = (event, listing) => {
    console.log("clicked", listing.id);
    setAnchorEl(event.currentTarget);
    setActiveListing(listing);
    setCurrentRange([]);
  };

  const addingRanges = () => {
    if (!currentRange || currentRange.length !== 2) {
      alert("Please select a full date range (start and end date)");
      return;
    }

    const listingId = activeListing?.id;
    
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
  
  return (
    <div>
      <h2>Hosted Listings</h2>
      {listings.length === 0 ? (
        <p>No hosted listings found</p>
      ) : (
        listings.map((listing) => (
          <div key={listing.id} >
            <h3>{listing.title}</h3>
            <p>${listing.price}</p>
            <p>Number of Bedrooms: {listing.metadata?.bedrooms}</p>
            <Button 
              aria-describedby={listing.id} 
              variant="contained" 
              onClick={(e) => handleClick(e, listing)}
            >
              Manage Availability
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
          <>
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
            >
              Publish Listing
            </Button>
          </>
        )}
      </Popover>
    </div>
  );
}

export default ViewHostedListings;