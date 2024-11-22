import React, { useState, useEffect, FC, useRef, ChangeEvent, KeyboardEvent, FocusEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import './Auction.css';
import { useAppSelector } from '../../store/reduxHooks';

const parameters: Map<string, string | number> = new Map([
  ["availability", "Наличие комплекса мероприятий"],
  ["term", "Срок изготовления лота, дней"],
  ["warrantyObligations", "Гарантийные обязательства, мес"],
  ["paymentTerms", "Условия оплаты"],
  ["currentBid", "Итоговая стоимость, руб."]
]);

interface IParticipant {
  socket: string,
  email: string,
  active: boolean,
  currentBid: number,
  turnEndTime: string
}

const Auction: FC = () => {
  const { user, token } = useAppSelector(state => state.page);
  const socketRef = useRef<Socket | null>(null);
  const [participants, setParticipants] = useState<IParticipant[]>([]);
  const [timer, setTimer] = useState(30)
  const [auctionId, setAuctionId] = useState("");
  const [value, setValue] = useState("")

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

    socket.on('auction started', (id, participants) => {
      socket.emit('join auction', id);
      setAuctionId(id)
    });

    socket.on('auction ended', () => {
      setAuctionId("")
    });

    socket.on("your turn", (data) => {
      setValue(data.participant.currentBid)
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
      const id = Math.random().toString(36).substring(2, 15)
      setAuctionId(id)
      socketRef.current.emit('start auction', id);
    }
  };
  const passTurnToNextParticipant = () => {
    if (socketRef.current) {
      socketRef.current.emit('turn timeout', participants.find(i => i.active), auctionId);
    }
  };

  const placeBid = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (socketRef.current) {
        socketRef.current.emit('place bid', parseInt(value), auctionId, participants.find(i => i.active));
      }
    }
  };

  const endAuction = () => {
    if (socketRef.current) {
      socketRef.current.emit('end auction', auctionId);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    value = value.replace(/\D/g, "")
    e.target.value = value
    setValue(e.target.value)
  }

  const handleFocus = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "0") {
      e.target.value = "";
      setValue("")
    }
  };

  return (
    <div className="auction-room">
      {auctionId === "" ? <><h2>Скоро начнём торги</h2></> : <><h2>Ход торгов: Тестовые торги на аппарат ЛОТОС №2033554 ({new Date().toLocaleString()})</h2>
        <p>Уважаемые участники, во время вашего хода вы можете изменить параметры торгов, указанные в таблице:</p></>}
      {/* <div className="timer" style={{ width: "300px", marginBottom: "10px" }}>
        <span>Оставшееся время: {timeLeft} секунд</span>
      </div> */}
      <table>
        <thead>
          <tr>
            <th>Параметры и требования</th>
            {participants.map((participant, index) => (
              <th key={index}>
                {participant.active && auctionId && (
                  <div className="timer" style={{ width: "100%", marginTop: "-100px" }}>
                    <span>00:00:{timer.toString().padStart(2, "0")}</span>
                  </div>
                )}
                <div style={participant.active ? { marginTop: "70px" } : { marginTop: "0" }}>Участник<br />{participant.email}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from(parameters).map(([key, val], index) => (
            <tr key={index}>
              <td>{val}</td>
              {participants.map((participant, participantIndex) => (
                <td key={participantIndex}>
                  {key === "currentBid" && participant.active && user.email === participant.email ?
                    <input type="text" value={value}
                      onFocus={handleFocus}
                      onChange={handleChange}
                      onKeyDown={placeBid}
                    /> :
                    <span>{participant[key as keyof IParticipant]}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {
        user.role === "user" && participants.find(i => i.active && i.email === user.email) && (
          <div>
            <button onClick={passTurnToNextParticipant}>Передать ход</button>
          </div>
        )
      }
      {
        user.role === "organizer" && (
          <div className="organizer">
            <button disabled={auctionId.length > 0} onClick={startAuction}>Начать торги</button>
            <button disabled={auctionId.length === 0} onClick={endAuction}>Завершить торги</button>
          </div>
        )
      }
    </div >
  );
};

export default Auction;