const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');

const router = express.Router();

router.route('/signup').post(
    [
        body('name').not().isEmpty().withMessage('Please Enter Your Name'),
        body('email').isEmail().withMessage('Please Enter Valid Email')
        .custom((userEmail)=> {
            return User.findOne({email:userEmail}).then(user => {
                if (user) {
                    return Promise.reject('Email is already exists!')
                }
            })
        }),

        body('password').not().isEmpty().withMessage('Please Enter A Password'),
    ], 
    authController.createUser);
router.route('/login').post(authController.loginUser);
router.route('/logout').get(authController.logoutUser);
router.route('/create').get(authController.getCreatePage);
router.route('/create').post(authController.createTask);
router.route('/read').get(authMiddleware, authController.readTasks);
router.route('/read/:id').get(authMiddleware, authController.getSingleTask);
router.route('/read/:id').delete(authMiddleware, authController.deleteTask);
router.route('/read/filter/:slug').get(authMiddleware, authController.filterTasks);

module.exports = router;