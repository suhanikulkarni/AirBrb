import axios from "axios";
import { API_BASE_URL } from "../constants";
import { useEffect, useState } from "react";

const getAllListings = async (owner) => {
  let hostedListings = [];
  try {
    const res = await axios.get(`${API_BASE_URL}listings`);
    console.log("bfbnfj",res)
    if (res) {
      const listingData = res.data.listings;
      console.log("listingData", listingData)
      listingData.forEach(element => {
        if (element.owner === owner) {
          hostedListings.push(element)
        }
      });
        
      console.log("hosted listings",hostedListings);
      return hostedListings;
    } 
  }
  catch {
    console.log("ERROR")
  }
}

function viewHostedListings({ owner }) {
  const [listings, setListings] = useState([{}]);
  
  useEffect (() => {

    const getFetch = async () => {
      const res = await getAllListings(owner);
      console.log(res)
      if (res) setListings(res);
      console.log(listings)
    } 
    getFetch(owner)
  }, [owner]);
  return (
    <div>
      <h2>Hosted Listings</h2>
      {listings.length === 0 ? (
        <p>No listings found for owner: {owner}</p>
      ) : (
        listings.map((listing) => (
          <div key={listing.id}>
            <h3>{listing.title}</h3>
            <p>{listing.address?.value}</p>
            <p>${listing.price}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default viewHostedListings;