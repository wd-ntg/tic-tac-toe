import React, { useEffect } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import RoomPlaySetting from "./components/RoomPlaySetting";
import TicTacToe from "./pages/TicTacToe";
import socketService from "./services/socketService";
import { connect, disconnect } from "./features/socketConnect/socketSlice";
import { useDispatch } from "react-redux";

function App() {
  // const connectSocket = async () => {
  //   const socket = await socketService
  //     .connect("http://localhost:9000", 5000)
  //     .catch((err) => {
  //       console.log("Error: ", err);
  //     });
  // };

  // useEffect(() => {
  //   connectSocket();
  // }, []);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(connect());

    return () => {
      dispatch(disconnect());
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/new" element={<HomePage />} />
        <Route path={"room/:roomId"} element={<TicTacToe />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
