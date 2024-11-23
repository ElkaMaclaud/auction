import React, { FC, Fragment } from 'react';
import Table from '../../components/Table/Table';
import { useSocket } from '../../socketContext';
import style from "./style/Auction.module.css"


const Auction: FC = () => {
  const { participants, user, passTurnToNextParticipant } = useSocket();
  return (
    <Fragment>
      <Table />
      {
        user && user.role === "user" && participants.find(i => i.active && i.nameCompany === user.nameCompany) && (
          <div className={style.buttonWrapper}>
            <button onClick={passTurnToNextParticipant}>Передать ход</button>
          </div>
        )
      }
      </Fragment>
  );
};

export default Auction;