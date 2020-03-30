const express = require("express");
const router = express.Router();
const config = require("../config");
const telnyx = require("telnyx")(config.telnyx_api_key);
const { start, close } = require("../game/game");

/* POST admin-webhook.
- Parse text from messages
- start <phrase> will start a new game with the given <phrase>
- close will close the current active game
*/
router.post("/", function(req, res, next) {
  // This is important because we receive webhook everytime we also emit a message from that number
  if (req.body.data.event_type === "message.received") {
    let phoneNumber = req.body.data.payload.from.phone_number;
    let text = req.body.data.payload.text;
    let instruction = parseInstruction(text);
    if (instruction.action === "start") {
      let phrase = instruction.phrase.join(" ");
      if (start(phrase) === true) {
        telnyx.messages.create(
          {
            from: config.game_number,
            to: phoneNumber,
            text: `New puzzle has been created with the solution: '${phrase}'`
          },
          function(err, response) {}
        );
      } else {
        telnyx.messages.create(
          {
            from: config.game_number,
            to: phoneNumber,
            text: `A puzzle is already running, please close it before starting a new one`
          },
          function(err, response) {}
        );
      }
    } else if (instruction.action === "close") {
      close();
      telnyx.messages.create(
        {
          from: config.game_number,
          to: phoneNumber,
          text: `Game has been closed`
        },
        function(err, response) {}
      );
    } else {
      telnyx.messages.create(
        {
          from: config.game_number,
          to: phoneNumber,
          text: `Unknown Command, please use: close to close a puzzle or 'start phrase you want to guess' to start a new puzzle`
        },
        function(err, response) {}
      );
    }
  }

  res.send("Respond to webhook");
});

let parseInstruction = text => {
  let instruction = {};
  let splitted_text = text.toLowerCase().split(" ");

  if (splitted_text[0] === "start") {
    instruction.action = "start";
    instruction.phrase = splitted_text.splice(1);
  } else if (splitted_text[0] === "close") {
    instruction.action = "close";
  } else {
    instruction.action = "undefined";
  }

  return instruction;
};

module.exports = router;
