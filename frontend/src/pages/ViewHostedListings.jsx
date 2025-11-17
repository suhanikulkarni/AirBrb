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

function ViewHostedListings({ owner, token }) {
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

    console.log("Publishing listing with body:", body);


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
        console.log("this si resdata",res)
      }
    }
    catch {
      console.log("EROROROROORORORORO");
      return;
    } 

  }


  const addingRanges = () => {
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
  
}

export default ViewHostedListings;