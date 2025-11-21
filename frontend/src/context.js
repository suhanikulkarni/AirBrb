import React from 'react';
import { createContext } from 'react';

export const ErrorContext = createContext();
export const ConfirmationContext = createContext();
export const useContext = React.useContext;