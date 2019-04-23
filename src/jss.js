import React from "react";
import withStyles from "react-jss";

export const Button = withStyles({
  root: props => ({
    background: props.primary ? "palevioletred" : "white",
    color: props.primary ? "white" : "palevioletred",
    fontSize: "1em",
    margin: "1em",
    padding: "0.25em 1em",
    border: "2px solid palevioletred",
    borderRadius: "3px"
  })
})(({ classes, primary, ...other }) => (
  <button {...other} className={classes.root} />
));

export const CssReset = withStyles({
  "@global": {
    body: {
      color: "grey"
    }
  }
})(() => null);
