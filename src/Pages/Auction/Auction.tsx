import React, { useState, useEffect, FC, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import './Auction.css';
import { useAppSelector } from '../../store/reduxHooks';

const parameters = [
  "Начальная стоимость лота, руб.",
  "Срок изготовления лота, дней",
  "Гарантийные обязательства, мес",
  "Условия оплаты",
  "Снижение стоимости лота, руб. (без НДС)",
  "Итоговая стоимость, руб."
];

interface IParticipant {
  socket: string,
  email: string,
  active: boolean,
  currentBid: 0,
  turnEndTime: string
}

const Auction: FC = () => {
  const { user, token } = useAppSelector(state => state.page);
  const socketRef = useRef<Socket | null>(null);
  const [participants, setParticipants] = useState<IParticipant[]>([]);
  const [timer, setTimer] = useState(30)
  const [auctionActive, setAuctionActive] = useState(false);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000', {
      transports: ['polling', 'websocket'],
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`
      },
    });
    socketRef.current.on("connect_error", (err) => {
      console.log("Ошибка подключения к сокету:", err);
    });
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log("Вы подключились к торгам!");
    });

    socket.on('auction started', (auctionId, participants) => {
      socket.emit('join auction', auctionId);
    });

    socket.on('auction ended', () => {

    });

    socket.on("place bid", () => {


    });

    socket.on("your turn", (data) => {

    });

    socket.on('participants updated', (data: { participants: IParticipant[], remainingTime: number }) => {
      const { participants, remainingTime } = data
      console.log('Updated participants:', participants, remainingTime !== undefined ? remainingTime : "");
      setParticipants(participants)
      if (remainingTime !== undefined) setTimer(remainingTime)
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const startAuction = () => {
    if (socketRef.current) {
      setAuctionActive(true)
      socketRef.current.emit('start auction', Math.random().toString(36).substring(2, 15));
    }
  };

  const endAuction = () => {
    if (socketRef.current) {
      socketRef.current.emit('end auction');
    }
  };

  return (
    <div className="auction-room">
      <h2>Ход торгов: Тестовые торги на аппарат ЛОТОС №2033554 ({new Date().toLocaleString()})</h2>
      <p>Уважаемые участники, во время вашего хода вы можете изменить параметры торгов, указанные в таблице:</p>
      {/* <div className="timer" style={{ width: "300px", marginBottom: "10px" }}>
        <span>Оставшееся время: {timeLeft} секунд</span>
      </div> */}
      <table>
        <thead>
          <tr>
            <th>Параметры и требования</th>
            {participants.map((participant, index) => (
              <th key={index}>
                {participant.active && (
                  <div className="timer" style={{ width: "100%", marginTop: "-100px" }}>
                    <span>00:00:{timer.toString().padStart(2, "0")}</span>
                  </div>
                )}
                <div style={{ marginTop: "70px" }}>Участник<br />{participant.email}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parameters.map((param, index) => (
            <tr key={index}>
              <td>{param}</td>
              {participants.map((participant, participantIndex) => (
                <td key={participantIndex}>
                  {participant.email}
                  {participant.socket}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {user.role === "organizer" && (
        <div className="organizer">
          <button disabled={auctionActive} onClick={startAuction}>Начать торги</button>
          <button disabled={!auctionActive} onClick={endAuction}>Завершить торги</button>
        </div>
      )}
    </div>
  );
};

export default Auction;