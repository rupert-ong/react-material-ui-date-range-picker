import MomentUtils from "@date-io/moment";
import { Box, Button, Typography } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { ThemeProvider } from "@material-ui/styles";
import React, { useState } from "react";
import moment from "moment";
import DateRangePicker from "./components/DateRangePicker";
import theme from "./theme/index";

const initialDateRange = {
  startDate: moment(new Date())
    .subtract(1, "days")
    .toDate(),
  endDate: new Date()
};

function App() {
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleAccept = (startDate, endDate) => {
    setIsModalOpen(false);
    setDateRange({
      startDate,
      endDate
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ width: "100vw", height: "100vh" }}
        >
          <Box>
            <Button onClick={() => setIsModalOpen(true)} variant="outlined">
              Open date range picker
            </Button>
            <Typography
              variant="caption"
              style={{ display: "block", textAlign: "center" }}
            >
              {`${moment(dateRange.startDate).format("MMM Do, YYYY")} -
                ${moment(dateRange.endDate).format("MMM Do, YYYY")}`}
            </Typography>
          </Box>
        </Box>
        <DateRangePicker
          title="Change date"
          // initialDateRange={dateRange}
          open={isModalOpen}
          onAccept={handleAccept}
          onCancel={handleCancel}
          maxDate={initialDateRange.endDate}
          minDate={moment(initialDateRange.endDate)
            .subtract(2, "years")
            .toDate()}
          // dateStringFormatter="DD/MM/YYYY"
        />
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
}

export default App;
