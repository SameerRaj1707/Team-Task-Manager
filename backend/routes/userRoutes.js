const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUsers, 
  getUser 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/').get(protect, getUsers);
router.route('/:id').get(protect, getUser);

module.exports = router;
