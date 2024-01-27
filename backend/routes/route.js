const express=require('express');
const { createRole, getAllRoles, signupUser, signinUser, getUser, createCommunity, getAllCommunity, addMember, deleteMember } = require('../controllers/controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router=express.Router();

router.post('/role',createRole);  // Role is assigned to a person who is a member of the community.
router.get('/role',getAllRoles); //List all the data with pagination.
router.post('/auth/signup',signupUser);  // Create a user
router.post('/auth/signin',signinUser);  // login user
router.get('/auth/me',authMiddleware,getUser);  // Should return the details on the currently signed in user, using the access token.
router.post('/community',authMiddleware,createCommunity);  // Create a community
router.get('/community',getAllCommunity);  //List all the data with pagination.
router.post('/member',authMiddleware,addMember);  //Add a member in the community
router.delete('/member/:id',authMiddleware,deleteMember); // Remove the user from the community

module.exports=router;