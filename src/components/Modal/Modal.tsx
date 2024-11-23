import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./style/Modal.module.css";
import { useSocket } from "../../socketContext";

export const Modal: FC<{ children: ReactNode }> = ({ children }) => {
    const { setVisibleModal } = useSocket()
    const ref = useRef<HTMLDivElement>(null);
    const node = document.querySelector("#react_modal");

    useEffect(() => {
        setTimeout(() => setVisibleModal(false), 800)
    }, [])

    if (!node) return null;
    return ReactDOM.createPortal(
        <div
            className={styles.modal}
            ref={ref}
        >
            <h2>
                {children}
            </h2>
        </div>,
        node
    );
};
