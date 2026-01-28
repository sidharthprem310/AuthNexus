import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accessToken) {
            try {
                const decoded = jwtDecode(accessToken);
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser({ id: decoded.sub, ...decoded });
                    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                }
            } catch (e) {
                logout();
            }
        }
        setLoading(false);
    }, [accessToken]);

    const login = (token) => {
        localStorage.setItem('access_token', token);
        setAccessToken(token);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setAccessToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
