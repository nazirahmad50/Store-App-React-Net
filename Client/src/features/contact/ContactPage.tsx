import { Button, ButtonGroup, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { decrement, increment } from "./counterSlice";

const ContactPage = () => {
  const { data, title } = useAppSelector((state) => state.counter);
  const dispatch = useAppDispatch();

  return (
    <>
      <Typography variant="h2">{title}</Typography>
      <Typography variant="h5">{data}</Typography>
      <ButtonGroup>
        <Button
          onClick={() => dispatch(decrement(1))}
          variant="contained"
          color="error"
        >
          Decrement
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => dispatch(increment(5))}
        >
          Increment
        </Button>
      </ButtonGroup>
    </>
  );
};

export default ContactPage;
