import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL, AUTH_HEADER } from '../constants';

const postListing = async (body) => {
  
  try {
    const response = await axios.post(
    `${API_BASE_URL}listings/new`, body, AUTH_HEADER,
  );
  if (response) return response;
  }
  catch {
    console.log("njrekgnkjgnkg");
  }
}

function createListing() {
  const [listingInfo, setListingInfo] = useState({
    'title': '',
    'address': {},
    'price': 0,
    'thumbnail': '',
    'metadata': {}
  });


  const handleChange = (e) => {
    const {name, value} = e.target;

    setListingInfo((prevData) => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleSubmission = () => {
    if (!listingInfo.title || !listingInfo.address || !listingInfo.metadata || !listingInfo.thumbnail || !listingInfo.price) {
      alert("Please fill out the whole form")
      return;
    }
    console.log("Listing data: ",listingInfo)
  }
  

  return (
    <form>
      <h2>Listing Information</h2>
      <label>Listing Title</label>
      <input
        type='text'
        onChange={handleChange}
        name='title'
        required
      ></input>

      <label>Listing Address</label>
      <input
        type='text'
        onChange={handleChange}
        name='address'
        required
      ></input>

      <label>Listing Price</label>
      <input
        type='text'
        onChange={handleChange}
        name='price'
        required
      ></input>
      
      <label>Thumbnail</label>
      <input
        type='text'
        onChange={handleChange}
        name='thumbnail'
        required
      ></input>
      
      <label>Additional Information</label>
      <input
        type='text'
        onChange={handleChange}
        name='metadata'
        required
      ></input>

      <button type='button' onClick={handleSubmission}>Submit</button>
    </form>
  )
}

export default createListing