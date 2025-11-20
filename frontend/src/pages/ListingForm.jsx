import { useState } from 'react';

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
  return (
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

    </Form>
  )
}

export default ListingForm;
