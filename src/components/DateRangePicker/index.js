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
import React, {
  useEffect,
  useReducer,
  useState,
  useMemo,
  useCallback
} from "react";
import createAutoCorrectedDatePipe from "text-mask-addons/dist/createAutoCorrectedDatePipe";
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
  disabledDay: {
    color: theme.palette.text.disabled,
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
  }
}));

const INITIAL_ERROR_MESSAGES_STATE = {
  startDate: null,
  endDate: null
};

const INITIAL_INPUTS_TOUCHED_STATE = {
  startDate: false,
  endDate: false
};

const DATE_TYPES = {
  START_DATE: "startDate",
  END_DATE: "endDate"
};

const DATE_RANGE_ACTIONS = {
  SET_START_DATE: "setStartDate",
  SET_END_DATE: "setEndDate",
  SET_BOTH: "setBoth"
};

const dateRangeReducer = (state, { type, payload }) => {
  switch (type) {
    case DATE_RANGE_ACTIONS.SET_START_DATE:
      return {
        ...state,
        [DATE_TYPES.START_DATE]: payload
      };
    case DATE_RANGE_ACTIONS.SET_END_DATE:
      return {
        ...state,
        [DATE_TYPES.END_DATE]: payload
      };
    case DATE_RANGE_ACTIONS.SET_BOTH:
      return { ...payload };
    default:
      throw new Error();
  }
};

let timerId;

const createDecrementedRange = (start, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => stop - i * step);

