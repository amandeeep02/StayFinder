
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
    type User, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut,
    onAuthStateChanged 
} from "firebase/auth";
import { auth } from "../config/firebase";
import { api } from "../utils/api";

interface AuthContextType {
    currentUser: User | null;
    authUser: any;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authUser, setAuthUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
        // Get Firebase token and send to backend
        const token = await result.user.getIdToken();
        localStorage.setItem('firebaseToken', token);
        
        // Create/update user in backend
        try {
            const response = await api.post('/auth/firebase-login', {
                token,
                email: result.user.email,
                firstName: result.user.displayName?.split(' ')[0] || '',
                lastName: result.user.displayName?.split(' ')[1] || '',
            });
            
            localStorage.setItem('authToken', response.data.token);
            setAuthUser(response.data.user);
        } catch (error) {
            console.error('Backend auth failed:', error);
        }
    };

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem('firebaseToken');
        localStorage.removeItem('authToken');
        setAuthUser(null);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if (user) {
                // Check if user exists in backend
                const token = localStorage.getItem('authToken');
                if (token) {
                    try {
                        const response = await api.get('/auth/current-user');
                        setAuthUser(response.data);
                    } catch (error) {
                        console.error('Failed to get user from backend:', error);
                    }
                }
            } else {
                setAuthUser(null);
            }
            
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        authUser,
        loading,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};