import { createMuiTheme } from "@material-ui/core/styles";
import palette from "./palette";
import overrides from "./overrides";
import typography from "./typography";

// eslint-disable-next-line import/no-mutable-exports
const theme = createMuiTheme({
  palette,
  typography,
  overrides,
  spacing: 8
});

export default theme;
