import React, { createContext, Dispatch, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

interface SocketContextProps {
  socket: Socket | null;
  auctionId: string;
  participants: IParticipant[];
  participantsUrl: Array<string>;
  timer: number;
  user: { role: string, nameCompany: string };
  actionValue: string,
  startAuction: () => void;
  placeBid: (bid: number) => void;
  endAuction: () => void;
  passTurnToNextParticipant: () => void;
  visibleModal: boolean,
  setVisibleModal: Dispatch<React.SetStateAction<boolean>>;
  addCompanyName: (list: string) => void;
  waitingConnection: boolean
}
export interface IParticipant {
  socket: string,
  nameCompany: string,
  active: boolean,
  currentBid: number,
  turnEndTime: string,
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [auctionId, setAuctionId] = useState("");
  const [participants, setParticipants] = useState<IParticipant[]>([]);
  const [timer, setTimer] = useState(30);
  const [actionValue, setActionValue] = useState("");
  const [participantsUrl, setParticipantsUrl] = useState<string[]>([]);
  const location = useLocation();
  const [user, setUser] = useState({ role: "", nameCompany: "" })
  const [visibleModal, setVisibleModal] = useState(false)
  const [waitingConnection, setWaitingConnection] = useState(true)

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setUser({
      role: queryParams.get("role") || "user",
      nameCompany: queryParams.get("nameCompany") || ""
    })
    const link: string = `${process.env.REACT_APP_API_URL}${location.search}`; 

    socketRef.current = io(link, {
      transports: ['polling', 'websocket'],
      withCredentials: true
    });

    socketRef.current.on("connect_error", (err) => {
      console.log("Ошибка подключения к сокету:", err);
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setWaitingConnection(false)
      console.log("Вы подключились к торгам!");
    });

    socket.on('auction started', (id, participants) => {
      socket.emit('join auction', id);
      setAuctionId(id);
      setVisibleModal(true)
    });

    socket.on('auction ended', () => {
      setAuctionId("");
      setVisibleModal(true)
    });

    socket.on("your turn", (data) => {
      setActionValue(data.participant.currentBid);
    });

    socket.on("participantsUrl", (data) => {
      setParticipantsUrl(data);
    });

    socket.on('participants updated', (data: { participants: IParticipant[], remainingTime: number }) => {
      const { participants, remainingTime } = data;
      setParticipants(participants);
      if (remainingTime !== undefined) setTimer(remainingTime);
    });

    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAuction = () => {
    if (socketRef.current) {
      const id = Math.random().toString(36).substring(2, 15);
      setAuctionId(id);
      socketRef.current.emit('start auction', id);
    }
  };

  const placeBid = (bid: number) => {
    if (socketRef.current) {
      socketRef.current.emit('place bid', bid, auctionId, participants.find(i => i.active));
    }
  };

  const addCompanyName = (list: string) => {
    if (socketRef.current) {
      socketRef.current.emit("add participantsUrl", list);
    }
  };

  const endAuction = () => {
    if (socketRef.current) {
      socketRef.current.emit('end auction', auctionId);
    }
  };

  const passTurnToNextParticipant = () => {
    if (socketRef.current) {
      socketRef.current.emit('turn timeout', participants.find(i => i.active), auctionId);
    }
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      auctionId, 
      participantsUrl,
      participants,
      actionValue, 
      user,
      timer,
      startAuction,
      placeBid,
      endAuction,
      passTurnToNextParticipant,
      visibleModal,
      setVisibleModal,
      addCompanyName,
      waitingConnection
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
