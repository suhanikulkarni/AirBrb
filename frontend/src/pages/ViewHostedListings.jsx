import axios from "axios";
import { API_BASE_URL } from "../constants";
import { useEffect, useState } from "react";
import * as React from 'react';

import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DatePicker, { DateObject } from "react-multi-date-picker";

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

function viewHostedListings({ owner }) {
  const [listings, setListings] = useState([]);
  
  useEffect (() => {

    const getFetch = async () => {
      try {

        const listingIds = await getAllListings(owner);
        if (!listingIds || listingIds.length === 0) {
          setListings([]);
          return;
        }

        const detailedListings = await Promise.all(
          listingIds.map(id => getListingInfo(id))
        );
        setListings(detailedListings.filter(Boolean));

      }
      catch (error) {
        console.error("Error fetching listings:", error);
      }
    } 
    getFetch(owner)
        

  }, []);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [activeListing, setActiveListing] = useState(null);
  const [dates, setDates] = useState([])

  // const setAvailability = (value) => {
    
  //     setDates((prevData) => ({
  //         ...prevData,
  //         value
  //     }))
  //     console.log(dates)
  // }
  console.log("dates", dates)

  const handleClick = (event, listing) => {
    console.log("clicked")
    setAnchorEl(event.currentTarget);
    setActiveListing(listing);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setActiveListing(null);
  };
  const open = Boolean(anchorEl);
  console.log("listigns", listings)
  return (
    <div>
      <h2>Hosted Listings</h2>
      {listings.length === 0 ? (
        <p></p>
      ) : (
        listings.map((listing) => (
          <div key={listing.title}>
            <h3>{listing.title}</h3>
            <p>${listing.price}</p>
            <p>Number of Bedrooms: Need to change to beds: {listing.metadata.bedrooms}</p>
            <p>{listings.price}</p>
            <Button aria-describedby={listing.id} variant="contained" onClick={handleClick}>
                Publish Listing
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
      >
        <Typography sx={{ p: 10 }}>
          <DatePicker range value={dates} onChange={dateObjects => {
      setDates(dateObjects)}} />;
        </Typography>
      </Popover>
    </div>
  );
}

export default viewHostedListings;