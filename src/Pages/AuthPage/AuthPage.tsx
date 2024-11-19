import React from 'react'
import classes from "./style/AuthPage.module.css"
import { Outlet } from 'react-router-dom'

const AuthPage = () => {
  return (
      <div className={classes.wrapper}>
          <div className={classes.form}>
              <Outlet />
          </div>
      </div>
  );
}

export default AuthPage
