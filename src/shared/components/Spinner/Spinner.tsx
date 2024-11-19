import React from "react";
import classes from "./style/Spinner.module.css";

const Spinner = () => {
  return (
    <div className={classes.spinnerWrapper}>
      <div className={classes.spinnerContainer}>
        <div className={classes.spinner}></div>
      </div>
    </div>
  );
};

export default Spinner;
