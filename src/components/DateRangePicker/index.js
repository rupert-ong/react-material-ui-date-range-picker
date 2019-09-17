import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  TextField
} from "@material-ui/core";
import { DatePicker } from "@material-ui/pickers";
import { makeStyles } from "@material-ui/styles";
import classNames from "classnames";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useState, useMemo } from "react";
import createAutoCorrectedDatePipe from "text-mask-addons/dist/createAutoCorrectedDatePipe";
import TextMaskInput from "../TextMaskInput";
import MaskedInput from "react-text-mask";

const useStyles = makeStyles(theme => ({
  day: {
    width: 36,
    height: 36,
    fontSize: theme.typography.caption.fontSize,
    margin: "0 2px",
    color: "inherit"
  },
  customDayHighlight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "2px",
    right: "2px",
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: "50%"
  },
  nonCurrentMonthDay: {
    opacity: 0,
    pointerEvents: "none"
  },
  highlight: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white
  },
  firstHighlight: {
    background: theme.palette.primary.main,
    borderTopLeftRadius: "50%",
    borderBottomLeftRadius: "50%",
    color: theme.palette.common.white
  },
  endHighlight: {
    background: theme.palette.primary.main,
    borderTopRightRadius: "50%",
    borderBottomRightRadius: "50%",
    color: theme.palette.common.white
  },
  dialogPaper: {
    maxWidth: 310 + theme.spacing(6)
  },
  dialogActions: {
    padding: theme.spacing(2, 3)
  },
  menu: {
    height: 300
  }
}));

const initialErrors = {
  startDate: null,
  endDate: null
};

const DATE_TYPES = {
  START_DATE: "startDate",
  END_DATE: "endDate"
};

const DATE_RANGE_ACTIONS = {
  SET_START_DATE: "setStartDate",
  SET_END_DATE: "setEndDate",
  RESET: "reset"
};

const dateRangeReducer = (state, { type, payload }) => {
  switch (type) {
    case DATE_RANGE_ACTIONS.SET_START_DATE:
      return {
        [DATE_TYPES.START_DATE]: payload,
        [DATE_TYPES.END_DATE]: null
      };
    case DATE_RANGE_ACTIONS.SET_END_DATE:
      return {
        ...state,
        [DATE_TYPES.END_DATE]: payload
      };
    case DATE_RANGE_ACTIONS.RESET:
      return { ...payload };
    default:
      throw new Error();
  }
};

const createDecrementedRange = (start, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => stop - i * step);

