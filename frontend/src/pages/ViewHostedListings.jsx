import axios from "axios";
import { API_BASE_URL } from "../constants";
import { useEffect, useState } from "react";

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
          </div>
        ))
      )}
    </div>
  );
}

export default viewHostedListings;