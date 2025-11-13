import { useState } from 'react';
import { CloseButton, DimBackground, Heading, Popup } from '../styles/popupStyles';

function ErrorPopup({ showErrorPopup, closeErrorPopup }) {
  return (
    <>
      {showErrorPopup && (
        <DimBackground>
          <Popup>
              <Heading>Error:</Heading>
              <CloseButton onClick={closeErrorPopup}>✖</CloseButton>
              <hr />
              {showErrorPopup}
          </Popup>
        </DimBackground>
      )}
    </>
  )
}

export default ErrorPopup;
