import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

type IAuthorization = {
    name?: string;
    email: string;
    role?: string;
    password: string;
};


export type ResponseType = { success: boolean; message: string };

export interface IInitialState {
    transition: boolean;
    success: boolean;
    message: string;
    token: string | null;
    user: IAuthorization;
    page: "LOADING" | "COMPLICATED" | "LOGIN";
}
const state: IInitialState = {
    transition: false,
    success: false,
    message: "",
    token: localStorage.getItem("access_token"),
    user: { email: "", password: "", role: "user" },
    page: "LOGIN",
};
async function fetchDataWithRetry<T>(
    url: string,
    options: RequestInit,
    responseType: 'json' | 'blob' | 'text' | 'document' = 'json',
    retryCount = 3,
    timeout = 3000
) {
    let retries = 0;
    while (retries < retryCount) {
        try {
            const response = await Promise.race([
                fetch(url, options),
                new Promise<Response>((_, reject) =>
                    setTimeout(
                        () => reject(new Error("Время ожидания истекло")),
                        timeout
                    )
                ),
            ]);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Что-то пошло не по-плану..."
                );
            }
            if (responseType !== "json") {
                return response as T
            }
            const data: T = await response.json();
            return data;
        } catch (error) {
            retries++;
            if (retries === retryCount) {
                const errorMessage =
                    (error as Error).message || "Неизвестная ошибка";
                throw new Error(
                    `Ошибка после ${retryCount} попыток: ${errorMessage}`
                );
            }
        }
    }
    throw new Error("Не удалось получить данные после всех попыток.");
}
export const REGISTR_USER = createAsyncThunk<
    ResponseType,
    IAuthorization,
    {
        rejectValue: string;
    }
>("page/REGISTR_USER", async ({ email, password }, { rejectWithValue }) => {
    const url =
        "http://localhost:3000/api/auth/register";

    const option: RequestInit = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    };
    try {
        const data = await fetchDataWithRetry<ResponseType>(url, option);
        if (data.success) {
            return data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        return rejectWithValue(`${error}`);
    }
});
export const AUTH_USER = createAsyncThunk<
    ResponseType & { access_token: string },
    IAuthorization,
    {
        rejectValue: string;
    }
>("page/AUTH_USER", async ({ email, password }, { rejectWithValue }) => {
    const url = "http://localhost:3000/api/auth/login";
    const option: RequestInit = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    };
    try {
        const data = await fetchDataWithRetry<ResponseType & { access_token: string }>(
            url,
            option
        );
        if (data.access_token) {
            return data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        return rejectWithValue(`${error}`);
    }
});

const slice = createSlice({
    name: "Page",
    initialState: state, 
    reducers: {
        SET_PAGE: (state, action) => {
            state.page = action.payload;
        },
        SET_USER_DATA: (state, action) => {
            state.transition = true;
            state.user = {
                email: action.payload.email,
                role: action.payload?.role || "user",
                password: action.payload.password,
            };
        }
    },
    extraReducers: (builder) => {
        builder.addCase(REGISTR_USER.fulfilled, (state, action) => {
            return {
                ...state,
                success: true,
                transition: true,
                message: action.payload.message,
            };
        });
        builder.addCase(REGISTR_USER.rejected, (state, action) => {
            return {
                ...state,
                success: false,
                transition: false,
                message: action.payload as string,
            };
        });
        builder.addCase(AUTH_USER.fulfilled, (state, action) => {
            localStorage.setItem("access_token", action.payload.access_token);
            return {
                ...state,
                success: true,
                token: action.payload.access_token,
                // role: 
                message: "Success",
                page: "COMPLICATED",
            };
        });
        builder.addCase(AUTH_USER.rejected, (state, action) => {
            return {
                ...state,
                success: false,
                message: action.payload as string,
                page: "LOGIN",
            };
        });
    },
});

export const { SET_PAGE, SET_USER_DATA } = slice.actions;
export default slice.reducer;
