import React, { useEffect, useState } from "react";
import RoomPlaySetting from "../components/RoomPlaySetting";
import { useSelector } from "react-redux";
import socketService from "../services/socketService";
import RoomService from "../services/socketService/roomService";
import { useNavigate } from "react-router-dom";
import { Toast } from "flowbite-react";
import { ConfirmPassword } from "../components/ConfirmPassword";

export const HomePage = () => {
  const [openRoomPlaySetting, setOpenRoomPlaySetting] =
    useState<boolean>(false);

  const [openConfirmPass, setOpenConfirmPass] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const [dataApi, setDataApi] = useState<any>([]);
  const [error, setError] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState<boolean>(false);

  const navigator = useNavigate();

  const handleOpenRoomPlaySetting = () => {
    setOpenRoomPlaySetting(true);
  };

  const socket = useSelector((state: any) => state.socket.socket);

  const callApi = async () => {
    try {
      if (socket) {
        const roomJoined = await RoomService.getAllRooms(socket);
        setDataApi(roomJoined);
      } else {
        console.log("Socket not connected");
      }
    } catch (err) {
      console.error("Create room error: ", err);
    }
  };

  const handleGetDataRoom = async (roomId: string): Promise<void> => {
    try {

      if (socket.connected) {
        const roomJoined: any = await RoomService.getRoom(socket, roomId);
        if (roomJoined) {
          setRoomId(roomJoined.id);
          if (roomJoined.data.typeRoom == "private") {
            setIsPrivate(true);
            setPassword(roomJoined.data.password);
          }
        }
      } else {
        console.log("Socket not connected");
      }
    } catch (err) {
      console.error("Create room error: ", err);
      setError(String(err));
    }
  };

  useEffect(() => {
    callApi();

    socket.emit("get_all_rooms");

    socket.on("allRooms", (rooms: any) => {
      setDataApi(rooms); 
    });

    return () => {
      socket.off("allRooms");
    };
  }, [socket]);

  return (
    <div className="flex justify-center items-center">
      <div className="w-[900px] flex justify-center items-center flex-col py-28">
        <div className="w-full py-2   flex justify-center items-center space-x-2">
          <div className="flex justify-center items-center text-center space-x-2">
            <div className="m-auto flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="48"
                height="48"
                className="text-red-500"
              >
                <line
                  x1="4"
                  y1="4"
                  x2="20"
                  y2="20"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <line
                  x1="20"
                  y1="4"
                  x2="4"
                  y2="20"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="48"
                height="48"
                className="text-blue-500"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
            </div>
            <div className="text-3xl text-white">Game</div>
          </div>
        </div>
        <div className="py-8 space-y-6">
          <div className="text-white space-y-4">
            <div className="flex space-x-4">
              <button
                className="bg-red-500 px-6 py-2 rounded-md flex justify-center items-center space-x-2"
                onClick={handleOpenRoomPlaySetting}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>

                <div>New Room</div>
              </button>
              <button className=" bg-blue-500 px-6 py-2 rounded-md flex justify-center items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                <div>Refresh</div>
              </button>
              <button className=" bg-blue-500 px-6 py-2 rounded-md flex justify-center items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
                  />
                </svg>
                <div>Quick Play</div>
              </button>
            </div>
          </div>
          <div>
            <div className="flex space-x-2 items-center">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 hover:cursor-pointer text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
              <div>
                <input
                  placeholder="Room ID"
                  className="outline-none border-b-4 px-2 py-1 border-blue-500 w-[440px]"
                />
              </div>
            </div>
          </div>
        </div>

        {
          <div className="bg-white/65 p-8 rounded-lg shadow-lg">
            <div className="font-semibold mb-4 w-full flex justify-center items-center">
              List Room
            </div>
            {dataApi.map((room: any, index: number) => (
              <div className="flex space-x-24 items-center">
                <div className="my-2  ">
                  <button
                    className="px-2 py-1 bg-teal-500 rounded-md text-white"
                    onClick={() => {
                      console.log("Room", room.id);
                      handleGetDataRoom(room.id);
                      setOpenConfirmPass(true);
                    }}
                  >
                    Join Room
                  </button>
                </div>
                <div>{room.id}</div>
              </div>
            ))}
          </div>
        }
      </div>
      {openRoomPlaySetting && (
        <div className="fixed top-0 left-0 right-0 bottom-0 h-screen w-full items-center justify-center bg-black bg-opacity-50">
          <RoomPlaySetting
            openRoomPlaySetting={openRoomPlaySetting}
            setOpenRoomPlaySetting={setOpenRoomPlaySetting}
          />
        </div>
      )}
      {error && (
        <div className="fixed bottom-10 right-10">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-800 dark:text-cyan-200"></div>
            <div className="ml-3 text-sm font-normal">{error}</div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}

      {openConfirmPass && (
        <div className="fixed top-0 left-0 right-0 bottom-0 h-screen w-full items-center justify-center bg-black bg-opacity-50">
          <ConfirmPassword
            roomId={roomId}
            password={password}
            openConfirmPass={openConfirmPass}
            setOpenConfirmPass={setOpenConfirmPass}
            isPrivate={isPrivate}
          />
        </div>
      )}
    </div>
  );
};
