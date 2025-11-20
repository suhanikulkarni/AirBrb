import { useEffect, useState } from 'react';

import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';

import { Form } from '../styles/mainStyles';

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

function ListingForm({ getters, setters }) {
  const [thumbnailImageName, setThumbnailImageName] = useState('');

  useEffect(() => {
    const thumbnail = getters.listingInfo.thumbnail;

    if (!thumbnail) {
      return;
    }

    if (thumbnail.startsWith("https://www.youtube.com/")) {
      setters.setThumbnailType('youtube');
    } else if (thumbnail.startsWith("data:image/")) {
      setters.setThumbnailType('image');
      setThumbnailImageName('previous_thumbnail');
    }

    setters.setListingInfo((prevData) => ({
      ...prevData,
      'thumbnail': thumbnail
    }));
  }, []);

  const handleInfo = (e) => {
    const {name, value} = e.target;

    setters.setListingInfo((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }

  const handleAddressInfo = (e) => {
    const {name, value} = e.target;
    setters.setListingAddress((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }

  const handleMetadataInfo = (e) => {
    const {name, value} = e.target;
    console.log("name and vakue", name, value)

    setters.setListingMetadata((prevData) => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'bedroomCount') {
      renderBedroomForm();
    }
  }

  const handleThumbnailImage = async (file) => {
    setThumbnailImageName(file.name);

    const dataUrl = await fileToDataUrl(file);
    setters.setListingInfo((prevData) => ({
      ...prevData,
      'thumbnail': dataUrl
    }))
  }

  const clearThumbnail = () => {
    setThumbnailImageName('');

    setters.setListingInfo((prevData) => ({
      ...prevData,
      'thumbnail': ''
    }))
  }

  const handleThumbnailYoutube = (youtubeLink) => {
    setters.setListingInfo((prevData) => ({
      ...prevData,
      'thumbnail': youtubeLink
    }))
  }

  const renderBedroomForm = () => {
    const array = [];

    for (let i = 1; i <= getters.listingMetadata.bedroomCount; i++) {
      array.push(
        <BedroomForm
          key={i}
          bedroomNumber={i}
          updateBedroomMetadata={updateBedroomMetadata}
          bedroomMetadata={getters.listingMetadata.bedrooms[i - 1].bedTypes}
        />
      )
    }

    return array;
  }

  const updateBedroomMetadata = (bedroomNumber, bedroomInfo) => {
    setters.setListingMetadata(prev => {
      const updated = [...prev.bedrooms];
      updated[bedroomNumber - 1] = bedroomInfo;
      return { ...prev, bedrooms: updated };
    });
  };

  return (
    <Form>
      <TextField 
        id="listing-title-input" 
        label="Property Name"
        type="text"
        onChange={handleInfo}
        name="title"
        value={getters.listingInfo.title}
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
        value={getters.listingInfo.price}
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
          value={getters.listingAddress.streetAddress}
          required
        />
        <br /><br />

        <TextField
          id="listing-suburb-input"
          label="Suburb"
          type="text"
          onChange={handleAddressInfo}
          name="suburb"
          value={getters.listingAddress.suburb}
          required
        />

        <TextField
          id="listing-state-input"
          label="State"
          type="text"
          onChange={handleAddressInfo}
          name="state"
          value={getters.listingAddress.state}
          required
        />
        <br /><br />

        <TextField
          id="listing-country-input"
          label="Country"
          type="text"
          onChange={handleAddressInfo}
          name="country"
          value={getters.listingAddress.country}
          required
        />

        <TextField
          id="listing-postcode-input"
          label="Postcode"
          type="text"
          onChange={handleAddressInfo}
          name="postcode"
          value={getters.listingAddress.postcode}
          required
        />
      </Box>
      <br />

      <h2>Listing Thumbnail</h2>
      <ToggleButtonGroup
        value={getters.thumbnailType}
        exclusive
        onChange={(e, thumbnailType) => {
          if (thumbnailType !== null) {
            clearThumbnail();
            setters.setThumbnailType(thumbnailType);
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
        {getters.thumbnailType === 'image' && 
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
        {getters.thumbnailType === 'youtube' &&
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

      <h2>Listing Details</h2>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Property Type</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          name="propertyType"
          value={getters.listingMetadata.propertyType}
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
        value={getters.listingMetadata.amenities}
      />
      <br />

      {/* TODO: prevent no. from decreasing beyond 0 */}
      <TextField
        id="bathroom-count-input"
        label="Number of Bathrooms"
        type="number"
        onChange={handleMetadataInfo}
        name="bathroomCount"
        value={getters.listingMetadata.bathroomCount}
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
        value={getters.listingMetadata.bedroomCount}
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
    </Form>
  )
}

export default ListingForm;
