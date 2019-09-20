import palette from "./palette";

const typography = {
  fontFamily: ["Roboto", "Arial", "Helvetica", "sans-serif"].join(","),
  chart: {
    innerBarText: {
      stroke: "#000000",
      fontWeight: 200,
      fontSize: "0.75rem",
      letterSpacing: "1.5px"
    },
    axisText: {
      fontSize: "0.8125rem",
      stroke: "#6A6A6A",
      fontWeight: 200,
      letterSpacing: "0.5px"
    },
    tooltip: {
      fontSize: "0.8125rem"
    },
    axisLabel: {
      fontSize: "0.75rem",
      fontWeight: 500,
      letterSpacing: 0.4,
      color: palette.text.secondary
    },
    axisValues: {
      fontSize: "0.625rem",
      fontWeight: 400,
      letterSpacing: 0.45,
      color: palette.text.secondary
    }
  },
  tooltip: {
    borderRadius: 4,
    padding: 10,
    listStyleType: "none",
    fontSize: "0.8rem"
  },
  h1: {
    fontSize: "2.25rem",
    letterSpacing: -0.2
  },
  h2: {
    fontSize: "2rem",
    letterSpacing: -0.18
  },
  // Page titles, emphasis data
  h3: {
    fontSize: "1.75rem",
    letterSpacing: -0.15
  },
  // card titles
  h4: {
    fontSize: "1.5rem",
    letterSpacing: 0
  },
  // Table titles, main headlines
  h5: {
    fontSize: "1.25rem",
    letterSpacing: 0.15
  },
  h6: {
    fontSize: "1.125rem",
    letterSpacing: 0.15
  },
  subtitle1: {
    fontSize: "1rem",
    letterSpacing: 0.15,
    fontWeight: 500
  },
  subtitle2: {
    fontSize: "0.875rem",
    letterSpacing: 0.25,
    fontWeight: 500
  },
  body1: {
    fontSize: "1rem",
    letterSpacing: 0.15,
    fontWeight: 400
  },
  body2: {
    fontSize: "0.875rem",
    letterSpacing: 0.25,
    fontWeight: 400
  },
  caption: {
    fontSize: "0.75rem",
    letterSpacing: 0.4,
    fontWeight: 400
  },
  overline: {
    fontSize: "0.625rem",
    letterSpacing: 2,
    fontWeight: 500
  }
};

export default typography;
