import React from "react";
import PropTypes from "prop-types";

import {
  Typography,
  Link,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  Paper,
} from "@material-ui/core";
import MarkdownJsx from "markdown-to-jsx";

const headings = [1, 2, 3, 4, 5, 6].reduce((obj, level) => {
  const result = { ...obj };
  result[`h${level}`] = {
    component: Typography,
    props: { variant: `h${level}` },
  };
  return result;
}, {});

const overrides = {
  a: { component: Link, props: { color: "secondary" } },
  p: { component: Typography },
  // table: { component: Table, props: { size: 'small' } },
  table: {
    component: (props) => (
      <TableContainer component={Paper} variant="outlined" square elevation={0}>
        <Table size="small" {...props} />
      </TableContainer>
    ),
  },
  td: { component: TableCell },
  tbody: { component: TableBody },
  tfoot: { component: TableFooter },
  th: { component: TableCell },
  thead: { component: TableHead },
  tr: { component: TableRow },
  ...headings,
};

const Markdown = ({ children }) => (
  <MarkdownJsx options={{ overrides }}>{children || ""}</MarkdownJsx>
);
Markdown.propTypes = {
  children: PropTypes.string,
};

Markdown.defaultProps = {
  children: "",
};

Markdown.displayName = "Markdown";

export default Markdown;
