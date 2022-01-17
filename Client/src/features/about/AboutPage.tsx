import {
  Alert,
  AlertTitle,
  Button,
  ButtonGroup,
  Container,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useState } from "react";
import baseApi from "../../app/api/baseApi";

const AboutPage = () => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const getValidationError = () => {
    baseApi.TestErrors.getValidationError()
      .then(() => console.log("should not see"))
      .catch((error) => setValidationErrors(error));
  };
  return (
    <Container>
      <Typography gutterBottom variant="h2">
        Errors
      </Typography>
      <ButtonGroup fullWidth>
        <Button
          variant="contained"
          onClick={() => baseApi.TestErrors.get400Error()}
        >
          400 error
        </Button>
        <Button
          variant="contained"
          onClick={() => baseApi.TestErrors.get401Error()}
        >
          401 error
        </Button>
        <Button
          variant="contained"
          onClick={() => baseApi.TestErrors.get404Error()}
        >
          404 error
        </Button>
        <Button
          variant="contained"
          onClick={() => baseApi.TestErrors.get500Error()}
        >
          500 error
        </Button>
        <Button variant="contained" onClick={getValidationError}>
          validaiton error
        </Button>
      </ButtonGroup>
      {validationErrors.length > 0 && (
        <Alert severity="error">
          <AlertTitle>Validation Errors</AlertTitle>
          <List>
            {validationErrors.map((err) => (
              <ListItem key={err}>
                <ListItemText>{err}</ListItemText>
              </ListItem>
            ))}
          </List>
        </Alert>
      )}
    </Container>
  );
};

export default AboutPage;
