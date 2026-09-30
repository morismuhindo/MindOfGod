const router = require('express').Router();
const {registerUser, loginUser, resetPassword,forgotPassword, changePassword, myProfile, getAllUsers} = require('../controllers/User');
const {verifyToken, authorizeRoles} = require('../middlewares/authentication');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', verifyToken, authorizeRoles("admin"),changePassword);
router.get('/my-profile', verifyToken, authorizeRoles("user"), myProfile);
router.get('/all-users', verifyToken, authorizeRoles("admin"),getAllUsers);


module.exports = router;
