import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import MainPage from "./Pages/MainPage/MainPage";
import Auction from "./Pages/Auction/Auction";
import Organizer from "./Pages/Organizer/Organizer";
import OrganizerAuction from "./Pages/OrganizerAuction/OrganizerAuction";

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const currentUrl = window.location.href;
    if (!currentUrl.includes('?')) {
      navigate('/orginazer')
    } 
  }, []);

  return (
    <Routes>
      <Route path={"/"} element={<MainPage />}>
        <Route
          path="/auction"
          element={<Auction />}
        />
        <Route
          path="/orginazer"
          element={<Organizer />}
        />
        <Route
          path="/orginazerAuction"
          element={<OrganizerAuction />}
        />
      </Route>
    </Routes>
  )
}

export default App;
