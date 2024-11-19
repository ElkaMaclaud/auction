import React from "react";
import classes from "./style/MainPage.module.css";
import { Outlet } from "react-router-dom";


const MainPage = () => {
  return (
    <div className={classes.wrapperPage}>
      <div className={classes.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default MainPage;
