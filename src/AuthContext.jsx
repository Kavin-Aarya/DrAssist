import React, { createContext, useState, useEffect, useContext } from 'react';
import Alert from "./alert";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  useEffect(() => {
    // On load, check localStorage for existing user data
    const savedUser = localStorage.getItem("user_info");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const updateUserInfo = (newData) => {
    const updatedUser = { ...user, ...newData }; 
    setUser(updatedUser);
    localStorage.setItem("user_info", JSON.stringify(updatedUser));
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user_info", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:5001/user/logout", {method: "POST" , headers: 
        {
        "Content-Type": "application/json",
        // Send the token so the backend can verify who is logging out if needed
        "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      })
    } catch (err) {
      console.error("Backend logout failed:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user_info");
      localStorage.removeItem("token");
      
    }
    showAlert('success', 'Logout Successful!');
    window.location.href = "/";
    
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);