const DateRangePicker = ({
  title,
  startLabel,
  endLabel,
  initialDateRange,
  minDate,
  maxDate,
  open,
  onAccept,
  onCancel
}) => {
  const classes = useStyles();
  const yearsList = createDecrementedRange(
    minDate.getFullYear(),
    maxDate.getFullYear()
  );
  const autoCorrectedDatePipe = createAutoCorrectedDatePipe("mm/dd/yyyy", {
    minYear: minDate.getFullYear(),
    maxYear: maxDate.getFullYear()
  });

  const [dateRange, dispatchDateRange] = useReducer(
    dateRangeReducer,
    initialDateRange
  );
  const [isStartDateClick, setIsStartDateClick] = useState(true);
  const [year, setYear] = useState(
    moment(dateRange.startDate).isValid()
      ? moment(dateRange.startDate).year()
      : minDate.getFullYear()
  );
  const [isYearDropdownChanged, setIsYearDropdownChanged] = useState(false);
  const [isMonthChanged, setIsMonthChanged] = useState(false);
  const [errorMessages, setErrorMessages] = useState(initialErrors);
  const [hasErrors, setHasErrors] = useState(false);

  const { startDate, endDate } = dateRange;

  function renderMaskedInput(props) {
    const { inputRef, ...other } = props;

    return (
      <MaskedInput
        {...other}
        ref={ref => {
          inputRef(ref ? ref.inputElement : null);
        }}
        mask={[/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/]}
        placeholderChar={"\u2000"}
        pipe={autoCorrectedDatePipe}
        guide
        keepCharPositions
      />
    );
  }

  const renderDayAsDateRange = (
    momentDate,
    _selectedDate,
    dayInCurrentMonth
  ) => {
    const dayIsBetween = momentDate.isBetween(startDate, endDate);
    const isBeforeStartDateOnEndDateSelection =
      momentDate.isBefore(startDate, "day") && !isStartDateClick;
    const isStartDate = momentDate.isSame(startDate, "day");
    const isEndDate = momentDate.isSame(endDate, "day");

    const wrapperClassName = classNames({
      [classes.highlight]:
        dayInCurrentMonth && !isYearDropdownChanged && dayIsBetween,
      [classes.firstHighlight]:
        (isYearDropdownChanged &&
          (moment(startDate).isSame(endDate) ||
            (isMonthChanged && !isStartDateClick)) &&
          isStartDate) ||
        (!isYearDropdownChanged && isStartDate),
      [classes.endHighlight]: !isYearDropdownChanged && isEndDate
    });

    const dayClassName = classNames(classes.day, {
      [classes.nonCurrentMonthDay]: !dayInCurrentMonth
    });

    return (
      <div className={wrapperClassName}>
        <IconButton
          className={dayClassName}
          disabled={isBeforeStartDateOnEndDateSelection}
        >
          <span> {momentDate.format("D")} </span>
        </IconButton>
      </div>
    );
  };

  const resetTrackingState = () => {
    setIsStartDateClick(true);
    setIsYearDropdownChanged(false);
    setIsMonthChanged(false);
    moment(startDate).isValid() && setYear(startDate.getFullYear());
  };

  const handleYearDropdownChange = e => {
    const year = e.target.value;
    const actionType = isStartDateClick
      ? DATE_RANGE_ACTIONS.SET_START_DATE
      : DATE_RANGE_ACTIONS.SET_END_DATE;
    const momentDate = isStartDateClick ? moment(startDate) : moment(endDate);
    const fallbackDate = isStartDateClick
      ? moment(`${year}-01-01`, "YYYY-MM-DD").toDate()
      : moment(startDate)
          .set({ year })
          .toDate();

    dispatchDateRange({
      type: actionType,
      payload: momentDate.isValid()
        ? momentDate.set({ year }).toDate()
        : fallbackDate
    });

    setYear(year);
    setIsYearDropdownChanged(true);
    console.log("handleYearListChange", year, isYearDropdownChanged);
  };

  const handleChange = momentDate => {
    console.log("onChange");
    /* const errors = {};
    const key = isStartDateClick ? DATE_TYPES.START_DATE : DATE_TYPES.END_DATE;
    errors[key] = !momentDate.isValid() ? "Invalid date" : null;

    if (isStartDateClick && momentDate > endDate) {
      errors[key] = "Start date should not be after end date";
    } else if (!isStartDateClick && momentDate < startDate) {
      errors[key] = "End date should not be before start date";
    }

    setErrorMessages(prevState => ({
      ...prevState,
      ...errors
    })); */

    if (momentDate !== null) {
      dispatchDateRange({
        type: isStartDateClick
          ? DATE_RANGE_ACTIONS.SET_START_DATE
          : DATE_RANGE_ACTIONS.SET_END_DATE,
        payload: momentDate.toDate()
      });

      if (momentDate.isValid()) {
        setIsStartDateClick(prevState => !prevState);
        isYearDropdownChanged && setIsYearDropdownChanged(false);
        isMonthChanged && setIsMonthChanged(false);
      }
    }
  };

  const handleMonthChange = momentDate => {
    const dateYear = momentDate.year();
    dateYear !== year && setYear(dateYear);
    setIsMonthChanged(true);
  };

  const handleCancelPicker = () => {
    dispatchDateRange({
      type: DATE_RANGE_ACTIONS.RESET,
      payload: initialDateRange
    });
    resetTrackingState();
    typeof onCancel === "function" && onCancel(startDate, endDate);
  };

  const handleOkPicker = () => {
    resetTrackingState();
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
  }, [startDate, endDate, hasErrors, isYearDropdownChanged]);

  return (
    <Dialog
      aria-labelledby="dateRangePicker-dialog-title"
      open={open}
      onClose={onCancel}
      classes={{
        paper: classes.dialogPaper
      }}
    >
      <DialogTitle
        id="dateRangePicker-dialog-title"
        style={{ paddingBottom: 0 }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        {
          <Grid container spacing={1}>
            <Grid item xs>
              <TextField
                label={startLabel}
                value={null}
                InputProps={{
                  inputComponent: renderMaskedInput
                }}
                variant="outlined"
                margin="dense"
                helperText="mm/dd/yyyy"
                fullWidth
              />
            </Grid>
            <Grid item xs>
              <TextField
                label={endLabel}
                value={moment(endDate).format("MMM Do, YYYY")}
                variant="outlined"
                margin="dense"
                helperText="mm/dd/yyyy"
                fullWidth
              />
            </Grid>
            {
              <Grid item xs={12}>
                <TextField
                  label="Year"
                  value={year}
                  onChange={handleYearDropdownChange}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  select
                >
                  {yearsList.map(year =>
                    !isStartDateClick &&
                    year < startDate.getFullYear() ? null : (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>
            }
          </Grid>
        }
        <DatePicker
          value={
            isStartDateClick
              ? moment(startDate)
              : moment(endDate).isValid()
              ? moment(endDate)
              : moment(startDate)
          }
          renderDay={renderDayAsDateRange}
          minDate={!isStartDateClick ? startDate : minDate}
          maxDate={maxDate}
          onChange={handleChange}
          onAccept={_date => console.log("onAccept")}
          onMonthChange={handleMonthChange}
          disableToolbar
          variant="static"
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button
          color="primary"
          variant="contained"
          onClick={handleOkPicker}
          disabled={hasErrors || isYearDropdownChanged}
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
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  onAccept: PropTypes.func,
  onCancel: PropTypes.func,
  open: PropTypes.bool
};

DateRangePicker.defaultProps = {
  title: "Select date range",
  startLabel: "Start",
  endLabel: "End",
  initialDateRange: {
    startDate: null,
    endDate: null
  },
  minDate: moment("1900-01-01").toDate(),
  maxDate: moment("2099-12-31").toDate(),
  onAccept: null,
  onCancel: null,
  open: false
};

export default DateRangePicker;
