import React from 'react'
import Table from '../../components/Table/Table'
import { useSocket } from '../../socketContext';
import { Link } from 'react-router-dom';
import style from "./style/OrganizerAuction.module.css"

const OrganizerAuction = () => {
    const { auctionId, participants, actionValue, timer, endAuction } = useSocket();
    return (
        <div className={style.wrapper}>
            <Table />
            <div className={style.buttons}>
                <button className={style.link} disabled={auctionId.length === 0} onClick={endAuction}>Завершить торги</button>
                <Link className={style.link} to="/orginazer">Закрыть</Link>
            </div>
        </div>
    )
}

export default OrganizerAuction
