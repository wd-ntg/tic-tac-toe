import * as express from "express";

const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Hello Boy!!");
});

router.get('/test', (req, res) => {
  res.send('Listen test!');
});

module.exports = router;