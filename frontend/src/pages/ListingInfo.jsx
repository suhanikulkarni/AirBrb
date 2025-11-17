import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import axios from 'axios';

const getListingInfo = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}listings/${id}`)
    console.log(response)
    if (response) {
      console.log("this is the response",response.data.listing)
      return response.data.listing;
    }
  }
  catch (error) {
    console.log("in the catch, there is an error", error.message);
  }
}

function ListingInfo() {
  const { id } = useParams();
  const [listingDetails, setListingDetails] = useState({});

  useEffect(() => {
    const fetchListings = async () => {
      const data = await getListingInfo(id);
      if (data) setListingDetails(data);
    };
    fetchListings();
  }, [])


  return (
    <div>
      <h2>Listing Info</h2>
      <p>ID: {id}</p>
      {/* <p>Title: {listingDetails.title}</p> */}
      {/* <p>Address: {listingDetails.address}</p> */}
      {/* <p>Amenities: {listingDetails.metadata.amenities}</p> */}
      {/* <p>Price: {listingDetails.price}</p> */}
      {/* <p>Price: {listingDetails.metadata.type}</p> */}
    </div>
  );
}

export default ListingInfo;