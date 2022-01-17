export const INCREMENT_COUNTER = "INCREMENT_COUNTER";
export const DECREMENT_COUNTER = "DECREMENT_COUNTER";

export function increment(amount = 1) {
  return {
    type: INCREMENT_COUNTER,
    payload: amount,
  };
}

export function decrement(amount = 1) {
  return {
    type: DECREMENT_COUNTER,
    payload: amount,
  };
}

export interface CounterState {
  data: number;
  title: string;
}

const intialState: CounterState = {
  data: 42,
  title: "yet another redux counter",
};

export default function counterReducer(state = intialState, action: any) {
  switch (action.type) {
    case INCREMENT_COUNTER:
      return {
        ...state,
        data: state.data + action.payload,
      };
    case DECREMENT_COUNTER:
      return {
        ...state,
        data: state.data - action.payload,
      };
    default:
      return state;
  }
}
