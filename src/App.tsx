import React, { ReactElement, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Auth from "./shared/components/Registration/Auth";
import Registration from "./shared/components/Registration/Registration";
import { useAppDispatch, useAppSelector } from "./store/reduxHooks";
import MainPage from "./Pages/MainPage/MainPage";
import AuthPage from "./Pages/AuthPage/AuthPage";
import PrivateRoute from "./HOC/PrivateRoute";
import LoadingPage from "./Pages/LoadingPage/LoadingPage";
import Auction from "./Pages/Auction/Auction";

function App() {
  const { page, token } = useAppSelector((state) => state.page);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (page === "LOGIN") {
      token !== null ? navigate("/auth") : navigate("/registration");
    } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, dispatch]);
  if (page === "COMPLICATED") {
    return (
      <PrivateRoute>
        <Routes>
          <Route path={"/auction"} element={<MainPage />}>
            <Route
              path="/auction"
              element={<Auction />}
            />
          </Route>
        </Routes>
      </PrivateRoute>
    );
  }

  if (page === "LOADING") {
    return <LoadingPage />;
  }
  return (
    <Routes>
      <Route path={"/"} element={<AuthPage />}>
        <Route
          key={Math.random().toString(36)}
          path={"/auth"}
          element={<Auth />}
        />
        <Route
          key={Math.random().toString(36)}
          path={"/registration"}
          element={<Registration />}
        />
      </Route>
    </Routes>
  );
}

export default App;
