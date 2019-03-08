const config = require("./config.js");

/* TODO: make more pretty default help */
const HELP_MSG =
  "You can ask me start the clock. Also you can manage time per player in game process.  What would you like to do?";

module.exports = {
  helpMsg(interactionStage) {
    switch (interactionStage) {
      case config.STAGES.INIT:
        return "For start the clock you need to ask me about it.";
      case config.STAGES.PREPARE:
        return `Before you start, you need to determine the number of players and their colors. Number of players up to ${
          config.MAX_PLAYERS_AMOUNT
        }.`;
      case config.STAGES.GAME:
        return 'For finish the game for current player, say "Finish" or "Ready" or "Complete". If you want to change player, say "Next" or "Switch player". For stop the clock say "Stop game clock"';
      case config.STAGES.PAUSE:
        return "Time has been suspended. Ask me to continue when you are ready!";
      case config.STAGES.CLOSE:
        return 'You can restart clock for that you should to say "Restart" or "Init". If you want to exit, say "Exit" or "Close". For repeating result say "Result" or "Call time';
      default:
        return HELP_MSG;
    }
  },

  nextPlayer(stepPlayer, players) {
    const _stepPlayer = parseInt(stepPlayer);
    /** sort players by number and activity */
    const _activePlayersNumbers = Object.keys(players)
      .filter(function(playerNum) {
        return players[playerNum].active;
      })
      .map(function(numStr) {
        return parseInt(numStr);
      })
      .sort();

    const stepPlayerIdx = _activePlayersNumbers.indexOf(_stepPlayer);
    const nextPlayerNum =
      stepPlayerIdx === _activePlayersNumbers.length - 1
        ? _activePlayersNumbers[0]
        : _activePlayersNumbers[stepPlayerIdx + 1];
    return nextPlayerNum;
  },

  humanTime(timeMS) {
    let s = Math.round(timeMS / 1000.0);
    let m = (s - (s % 60)) / 60;
    let h = (m - (m % 60)) / 60;
    s = s % 60;
    m = m % 60;

    let rslt = [];

    if (s > 0) rslt.push(`${s} seconds`);
    if (m > 0) rslt.push(`${m} minutes`);
    if (h > 0) rslt.push(`${h} hours`);

    switch (rslt.length) {
      case 1:
        return rslt[0];
      case 2:
        return `${rslt[1]} and ${rslt[0]}`;
      case 3:
        return `${rslt[2]}, ${rslt[1]} and ${rslt[0]}`;
      default:
        return "0 seconds";
    }
  },

  playersStats(players) {
    let text = "";

    Object.keys(players)
      .map(function(playerNum) {
        const player = players[playerNum];
        player.humanTime = module.exports.humanTime(player.time);
        return player;
      })
      .sort(function(prev, next) {
        return prev.time > next.time;
      })
      .forEach(function(player) {
        text += `. ${player.color} player's time: ${player.humanTime}`;
      });

    return text;
  },

  defaultState() {
    return {
      players: {
        /*
          playerNumber: {
            color,
            active: false,
            time
          }
        */
      },
      playersAmount: 0,
      playersLimit: config.MAX_PLAYERS_AMOUNT,
      stage: config.STAGES.INIT,
      stepTime: null,
      stepPlayer: null,
      totalTime: 0
    };
  }
};
