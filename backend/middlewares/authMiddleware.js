const jwt=require('jsonwebtoken');

const authMiddleware=(req,res,next)=>{
  try {
      const token=req.header('Authorization');

      if(!token) return res.status(401).json({error:"Unauthorized user"})

      const user=jwt.verify(token.split(' ')[1],process.env.JWT_SECRET_KEY);
      
      req.userId= user.userId;

      next();
  } catch (error) {
    return res.status(401).json({error:"Unauthorized user"})
  }
}


module.exports = authMiddleware;