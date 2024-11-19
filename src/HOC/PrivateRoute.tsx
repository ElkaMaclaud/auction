import React, { FC, Fragment, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/reduxHooks";

const PrivateRoute: FC<{ children: ReactNode }> = ({
    children,
}): JSX.Element | null => {
    const page = useAppSelector((state) => state.page.page);
    const navigate = useNavigate();

    useEffect(() => {
        const currentPath = window.location.pathname;
        if (
            (currentPath === "/auth" ||
                currentPath === "/registration" ||
                currentPath === "/") &&
            page === "COMPLICATED"
        ) {
            navigate("auction", { replace: true });
        }
    }, [page, navigate]);

    return <Fragment>{children}</Fragment>;
};

export default PrivateRoute;
