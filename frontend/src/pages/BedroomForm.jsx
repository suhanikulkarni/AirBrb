import { useState } from 'react';

import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';

function BedroomForm({ bedroomNumber, setListingInfo }) {
  const [bedroomInfo, setBedroomInfo] = useState({
    'bedroomNumber': bedroomNumber,
    'bedCount': '',
    'bedTypes': {}
  });

  const [bedroomBedInfo, setBedroomBedInfo] = useState({
    'singleBed': '',
    'doubleBed': '',
    'queenBed': '',
    'kingBed': '',
    'sofaBed': ''
  });

  const handleBedroomBedInfo = (e) => {
    const {name, value} = e.target;

    setBedroomBedInfo((prevData) => ({
      ...prevData,
      [name]: value
    }));

    setBedroomInfo((prevData) => ({
      ...prevData,
      'bedTypes': bedroomInfo
    }));

    // TODO: set bed info into listing info
  }

  return (
    <Box>
      <h4>Bedroom {bedroomNumber}</h4>

      <TextField
        label="Single Beds"
        type="number"
        onChange={handleBedroomBedInfo}
        name="singleBed"
        slotProps={{ input: { min: 0 } }}
      />

      <TextField
        label="Double Beds"
        type="number"
        onChange={handleBedroomBedInfo}
        name="doubleBed"
        slotProps={{ input: { min: 0 } }}
      />
      <br /><br />

      <TextField
        label="Queen Beds"
        type="number"
        onChange={handleBedroomBedInfo}
        name="queenBed"
        slotProps={{ input: { min: 0 } }}
      />

      <TextField
        label="King Beds"
        type="number"
        onChange={handleBedroomBedInfo}
        name="kingBed"
        slotProps={{ input: { min: 0 } }}
      />
      <br /><br />

      <TextField
        label="Sofa Beds"
        type="number"
        onChange={handleBedroomBedInfo}
        name="sofaBed"
        slotProps={{ input: { min: 0 } }}
      />
    </Box>
  )
}

export default BedroomForm;
