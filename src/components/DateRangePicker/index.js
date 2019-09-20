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

const DATE_TYPES = {
  START_DATE: "startDate",
  END_DATE: "endDate"
};

const DATE_RANGE_ACTIONS = {
  SET_START_DATE_FOR_PICKER: "setStartDateForPicker",
  SET_START_DATE: "setStartDate",
  SET_END_DATE: "setEndDate",
  SET_BOTH: "setBoth"
};

const dateRangeReducer = (state, { type, payload }) => {
  switch (type) {
    case DATE_RANGE_ACTIONS.SET_START_DATE_FOR_PICKER:
      return {
        [DATE_TYPES.START_DATE]: payload,
        [DATE_TYPES.END_DATE]: null
      };
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
    return createAutoCorrectedDatePipe(dateStringFormatter.toLowerCase(), {
      minYear: minDate.getFullYear(),
      maxYear: maxDate.getFullYear()
    });
  }, [dateStringFormatter, minDate, maxDate]);
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
  const [isPickerSettingStartDate, setIsPickerSettingStartDate] = useState(
    true
  );
  const [year, setYear] = useState(
    moment(dateRange.startDate).isValid()
      ? moment(dateRange.startDate).year()
      : minDate.getFullYear()
  );
  const [isYearDropdownChanged, setIsYearDropdownChanged] = useState(false);
  const [isMonthChanged, setIsMonthChanged] = useState(false);
  const [inputErrorMessages, setInputErrorMessages] = useState(
    INITIAL_ERROR_MESSAGES_STATE
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
    const dayIsBetween = momentDate.isBetween(startDate, endDate);
    const isBeforeStartDateOnEndDateSelection =
      momentDate.isBefore(startDate, "day") && !isPickerSettingStartDate;
    const isStartDate = momentDate.isSame(startDate, "day");
    const isEndDate = momentDate.isSame(endDate, "day");
    const isYearChangedOnEndDateSelect =
      isYearDropdownChanged &&
      (moment(startDate).isSame(endDate) ||
        (isMonthChanged && !isPickerSettingStartDate));
    const isDayOutsideMinAndMax =
      momentDate.isBefore(minDate, "day") || momentDate.isAfter(maxDate, "day");

    const wrapperClassName = classNames({
      [classes.highlight]:
        dayInCurrentMonth && !isYearDropdownChanged && dayIsBetween,
      [classes.firstHighlight]:
        (isYearChangedOnEndDateSelect && dayInCurrentMonth && isStartDate) ||
        (!isYearDropdownChanged && dayInCurrentMonth && isStartDate),
      [classes.endHighlight]:
        !isYearDropdownChanged && dayInCurrentMonth && isEndDate,
      [classes.disabledDay]: isDayOutsideMinAndMax
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
    setIsPickerSettingStartDate(true);
    setIsYearDropdownChanged(false);
    setIsMonthChanged(false);
    setInputErrorMessages({ ...INITIAL_ERROR_MESSAGES_STATE });
    if (moment(startDate).isValid()) setYear(startDate.getFullYear());
  };

  const handleYearDropdownChange = e => {
    const yearValue = e.target.value;
    const actionType = isPickerSettingStartDate
      ? DATE_RANGE_ACTIONS.SET_START_DATE_FOR_PICKER
      : DATE_RANGE_ACTIONS.SET_END_DATE;
    const momentDate = isPickerSettingStartDate
      ? moment(startDate)
      : moment(endDate);
    const fallbackDate = isPickerSettingStartDate
      ? moment(`01/01/${yearValue}`, "MM/DD/YYYY").toDate()
      : moment(startDate <= minDate ? startDate : minDate)
          .set({ year: yearValue })
          .toDate();

    console.log(
      "handleYearChange: isStartDate:",
      isPickerSettingStartDate,
      momentDate,
      fallbackDate
    );

    dispatchDateRange({
      type: actionType,
      payload: momentDate.isValid()
        ? momentDate.set({ year: yearValue }).toDate()
        : fallbackDate
    });

    setDateRangeInputs({
      startDate: isPickerSettingStartDate ? "" : dateRangeInputs.startDate,
      endDate: ""
    });

    setYear(yearValue);
    setIsYearDropdownChanged(true);
  };

  const handleInputChange = name => e => {
    console.log(
      "handleInputChange - isStartDate: ",
      name === DATE_TYPES.START_DATE,
      e.target.value
    );
    const { value } = e.target;
    const errorMessagesObject = { [name]: null };
    const momentDate = moment(value, dateStringFormatter);
    const isStartDate = name === DATE_TYPES.START_DATE;
    const isDateValidAndWithinRange =
      momentDate.isValid() && momentDate.isBetween(minDate, maxDate, "day", []);

    setDateRangeInputs({
      ...dateRangeInputs,
      [name]: value
    });

    errorMessagesObject[name] =
      !isDateValidAndWithinRange || value.match(/\d/g).length !== 8
        ? errorMessages.invalidDate
        : null;

    if (
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
    if (isMonthChanged) setIsMonthChanged(false);
    if (isYearDropdownChanged) setIsYearDropdownChanged(false);
    if (!isPickerSettingStartDate) setIsPickerSettingStartDate(true);

    dispatchDateRange({
      type: isStartDate
        ? DATE_RANGE_ACTIONS.SET_START_DATE
        : DATE_RANGE_ACTIONS.SET_END_DATE,
      payload: momentDate.toDate()
    });
  };

  const handlePickerChange = momentDate => {
    if (momentDate !== null) {
      dispatchDateRange({
        type: isPickerSettingStartDate
          ? DATE_RANGE_ACTIONS.SET_START_DATE_FOR_PICKER
          : DATE_RANGE_ACTIONS.SET_END_DATE,
        payload: momentDate.toDate()
      });

      const dateString = momentDate.format(dateStringFormatter);

      setDateRangeInputs(prevState => ({
        startDate: isPickerSettingStartDate ? dateString : prevState.startDate,
        endDate: !isPickerSettingStartDate ? dateString : ""
      }));

      setIsPickerSettingStartDate(prevState => !prevState);
      if (!isPickerSettingStartDate) setYear(startDate.getFullYear());
      if (isYearDropdownChanged) setIsYearDropdownChanged(false);
      if (isMonthChanged) setIsMonthChanged(false);
    }
  };

  const handleMonthChange = momentDate => {
    const dateYear = momentDate.year();
    if (dateYear !== year) setYear(dateYear);
    setIsMonthChanged(true);
  };

  const handleCancelPicker = () => {
    dispatchDateRange({
      type: DATE_RANGE_ACTIONS.SET_BOTH,
      payload: initialDateRange
    });
    setDateRangeInputs({
      startDate:
        (moment(initialDateRange.startDate).isValid() &&
          moment(initialDateRange.startDate).format(dateStringFormatter)) ||
        "",
      endDate:
        (moment(initialDateRange.endDate).isValid() &&
          moment(initialDateRange.endDate).format(dateStringFormatter)) ||
        ""
    });
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
      const momentInputStartDateYear = momentInputStartDate.year();
      setInputErrorMessages({ ...INITIAL_ERROR_MESSAGES_STATE });

      if (year !== momentInputStartDateYear && !isMonthChanged)
        setYear(momentInputStartDateYear);
      if (isYearDropdownChanged) setIsYearDropdownChanged(false);
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
    startDate,
    endDate,
    year,
    isMonthChanged,
    dateStringFormatter,
    isYearDropdownChanged,
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
                onChange={handleInputChange(DATE_TYPES.START_DATE)}
                InputProps={{
                  inputComponent: renderMaskedInput
                }}
                variant="outlined"
                margin="dense"
                helperText={
                  inputErrorMessages.startDate ||
                  dateStringFormatter.toLowerCase()
                }
                error={Boolean(inputErrorMessages.startDate)}
                fullWidth
              />
            </Grid>
            <Grid item xs>
              {
                <TextField
                  label={endLabel}
                  value={dateRangeInputs.endDate}
                  onChange={handleInputChange(DATE_TYPES.END_DATE)}
                  InputProps={{
                    inputComponent: renderMaskedInput
                  }}
                  variant="outlined"
                  margin="dense"
                  error={Boolean(inputErrorMessages.endDate)}
                  helperText={
                    inputErrorMessages.endDate ||
                    dateStringFormatter.toLowerCase()
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
                    onChange={handleYearDropdownChange}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    select
                  >
                    {yearsList.map(yearValue =>
                      !isPickerSettingStartDate &&
                      yearValue < startDate.getFullYear() ? null : (
                        <MenuItem key={yearValue} value={yearValue}>
                          {yearValue}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                }
              </Grid>
            }
          </Grid>
        }
        {
          <DatePicker
            value={
              /*  isPickerSettingStartDate
                ? moment(startDate)
                : moment(endDate).isValid()
                ? moment(endDate)
                : moment(startDate) */
              isPickerSettingStartDate || !moment(endDate).isValid()
                ? moment(startDate)
                : moment(endDate)
            }
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
              disabled={hasDateErrors || isYearDropdownChanged || hasInputError}
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
    endDateBeforeEndDate: "Please enter a date after the start date"
  },
  minDate: moment("1900-01-01", "YYYY-MM-DD").toDate(),
  maxDate: moment("2099-12-31", "YYYY-MM-DD").toDate(),
  onAccept: null,
  onCancel: null,
  open: false,
  dateStringFormatter: "MM/DD/YYYY"
};

export default DateRangePicker;
