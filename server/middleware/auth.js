const jwt = require('jsonwebtoken');
const db = require('../data/database_connection');

const isAuthenticated = async (req, res, next) => {
    try {
      console.log('isAuthenticated middleware spustený');
      
      const authHeader = req.headers.authorization;

      console.log(authHeader);
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Potrebná autentifikácia' });
      }
      
      const token = authHeader.split(' ')[1];
      
      const decoded = jwt.verify(token, "tajnyKluc");
      console.log('JWT overenie úspešné:', decoded);
      
      const query = "SELECT users.*, members.isAdmin FROM users LEFT JOIN members ON users.userId = members.userId WHERE users.userId = ?";
      console.log('Chystá sa vykonať query:', query, 's userId:', decoded.userId);
      
      const [results] = await db.query(query, [decoded.userId]);
      console.log('Query výsledky:', results);
      
      if (results.length === 0) {
        console.log('Nenašiel sa žiadny používateľ s týmto ID');
        return res.status(401).json({ message: 'Používateľ sa nenašiel' });
      }
      
      console.log('Používateľ sa našiel, pokračuje sa k ďalšiemu middlewareu');

      req.user = results[0];
      next();
      
    } catch (error) {
      console.error('Auth middleware chyba:', error);
      return res.status(401).json({ message: 'Neplatný token' });
    }
  };
  
const checkUserOwnership = (req, res, next) => {
  try {
    console.log('checkUserOwnership middleware called');
    
    const loggedInUserId = req.user.userId;
    
    const requestedUserId = req.params.userId;
    
    console.log(`Comparing logged in user ID ${loggedInUserId} with requested user ID ${requestedUserId}`);
    
    if (loggedInUserId.toString() !== requestedUserId.toString()) {
      console.log('User ownership check failed');
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only modify your own profile"
      });
    }
    
    console.log('User ownership check passed');
    next();
  } catch (error) {
    console.error('User ownership check error:', error);
    return res.status(500).json({ message: 'Error checking user permission' });
  }
};

const isMember = (req, res, next) => {
    console.log('isMember middleware called');
    if (!req.user) {
      console.log('No req.user found');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log('User data:', req.user);
    if (!req.user.isMember) {
      console.log("User is not a member. isMember value:", req.user.isMember);
      return res.status(403).json({ message: 'Membership required for this resource' });
    }
    
    console.log('User is a member, proceeding to next middleware');
    next();
  };

  const isAdmin = (req, res, next) => {
    console.log('isAdmin middleware called');
    if (!req.user) {
      console.log('No req.user found');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log('User data:', req.user);
    if (!req.user.isAdmin) {
      console.log("User is not a admin. isAdmin value:", req.user.isAdmin);
      return res.status(403).json({ message: 'Admin required for this resource' });
    }
    
    console.log('User is a admin, proceeding to next middleware');
    next();
  };

module.exports = { isAuthenticated,checkUserOwnership, isMember, isAdmin };