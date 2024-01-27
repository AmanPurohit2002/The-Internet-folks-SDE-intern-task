const express=require('express');
const { createRole, getAllRoles, signupUser, signinUser, getUser } = require('../controllers/controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router=express.Router();

router.post('/role',createRole);  // Role is assigned to a person who is a member of the community.
router.get('/role',getAllRoles); //List all the data with pagination.
router.post('/auth/signup',signupUser);  // Create a user
router.post('/auth/signin',signinUser);  // login user
router.get('/auth/me',authMiddleware,getUser);  // Should return the details on the currently signed in user, using the access token.


module.exports=router;