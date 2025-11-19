import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL, DEFAULT_IMAGE } from '../constants';
import { useNavigate } from 'react-router-dom';

import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Form, PageBody } from '../styles/mainStyles';

import { ErrorContext } from '../context';
import { Box } from '@mui/material';
import BedroomForm from './BedroomForm';

import { fileToDataUrl } from '../helper';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function CreateListing({ token }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (token === 'LOADING' || !token) navigate('/login');
  }, [token]);

  const [listingInfo, setListingInfo] = useState({
    'title': '',
    'address': {},
    'price': 0,
    'thumbnail': '',
    'metadata': {}
  });

  const [listingAddress, setListingAddress] = useState({
    'streetAddress': '',
    'suburb': '',
    'state': '',
    'country': '',
    'postcode': ''
  })

  const [listingMetadata, setListingMetadata] = useState({
    'propertyType': '',
    'bathroomCount': '',
    'bedroomCount': '',
    'bedrooms': [],
    'amenities': []
  });

  const [thumbnailImageName, setThumbnailImageName] = useState('');
  const [thumbnailType, setThumbnailType] = useState('image');

  const setShowErrorPopup = useContext(ErrorContext);
  const postListing = async (body, token) => {
    try {
      const response = await axios.post(`${API_BASE_URL}listings/new`, body, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/dashboard');
    } catch (error) {
      setShowErrorPopup(error.response.data.error);
    }
  }

  const handleInfo = (e) => {
    const {name, value} = e.target;

    setListingInfo((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }

  const handleAddressInfo = (e) => {
    const {name, value} = e.target;
    setListingAddress((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }

  useEffect(() => {
    console.log("Updated address:", listingAddress);
  }, [listingAddress]);

  const handleMetadataInfo = (e) => {
    const {name, value} = e.target;
    console.log("name and vakue", name, value)

    setListingMetadata((prevData) => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'bedroomCount') {
      renderBedroomForm();
    }
  }

  useEffect(() => {
    console.log("Updated metadata:", listingMetadata);
  }, [listingMetadata]);

  const handleThumbnailImage = async (file) => {
    setThumbnailImageName(file.name);

    const dataUrl = await fileToDataUrl(file);
    setListingInfo((prevData) => ({
      ...prevData,
      'thumbnail': dataUrl
    }))
  }

  const clearThumbnail = () => {
    setThumbnailImageName('');

    setListingInfo((prevData) => ({
      ...prevData,
      'thumbnail': ''
    }))
  }

  const handleThumbnailYoutube = (youtubeLink) => {
    setListingInfo((prevData) => ({
      ...prevData,
      'thumbnail': youtubeLink
    }))
  }

  const updateBedroomMetadata = (bedroomNumber, bedroomInfo) => {
    setListingMetadata(prev => {
      const updated = [...prev.bedrooms];
      updated[bedroomNumber - 1] = bedroomInfo;
      return { ...prev, bedrooms: updated };
    });
  };

  const renderBedroomForm = () => {
    const array = [];

    for (let i = 1; i <= listingMetadata.bedroomCount; i++) {
      array.push(
        <BedroomForm
          key={i}
          bedroomNumber={i}
          updateBedroomMetadata={updateBedroomMetadata}
        />
      )
    }

    return array;
  }

  const handleSubmission = async () => {
    if (!listingInfo.title || !listingInfo.price) {
      // TODO: usability -> instead of popup -> highlight empty field with error
      return setShowErrorPopup("Please fill out the whole form");
    }

    if (!listingAddress.country||!listingAddress.postcode||!listingAddress.state||!listingAddress.streetAddress||! listingAddress.suburb) {
      return setShowErrorPopup("Please enter all the address information");
    }

    if (!listingMetadata.bathroomCount||!listingMetadata.propertyType||!listingMetadata.bedroomCount) {
      return setShowErrorPopup("Please enter all the information about the property");
    }

    const bedNum   = Number(listingMetadata.bedroomCount);
    
    if(bedNum > 0 && listingMetadata.bedrooms.length != bedNum) {
      return setShowErrorPopup("Please enter the bedroom information");
    }
    
    const priceNum = Number(listingInfo.price);
    const bathNum  = Number(listingMetadata.bathroomCount);
    
    if (![priceNum, bathNum, bedNum].every(Number.isFinite)) {
      return setShowErrorPopup("Please insert a number");
    }
    
    let thumbnail = listingInfo.thumbnail;

    if (thumbnail && thumbnailType === "youtube" && !thumbnail.startsWith("https://www.youtube.com/")) {
      return setShowErrorPopup("Invalid YouTube link");
    };
    
    if (!thumbnail) thumbnail = DEFAULT_IMAGE;

    const body = {
      ...listingInfo,
      address: listingAddress,
      metadata: listingMetadata,
      price: parseInt(listingInfo.price, 10),
      thumbnail: thumbnail
    }
    console.log("Listing data: ",body)

    postListing(body, token);
  }

  useEffect(() => {
    console.log("Updated all info:", listingInfo);
  }, [listingInfo]);


  return (
    <PageBody>
      <Form>
        <h1>Listing Information</h1>

        <TextField 
          id="listing-title-input" 
          label="Property Name"
          type="text"
          onChange={handleInfo}
          name="title"
          required
        />
        <br />

        <InputLabel htmlFor="listing-amount-input">Amount *</InputLabel>
        <OutlinedInput
          id="listing-price-input"
          startAdornment={<InputAdornment position="start">$</InputAdornment>}
          label="Amount"
          name="price"
          onChange={handleInfo}
          required
        />
        <br />

        <h2>Listing Address</h2>
        <Box
          sx={{
            borderRadius: 3,
            bgcolor: '#f3f3f3ff',
            padding: '15px'
          }}
        >
          <TextField
            id="listing-street-address-input"
            label="Street Address"
            type="text"
            onChange={handleAddressInfo}
            name="streetAddress"
            required
          />
          <br /><br />

          <TextField
            id="listing-suburb-input"
            label="Suburb"
            type="text"
            onChange={handleAddressInfo}
            name="suburb"
            required
          />

          <TextField
            id="listing-state-input"
            label="State"
            type="text"
            onChange={handleAddressInfo}
            name="state"
            required
          />
          <br /><br />

          <TextField
            id="listing-country-input"
            label="Country"
            type="text"
            onChange={handleAddressInfo}
            name="country"
            required
          />

          <TextField
            id="listing-postcode-input"
            label="Postcode"
            type="text"
            onChange={handleAddressInfo}
            name="postcode"
            required
          />
        </Box>
        <br />

        <h2>Listing Thumbnail</h2>
        <ToggleButtonGroup
          value={thumbnailType}
          exclusive
          onChange={(e, thumbnailType) => {
            if (thumbnailType !== null) {
              clearThumbnail();
              setThumbnailType(thumbnailType);
            }; 
          }}
          aria-label="thumbnail type"
        >
          <ToggleButton value="image" aria-label="image thumbnail">
            <p>Image</p>
          </ToggleButton>
          <ToggleButton value="youtube" aria-label="youtube thumbnail">
            <p>Youtube</p>
          </ToggleButton>
        </ToggleButtonGroup>
        <br />
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {thumbnailType === 'image' && 
            <>
              <p>
                {thumbnailImageName === '' ? (
                  <>No image uploaded</>
                ) : (
                  <>
                    {thumbnailImageName}
                    <Button 
                      onClick={clearThumbnail}
                    >✖</Button>
                  </>
                )}
              </p>
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}  
              >
                Upload file
                <VisuallyHiddenInput
                  type="file"
                  onChange={e => {handleThumbnailImage(e.target.files[0])}}
                  name="thumbnail"
                  multiple
                />
              </Button>
            </>
          }
          {thumbnailType === 'youtube' &&
            <>
              <TextField
                id="youtube-thumbnail-input"
                label="YouTube URL"
                type="text"
                onChange={e => {handleThumbnailYoutube(e.target.value)}}
                name="thumbnail"
              />
            </>
          }
        </Box>
        <br />

        {/* TODO: create form elements for additional information */}
        <h2>Listing Details</h2>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Property Type</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            name="propertyType"
            value={listingMetadata.propertyType}
            label="Property Type"
            onChange={handleMetadataInfo}
          >
            <MenuItem value={"apartment"}>Apartment</MenuItem>
            <MenuItem value={"house"}>House</MenuItem>
            <MenuItem value={"guesthouse"}>Guesthouse</MenuItem>
            <MenuItem value={"hotelroom"}>Hotel Room</MenuItem>
            <MenuItem value={"cabin"}>Cabin</MenuItem>
            <MenuItem value={"other"}>Other</MenuItem>
          </Select>
        </FormControl>
        <br />

        <TextField
          type="text"
          label="Amenities"
          multiline
          rows={3}
          name="amenities"
          onChange={handleMetadataInfo}
        />
        <br />

        {/* TODO: prevent no. from decreasing beyond 0 */}
        <TextField
          id="bathroom-count-input"
          label="Number of Bathrooms"
          type="number"
          onChange={handleMetadataInfo}
          name="bathroomCount"
          slotProps={{ input: { min: 0 } }}
          required
        />
        <br />

        <h3>Bedrooms</h3>
        <TextField
          label="Number of Bedrooms"
          type="number"
          onChange={handleMetadataInfo}
          name="bedroomCount"
          slotProps={{ input: { min: 0 } }}
        />
        <br />

        <Box
          sx={{
            borderRadius: 3,
            bgcolor: '#f3f3f3ff',
            padding: '15px'
          }}
        >          
          <Box
            sx={{
              margin: '0 10px 15px 10px'
            }}
          >
            {renderBedroomForm()}
          </Box>
        </Box>
        <br />

        <Button 
          variant="contained"
          onClick={handleSubmission}
        >Submit</Button>
      </Form>
    </PageBody>
  )
}

export default CreateListing