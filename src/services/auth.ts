import { api } from "./api";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
    sub: string;
    role_id: number;
    exp: number;
}

export const login = async (email: string, password: string) => {
    const response = await api.post("/token", { email, password });
    const { access_token } = response.data;
    const decoded: TokenPayload = jwtDecode(access_token);

    localStorage.setItem("token", access_token);
    localStorage.setItem("user_role", decoded.role_id.toString());
    localStorage.setItem("user_id", decoded.sub);
    localStorage.setItem("user_token_exp", decoded.exp.toString())

    return decoded;
};

export const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
};