import axios from "axios";
import { API_BASE_URL } from "../constants";

const getAllListings = async () => {
  let hostedListings = [];
  try {
    const res = axios.get(`${API_BASE_URL}listings`);
    if (res) {
      listingData = res.data.listings;
      listingData.forEach(element => {
        // if ()
      });
        
      
    }
  }
  catch {

  }
}

function viewHostedListings() {

  return (
    <>
      hehehehe
    </>
  )

}

export default viewHostedListings;