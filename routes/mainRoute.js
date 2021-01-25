const express = require('express');

const router = express.Router();
const passport = require('passport');
const mainController = require('../controllers/mainController');

const authentication = passport.authenticate('jwt', { session: false });

router.get('/', authentication, mainController.GET_MAIN_PAGE);

router.get('/users', authentication, mainController.GET_ALL_USERS);

router.get('/profile', authentication, mainController.GET_CURRENT_USER);

router.get('/friends', authentication, mainController.GET_CURRENT_USER_FRIENDS);

router.get('/user/:id', authentication, mainController.GET_USER);

router.get('/posts/:id', authentication, mainController.GET_POST);

router.post('/search', authentication, mainController.POST_SEARCH);

router.post('/:id/like', authentication, mainController.POST_LIKE);

router.post(
  '/:id/friendReq',
  authentication,
  mainController.POST_FRIEND_REQUEST
);

router.post(
  '/:id/addFriend',
  authentication,
  mainController.POST_ACCEPT_FRIEND
);
router.delete(
  '/:id/deleteFriend',
  authentication,
  mainController.DELETE_FRIEND
);

router.delete(
  '/:id/deleteRequest',
  authentication,
  mainController.DELETE_REQUEST
);

router.post(
  '/posts/:id/addComment',
  authentication,
  mainController.POST_COMMENT
);

router.post('/comment/:id', authentication, mainController.POST_COMMENT_LIKE);

router.post('/create', authentication, mainController.POST_POST);

router.delete('/comment/:id', authentication, mainController.DELETE_COMMENT);

module.exports = router;
