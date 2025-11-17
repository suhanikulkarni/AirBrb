import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../src/constants';

export const fetchAllListings = createAsyncThunk(
  'listings/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}listings`);
      return res.data.listings;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching listings');
    }
  }
);

export const fetchListingDetails = createAsyncThunk(
  'listings/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}listings/${id}`);
      return { id, data: res.data.listing };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching listing details');
    }
  }
);

const listingsSlice = createSlice({
  name: 'listings',
  initialState: {
    allListings: [],
    listingDetails: {},
    loading: false,
    detailsLoading: {},
    error: null,
    lastFetched: null,
  },
  reducers: {
    clearListings: (state) => {
      state.allListings = [];
      state.listingDetails = {};
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all listings
      .addCase(fetchAllListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllListings.fulfilled, (state, action) => {
        state.loading = false;
        state.allListings = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch listing details
      .addCase(fetchListingDetails.pending, (state, action) => {
        state.detailsLoading[action.meta.arg] = true;
      })
      .addCase(fetchListingDetails.fulfilled, (state, action) => {
        state.detailsLoading[action.payload.id] = false;
        state.listingDetails[action.payload.id] = action.payload.data;
      })
      .addCase(fetchListingDetails.rejected, (state, action) => {
        state.detailsLoading[action.meta.arg] = false;
        state.error = action.payload;
      });
  },
});

export const { clearListings } = listingsSlice.actions;
export default listingsSlice.reducer;