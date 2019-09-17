import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@material-ui/core";
import { KeyboardDatePicker } from "@material-ui/pickers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const commonDatePickerProps = {
  autoOk: true,
  format: "MM/DD/YYYY",
  margin: "dense",
  placeholder: "mm/dd/yyyy",
  PopoverProps: {
    anchorOrigin: { horizontal: "left", vertical: "bottom" },
    transformOrigin: { horizontal: "left", vertical: "top" }
  },
  inputVariant: "outlined",
  invalidDateMessage: "Invalid date format",
  variant: "inline"
};

const handleDateChange = setStateCallback => momentDate =>
  momentDate !== null && setStateCallback(momentDate.toDate());

const initialErrors = {
  startDate: null,
  endDate: null
};

const DATE_TYPES = {
  START_DATE: "startDate",
  END_DATE: "endDate"
};

const DateRangePicker = ({
  title,
  startLabel,
  endLabel,
  initialDateRange,
  open,
  onAccept,
  onCancel,
  disableToolbar
}) => {
  const [startDate, setStartDate] = useState(initialDateRange.startDate);
  const [endDate, setEndDate] = useState(initialDateRange.endDate);
  const [errorMessages, setErrorMessages] = useState(initialErrors);
  const [hasErrors, setHasErrors] = useState(false);

  const handleChange = (key, setStateCallback) => momentDate => {
    const tempObject = {};
    tempObject[key] = !momentDate.isValid() ? "Invalid date" : null;

    if (key === DATE_TYPES.START_DATE && momentDate > endDate) {
      tempObject[key] = "Start date should not be after end date";
    } else if (key === DATE_TYPES.END_DATE && momentDate < startDate) {
      tempObject[key] = "End date should not be before start date";
    }

    setErrorMessages(prevState => ({
      ...prevState,
      ...tempObject
    }));

    momentDate !== null && setStateCallback(momentDate.toDate());
  };

  const handleCancelPicker = () => {
    setStartDate(initialDateRange.startDate);
    setEndDate(initialDateRange.endDate);

    typeof onCancel === "function" && onCancel(startDate, endDate);
  };

  const handleOkPicker = () => {
    typeof onAccept === "function" && onAccept(startDate, endDate);
  };

  useEffect(() => {
    setHasErrors(
      !moment(startDate).isValid() ||
        !moment(endDate).isValid() ||
        endDate < startDate
    );
    if (!hasErrors) {
      setErrorMessages({ ...initialErrors });
    }
  }, [startDate, endDate, hasErrors]);

  return (
    <Dialog
      aria-labelledby="dateRangePicker-dialog-title"
      open={open}
      onClose={onCancel}
    >
      <DialogTitle
        id="dateRangePicker-dialog-title"
        style={{ paddingBottom: 0 }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <Box display="flex">
          <Box>
            <KeyboardDatePicker
              {...commonDatePickerProps}
              label={startLabel}
              value={moment(startDate)}
              onChange={handleChange(DATE_TYPES.START_DATE, setStartDate)}
              maxDate={endDate}
              error={Boolean(errorMessages.startDate)}
              helperText={
                errorMessages.startDate ? errorMessages.startDate : "mm/dd/yyyy"
              }
              disableToolbar={disableToolbar}
              autoFocus
              views={["date"]}
            />
          </Box>
          <Box pl={1}>
            <KeyboardDatePicker
              {...commonDatePickerProps}
              label={endLabel}
              value={moment(endDate)}
              onChange={handleChange(DATE_TYPES.END_DATE, setEndDate)}
              minDate={startDate}
              error={Boolean(errorMessages.endDate)}
              helperText={
                errorMessages.endDate ? errorMessages.endDate : "mm/dd/yyyy"
              }
              disableToolbar={disableToolbar}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          onClick={handleOkPicker}
          disabled={hasErrors}
        >
          Save
        </Button>
        <Button variant="outlined" onClick={handleCancelPicker}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DateRangePicker.propTypes = {
  title: PropTypes.string,
  startLabel: PropTypes.string,
  endLabel: PropTypes.string,
  initialDateRange: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date)
  }),
  onAccept: PropTypes.func,
  onCancel: PropTypes.func,
  open: PropTypes.bool,
  disableToolbar: PropTypes.bool
};

DateRangePicker.defaultProps = {
  title: "Select date range",
  startLabel: "Start",
  endLabel: "End",
  initialDateRange: {
    startDate: null,
    endDate: null
  },
  onAccept: null,
  onCancel: null,
  open: false,
  disableToolbar: false
};

export default DateRangePicker;
