import React, { ChangeEvent, FC, KeyboardEvent, useState } from 'react'
import style from "./style/Table.module.css"
import { IParticipant, useSocket } from '../../socketContext';
import { parameters } from '../../Mockup/parameters';
import Hourglass from '../../shared/UI/Hourglass';
import { Modal } from '../Modal/Modal';


const Table: FC = () => {
    const { auctionId, participants, user, actionValue, timer, placeBid, visibleModal } = useSocket();
    const [value, setValue] = useState(actionValue);

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
    const placeBidLocal = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setValue("")
            placeBid && placeBid(parseInt(value))
        }
    };
    return (
        <div className={style.auctionRoom}>
            {visibleModal && auctionId.length > 0 && <Modal>Торги начались!</Modal> }
            {visibleModal && auctionId.length === 0 && <Modal>Торги завершились!</Modal> }
            {auctionId === "" ? <>
                <h2>Скоро начнём торги</h2></>
                : <><h2>Ход торгов: Тестовые торги на аппарат ЛОТОС №2033554
                    ({new Date().toLocaleString()})</h2>
                    <p>Уважаемые участники,
                        во время вашего хода вы можете изменить параметры торгов, указанные в таблице:</p></>}
            <table>
                <thead>
                    <tr>
                        <th>Параметры и требования</th>
                        {participants.map((participant, index) => (
                            <th key={index}>
                                {participant.active && auctionId && (
                                    <div className={style.timer} style={{ marginTop: "-100px" }}>
                                        <span>00:00:{timer.toString().padStart(2, "0")}</span>
                                        <Hourglass />
                                    </div>
                                )}
                                <div style={participant.active ? { marginTop: "70px" } : { marginTop: "0" }}>
                                    Участник<br />{participant.nameCompany}
                                </div>
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
                                    {auctionId && key === "action" && participant.active && user?.nameCompany === participant.nameCompany ?
                                        <label className={style.newBid}>
                                            <span>Введите новую цену и нажмите Enter</span>
                                            <input type="text" value={value}
                                                placeholder='Введите новую цену'
                                                onFocus={handleFocus}
                                                onChange={handleChange}
                                                onKeyDown={placeBidLocal}
                                                />
                                        </label>
                                        : key === "currentBid" ?
                                            <span style={{ color: "green" }}>
                                                {`${participant[key as keyof IParticipant]} руб.`}
                                            </span>
                                            :
                                            <span>
                                                {participant[key as keyof IParticipant]}
                                            </span>
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    )
}

export default Table
