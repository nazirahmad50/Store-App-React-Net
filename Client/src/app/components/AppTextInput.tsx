import { TextField } from "@mui/material";
import { useController, UseControllerProps } from "react-hook-form";

interface Props extends UseControllerProps {
  label: string;
  multiline?: boolean;
  rows?: number;
  type?: string;
}

const AppTextInput = (props: Props) => {
  const { fieldState, field } = useController({ ...props, defaultValue: "" });
  return (
    <TextField
      {...props}
      {...field}
      fullWidth
      multiline={props.multiline}
      rows={props.rows}
      variant="outlined"
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
      type={props.type}
    />
  );
};

export default AppTextInput;
