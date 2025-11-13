import styled from 'styled-components';

export const Popup = styled.div`
  width: 40%;
  max-width: 500px;
  min-width: 300px;
  height: fit-content;
  display: inline-block;
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, 0);
  padding: 25px;
  background-color: #ffffffff;
  border-radius: 15px;
  box-shadow: 0 0 15px #717171ff;
`;

export const Heading = styled.h2`
  width: fit-content;
  margin: 0 0 10px 0;
`;

export const CloseButton = styled.button`
  float: right;
  margin-top: -40px;
  font-size: 20px;
  background: none;
  border: none;
  &:hover {
    color: #1976d2;
  };
  transition-duration: 0.2s;
`;

export const DimBackground = styled.div`
  background-color: rgba(0, 0, 0, 50%);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99;
`;