import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    localStorage.removeItem('isMember');
    console.log('Po odhlásení localStorage:', {
      token: localStorage.getItem('authToken'),
      email: localStorage.getItem('userEmail'),
      isAdmin: localStorage.getItem('isAdmin'),
      userId: localStorage.getItem('userId'),
      isMember: localStorage.getItem('isMember')
    });
  }, []);

  const checkTokenValidity = useCallback(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return false;
    }
    
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; 
      
      if (decodedToken.exp < currentTime) {
        console.log('Token expiroval, odhlasovanie...');
        logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Neplatný token', error);
      logout();
      return false;
    }
  }, [logout]); 

  const login = useCallback(({ email, token, isAdmin, userId, isMember }) => {
    
    setUser({ email, token, isAdmin, userId, isMember });
   
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
    localStorage.setItem('userId', userId);
    localStorage.setItem('isMember', isMember ? 'true' : 'false');
  }, []);

  const isAuthenticated = useCallback(() => {
    
    if (!checkTokenValidity()) {
      return false;
    }
    
    const tokenInStorage = localStorage.getItem('authToken');
    return user !== null && tokenInStorage !== null;
  }, [checkTokenValidity, user]);

  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const isMember = localStorage.getItem('isMember') === 'true';

    if (token && userEmail) {
      
      if (checkTokenValidity()) {
        setUser({ email: userEmail, token, isAdmin, isMember, userId });
      } else {
        console.log('Token nie je platný pri inicializácii');
      }
    }
    setIsLoading(false);
  }, [checkTokenValidity]); 

  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        checkTokenValidity();
      }
    }, 60000); 
    
    return () => clearInterval(interval);
  }, [user, checkTokenValidity]); 

  const checkMember = useCallback(async () => {
    if (!user || !user.token) return false;
    try {
      const response = await fetch('http://localhost:5001/api/members', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Error checking member status:', error);
      return false;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkMember, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);