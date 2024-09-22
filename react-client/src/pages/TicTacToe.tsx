import React, { useEffect, useState } from "react";
import socketService from "../services/socketService";
import RoomService from "../services/socketService/roomService";
import { useNavigate, useParams } from "react-router-dom";
import { Toast, Modal, Button, Popover } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { setSymbol, setTimeOutPlayer } from "../features/game/gameSlice";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Chat } from "../components/Chat";

// End Game set cho doi tuong dem nguoc thoi gian ve 0 dong thoi cung reload
// Update score se thuc hien reload lai luon

function TicTacToe() {
  const dispatch = useDispatch();

  const [dataApi, setDataApi] = useState<any>([]);
  const [namePlayer1, setNamePlayer1] = useState<string>("");
  const [namePlayer2, setNamePlayer2] = useState<string>("");

  const [isMyTurn, setIsMyTurn] = useState<boolean>(true);

  const [borderPlayer1, setBorderPlayer1] = useState<boolean>(true);
  const [borderPlayer2, setBorderPlayer2] = useState<boolean>(false);

  const [isGameStarted, setIsGameStarted] = useState(false);

  const [gameEnded, setGameEnded] = useState<boolean>(false);

  const { roomId } = useParams();

  const socket = useSelector((state: any) => state.socket.socket);

  // Store
  const symbolPlayer = useSelector((state: any) => state.game.symbol);
  const player = useSelector((state: any) => state.game.namePlayer);
  const timeOutPlayer = useSelector((state: any) => state.game.timeOut);

  // Time Player

  const [player1Time, setPlayer1Time] = useState(120);
  const [player2Time, setPlayer2Time] = useState(120);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  const [gridSize, setGridSize] = useState<number>(3);
  const [matrix, setMatrix] = useState<string[][]>(
    Array(3)
      .fill("")
      .map(() => Array(3).fill(""))
  );
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");

  const [winner, setWinner] = useState<string | null>(null);

  // Thong bao

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [notiChange, setNotiChange] = useState<boolean>(false);
  const [namePlayerchange, setNamePlayerChange] = useState<string>("");

  const [notiReset, setNotiReset] = useState<boolean>(false);
  const [openModalReset, setOpenModalReset] = useState<boolean>(false);
  const [openChat, setOpenChat] = useState<boolean>(false);

  const [hiddenStart, setHiddenStart] = useState<boolean>(false);

  // Dark Mode

  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Diem so

  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);

  // Message

  const handleGridSizeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (isGameStarted) {
      setOpenModal(true);
      return;
    } else {
      const size = parseInt(e.target.value, 10);
      setGridSize(size);
      setMatrix(
        Array(size)
          .fill("")
          .map(() => Array(size).fill(""))
      );

      await socket.emit("change_matrix", {
        roomId,
        gridSize: size,
        matrix: Array(size)
          .fill("")
          .map(() => Array(size).fill("")),
      });

      setWinner(null);
    }
  };

  const checkWinner = (matrix: string[][]) => {
    const winningLength = gridSize > 5 ? 5 : gridSize == 5 ? 4 : 3;

    // Kiểm tra hàng ngang và cột dọc
    for (let i = 0; i < gridSize; i++) {
      // Kiểm tra hàng ngang
      for (let j = 0; j <= gridSize - winningLength; j++) {
        if (
          matrix[i]
            .slice(j, j + winningLength)
            .every((cell) => cell === currentPlayer)
        ) {
          setWinnerAndEmit(currentPlayer);
          return ;
        }
      }

      // Kiểm tra cột dọc
      for (let j = 0; j <= gridSize - winningLength; j++) {
        if (
          matrix
            .slice(j, j + winningLength)
            .every((row, index) => row[i] === currentPlayer)
        ) {
          setWinnerAndEmit(currentPlayer);
          return ;
        }
      }
    }

    // Kiểm tra đường chéo chính
    for (let i = 0; i <= gridSize - winningLength; i++) {
      for (let j = 0; j <= gridSize - winningLength; j++) {
        if (
          Array.from(
            { length: winningLength },
            (_, k) => matrix[i + k][j + k]
          ).every((cell) => cell === currentPlayer)
        ) {
          setWinnerAndEmit(currentPlayer);
          return;
        }
      }
    }

    // Kiểm tra đường chéo phụ
    for (let i = 0; i <= gridSize - winningLength; i++) {
      for (let j = winningLength - 1; j < gridSize; j++) {
        if (
          Array.from(
            { length: winningLength },
            (_, k) => matrix[i + k][j - k]
          ).every((cell) => cell === currentPlayer)
        ) {
          setWinnerAndEmit(currentPlayer);
          return;
        }
      }
    }

    // Kiểm tra hòa (không còn ô trống)
    if (matrix.flat().every((cell) => cell !== "")) {
      setWinner("Draw");

      setWinnerAndEmit("Draw");
    }
  };

  const setWinnerAndEmit = (player: string) => {
    setWinner(player);

    socket.emit("update_game", {
      roomId,
      winner: player,
    });

    setPlayer1Time(timeOutPlayer);
    setPlayer2Time(timeOutPlayer);
  };

  const resetGame = () => {
    setMatrix(
      Array(gridSize)
        .fill("")
        .map(() => Array(gridSize).fill(""))
    );
    setWinner(null);
    setCurrentPlayer(symbolPlayer);
  };

  const resetScore = () => {
    setMatrix(
      Array(gridSize)
        .fill("")
        .map(() => Array(gridSize).fill(""))
    );
    setWinner(null);
    setCurrentPlayer(symbolPlayer);

    setScore1(0);
    setScore2(0);

    socket.emit("reset_game", { roomId });
  };

  const sendTimeUpdate = (player1Time: number, player2Time: number) => {
    socket.emit("update_time", {
      roomId,
      player1Time,
      player2Time,
    });
  };

  const handleSetGameStart = (roomId: string) => {
    setIsGameStarted(true);

    socket.emit("start_game", { roomId });
  };

  const handleClick = (rowIndex: number, colIndex: number) => {
    if (isGameStarted) {
      if (matrix[rowIndex][colIndex] === "" && isMyTurn && !winner) {
        const newMatrix = matrix.map((row, rIndex) =>
          row.map((cell, cIndex) => {
            if (rIndex === rowIndex && cIndex === colIndex) {
              return currentPlayer;
            }
            return cell;
          })
        );

        setMatrix(newMatrix);

        checkWinner(newMatrix);

        socket.emit("make_move", { newMatrix, currentPlayer, roomId });

        socket.on("current_turn", (nextPlayer: "X" | "O") => {
          if (nextPlayer === "X") {
            setBorderPlayer1(true);
            setBorderPlayer2(false);
          } else {
            setBorderPlayer1(false);
            setBorderPlayer2(true);
          }
        });

        if (intervalId) clearInterval(intervalId);

        setIsMyTurn(false);
      }
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes} : ${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const notiChangeXO = () => {
    socket.emit("noti_change_xo", {
      roomId,
      symbolPlayer: symbolPlayer,
      player: player,
    });
  };

  const notiResetGame = () => {
    socket.emit("noti_reset_game", { roomId, player: player });
  };

  const changeXO = () => {
    socket.emit("change_xo", {
      roomId,
      symbolPlayer: symbolPlayer,
      player: player,
    });
    setHiddenStart(true);
  };

  useEffect(() => {
    if (socket && roomId) {
      socket.emit("get_room", roomId);

      socket.on("playerJoined", (updatedRoom: any) => {
        setNamePlayer1(updatedRoom.data.player1);
        setNamePlayer2(updatedRoom.data.player2);

        setDataApi(updatedRoom);
      });

      socket.on("roomFound", (room: any) => {
        setNamePlayer1(room.data.player1);
        setNamePlayer2(room.data.player2);
        setPlayer1Time(room.data.timeOut * 60);
        setPlayer2Time(room.data.timeOut * 60);
        dispatch(setTimeOutPlayer(room.data.timeOut * 60));
      });

      if (symbolPlayer === "X") {
        setIsMyTurn(true);
      } else {
        setIsMyTurn(false);
      }
    }
  }, [socket, roomId]);

  useEffect(() => {
    if (socket && roomId) {
      socket.on("playerJoined", (data: any) => {
        setHiddenStart(true);
      });

      socket.on(
        "move_made",
        (
          newMatrix: string[][],
          nextPlayer: "X" | "O",
          namePlayerNext: string
        ) => {
          setMatrix(newMatrix);

          setCurrentPlayer(nextPlayer);

          if (nextPlayer === "X") {
            setBorderPlayer1(true);
            setBorderPlayer2(false);
          } else {
            setBorderPlayer1(false);
            setBorderPlayer2(true);
          }

          setIsMyTurn(true);

          checkWinner(newMatrix);
        }
      );

      socket.on("current_turn", (newMatrix: string[][]) => {
        checkWinner(newMatrix);
      });

      socket.on("start_game", () => {
        setIsGameStarted(true);
      });

      socket.on("change_matrix", (data: any) => {
        setGridSize(data.gridSize);
        setMatrix(data.matrix);
      });

      socket.on("noti_change_xo", (data: any) => {
        setNotiChange(true);
        setNamePlayerChange(data.player);
        setOpenModal(true);
      });

      socket.on("noti_reset_game", (data: any) => {
        console.log(data);
        setNotiReset(true);
        setNamePlayerChange(data.player);
        setOpenModalReset(true);

        setScore1(0);
        setScore2(0);
      });

      socket.on("change_xo", (data: any) => {
        setNamePlayer1(data.player1);
        setNamePlayer2(data.player2);

        setScore1(data.score1 / 2);
        setScore2(data.score2 / 2);

        dispatch(setSymbol(data.symbol));

        if (data.symbol === "X") {
          setCurrentPlayer("X");
          setIsMyTurn(true);
        } else {
          setCurrentPlayer("O");
          setIsMyTurn(false);
        }
      });

      socket.on("end_game", (data: any) => {
        setWinner(data.symbolPlayer);
        setIsGameStarted(false);
        setPlayer1Time(timeOutPlayer);
        setPlayer2Time(timeOutPlayer);
        setWinner(null);
      });

      socket.on("update_game", (data: any) => {
        setWinner(data.winner);

        setPlayer1Time(data.timePlayer);
        setPlayer2Time(data.timePlayer);

        if (symbolPlayer === "X") {
          setIsMyTurn(true);
        } else {
          setIsMyTurn(false);
        }
        setIsGameStarted(false);
      });

      return () => {
        socket.off("start_game");
        socket.off("move_made");
      };
    }
  }, []);

  useEffect(() => {
    if (!isGameStarted) return;

    if (intervalId) clearInterval(intervalId);

    let id: any;

    if (isMyTurn) {
      if (currentPlayer === "X") {
        id = setInterval(() => {
          setPlayer1Time((prevTime) => {
            const newTime = prevTime > 0 ? prevTime - 1 : 0;
            sendTimeUpdate(newTime, player2Time);

            if (newTime === 0 && !gameEnded) {
              socket.emit("end_game", {
                roomId,
                winner: namePlayer2,
              });
              setGameEnded(true);
            }
            return newTime;
          });
        }, 1000);
      } else if (currentPlayer === "O") {
        id = setInterval(() => {
          setPlayer2Time((prevTime) => {
            const newTime = prevTime > 0 ? prevTime - 1 : 0;
            sendTimeUpdate(player1Time, newTime);

            if (newTime === 0 && !gameEnded) {
              socket.emit("end_game", {
                roomId,
                winner: namePlayer1,
              });
              setGameEnded(true);
            }
            return newTime;
          });
        }, 1000);
      }

      setIntervalId(id);
    }

    return () => {
      if (id) clearInterval(id);
    };
  }, [currentPlayer, isMyTurn, isGameStarted]);

  useEffect(() => {
    socket.on("update_time", ({ player1Time, player2Time }: any) => {
      if (currentPlayer === "X") {
        setPlayer2Time(player2Time);
      } else if (currentPlayer === "O") {
        setPlayer1Time(player1Time);
      }
    });

    return () => {
      socket.off("update_time");
    };
  }, [currentPlayer]);

  useEffect(() => {
    if (winner) {
      socket.emit("update_score", { roomId, winner });
    }

    if (symbolPlayer === "X") {
      setIsMyTurn(true);
    } else {
      setIsMyTurn(false);
    }

    socket.on("update_score", (data: any) => {
      setScore1(data.score1 / 2);
      setScore2(data.score2 / 2);
    });
  }, [winner]);

  return (
    <div
      className={`flex flex-col items-center justify-center h-screen py-10  ${
        darkMode ? "h-screen bg-black/80" : ""
      }`}
    >
      <div className="mb-16 space-x-4 flex items-center justify-center">
        <div className="flex space-x-4 justify-center items-center">
          <div
            className={`flex justify-center items-center space-x-4 border-t-[1px] border-l-[1px] border-r-[1px] border-o px-2 py-1 rounded-md text-x ${
              borderPlayer1 ? "border-b-[4px] border-blue-700" : ""
            }`}
          >
            <div
              className={`font-semibold text-black ${
                darkMode ? "text-white" : ""
              }`}
            >
              {namePlayer1}
            </div>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="32"
                height="32"
                className="text-o "
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
            </div>
            <div className="text-xl font-semibold">{score1}</div>
            <div
              className={`text-black text-xl ${darkMode ? "text-white" : ""}`}
            >
              {formatTime(player1Time)} '
            </div>
          </div>
          <div>
            <button
              className="flex justify-center items-center space-x-4  text-xl"
              onClick={notiChangeXO}
            >
              <>
                <div> X</div>
                <svg
                  height="40px"
                  width="40px"
                  version="1.1"
                  id="Capa_1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 60 60"
                  fill="#000000"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <g>
                      <path
                        style={{ fill: "#268eba" }}
                        d="M54.011,43.002c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.39-0.391-1.023,0-1.414 C56.332,38.264,58,34.252,58,30c0-8.822-7.178-16-16-16H18c-0.553,0-1-0.447-1-1s0.447-1,1-1h24c9.925,0,18,8.075,18,18 c0,4.786-1.876,9.3-5.282,12.709C54.522,42.904,54.267,43.002,54.011,43.002z"
                      />
                      <path
                        style={{ fill: "#77d624" }}
                        d="M42,48H18C8.075,48,0,39.925,0,30c0-4.259,1.529-8.396,4.307-11.652 c0.358-0.421,0.991-0.471,1.41-0.111c0.42,0.358,0.47,0.989,0.111,1.41C3.359,22.54,2,26.217,2,30c0,8.822,7.178,16,16,16h24 c0.553,0,1,0.447,1,1S42.553,48,42,48z"
                      />
                      <path
                        style={{ fill: "#268eba" }}
                        d="M18,14c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414l9-9 c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414l-9,9C18.512,13.902,18.256,14,18,14z"
                      />
                      <path
                        style={{ fill: "#268eba" }}
                        d="M27,23c-0.256,0-0.512-0.098-0.707-0.293l-9-9c-0.391-0.391-0.391-1.023,0-1.414 s1.023-0.391,1.414,0l9,9c0.391,0.391,0.391,1.023,0,1.414C27.512,22.902,27.256,23,27,23z"
                      />
                      <path
                        style={{ fill: "#77d624" }}
                        d="M35,57c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414l9-9 c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414l-9,9C35.512,56.902,35.256,57,35,57z"
                      />
                      <path
                        style={{ fill: "#77d624" }}
                        d="M44,48c-0.256,0-0.512-0.098-0.707-0.293l-9-9c-0.391-0.391-0.391-1.023,0-1.414 s1.023-0.391,1.414,0l9,9c0.391,0.391,0.391,1.023,0,1.414C44.512,47.902,44.256,48,44,48z"
                      />
                    </g>
                  </g>
                </svg>
              </>
              <div>O</div>
            </button>
          </div>
          <div
            className={`flex justify-center items-center space-x-4 border-t-[1px] border-l-[1px] border-r-[1px] border-blue-500 px-2 py-1 rounded-md text-o ${
              borderPlayer2 ? "border-b-[4px] border-blue-600" : ""
            }`}
          >
            <div
              className={`font-semibold text-black ${
                darkMode ? "text-white" : ""
              }`}
            >
              {namePlayer2}
            </div>

            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="32"
                height="32"
                className="text-x"
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
            <div className="font-semibold text-xl">{score2}</div>
            <div
              className={`text-black text-xl ${darkMode ? "text-white" : ""}`}
            >
              {formatTime(player2Time)} '
            </div>
          </div>
        </div>
      </div>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {matrix?.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleClick(rowIndex, colIndex)}
              className="w-12 h-12 border border-gray-400 flex items-center justify-center text-xl font-semibold cursor-pointer bg-white hover:bg-gray-200"
            >
              <span className={cell === "X" ? "text-o" : "text-x"}>{cell}</span>
            </div>
          ))
        )}
      </div>
      <div className="space-x-4 mt-12 flex justify-center items-center">
        <div>
          <Popover
            aria-labelledby="default-popover"
            content={
              <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
                <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                  <h3
                    id="default-popover"
                    className="font-semibold text-gray-900 dark:text-white"
                  >
                    Setting
                  </h3>
                </div>
                <div className="px-3 py-2 flex justify-between items-center">
                  <label
                    htmlFor="grid-size"
                    className=" font-semibold text-gray-700"
                  >
                    Grid Size
                  </label>
                  <input
                    id="grid-size"
                    type="number"
                    min="3"
                    max="10"
                    value={gridSize}
                    onChange={handleGridSizeChange}
                    className=" border border-gray-300 rounded outline-none hover:border-blue-500"
                  />
                </div>
                <div className="px-3 py-2 flex justify-between items-center">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-700 "
                  >
                    Change Mode
                  </button>
                </div>
                <div className="px-3 py-2 flex justify-between items-center">
                  <button
                    onClick={() => {
                      notiResetGame();
                      resetGame();
                    }}
                    className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-700 duration-300"
                  >
                    Reset Game
                  </button>
                </div>
              </div>
            }
          >
            <Button className={`${isGameStarted ? "hidden" : ""}`}>
              Setting
            </Button>
          </Popover>
        </div>
        <div className="">
          {symbolPlayer === "X" && hiddenStart ? (
            <button
              className=" px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 duration-300"
              onClick={() => {
                handleSetGameStart(roomId || "");
              }}
            >
              Start
            </button>
          ) : (
            <></>
          )}
        </div>
        <div>
          <button
            onClick={() => {
              setOpenChat(!openChat);
            }}
            className="bg-white/20 w-12 h-12 rounded-full flex justify-center items-center hover:bg-white duration-300"
          >
            <svg
              viewBox="0 0 1024 1024"
              className="icon"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              fill="#000000"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M885.8 383.8h-90.4c12.3 15.8 19.7 35.6 19.7 57.1v194c0 51.3-42 93.2-93.2 93.2H494.1c12.1 31 42.2 53.1 77.4 53.1h314.3c45.6 0 83-37.3 83-83V466.8c-0.1-45.7-37.4-83-83-83z"
                  fill="#FFB89A"
                ></path>
                <path
                  d="M780.7 582.4V286.3c0-74.2-60.7-134.9-134.9-134.9H198.2c-74.2 0-134.9 60.7-134.9 134.9v296.1c0 70.5 54.8 128.7 123.8 134.4 0 0-20 155.4 4.9 155.4s188.4-154.9 188.4-154.9h265.3c74.3 0 135-60.7 135-134.9z m-424.1 74.9l-17.4 16.4c-0.3 0.3-34.5 32.7-73.2 67.1-8.5 7.5-16.2 14.3-23.3 20.5 1.9-20.9 3.9-36.6 3.9-36.8l8-62.3L192 657c-38.5-3.2-68.7-36-68.7-74.6V286.3c0-19.9 7.8-38.6 22.1-52.8 14.2-14.2 33-22.1 52.8-22.1h447.6c19.9 0 38.6 7.8 52.8 22.1 14.2 14.2 22.1 33 22.1 52.8v296.1c0 19.9-7.8 38.6-22.1 52.8-14.2 14.2-33 22.1-52.8 22.1H356.6z"
                  fill="#45484C"
                ></path>
                <path
                  d="M830.3 337.9c-16.2-3.3-32.1 7.1-35.4 23.3-3.3 16.2 7.1 32.1 23.3 35.4 39 8 67.3 42.7 67.3 82.5v177c0 41.6-31.1 77.5-72.3 83.4l-32.7 4.7 7.8 32.1c2 8.1 3.9 16.8 5.8 25.3-17.6-16.4-37.3-35.2-55.2-52.7l-8.7-8.6H562.5c-21.9 0-36.6-1.4-47.2-8.6-13.7-9.3-32.4-5.8-41.7 7.9-9.3 13.7-5.8 32.4 7.9 41.7 25.7 17.5 55.3 19 81 19h143.2c10 9.7 27.3 26.3 45 42.8 16.2 15.1 29.6 27.1 39.8 35.9 20 17 29.3 23.1 41.6 23.1 9.7 0 18.7-4.4 24.8-12.1 10.1-12.9 10.2-29.1 0.5-78.7-1.4-7.2-2.9-14.2-4.3-20.6 54.4-21.1 92.4-74.3 92.4-134.6v-177c0.1-68-48.4-127.4-115.2-141.2z"
                  fill="#45484C"
                ></path>
                <path
                  d="M434.6 602.8c-35.9 0-71-17.1-98.8-48.1-24.6-27.5-39.3-61.6-39.3-91.4v-29.7l29.7-0.3c0.4 0 36.2-0.4 95.4-0.4 16.6 0 30 13.4 30 30s-13.4 30-30 30c-22.3 0-41.2 0.1-56.2 0.1 3.8 7.1 8.8 14.5 15.1 21.6 16 17.9 35.7 28.1 54.1 28.1s38.1-10.3 54.1-28.1c6.5-7.3 11.6-14.9 15.4-22.2-13.7-2.8-24.1-15-24-29.5 0.1-16.5 13.5-29.9 30-29.9h0.1c27.1 0.1 32.5 0.2 33.6 0.3l28.9 1.1v28.9c0 29.8-14.7 63.9-39.3 91.4-27.9 31-62.9 48.1-98.8 48.1z m107.1-109.5z"
                  fill="#33CC99"
                ></path>
              </g>
            </svg>
          </button>
        </div>
      </div>

      {notiChange && (
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
          <Modal.Header>{namePlayerchange} muốn đổi lượt với bạn</Modal.Header>

          <Modal.Footer>
            <Button
              onClick={() => {
                changeXO();
                setOpenModal(false);
              }}
            >
              Đồng ý
            </Button>
            <Button color="gray" onClick={() => setOpenModal(false)}>
              Không đồng ý
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {notiReset && (
        <Modal show={openModalReset} onClose={() => setOpenModalReset(false)}>
          <Modal.Header>{namePlayerchange} muốn reset game</Modal.Header>

          <Modal.Footer>
            <Button
              onClick={() => {
                resetScore();
                setOpenModalReset(false);
              }}
            >
              Đồng ý
            </Button>
            <Button color="gray" onClick={() => setOpenModalReset(false)}>
              Không đồng ý
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {winner && (
        <div className="fixed top-0 left-0 bottom-0 right-0 w-full h-full flex items-center justify-center bg-gray-50/60">
          <div className="flex justify-center items-center flex-col ">
            <CountdownCircleTimer
              isPlaying
              duration={3}
              size={80}
              strokeWidth={10}
              colors={["#268eba", "#77d624", "#268eba", "#77d624"]}
              colorsTime={[3, 2, 1, 0]}
              onComplete={() => {
                setWinner(null);
                resetGame();
              }}
            >
              {({ remainingTime }) => remainingTime}
            </CountdownCircleTimer>
            <div className="mt-6 text-2xl font-bold">
              {winner === "Draw"
                ? "The game is a draw!"
                : `Player ${winner} wins!`}
            </div>
          </div>
        </div>
      )}
      {
        <div className={`${openChat ? "block" : "hidden"}`}>
          <Chat roomId={roomId ?? ""} />
        </div>
      }
    </div>
  );
}

export default TicTacToe;
