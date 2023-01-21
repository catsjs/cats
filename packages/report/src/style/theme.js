import { tint, math, transparentize, shade } from "polished";
import { generateMedia } from "styled-media-query";

export const size = {
  large: "1200px",
  medium: "992px",
  small: "768px",
};
export const media = generateMedia(size);

const baseColors = {
  white: "#ffffff",
  nearwhite: "#fafafa",
  body: "#f2f2f2",
  black: "#000000",
  black38: "rgba(0, 0, 0, 0.38)",
  black54: "rgba(0, 0, 0, 0.54)",
  black87: "rgba(0, 0, 0, 0.87)",
  green700: "#388e3c", //+4 38803a
  green500: "#4caf50",
  green200: "#a5d6a7", //-6 aadaac
  green100: "#c8e6c9", //-8 c6e6c7
  red700: "#d32f2f",
  red500: "#f44336",
  red100: "#ffcdd2",
  ltblue700: "#0288d1",
  ltblue500: "#03a9f4",
  ltblue100: "#b3e5fc",
  grey700: "#616161",
  grey500: "#9e9e9e",
  grey300: "#e0e0e0",
  grey100: "#f5f5f5",
  grey50: "#eceff1",
  bluegrey800: "#37474f",
};

const colors = {
  ...baseColors,
  primary: shade(0.65, "#428bca"),
  gray: {
    regular: tint(0.335, baseColors.black),
    light: tint(0.467, baseColors.black),
    medium: tint(0.735, baseColors.black),
    lighter: tint(0.935, baseColors.black),
    lighterFaded: transparentize(0.95, tint(0.935, baseColors.black)),
  },
};

const theme = {
  /* font: {
        base: {
            family: "'robotoregular', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            size: '14px',
            lineHeight: '1.429'
        },
        light: {
            family: 'robotolight'
        },
        medium: {
            family: 'robotomedium'
        },
        mono: {
            family: "'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace"
        },
        lineHeightComputed: '20px'
    }, */
  color: {
    ...colors,
    text: colors.black87,
    body: colors.body,
    icon: {
      active: {
        light: colors.white,
        dark: colors.black54,
      },
      inactive: {
        light: transparentize(0.5, colors.white),
        dark: colors.black38,
      },
    },
    link: {
      default: colors.primary,
      hover: shade(0.15, colors.primary),
    },
  },
  footer: {
    height: "60px",
  },
  link: {
    transition: "color 0.2s ease-out",
  },
  container: {
    sm: {
      width: "720px",
    },
    md: {
      width: "940px",
    },
    lg: {
      width: "1140px",
    },
  },
  navbar: {
    default: {
      height: "122px",
    },
    short: {
      height: "56px",
    },
  },
  grid: {
    gutter: {
      width: "30px",
    },
  },
  shadow: {
    zDepth1:
      "0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12)",
  },
  highlight: {
    languages: ["javascript", "diff"],
  },
  headings: {
    fontFamily: "inherit",
    fontWeight: 400,
    lineHeight: 1.1,
    color: "inherit",
    smallColor: colors.gray.light,
    size3: "24px",
    size6: "12px",
  },
  transition: {
    default: {
      duration: "0.2s",
      easing: "ease",
    },
  },
};

const derived = (parentTheme) => ({
  ...parentTheme,
  container: {
    sm: {
      width: math(
        `${parentTheme.container.sm.width} + ${parentTheme.grid.gutter.width}`
      ),
    },
    md: {
      width: math(
        `${parentTheme.container.md.width} + ${parentTheme.grid.gutter.width}`
      ),
    },
    lg: {
      width: math(
        `${parentTheme.container.lg.width} + ${parentTheme.grid.gutter.width}`
      ),
    },
  },
});
console.log("THEME", derived(theme));
export default derived(theme);
