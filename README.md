# Telnyx March 2020 Hackathon Project

## Requirements to Run:
1. [Telnyx Portal](portal.telnyx.com) Account
2. [ngrok](ngrok.com) downloaded and setup
3. [Game Front End](https://github.com/team-telnyx/wheel-of-fortune_front_end)
4. [node >12.1](https://nodejs.org/en/download/)

### The A Team
- [Badal Moradia](https://github.com/badal-moradia)
- [Enzo Piacenza](https://github.com/enzoqtvf)
- [Gero Stanchev](https://github.com/gesta)
- [Hugo Oliveira](https://github.com/hugobessaa)
- [Vlad Ionash](https://github.com/vionash)

**The A Team** project that's going to win the inaugural Telnyx hackathon 2020!

### Background

Telnyx held a 24hr internal hackathon competition and the winner was the team that created the most unique project using our own APIs and Products. Our team chose to make a game that was similar to the [Tossup Round in Wheel of Fortune](https://wheeloffortunehistory.fandom.com/wiki/Gameplay_elements#Toss-Ups).

A board that's shown to the players with a word or phrase, except all the characters are just blanks. Every 15 seconds, a letter is flipped and shown the players. The first player to guess the entire word/phrase wins.

> **Note** This project is not polished or finished. The core logic was created in 24 hours by the team members. A few things were adjusted and cleaned up in the docs, comments, and configurations to make it ok for open-source release, but the underlying logic was untouched. Feel free to play around and try to get the #TODOs implemented!

## How To Play:

1. An admin will start a new puzzle by texting `start {your phrase}` to your Telnyx number.
2. The game will start and the front-end will show the blank phrase on the game board.
3. Every 15 seconds, a new letter will automatically be uncovered (a single letter, so even if there are two a's only a single a would be uncovered)
4. Every letter uncovered is a new round. Each player gets one guess per round.
5. If a someone guesses correctly, the game does not end and their number will show up as a winner on the gameboard.
6. The game ends automatically when >80% of the letters are uncovered on the frontend.


> **Note** Depending on your account status and the number you choose to play with, there may be delays in sending out texts. Long code numbers (non-tollfree numbers in the US are rate limits to sending 1 message every 6 seconds.)


## Front-End Interaction:

The backend has 4 endpoints:

- Telnyx Webhooks (inbound messages) (POST /webhook)
i. Where inbound webhooks from players are received
- Telnyx admin Webhooks (admin) (POST /admin-webhook)
i. Where inbound webhooks from the admin are received.
- Uncover new letter (frontend) (POST /data/letter)
i.  The front-end also polls the `/data/letter` endpoint every 15 seconds to get a new letter.
- Polling endpoint (frontend) (GET /data/meta)
i. The front-end polls the `/data/meta` endpoint every second to get information about new winners and if the game has ended.



## Setup

Ensure you have ngrok up and running on your computer. Follow the istructions [here](https://ngrok.com/) to setup an ngrok tunnel to your localhost. Then use the url for your tunnel and set that as your webhook address for your Telnyx messaging profile via the [portal](portal.telnyx.com/messaging).


Before running the application you also need to update `config.js` with your Telnyx credentials in main directory that will contain the following:

```javascript
config.telnyx_api_key = "YOUR_TELNYX_V2_API_KEY";
config.phone_number = "YOUR_TELNYX_PHONE_NUMBER";
```


## Running

The backend is built using express.js. To start the server you can run:
```bash
npm start
```
Or use nodemon:
```bash
nodemon start
```

This will start the backend of the game. You will also need to run the [front-end](https://github.com/team-telnyx/wheel-of-fortune_front_end) to be able to play the game.


## Starting a Game

Once the backend and front-end are running, you're ready to start playing! Send a text message from any phone to the number you setup with the admin profile. Structure it like `start testing out the telnyx hackathon wheel of fortune game`. That'll start a new game with the phrase `testing out the telnyx hackathon wheel of fortune game`.

> **Note**: Purchasing two numbers is technically optional and you can just modify the /admin-webhook endpoint and manually post the data there with curl or postman or an equivalent method. This will trigger a new game to start. You will need at least one phone number to play the game as it's currently setup.
