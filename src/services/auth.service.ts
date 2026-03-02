import { api } from "./api";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
    sub: string;
    role_id: number;
    exp: number;
}

export const login = async (email: string, password: string): Promise<TokenPayload> => {
    const response = await api.post("/token", { email, password });
    const { access_token } = response.data;
    const decoded: TokenPayload = jwtDecode(access_token);

    localStorage.setItem("token", access_token);

    return decoded;
};

export const forgotPassword = async (email: string): Promise<void> => {
    await api.post("/users/forgot-password", { email });
};

export const resetPassword = async (
    token: string,
    new_password: string,
    confirm_password: string
): Promise<void> => {
    await api.post("/users/reset-password", {
        secret_token: token,
        new_password,
        confirm_password,
    });
};

export const logout = (): void => {
    localStorage.clear();
};