import React, { FC, useEffect, useState } from "react";
import classes from "./style/RegistrationForm.module.css";
import { useAppDispatch, useAppSelector } from "../../../store/reduxHooks";
import {
  AUTH_USER,
  REGISTR_USER,
  SET_USER_DATA,
} from "../../../store/slice";
import { useNavigate } from "react-router-dom";

interface ActionCreators {
  [key: string]: any;
}
const actionCreators: ActionCreators = {
  REGISTR_USER,
  AUTH_USER,
};

const RegistrationForm: FC<{ action: string }> = ({ action }) => {
  const { success, user, transition } = useAppSelector(state => state.page);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: user.email,
    organizer: false,
    password: user.password,
  });
  const handleClick = (event: any) => {
    event.preventDefault();
    const actionFunction = actionCreators[action];
    if (actionFunction) {
      dispatch(actionFunction({ ...formData }));
      dispatch(SET_USER_DATA({ ...formData }));
    }
  };
  useEffect(() => {
    if (success && transition) {
      navigate("/auth");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);
  return (
    <div className={classes.registration}>
      <h2 className={classes.registration__header}>
        {action === "REGISTR_USER" ? "Registration" : "Authorization"}
      </h2>
      <form className={classes.registration} onSubmit={handleClick}>
        <input
          value={formData.email}
          onChange={(event) =>
            setFormData((user) => ({
              ...user,
              email: event.target.value.trim(),
            }))
          }
          type="text"
          placeholder="Введите email..."
        />
        <input
          value={formData.password}
          onChange={(event) =>
            setFormData((user) => ({
              ...user,
              password: event.target.value.trim(),
            }))
          }
          type="password"
          placeholder="Введите пароль..."
        />
        {action === "REGISTR_USER" && <label>
          <input type="checkbox" checked={formData.organizer} onChange={(e) => setFormData((user) => ({
              ...user,
              organizer: e.target.checked,
            }))} />
            <span>Зарегистрироваться как организатор</span>
        </label>}
        <button
          type="submit"
          className={classes.registration__btn}
          disabled={!formData.email || !formData.password}
        >
          {action === "REGISTR_USER" ? "Sign up" : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
