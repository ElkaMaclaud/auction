import React, { ChangeEvent, KeyboardEvent, useState } from 'react'
import style from "./style/Organizer.module.css"
import { useSocket } from '../../socketContext';
import { Link } from 'react-router-dom';

const Organizer = () => {
  const { participants, auctionId, startAuction, endAuction, participantsUrl, addCompanyName } = useSocket();
  const [value, setValue] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
    }

  const addCompanies = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addCompanyName(value)
      setValue("")
    }
};
  return (
    <div className={style.organizerWrapper}>
      <h1>Здесь вы можете начать и завершить торги</h1>
      <div className={style.organizer}>
        <div className={style.infoparticipants}>
          <h3>Список url для отправки участникам</h3>
          <p className={style.info}>Предполагается, что на бэке эти ссылки отправляются на почту, но для простоты тестирования просто выводим их здесь</p>
          <ul>
            <p className={style.info}>Перейдите по ссылкам, чтобы войти как участники либо скопируйте строчки ниже и вставте в поисковую строку браузера: </p>
          {participantsUrl.map(i=>{
            const key = i
            return <li><a href={i} target="_blank">{i}</a></li>
          })}
          </ul>
            <label htmlFor="" className={style.label}>
              Добавить компании для участия в предстоящем аукционе и нажмите Enter
              <input 
                type="text" 
                placeholder='Введите названия компаний через запятую'
                value={value}
                onChange={handleChange}
                onKeyDown={addCompanies}
                />
            </label>
        </div>
        <div className={style.organizerAction}>
          {!participants.length && <span>Не получится начать торги пока не подключится хотя бы один участник</span>}
          <button disabled={auctionId.length > 0 || !participants.length} onClick={startAuction}>Начать торги</button>
          <button disabled={auctionId.length === 0} onClick={endAuction}>Завершить торги</button>
          <button><Link className={style.link} to="/orginazerAuction">{auctionId ? "Текущие торги" : "Предстоящие торги"}</Link></button>
        </div>
      </div>
    </div>
  );
}

export default Organizer
