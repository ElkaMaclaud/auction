import React, { useState, useEffect, FC } from 'react';
import { io, Socket } from 'socket.io-client';
import './Auction.css';


const Organizer: FC<{ socket: Socket }> = ({ socket }) => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [auctionId, setAuctionId] = useState<string>('');

  const startAuction = () => {
    socket.emit('start auction', auctionId, participants);
  };

  const endAuction = () => {
    socket.emit('end auction', auctionId);
  };

  return (
    <div className="organizer">
      <h2>Организатор торгов</h2>
      <input
        type="text"
        placeholder="ID аукциона"
        value={auctionId}
        onChange={(e) => setAuctionId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Участники (через запятую)"
        onChange={(e) => setParticipants(e.target.value.split(','))}
      />
      <button onClick={startAuction}>Начать торги</button>
      <button onClick={endAuction}>Завершить торги</button>
    </div>
  );
};

const Auction: FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [auctionActive, setAuctionActive] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOrganizer, setIsOrganizer] = useState<boolean>(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'], 
  });
    setSocket(newSocket);

    newSocket.on('auction started', (auctionData: any) => {
      setAuctionActive(true);
      setTimeLeft(30);
    });

    newSocket.on('auction ended', () => {
      setAuctionActive(false);
      setTimeLeft(0);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionActive]);

  const handleOrganizerClick = () => {
    setIsOrganizer(true);
  };

  return (
    <div className="auction-room">
      <h2>Ход торгов: Тестовые торги на аппарат ЛОТОС №2033554 ({new Date().toLocaleString()})</h2>
      <p>Уважаемые участники, во время вашего хода вы можете изменить параметры торгов, указанные в таблице:</p>
      { <div className="timer">
        <span>Оставшееся время: {timeLeft} секунд</span>
      </div>}
      <table>
        <thead>
          <tr>
            <th>Параметры и требования</th>
            <th>Участник №1</th>
            <th>Участник №2</th>
            <th>Участник №3</th>
            <th>Участник №4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Начальная стоимость лота, руб.</td>
            <td>3,700,000 руб.</td>
            <td>2,800,000 руб.</td>
            <td>2,500,000 руб.</td>
            <td>2,500,000 руб.</td>
          </tr>
          <tr>
            <td>Срок изготовления лота, дней</td>
            <td>80</td>
            <td>75</td>
            <td>120</td>
            <td>90</td>
          </tr>
          <tr>
            <td>Гарантийные обязательства, мес</td>
            <td>24</td>
            <td>22</td>
            <td>36</td>
            <td>30</td>
          </tr>
          <tr>
            <td>Условия оплаты</td>
            <td>50%</td>
            <td>60%</td>
            <td>40%</td>
            <td>55%</td>
          </tr>
          <tr>
            <td>Снижение стоимости лота, руб. (без НДС)</td>
            <td>-25,000 руб.</td>
            <td>-25,000 руб.</td>
            <td>-25,000 руб.</td>
            <td>-25,000 руб.</td>
          </tr>
          <tr>
            <td>Итоговая стоимость, руб.</td>
            <td>2,475,000 руб.</td>
            <td>2,475,000 руб.</td>
            <td>2,475,000 руб.</td>
            <td>2,475,000 руб.</td>
          </tr>
        </tbody>
      </table>
      {!isOrganizer && (
        <button onClick={handleOrganizerClick}>Я организатор</button>
      )}
      {isOrganizer && <Organizer socket={socket!} />}
    </div>
  );
};

export default Auction;