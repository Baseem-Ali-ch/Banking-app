import { User } from "@/types";
import { api } from "./client"


interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
    role: string;
  };
}

interface RegisterResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
    role: string;
  };
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  login: (credentials: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    return api.post("/auth/login", credentials);
  },

  register: (userData: any): Promise<RegisterResponse> => {
    return api.post("/auth/register", userData)
  },

  logout: (): Promise<{ status: string; message: string }> => {
    return api.post("/auth/logout")
  },

  resetPassword: (email: string): Promise<ResetPasswordResponse> => {
    return api.post("/auth/reset-password", { email })
  },

  verifyResetCode: (token: string, code: string): Promise<ResetPasswordResponse> => {
    return api.post(`/auth/verify-reset/${token}`, { code })
  },

  setNewPassword: (token: string, password: string): Promise<ResetPasswordResponse> => {
    return api.post(`/auth/new-password/${token}`, { password })
  },

  refreshToken: (): Promise<{ token: string }> => {
    return api.post("/auth/refresh-token")
  },

  getProfile: (): Promise<User> => {
    return api.get("/auth/profile")
  },

  updateProfile: (userData: Partial<User>): Promise<User> => {
    return api.put("/auth/profile", userData)
  },

  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<ResetPasswordResponse> => {
    return api.post("/auth/change-password", data)
  },
}
