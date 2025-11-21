import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';

function BedroomForm({ bedroomNumber, updateBedroomMetadata, bedroomMetadata }) {
  const [bedroomInfo, setBedroomInfo] = useState({
    'singleBed': '',
    'doubleBed': '',
    'queenBed': '',
    'kingBed': '',
    'sofaBed': ''
  });

  useEffect(() => {
    setBedroomInfo(bedroomMetadata);
  }, []);

  const handleBedroomBedInfo = (e) => {
    const {name, value} = e.target;

    const updatedBeds = {
      ...bedroomInfo,
      [name]: Number(value) || 0
    };

    const totalBeds = Object.values(updatedBeds)
      .reduce((sum, count) => sum + count, 0);

    setBedroomInfo(updatedBeds);

    updateBedroomMetadata(bedroomNumber, {
      bedTypes: updatedBeds,
      bedCount: totalBeds
    });
  };
  
  return (
    <>
      <h4>Bedroom {bedroomNumber}</h4>
    
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '10px'
        }}
      >
        <TextField
          label='Single Beds'
          type='number'
          value={bedroomInfo.singleBed}
          onChange={handleBedroomBedInfo}
          name='singleBed'
          slotProps={{ input: { min: 0 } }}
        />

        <TextField
          label='Double Beds'
          type='number'
          value={bedroomInfo.doubleBed}
          onChange={handleBedroomBedInfo}
          name='doubleBed'
          slotProps={{ input: { min: 0 } }}
        />

        <TextField
          label='Queen Beds'
          type='number'
          value={bedroomInfo.queenBed}
          onChange={handleBedroomBedInfo}
          name='queenBed'
          slotProps={{ input: { min: 0 } }}
        />

        <TextField
          label='King Beds'
          type='number'
          value={bedroomInfo.kingBed}
          onChange={handleBedroomBedInfo}
          name='kingBed'
          slotProps={{ input: { min: 0 } }}
        />

        <TextField
          label='Sofa Beds'
          type='number'
          value={bedroomInfo.sofaBed}
          onChange={handleBedroomBedInfo}
          name='sofaBed'
          slotProps={{ input: { min: 0 } }}
        />
      </Box>
    </>
  )
}

export default BedroomForm;