const DateRangePicker = ({
  title,
  startLabel,
  endLabel,
  initialDateRange,
  errorMessages,
  minDate,
  maxDate,
  open,
  dateStringFormatter,
  onAccept,
  onCancel
}) => {
  const classes = useStyles();
  const yearsList = createDecrementedRange(
    minDate.getFullYear(),
    maxDate.getFullYear()
  );
  const autoCorrectedDatePipe = useMemo(() => {
    return createAutoCorrectedDatePipe(dateStringFormatter.toLowerCase());
  }, [dateStringFormatter]);
  const renderMaskedInput = useCallback(
    props => {
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
    },
    [autoCorrectedDatePipe]
  );

  const [dateRange, dispatchDateRange] = useReducer(
    dateRangeReducer,
    initialDateRange
  );
  const [dateRangeInputs, setDateRangeInputs] = useState({
    startDate:
      moment(initialDateRange.startDate).format(dateStringFormatter) || "",
    endDate: moment(initialDateRange.endDate).format(dateStringFormatter) || ""
  });
  const [pickerDate, setPickerDate] = useState(
    moment(initialDateRange.startDate).isValid()
      ? initialDateRange.startDate
      : null
  );
  const [isPickerSettingStartDate, setIsPickerSettingStartDate] = useState(
    true
  );
  const [year, setYear] = useState(
    moment(dateRange.startDate).isValid()
      ? moment(dateRange.startDate).year()
      : minDate.getFullYear()
  );
  const [inputErrorMessages, setInputErrorMessages] = useState(
    INITIAL_ERROR_MESSAGES_STATE
  );
  const [inputsTouched, setInputsTouched] = useState(
    INITIAL_INPUTS_TOUCHED_STATE
  );
  const [hasDateErrors, setDateErrors] = useState(false);

  const { startDate, endDate } = dateRange;
  const hasInputError =
    Object.values(inputErrorMessages).find(value => Boolean(value)) !==
    undefined;

  const renderDayAsDateRange = (
    momentDate,
    _selectedDate,
    dayInCurrentMonth
  ) => {
    const isDayBetweenStartAndEndDate = momentDate.isBetween(
      startDate,
      endDate,
      "day"
    );
    const isBeforeStartDateOnEndDateSelection =
      momentDate.isBefore(startDate, "day") && !isPickerSettingStartDate;
    const isStartDate = momentDate.isSame(startDate, "day");
    const isEndDate = momentDate.isSame(endDate, "day");
    const isDayOutsideMinAndMax =
      momentDate.isBefore(minDate, "day") ||
      momentDate.isAfter(maxDate, "day") ||
      (!isPickerSettingStartDate && momentDate.isBefore(startDate, "day"));

    const isHighlight = dayInCurrentMonth && isDayBetweenStartAndEndDate;
    const isFirstHighlight = dayInCurrentMonth && isStartDate;
    const isEndHighlight =
      dayInCurrentMonth &&
      isEndDate &&
      momentDate.isSameOrAfter(startDate, "day");
    const isDisabled = isDayOutsideMinAndMax;

    const wrapperClassName = classNames({
      [classes.highlight]: isHighlight,
      [classes.firstHighlight]: isFirstHighlight,
      [classes.endHighlight]: isEndHighlight,
      [classes.disabledDay]: isDisabled
    });

    const dayClassName = classNames(classes.day, {
      [classes.nonCurrentMonthDay]: !dayInCurrentMonth
    });

    const dataAttributes = {};
    if (isHighlight) dataAttributes["data-is-highlight"] = true;
    if (isFirstHighlight) dataAttributes["data-is-first-highlight"] = true;
    if (isEndHighlight) dataAttributes["data-is-end-highlight"] = true;
    if (isDisabled) dataAttributes["data-is-disabled"] = true;

    return (
      <div className={wrapperClassName} {...dataAttributes}>
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
    setIsPickerSettingStartDate(true);
    setInputErrorMessages({ ...INITIAL_ERROR_MESSAGES_STATE });
  };

  const handleYearDropdownFocus = () => {
    clearTimeout(timerId);
  };

  const handleYearDropdownChange = e => {
    const yearValue = e.target.value;
    const momentDate = isPickerSettingStartDate
      ? moment(startDate).set({ year: yearValue })
      : moment(endDate).set({ year: yearValue });
    let newPickerDate = momentDate.toDate();

    if (momentDate.isAfter(maxDate, "day")) {
      newPickerDate = maxDate;
    } else if (momentDate.isBefore(minDate, "day")) {
      newPickerDate = minDate;
    }

    setPickerDate(newPickerDate);
    setYear(yearValue);
  };

  const handleInputChange = name => e => {
    const { value } = e.target;
    const errorMessagesObject = { [name]: null };
    const momentDate = moment(value, dateStringFormatter);
    const isStartDate = name === DATE_TYPES.START_DATE;
    const isDateValid = momentDate.isValid() && value.match(/\d/g).length === 8;
    const isDateWithinMinMaxDateRange = momentDate.isBetween(
      minDate,
      maxDate,
      "day",
      []
    );
    setDateRangeInputs({
      ...dateRangeInputs,
      [name]: value
    });

    errorMessagesObject[name] = !isDateValid ? errorMessages.invalidDate : null;

    if (isDateValid && !isDateWithinMinMaxDateRange) {
      errorMessagesObject[name] = isStartDate
        ? errorMessages.startDateBeforeMinDate
        : errorMessages.endDateAfterMaxDate;
    }

    if (
      isDateValid &&
      isStartDate &&
      moment(endDate).isValid() &&
      momentDate.isAfter(endDate, "day")
    ) {
      errorMessagesObject[name] = errorMessages.startDateAfterEndDate;
    } else if (!isStartDate && momentDate.isBefore(startDate, "day")) {
      errorMessagesObject[name] = errorMessages.endDateBeforeEndDate;
    }

    setInputErrorMessages(prevState => ({
      ...prevState,
      ...errorMessagesObject
    }));

    if (errorMessagesObject[name]) return;

    const dateYear = momentDate.year();
    if (year !== dateYear) setYear(dateYear);

    dispatchDateRange({
      type: isStartDate
        ? DATE_RANGE_ACTIONS.SET_START_DATE
        : DATE_RANGE_ACTIONS.SET_END_DATE,
      payload: momentDate.toDate()
    });
    setPickerDate(momentDate.toDate());
  };

  const handleInputFocus = name => e => {
    const isStartDate = name === DATE_TYPES.START_DATE;
    clearTimeout(timerId);

    setIsPickerSettingStartDate(isStartDate ? true : false);
    setPickerDate(dateRange[name]);
    if (year !== dateRange[name].getFullYear())
      setYear(dateRange[name].getFullYear());
  };

  const handleInputBlur = name => e => {
    const isStartDate = name === DATE_TYPES.START_DATE;

    // if (!isStartDate) {
    timerId = setTimeout(() => {
      setIsPickerSettingStartDate(true);
      console.log("just reset isPickerSettingStartDate to true");
    }, 750);
    // }
    setInputsTouched(prevState => ({
      ...prevState,
      [name]: true
    }));
  };

  const handlePickerChange = momentDate => {
    if (momentDate !== null) {
      dispatchDateRange({
        type: isPickerSettingStartDate
          ? DATE_RANGE_ACTIONS.SET_START_DATE
          : DATE_RANGE_ACTIONS.SET_END_DATE,
        payload: momentDate.toDate()
      });

      setPickerDate(momentDate.toDate());

      const dateString = momentDate.format(dateStringFormatter);

      setDateRangeInputs(prevState => ({
        startDate: isPickerSettingStartDate ? dateString : prevState.startDate,
        endDate: !isPickerSettingStartDate ? dateString : prevState.endDate
      }));

      setIsPickerSettingStartDate(prevState => !prevState);
    }
  };

  const handleMonthChange = momentDate => {
    const dateYear = momentDate.year();
    clearTimeout(timerId);
    if (dateYear !== year) setYear(dateYear);
  };

  const handleCancelPicker = () => {
    dispatchDateRange({
      type: DATE_RANGE_ACTIONS.SET_BOTH,
      payload: initialDateRange
    });
    setDateRangeInputs({
      startDate: moment(initialDateRange.startDate).isValid()
        ? moment(initialDateRange.startDate).format(dateStringFormatter)
        : "",
      endDate: moment(initialDateRange.endDate).isValid()
        ? moment(initialDateRange.endDate).format(dateStringFormatter)
        : ""
    });
    if (moment(initialDateRange.startDate).isValid()) {
      setPickerDate(initialDateRange.startDate);
      setYear(initialDateRange.startDate.getFullYear());
    }
    resetTrackingState();
    if (typeof onCancel === "function") onCancel(startDate, endDate);
  };

  const handleOkPicker = () => {
    resetTrackingState();
    if (typeof onAccept === "function") onAccept(startDate, endDate);
  };

  useEffect(() => {
    setDateErrors(
      !moment(startDate).isValid() ||
        !moment(endDate).isValid() ||
        endDate < startDate
    );
  }, [startDate, endDate]);

  useEffect(() => {
    const momentInputStartDate = moment(
      dateRangeInputs.startDate,
      dateStringFormatter
    );
    const momentInputEndDate = moment(
      dateRangeInputs.endDate,
      dateStringFormatter
    );
    const inputStartDateDigits = dateRangeInputs.startDate.match(/\d/g) || [];
    const inputEndDateDigits = dateRangeInputs.endDate.match(/\d/g) || [];
    const doBothInputDatesHaveProperLength =
      inputStartDateDigits.length === 8 && inputEndDateDigits.length === 8;

    if (
      momentInputStartDate.isValid() &&
      momentInputStartDate.isSameOrAfter(minDate, "day") &&
      momentInputEndDate.isValid() &&
      momentInputEndDate.isSameOrBefore(maxDate, "day") &&
      momentInputEndDate.isSameOrAfter(momentInputStartDate) &&
      !hasDateErrors &&
      doBothInputDatesHaveProperLength
    ) {
      setInputErrorMessages({ ...INITIAL_ERROR_MESSAGES_STATE });

      if (!momentInputStartDate.isSame(startDate)) {
        dispatchDateRange({
          type: DATE_RANGE_ACTIONS.SET_START_DATE,
          payload: momentInputStartDate.toDate()
        });
      }
      if (!momentInputEndDate.isSame(endDate)) {
        dispatchDateRange({
          type: DATE_RANGE_ACTIONS.SET_END_DATE,
          payload: momentInputEndDate.toDate()
        });
      }
    }
  }, [
    dateRangeInputs.startDate,
    dateRangeInputs.endDate,
    minDate,
    maxDate,
    startDate,
    endDate,
    dateStringFormatter,
    hasDateErrors
  ]);

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
                value={dateRangeInputs.startDate}
                onFocus={handleInputFocus(DATE_TYPES.START_DATE)}
                onChange={handleInputChange(DATE_TYPES.START_DATE)}
                onBlur={handleInputBlur(DATE_TYPES.START_DATE)}
                InputProps={{
                  inputComponent: renderMaskedInput
                }}
                variant="outlined"
                margin="dense"
                helperText={
                  inputErrorMessages.startDate && inputsTouched.startDate
                    ? inputErrorMessages.startDate
                    : dateStringFormatter.toLowerCase()
                }
                error={Boolean(
                  inputsTouched.startDate && inputErrorMessages.startDate
                )}
                fullWidth
              />
            </Grid>
            <Grid item xs>
              {
                <TextField
                  label={endLabel}
                  value={dateRangeInputs.endDate}
                  onFocus={handleInputFocus(DATE_TYPES.END_DATE)}
                  onChange={handleInputChange(DATE_TYPES.END_DATE)}
                  onBlur={handleInputBlur(DATE_TYPES.END_DATE)}
                  InputProps={{
                    inputComponent: renderMaskedInput
                  }}
                  variant="outlined"
                  margin="dense"
                  error={Boolean(
                    inputsTouched.endDate && inputErrorMessages.endDate
                  )}
                  helperText={
                    inputErrorMessages.endDate && inputsTouched.endDate
                      ? inputErrorMessages.endDate
                      : dateStringFormatter.toLowerCase()
                  }
                  fullWidth
                />
              }
            </Grid>
            {
              <Grid item xs={12}>
                {
                  <TextField
                    label="Year"
                    value={year}
                    onFocus={handleYearDropdownFocus}
                    onChange={handleYearDropdownChange}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    select
                  >
                    {yearsList.map(yearValue => (
                      <MenuItem key={yearValue} value={yearValue}>
                        {yearValue}
                      </MenuItem>
                    ))}
                  </TextField>
                }
              </Grid>
            }
          </Grid>
        }
        {
          <DatePicker
            value={pickerDate}
            renderDay={renderDayAsDateRange}
            minDate={!isPickerSettingStartDate ? startDate : minDate}
            maxDate={maxDate}
            onChange={handlePickerChange}
            onMonthChange={handleMonthChange}
            variant="static"
            disableToolbar
          />
        }
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        {
          <>
            <Button
              color="primary"
              variant="contained"
              onClick={handleOkPicker}
              disabled={hasDateErrors || hasInputError}
            >
              Save
            </Button>
            <Button variant="outlined" onClick={handleCancelPicker}>
              Cancel
            </Button>
          </>
        }
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
  errorMessages: PropTypes.shape({
    invalidDate: PropTypes.string,
    startDateAfterEndDate: PropTypes.string,
    endDateBeforeEndDate: PropTypes.string
  }),
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  onAccept: PropTypes.func,
  onCancel: PropTypes.func,
  open: PropTypes.bool,
  dateStringFormatter: PropTypes.oneOf([
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    "YYYY/MM/DD"
  ])
};

DateRangePicker.defaultProps = {
  title: "Select date range",
  startLabel: "Start",
  endLabel: "End",
  initialDateRange: {
    startDate: null,
    endDate: null
  },
  errorMessages: {
    invalidDate: "Please enter a valid date",
    startDateAfterEndDate: "Please enter a date before the end date",
    endDateBeforeEndDate: "Please enter a date after the start date",
    startDateBeforeMinDate:
      "Please enter a date after the minimum date allowed",
    endDateAfterMaxDate: "Please enter a date before the maximum date allowed"
  },
  minDate: moment("1900-01-01", "YYYY-MM-DD").toDate(),
  maxDate: moment("2099-12-31", "YYYY-MM-DD").toDate(),
  onAccept: null,
  onCancel: null,
  open: false,
  dateStringFormatter: "MM/DD/YYYY"
};

export default DateRangePicker;
