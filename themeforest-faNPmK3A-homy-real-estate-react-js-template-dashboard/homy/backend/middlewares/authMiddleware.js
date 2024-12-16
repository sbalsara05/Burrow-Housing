const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];
   console.log("Here is the token "+token);

   if (!token) return res.status(401).json({ message: 'Access token missing' });

   jwt.verify(token,'stonepaperscissors', (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user; // Attach decoded user info to request
      next();
   });
};

module.exports = { authenticateToken };
