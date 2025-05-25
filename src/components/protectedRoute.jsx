import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requiredRole = "authenticated" }) => {
  const { user, isLoading } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const params = useParams();
  
  const isOwner = params.userId && user && user.userId === params.userId;
  

  useEffect(() => {
    const checkUserRoles = async () => {
      if (!user || !user.token) {
        setIsChecking(false);
        return;
      }
      
      if (requiredRole === "member" || requiredRole === "admin" || requiredRole === "owner-or-member") {
        try {
          const response = await fetch('http://localhost:5001/api/members', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          
          setIsMember(response.ok);
          
          if (requiredRole === "admin") {
            const adminResponse = await fetch('http://localhost:5001/api/admin', {
              headers: {
                'Authorization': `Bearer ${user.token}`
              }
            });
            setIsAdmin(adminResponse.ok);
          }
        } catch (error) {
          console.error('Error checking user roles:', error);
          setIsMember(false);
          setIsAdmin(false);
        }
      }
      
      setIsChecking(false);
    };
    
    checkUserRoles();
  }, [user, requiredRole, params.userId]);

  if (isLoading || isChecking) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (requiredRole === "member" && !user.isMember) {
    return <div>Potrebuješ byť členom aby si videl tuto stranku.</div>;
  }

  if (requiredRole === "admin" && !user.isAdmin) {
    return <div>Potrebuješ byť adminom aby si videl tuto stranku.</div>;
  }
  
  if (requiredRole === "owner-or-member" && !user.isMember && !isOwner) {
    return <div>Túto stránku môžu vidieť iba členovia alebo vlastník profilu.</div>;
  }

  if (requiredRole === "owner" && !isOwner) {
    return <div>Túto stránku môže vidieť iba vlastník profilu.</div>;
  }

  return children;
};

export default ProtectedRoute;