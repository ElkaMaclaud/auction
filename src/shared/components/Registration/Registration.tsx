import React from "react";
import classes from "./style/Registration.module.css";
import { Link } from "react-router-dom";
import RegistrationForm from "../RegistrationForm/RegistrationForm";

const Registration = () => {
  return (
    <div className={classes.wrapper}>
      <RegistrationForm action={"REGISTR_USER"} />
      <Link to="../auth">Уже есть аккаунт</Link>
    </div>
  );
};

export default Registration;
