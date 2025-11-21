import { DimBackground, Heading, Popup } from '../styles/popupStyles';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

function ConfirmDeletePopup({ showConfirmDeletePopup, closeConfirmDeletePopup }) {
  return (
    <>
      {showConfirmDeletePopup.value && (
        <DimBackground>
          <Popup>
            <Heading>Are you sure?</Heading>
            <hr />
            <p>This will permanently delete this listing.</p>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row'
              }}
            >
              <Button
                variant='contained'
                onClick={() => {
                  showConfirmDeletePopup.function();
                  closeConfirmDeletePopup();
                }}
                sx={{
                  marginRight: '5px',
                  flexGrow: '1'
                }}
                color='error'
              >Delete</Button>
              <Button
                variant='outlined'
                onClick={closeConfirmDeletePopup}
                sx={{
                  flexGrow: '1'
                }}
              >Cancel</Button>
            </Box>
          </Popup>
        </DimBackground>
      )}
    </>
  )
}

export default ConfirmDeletePopup;
