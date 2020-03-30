var express = require("express");
var router = express.Router();
var cache = require("../game/cache");

const cors = require('cors')


/* Umlock a new letter in the puzzle. */
router.post("/letter", cors(), function(req, res, next) {
    const game = cache.get("currentGame")

    if(game === undefined) {
        res.send({status: 400, message: "No active game"})
        return
    }

    // Get the next letter in the game
    const phrase = game.nextLetter()

    // Game has updated so the cache needs to be updated as well
    cache.set("currentGame", game);

    res.json({phrase: phrase});
});


router.get("/meta", cors(),  function(req, res, next) {
    let resp = {}

    const game = cache.get("currentGame")

    if(game === undefined) {
        resp.winners = []
        resp.gameActive = false
        resp.roundNumber = 0
        resp.number = ""
    } else {
        console.log(resp.winners)
        resp.winners = game.winners
        resp.gameActive = true
        resp.roundNumber = game.round
        resp.number = game.puzzleNumber
    }


    // TODO: Implement when a leaderboard is maintained
    // const selectLastWinner = "SELECT alias FROM winners ORDER BY id DESC LIMIT 1"
    // const selectLeaderboard = "SELECT alias, points FROM users WHERE points > 0 ORDER BY points DESC LIMIT 5"

    res.json(resp);


})

module.exports = router;
