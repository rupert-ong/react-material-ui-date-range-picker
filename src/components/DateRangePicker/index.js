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
  RESET: "reset"
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
  const autoCorrectedDatePipe = useMemo(() => {
    return createAutoCorrectedDatePipe("mm/dd/yyyy", {
      minYear: minDate.getFullYear(),
      maxYear: maxDate.getFullYear()
    });
  }, [minDate, maxDate]);
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
    startDate: moment(initialDateRange.startDate).format("MM/DD/YYYY") || "",
    endDate: moment(initialDateRange.endDate).format("MM/DD/YYYY") || ""
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

    const wrapperClassName = classNames({
      [classes.highlight]:
        dayInCurrentMonth && !isYearDropdownChanged && dayIsBetween,
      [classes.firstHighlight]:
        (isYearChangedOnEndDateSelect && isStartDate) ||
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
    setIsPickerSettingStartDate(true);
    setIsYearDropdownChanged(false);
    setIsMonthChanged(false);
    setInputErrorMessages({ ...INITIAL_ERROR_MESSAGES_STATE });
    moment(startDate).isValid() && setYear(startDate.getFullYear());
  };

  const handleYearDropdownChange = e => {
    const year = e.target.value;
    const actionType = isPickerSettingStartDate
      ? DATE_RANGE_ACTIONS.SET_START_DATE_FOR_PICKER
      : DATE_RANGE_ACTIONS.SET_END_DATE;
    const momentDate = isPickerSettingStartDate
      ? moment(startDate)
      : moment(endDate);
    const fallbackDate = isPickerSettingStartDate
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

  const handleInputChange = name => e => {
    const { value } = e.target;
    const errorMessages = {};
    const momentDate = moment(value);
    const isStartDate = name === DATE_TYPES.START_DATE;

    setDateRangeInputs({
      ...dateRangeInputs,
      [name]: value
    });

    errorMessages[name] = !momentDate.isValid() ? "Invalid date" : null;

    if (isStartDate && momentDate > endDate) {
      errorMessages[name] = "Start date should not be after end date";
    } else if (!isStartDate && momentDate < startDate) {
      errorMessages[name] = "End date should not be before start date";
    }

    setInputErrorMessages(prevState => ({
      ...prevState,
      ...errorMessages
    }));

    if (errorMessages[name]) return;

    dispatchDateRange({
      type: isStartDate
        ? DATE_RANGE_ACTIONS.SET_START_DATE
        : DATE_RANGE_ACTIONS.SET_END_DATE,
      payload: moment(value, "MM-DD-YYYY").toDate()
    });
  };

  const handlePickerChange = momentDate => {
    console.log("onChange");

    if (momentDate !== null) {
      dispatchDateRange({
        type: isPickerSettingStartDate
          ? DATE_RANGE_ACTIONS.SET_START_DATE_FOR_PICKER
          : DATE_RANGE_ACTIONS.SET_END_DATE,
        payload: momentDate.toDate()
      });

      setDateRangeInputs(prevState => ({
        ...prevState,
        [isPickerSettingStartDate
          ? DATE_TYPES.START_DATE
          : DATE_TYPES.END_DATE]: momentDate.format("MM/DD/YYYY")
      }));

      if (momentDate.isValid()) {
        setIsPickerSettingStartDate(prevState => !prevState);
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
    setDateRangeInputs({
      startDate: moment(initialDateRange.startDate).format("MM/DD/YYYY") || "",
      endDate: moment(initialDateRange.endDate).format("MM/DD/YYYY") || ""
    });
    resetTrackingState();
    typeof onCancel === "function" && onCancel(startDate, endDate);
  };

  const handleOkPicker = () => {
    resetTrackingState();
    typeof onAccept === "function" && onAccept(startDate, endDate);
  };

  useEffect(() => {
    setDateErrors(
      !moment(startDate).isValid() ||
        !moment(endDate).isValid() ||
        endDate < startDate
    );
    if (!hasDateErrors) {
      setInputErrorMessages({ ...INITIAL_ERROR_MESSAGES_STATE });
    }
  }, [startDate, endDate, hasDateErrors, isYearDropdownChanged]);

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
                helperText={inputErrorMessages.startDate || "mm/dd/yyyy"}
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
                  helperText={inputErrorMessages.endDate || "mm/dd/yyyy"}
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
                    {yearsList.map(year =>
                      !isPickerSettingStartDate &&
                      year < startDate.getFullYear() ? null : (
                        <MenuItem key={year} value={year}>
                          {year}
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
              isPickerSettingStartDate
                ? moment(startDate)
                : moment(endDate).isValid()
                ? moment(endDate)
                : moment(startDate)
            }
            renderDay={renderDayAsDateRange}
            minDate={!isPickerSettingStartDate ? startDate : minDate}
            maxDate={maxDate}
            onChange={handlePickerChange}
            onAccept={_date => console.log("onAccept")}
            onMonthChange={handleMonthChange}
            disableToolbar
            variant="static"
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
              disabled={
                hasDateErrors ||
                isYearDropdownChanged ||
                Object.values(inputErrorMessages).find(value =>
                  Boolean(value)
                ) !== undefined
              }
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
