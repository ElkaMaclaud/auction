import React from "react";
import classes from "./style/Registration.module.css";
import { Link } from "react-router-dom";
import RegistrationForm from "../RegistrationForm/RegistrationForm";

const Auth = () => {
  return (
    <div className={classes.wrapper}>
      <RegistrationForm action={"AUTH_USER"} />
      <Link to="../registration">Нет аккаунта? Зарегистрироваться</Link>
    </div>
  );
};

export default Auth;
