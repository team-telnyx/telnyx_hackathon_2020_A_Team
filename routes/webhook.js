const express = require("express");
const db = require("../database");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals
} = require("unique-names-generator");
const router = express.Router();
const config = require("../config");
const telnyx = require("telnyx")(config.telnyx_api_key);
const cache = require("../game/cache");

/* POST webhook.
- Receives webhooks related to TF_PHONE_NUMBER
- Maybe create a new entry in the DB for the from phone number
- Return the auto generated alias via SMS to the from phone_number
*/
router.post("/", function(req, res, next) {
  // This is important because we receive webhook everytime we also emit a message from that number
  if (req.body.data.event_type === "message.received") {
    let phoneNumber = req.body.data.payload.from.phone_number;
    maybeCreateUser(phoneNumber);

    let currentGame = cache.get("currentGame");

    if (currentGame !== undefined) {

      if (currentGame.isPhoneNumberWinner(phoneNumber)) {
        telnyx.messages.create(
          {
            from: config.game_number,
            to: phoneNumber,
            text: `You've already won! Congrats, wait for the next game to play again!`
          },
          function(err, response) {}
        );
        res.send("Respond to webhook");
        return
      }

      if (!currentGame.checkCanGuess(phoneNumber)) {
        telnyx.messages.create(
          {
            from: config.game_number,
            to: phoneNumber,
            text: `You've already guessed this round. Wait for the next round to guess again.`
          },
          function(err, response) {}
        );
        res.send("Respond to webhook");
        return
      } else {
        let inputText = req.body.data.payload.text.toLowerCase();
        if (currentGame.checkWinner(phoneNumber, inputText)) {
          telnyx.messages.create(
            {
              from: config.game_number,
              to: phoneNumber,
              text: `Congratulations! You guessed correctly!!`
            },
            function(err, response) {}
          );
          cache.set("currentGame", currentGame);
          res.send("Respond to webhook");
          return
        } else {
          telnyx.messages.create(
            {
              from: config.game_number,
              to: phoneNumber,
              text: `I'm sorry that's incorrect! You can try again next round.`
            },
            function(err, response) {}
          );
          cache.set("currentGame", currentGame);
          res.send("Respond to webhook");
          return
        }
      }
    } else {
      telnyx.messages.create(
        {
          from: config.game_number,
          to: phoneNumber,
          text: `Please wait for a new game to start!`
        },
        function(err, response) {}
      );
      res.send("Respond to webhook");
    };
  }
})


function maybeCreateUser(phoneNumber) {
  let getUserWithPhoneNumber = "SELECT * FROM users WHERE phone_number = ?";
  let paramsUserWithPhoneNumber = [phoneNumber];
  db.get(
    getUserWithPhoneNumber,
    paramsUserWithPhoneNumber,
    (err, maybeUser) => {
      if (err) {
        console.log({ error: err.message });
        return
      }
      if (maybeUser !== undefined) {
        return maybeUser
      } else {
        let newAlias = uniqueNamesGenerator({
          dictionaries: [adjectives, colors, animals],
          separator: "-"
        });
        console.log(newAlias);
        let insertNewUser =
          "INSERT INTO users (phone_number, alias, created_at, points) VALUES (?,?,?,?)";
        let createdAt = new Date().toISOString();
        let paramsInsertNewUser = [phoneNumber, newAlias, createdAt, 0];
        db.run(insertNewUser, paramsInsertNewUser, function(err, result) {
          if (err) {
            console.log({ error: err.message });
            return;
          }
          telnyx.messages.create(
            {
              from: config.game_number, // Your Telnyx number
              to: phoneNumber,
              text: `Hello, new player ! Here is your alias: ${newAlias}`
            },
            function(err, response) {}
          );
        });
        return null
      }
    }
  );
}

module.exports = router;
