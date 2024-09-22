import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "flowbite-react";

import socketService from "../services/socketService";
import RoomService from "../services/socketService/roomService";

import { useDispatch, useSelector } from "react-redux";
import { setDataNamePlayer, setSymbol } from "../features/game/gameSlice";

type ConfirmPasswordProps = {
  roomId: string;
  password: string;
  openConfirmPass: boolean;
  setOpenConfirmPass: (openConfirmPass: boolean) => void;
  isPrivate: boolean;
};

export const ConfirmPassword = ({
  roomId,
  password,
  openConfirmPass,
  setOpenConfirmPass,
  isPrivate,
}: ConfirmPasswordProps) => {
  const navigate = useNavigate();

  const [confrimPasswrod, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [namePlayer2, setNamePlayer2] = useState<string>("");

  const dispatch = useDispatch();

  const handleConfirmPassword = () => {
    if (password === confrimPasswrod) {
      navigate(`/room/${roomId}`);
    } else {
      setError("Password not match");
    }
  };

  const socket = useSelector((state: any) => state.socket.socket);

  const handleJoinRoom = async (roomId: string): Promise<void> => {
    try {
      if (socket.connected) {
        const roomJoined: any = await RoomService.joinGameRoom(
          socket,
          roomId,
          namePlayer2
        );
        if (roomJoined) {
          dispatch(setDataNamePlayer(namePlayer2));
          dispatch(setSymbol("O"));
          navigate(`/room/${roomId}`);
        } else {
          setError("Room not found");
        }
      } else {
        console.log("Socket not connected");
      }
    } catch (err) {
      console.error("Join room error: ", err);
      setError(String(err));
    }
  };

  return (
    <div
      className={`flex h-screen w-full items-center justify-center bg-gray-100/50 ${
        openConfirmPass ? "block" : "hidden"
      }`}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Confirm Password
        </h2>

        <div className="space-y-2 mb-6">
          <div>
            <label htmlFor="name">Name Player</label>
            <input
              id="name"
              placeholder=""
              className="px-2 py-1 outline-none border-b-[1px] border-black w-full"
              onChange={(e) => setNamePlayer2(e.target.value)}
            />
          </div>
        </div>
        {isPrivate && (
          <div className="space-y-2 mb-6">
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                placeholder="1"
                className="px-2 py-1 outline-none border-b-[1px] border-black w-full"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="space-x-2">
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-all"
            onClick={() => {
              handleConfirmPassword();
              handleJoinRoom(roomId);
            }}
          >
            Confirm
          </button>
          <button className="border-[1px] hover:bg-gray-200 border-gray-700 text-black px-2 py-1 rounded-md transition-all">
            Cancel
          </button>
        </div>
      </div>
      {error && (
        <div className="fixed bottom-10 right-10">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-800 dark:text-cyan-200"></div>
            <div className="ml-3 text-sm font-normal">{error}</div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}
    </div>
  );
};
