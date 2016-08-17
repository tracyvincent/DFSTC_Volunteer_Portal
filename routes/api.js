const router = require('express').Router();
const path = require('path');

router.get('/checkAuth', function(request, response) {
  if (request.isAuthenticated()) {
    response.send(request.user);
    return;
  }
  response.sendStatus(200);
})

module.exports = router;
