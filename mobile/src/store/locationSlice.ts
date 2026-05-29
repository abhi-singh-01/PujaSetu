import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationFilter {
  state?: string;
  stateCode?: string;
  district?: string;
  city?: string;
  coordinates?: { lat: number; lng: number };
}

interface LocationState {
  selected: LocationFilter;
  providerType?: 'pandit' | 'nau';
  selectedService?: string;
}

const initialState: LocationState = {
  selected: {},
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<LocationFilter>) => {
      state.selected = { ...state.selected, ...action.payload };
    },
    setProviderType: (state, action: PayloadAction<'pandit' | 'nau' | undefined>) => {
      state.providerType = action.payload;
    },
    setSelectedService: (state, action: PayloadAction<string | undefined>) => {
      state.selectedService = action.payload;
    },
    clearLocation: (state) => {
      state.selected = {};
      state.providerType = undefined;
      state.selectedService = undefined;
    },
  },
});

export const { setLocation, setProviderType, setSelectedService, clearLocation } =
  locationSlice.actions;
export default locationSlice.reducer;
