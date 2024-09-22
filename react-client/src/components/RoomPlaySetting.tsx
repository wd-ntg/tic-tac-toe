import React, { useState } from "react";
import socketService from "../services/socketService";
import RoomService from "../services/socketService/roomService";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setDataGame, setDataNamePlayer, setSymbol, setTimeOutPlayer } from "../features/game/gameSlice";

type RoomPlaySettingProps = {
  openRoomPlaySetting: boolean;
  setOpenRoomPlaySetting: (openRoomPlaySetting: boolean) => void;
};

interface CreateRoomData {
  typeRoom: string;
  timeOut: number;
  password?: string;
  player1: string;
  player2: string;
}

function RoomPlaySetting({
  openRoomPlaySetting,
  setOpenRoomPlaySetting,
}: RoomPlaySettingProps) {
  const handleCloseRoomPlaySetting = () => {
    setOpenRoomPlaySetting(false);
  };

  const [isPrivate, setIsPrivate] = useState<Boolean>(false);
  const [timeOut, setTimeOut] = useState(0);
  const [password, setPassword] = useState("");

  const [namePlayer, setNamePlayer] = useState<string>("");

  const navigator = useNavigate();
  const dispatch = useDispatch();

  const socket = useSelector((state: any) => state.socket.socket);

  const handleCreateRoom = async (data: object): Promise<void> => {
    const createRoomData: CreateRoomData = {
      typeRoom: isPrivate ? "private" : "public",
      timeOut: timeOut,
      password: password || "",
      player1: namePlayer,
      player2: "",
    };

    try {
      if (socket.connected) {
        const roomCreated = await RoomService.createGameRoom(
          socket,
          createRoomData
        );
        if (roomCreated) {

          dispatch(setDataGame(roomCreated));

          dispatch(setDataNamePlayer(namePlayer));

          dispatch(setSymbol("X"));

          dispatch(setTimeOutPlayer(Number(timeOut)*60));

          navigator(`/room/${roomCreated?.id || ""}`);
        }
      } else {
        console.log("Socket not connected");
      }
    } catch (err) {
      console.error("Create room error: ", err);
    }
  };

  return (
    <div
      className={`flex h-screen w-full items-center justify-center bg-gray-100/50 ${
        openRoomPlaySetting ? "block" : "hidden"
      }`}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Room Play Setting
        </h2>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="room-type">
            Room Type <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center mb-4">
            <input
              id="public"
              name="room-type"
              type="radio"
              className="mr-2"
              onChange={() => setIsPrivate(false)}
            />
            <label htmlFor="public" className="text-gray-700">
              Public
            </label>
          </div>
          <div className="flex items-center mb-4">
            <input
              id="private"
              name="room-type"
              type="radio"
              className="mr-2"
              onChange={() => setIsPrivate(true)}
            />
            <label htmlFor="private" className="text-gray-700">
              Private
            </label>
          </div>
        </div>
        <div className="flex flex-col mb-6">
          <label htmlFor="name" className="text-gray-700 mb-2">
            Name Player
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="mr-2"
            onChange={(e) => setNamePlayer(e.target.value)}
          />
        </div>
        <div className="space-y-2 mb-6">
          <div>
            <label htmlFor="timeout">Timeout (minutes)</label>
            <input
              id="timeout"
              placeholder="1"
              className="px-2 py-1 outline-none border-b-[1px] border-black w-full"
              onChange={(e) => setTimeOut(Number(e.target.value))}
            />
          </div>
          {isPrivate && (
            <div>
              <label htmlFor="password">Paswword</label>
              <input
                id="password"
                placeholder="******"
                className="px-2 py-1 outline-none border-b-[1px] border-black w-full"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="space-x-2">
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-all"
            onClick={() => handleCreateRoom({})}
          >
            Create Room
          </button>
          <button
            className="border-[1px] hover:bg-gray-200 border-gray-700 text-black px-2 py-1 rounded-md transition-all"
            onClick={handleCloseRoomPlaySetting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomPlaySetting;
