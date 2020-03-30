var cache = require("./cache");
var config = require("../config")
const db = require("../database");

class Game {
  constructor(phrase) {
    this.puzzleNumber = config.game_number;
    this.phrase = phrase;
    this.round = 0
    this.sequence = [];
    // Object with alias: phone_num
    this.winners = []
    // To use for the end game calculation i.e. >80% revealed
    this.totalLength = phrase.replace(/\s+/g, '').length;
    // Obj of indexes that are have been revealed
    this.picked = {}
    // Number:Alias
    this.currentRoundGuesses = {}

    this.findSpaces()

    this.revealLetter()

    this.createSeqeunce()
  }

  findSpaces() {
    for(let i = 0; i < this.phrase.length; i++) {
      if(this.phrase[i] === " ") {
        this.picked[i] = true
      }
    }
  }

  revealLetter(){
    this.round += 1
    let picked = -1

    while(true) {
      if(this.round > (this.totalLength * 0.8)) {
        break
      }
      // Random number from 0 to length of phrase
      const pick = Math.floor(Math.random() * this.phrase.length)

      // Ensure the letter hasn't already been picked
      if (pick in this.picked) {
        continue
      }

      // Save the pick in the history
      this.picked[pick] = true
      picked = pick
      break
    }

    if (picked < 0) {
      // This reveal resulted in more than 80% of letters being revealed
      return false
    }
    return true
  }

  createSeqeunce() {
    let phrase = ""
    for(let i = 0; i < this.phrase.length; i++) {
      if(i in this.picked) {
        phrase += this.phrase[i]
      } else {
        phrase += "-"
      }
    }
    let array = phrase.split(" ")

    let resp = []

    for(let i = 0; i < array.length; i++) {
      resp.push(array[i].split(""))
    }

    return resp

  }

  checkWinner(phoneNumber, guess) {
    if (guess.toLowerCase() === this.phrase) {
      // Get the user info from the DB and update the points for the user
      // Add the alias and phone number to this.winners
      let points = 10 - this.winners.length

      if (points < 1) {
        points = 1
      }
      // const updatePoints = `UPDATE users SET points = ? WHERE (phone_number = ?)`

      this.winners.push({phoneNumber: phoneNumber})
      console.log(this.winners)
      return true
      }

    this.currentRoundGuesses[phoneNumber] = true
    return false
  }

  nextLetter() {
    // Uncover the next letter. If this results in more than 80% of the letters being revealed,
    // then close the game and return the full phrase
    // Reset the current round guesses
    this.currentRoundGuesses = {}
    if(this.revealLetter() === false) {
      close()
      let resp = this.phrase.split(" ")
      let final = []

      for (let i = 0; i < resp.length; i++) {
        final.push(resp[i].split(""))
      }
      return final

    }
    return this.createSeqeunce()
  }

  checkCanGuess(phoneNumber) {
    if (phoneNumber in this.currentRoundGuesses) {
      return false
    }
    return true
  }

  isPhoneNumberWinner(phoneNumber) {
    console.log(this.winners)
    if (
      this.winners.find(winner => winner.phoneNumber === phoneNumber) !== undefined
    ) {
      return true
    }
    return false
  }
}


function start(phrase) {
  let currentGame = cache.get("currentGame");
  if (currentGame !== undefined) {
    return false;
  } else {
    let newGame = new Game(phrase);
    cache.set("currentGame", newGame);
    return true;
  }
}

function close() {
  /*
    Close the current game if it exists.
    If exists, grab the first winner and save to DB
  */
  const game = cache.get("currentGame")

  if(game === undefined) {
    return true
  }

  if(game.winners.length > 0) {
    // TODO: Work on implementing logic to save winners to the DB for future games

    // const winner = game.winners[0]
    // const phrase = game.phrase
    // const insertWinner = ("INSERT INTO winners (phrase, alias, phone_number, created_at) VALUES (?, ?, ?, ?)")
    // let createdAt = new Date().toISOString();
    // let paramsInsertNewWinner = [phrase, winner.alias, winner.phoneNumber, createdAt]
    // db.run(insertWinner, paramsInsertNewWinner, function(err) {
    //   if (err) {
    //     console.log({ error: err.message });
    //     cache.del("currentGame");
    //     return;
    //   }
    //}
    cache.del("currentGame");
    return true
  }


  cache.del("currentGame");
  return true;
}


var game = {
  Game,
  start,
  close,
};

module.exports = game;
