import React, { CSSProperties, FC, ReactNode, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "./style/Modal.module.css";
import { useSocket } from "../../socketContext";

export const Modal: FC<{ children: ReactNode, style?: CSSProperties }> = ({ children, style }) => {
    const { setVisibleModal } = useSocket()
    const ref = useRef<HTMLDivElement>(null);
    const node = document.querySelector("#react_modal");

    useEffect(() => {
        let timeoutId = setTimeout(() => setVisibleModal(""), 800)
        return (() => clearTimeout(timeoutId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!node) return null;
    return ReactDOM.createPortal(
        <div
            className={styles.modal}
            ref={ref}
            style={style}
        >
            <h2>
                {children}
            </h2>
        </div>,
        node
    );
};
