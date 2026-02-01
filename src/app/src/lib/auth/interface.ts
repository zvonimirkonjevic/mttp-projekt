export interface LoginParams {
    email: string;
    password: string;
}

export interface AuthResult {
    success: boolean;
    error?: string;
    token?: string;
    user?: {
        email: string | undefined;
        full_name: string | undefined;
        first_name: string | undefined;
        last_name: string | undefined;
    };
}