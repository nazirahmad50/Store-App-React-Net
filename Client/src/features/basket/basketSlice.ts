import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import baseApi from "../../app/api/baseApi";
import { Basket } from "../../app/models/basket";
import { getCookie } from "../../app/util/util";

interface BasketState {
  basket: Basket | null;
  status: string;
}

const initialState: BasketState = {
  basket: null,
  status: "idle",
};

export const fetchBasketAsync = createAsyncThunk<Basket>(
  "basket/fetchBasketAsync",
  async (_, thunkApi) => {
    try {
      return await baseApi.Basket.get();
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: error.data });
    }
  },
  {
    condition: () => {
      if (!getCookie("buyerId")) return false;
    },
  }
);

export const addBasketItemAsync = createAsyncThunk<
  Basket,
  { productId: number; quantity?: number }
>(
  "basket/addbasketItemAsync",
  async ({ productId, quantity = 1 }, thunkApi) => {
    try {
      return await baseApi.Basket.addItem(productId, quantity);
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: error.data });
    }
  }
);

export const removeBasketItemAsync = createAsyncThunk<
  void,
  { productId: number; quantity: number; name?: string }
>("basket/removeBasketItemAsync", async ({ productId, quantity }, thunkApi) => {
  try {
    await baseApi.Basket.removeItem(productId, quantity);
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: error.data });
  }
});

export const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    setBasket: (state, action) => {
      state.basket = action.payload;
    },
    clearBasket: (state) => {
      state.basket = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(removeBasketItemAsync.pending, (state, action) => {
      const { productId, name } = action.meta.arg;
      state.status = "pendingRemoveItem" + productId + name;
    });
    builder.addCase(removeBasketItemAsync.fulfilled, (state, action) => {
      const { productId, quantity } = action.meta.arg;

      const itemIndex = state.basket?.items.findIndex(
        (x) => x.productId === productId
      );
      if (itemIndex === -1 || itemIndex === undefined) return;

      state.basket!.items[itemIndex].quantity -= quantity;
      if (state.basket?.items[itemIndex].quantity === 0)
        state.basket.items.splice(itemIndex, 1);

      state.status = "idle";
    });
    builder.addCase(removeBasketItemAsync.rejected, (state, action) => {
      state.status = "idle";
      console.log(action.payload);
    });

    builder.addCase(addBasketItemAsync.pending, (state, action) => {
      state.status = "pendingAddItem" + action.meta.arg.productId;
    });
    builder.addMatcher(
      isAnyOf(addBasketItemAsync.fulfilled, fetchBasketAsync.fulfilled),
      (state, action) => {
        state.basket = action.payload;
        state.status = "idle";
      }
    );
    builder.addMatcher(
      isAnyOf(addBasketItemAsync.rejected, fetchBasketAsync.rejected),
      (state, action) => {
        state.status = "idle";
        console.log(action.payload);
      }
    );
  },
});

export const { setBasket, clearBasket } = basketSlice.actions;
