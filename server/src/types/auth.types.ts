export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
    accessToken: string;
    refreshToken: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface ResetPasswordData {
    token: string;
    password: string;
}
