import React from "react";
import PropTypes from "prop-types";
import MaskedInput from "react-text-mask";

const TextMaskInput = props => {
  const {
    inputRef,
    mask,
    placeholderChar,
    pipe,
    guide,
    keepCharPositions,
    showMask,
    ...other
  } = props;

  return (
    <MaskedInput
      {...other}
      ref={ref => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={mask}
      placeholderChar={"\u2000"}
      pipe={pipe}
      guide={guide}
      keepCharPositions={keepCharPositions}
      showMask={showMask}
    />
  );
};

TextMaskInput.propTypes = {
  inputRef: PropTypes.func.isRequired,
  mask: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.func
  ]).isRequired,
  placeholderChar: PropTypes.string,
  pipe: PropTypes.func,
  guide: PropTypes.bool,
  keepCharPositions: PropTypes.bool
};

TextMaskInput.defaultProps = {
  placeholderChar: "\u2000",
  pipe: null,
  guide: false,
  keepCharPositions: false,
  showMask: false
};
