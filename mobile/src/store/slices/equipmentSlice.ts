import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';

export interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  category: string;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  description?: string;
  assigned_to?: string;
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface EquipmentState {
  items: Equipment[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filters: {
    status: string;
    category: string;
  };
  selectedItem: Equipment | null;
}

const initialState: EquipmentState = {
  items: [],
  loading: false,
  error: null,
  searchTerm: '',
  filters: {
    status: '',
    category: '',
  },
  selectedItem: null,
};

// Async thunks
export const fetchEquipment = createAsyncThunk(
  'equipment/fetchEquipment',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getEquipment();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch equipment');
    }
  }
);

export const createEquipment = createAsyncThunk(
  'equipment/createEquipment',
  async (equipmentData: Partial<Equipment>, { rejectWithValue }) => {
    try {
      const response = await apiService.createEquipmentItem(equipmentData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create equipment');
    }
  }
);

export const updateEquipment = createAsyncThunk(
  'equipment/updateEquipment',
  async ({ id, data }: { id: string; data: Partial<Equipment> }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateEquipmentItem(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update equipment');
    }
  }
);

export const deleteEquipment = createAsyncThunk(
  'equipment/deleteEquipment',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.deleteEquipmentItem(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete equipment');
    }
  }
);

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<EquipmentState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        category: '',
      };
      state.searchTerm = '';
    },
    setSelectedItem: (state, action: PayloadAction<Equipment | null>) => {
      state.selectedItem = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Equipment
    builder
      .addCase(fetchEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Equipment
    builder
      .addCase(createEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(createEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Equipment
    builder
      .addCase(updateEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEquipment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Equipment
    builder
      .addCase(deleteEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
        state.error = null;
      })
      .addCase(deleteEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchTerm,
  setFilters,
  clearFilters,
  setSelectedItem,
  clearError,
} = equipmentSlice.actions;

export default equipmentSlice.reducer;
