import React, { useState, useEffect, FC } from 'react';
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

const Organizer: FC<{ socket: Socket }> = ({ socket }) => {

  const startAuction = () => {
    socket.emit('start auction', Math.random().toString(36).substring(2, 15));
  };

  const endAuction = () => {
    socket.emit('end auction');
  };

  return (
    <div className="organizer">
      <h2>Организатор торгов</h2>
      <button onClick={startAuction}>Начать торги</button>
      <button onClick={endAuction}>Завершить торги</button>
    </div>
  );
};

const Auction: FC = () => {
  const { user, token } = useAppSelector(state => state.page);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [auctionActive, setAuctionActive] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participants, setParticipants] = useState<{socket: string, email: string}[]>([]);
  const [auction, setAuction] = useState(false)

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['polling', 'websocket'],
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`
      },
    });
    setSocket(newSocket);
    newSocket.on('connect', () => {

    });
    newSocket.on('auction started', (auctionId, participants) => {
      newSocket.emit('join auction', auctionId);
      setAuctionActive(true);
      setTimeLeft(30);
    });

    newSocket.on('auction ended', () => {
      setAuctionActive(false);
      setTimeLeft(0);
    });

    newSocket.on('participants updated', (participants: {socket: string, email: string}[]) => {
      console.log('Updated participants:', participants);
      setParticipants(participants)
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (auctionActive) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [auctionActive]);

  return (
    <div className="auction-room">
      <h2>Ход торгов: Тестовые торги на аппарат ЛОТОС №2033554 ({new Date().toLocaleString()})</h2>
      <p>Уважаемые участники, во время вашего хода вы можете изменить параметры торгов, указанные в таблице:</p>
      <div className="timer" style={{ width: "300px" }}>
        <span>Оставшееся время: {timeLeft} секунд</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Параметры и требования</th>
            {participants.map((participant, index) => (
              <th key={index}>Участник<br/>{participant.email}</th>
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
      {user.role === "organizer" && <Organizer socket={socket!} />}
    </div>
  );
};

export default Auction;