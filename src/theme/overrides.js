import palette from "./palette";

const overrides = {
  MuiSelect: {
    root: {
      fontSize: "0.875rem",
      backgroundColor: palette.surface.base
    }
  },
  MuiOutlinedInput: {
    adornedEnd: {
      paddingRight: 0
    }
  },
  MuiTab: {
    textColorInherit: {
      "&$selected": {
        color: palette.primary.dark
      }
    }
  },
  MuiTableCell: {
    root: {
      paddingLeft: "1rem",
      paddingRight: "1rem",
      "&$sizeSmall": {
        paddingLeft: "1rem",
        paddingRight: "1rem"
      },
      "&:first-child, &$sizeSmall:first-child": {
        paddingLeft: "1.5rem"
      },
      "&:last-child, &$sizeSmall:last-child": {
        paddingRight: "1.5rem"
      },
      "&$sizeSmall&$paddingNone": {
        padding: 0
      }
    },
    head: {
      "&$sizeSmall": {
        paddingTop: "1rem",
        paddingBottom: "1rem"
      }
    }
  },
  MuiTableRow: {
    root: {
      "&$selected": {
        backgroundColor: palette.primary.light
      },
      "&$selected:hover": {
        backgroundColor: palette.primary.light
      },
      "&$hover:hover": {
        cursor: "pointer"
      }
    }
  },
  MuiListItem: {
    root: {
      color: palette.text.secondary,
      "&$selected": {
        color: palette.primary.dark
      }
    }
  },
  MuiButton: {
    root: {
      textTransform: "uppercase",
      fontSize: "0.875rem",
      letterSpacing: 1.25
    },
    // outlined buttons
    outlinedPrimary: {
      color: palette.primary.dark,
      border: `1px solid ${palette.primary.dark}`
    },
    // text buttons
    textPrimary: {
      color: palette.primary.dark
    }
  },
  MuiLink: {
    root: {
      color: palette.primary.dark
    }
  },
  MuiInputBase: {
    root: {
      overflow: "hidden",
      borderRadius: 4,
      backgroundColor: palette.surface.base
    }
  }
};

export default overrides;
