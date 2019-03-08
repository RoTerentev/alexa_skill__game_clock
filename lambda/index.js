const Alexa = require("ask-sdk-core");
const Helpers = require("./helpers.js");
const config = require("./config.js");

/* INTENT HANDLERS */
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    /** TODO: move to some persistent storage, is temporary solution */
    attributes.state = Helpers.defaultState();

    return handlerInput.responseBuilder
      .speak(config.WELCOME_MSG)
      .reprompt(Helpers.helpMsg(attributes.state.stage))
      .getResponse();
  }
};

const ClockLaunchHandler = {
  canHandle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const req = handlerInput.requestEnvelope.request;
    return (
      req.type === "IntentRequest" &&
      state.stage === config.STAGES.INIT &&
      (req.intent.name === "ClockLaunch" ||
        req.intent.name === "AMAZON.ResumeIntent" ||
        req.intent.name === "AMAZON.YesIntent")
    );
  },
  handle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    state.stage = config.STAGES.PREPARE;

    return handlerInput.responseBuilder
      .speak(config.PREPARE_MSG)
      .reprompt(Helpers.helpMsg(state.stage))
      .getResponse();
  }
};

const PrepareHandler = {
  canHandle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const req = handlerInput.requestEnvelope.request;
    return (
      req.type === "IntentRequest" &&
      state.stage === config.STAGES.PREPARE &&
      req.intent.name === "Prepare"
    );
  },
  handle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const req = handlerInput.requestEnvelope.request;

    if (!state.playersAmount) {
      const pAmnt =
        req.intent.slots.playersAmount && req.intent.slots.playersAmount.value;

      if (isNaN(pAmnt)) {
        return handlerInput.responseBuilder
          .speak("I can't understand! Are you sure that it is a number?")
          .reprompt(Helpers.helpMsg(state.stage))
          .getResponse();
      }

      if (!pAmnt) {
        return handlerInput.responseBuilder
          .speak("What amount of players?")
          .reprompt(Helpers.helpMsg(state.stage))
          .getResponse();
      }

      if (pAmnt && (pAmnt > config.MAX_PLAYERS_AMOUNT || pAmnt < 0)) {
        return handlerInput.responseBuilder
          .speak(
            `The received amount is not allowed. Try again! Remember, amount shouldn't be more than ${
              config.MAX_PLAYERS_AMOUNT
            }, allowed.`
          )
          .reprompt("Tell me correct amount of players, please.")
          .getResponse();
      }

      state.playersAmount = 1 * pAmnt;
      return handlerInput.responseBuilder
        .speak("Great! Which color have player 1?")
        .reprompt("Tell me color for 1th player")
        .getResponse();
    }

    const currentAmnt = Object.keys(state.players).length;

    const pColor =
      req.intent.slots.playerColor && req.intent.slots.playerColor.value;

    if (!pColor) {
      return handlerInput.responseBuilder
        .speak(`What color for ${currentAmnt + 1}th player?`)
        .reprompt(`Tell me color for ${currentAmnt + 1}th player`)
        .getResponse();
    }

    if (!config.COLORS.includes(pColor)) {
      return handlerInput.responseBuilder
        .speak("I don't know this color, try another one")
        .reprompt(`Tell me color for ${currentAmnt + 1}th player`)
        .getResponse();
    }

    if (
      Object.values(state.players)
        .map(function(player) {
          return player.color;
        })
        .includes(pColor)
    ) {
      return handlerInput.responseBuilder
        .speak("This color is already taken, please select a free color!")
        .reprompt(`Tell me color for ${currentAmnt + 1}th player`)
        .getResponse();
    }

    state.players[currentAmnt + 1] = {
      active: true,
      time: 0,
      color: pColor
    };

    if (currentAmnt + 1 === state.playersAmount) {
      state.stage = config.STAGES.GAME;
      state.stepTime = Date.now();
      state.totalTime = state.stepTime;
      state.stepPlayer = 1;
      return handlerInput.responseBuilder
        .speak(
          `The game has begun! ${
            state.players[1].color
          } player, your time is going!`
        )
        .reprompt(Helpers.helpMsg(state.stage))
        .getResponse();
    }

    return handlerInput.responseBuilder
      .speak(`Ok. What color for ${currentAmnt + 2}th player?`)
      .reprompt(`Tell me color for ${currentAmnt + 2}th player`)
      .getResponse();
  }
};

const PlayerSwitchHandler = {
  canHandle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const req = handlerInput.requestEnvelope.request;
    return (
      req.type === "IntentRequest" &&
      state.stage === config.STAGES.GAME &&
      (req.intent.name === "PlayerSwitch" ||
        req.intent.name === "AMAZON.NextIntent")
    );
  },
  handle(handlerInput) {
    /** Transfer control to the next active player */
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const stepDuration = Date.now() - state.stepTime;
    const curPlayer = state.players[state.stepPlayer];
    curPlayer.time += stepDuration;

    state.stepPlayer = Helpers.nextPlayer(state.stepPlayer, state.players);
    state.stepTime = Date.now();

    return handlerInput.responseBuilder
      .speak(`${state.players[state.stepPlayer].color} player's move!`)
      .reprompt(Helpers.helpMsg(state.stage))
      .getResponse();
  }
};

const PlayerPauseHandler = {
  canHandle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const req = handlerInput.requestEnvelope.request;
    return (
      req.type === "IntentRequest" &&
      state.stage === config.STAGES.GAME &&
      (req.intent.name === "PlayerPause" ||
        req.intent.name === "AMAZON.PauseIntent")
    );
  },
  handle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const stepDuration = Date.now() - state.stepTime;
    const curPlayer = state.players[state.stepPlayer];
    curPlayer.time += stepDuration;

    state.stage = config.STAGES.PAUSE;

    return handlerInput.responseBuilder
      .speak("Time break! Ask me to continue when you are ready!")
      .reprompt(Helpers.helpMsg(state.stage))
      .getResponse();
  }
};

const PlayerContinueHandler = {
  canHandle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const req = handlerInput.requestEnvelope.request;
    return (
      req.type === "IntentRequest" &&
      state.stage === config.STAGES.PAUSE &&
      (req.intent.name === "PlayerContinue" ||
        req.intent.name === "AMAZON.ResumeIntent")
    );
  },
  handle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    state.stage = config.STAGES.GAME;
    state.stepTime = Date.now();

    return handlerInput.responseBuilder
      .speak(
        `Time break ended! ${
          state.players[state.stepPlayer].color
        } player's move!`
      )
      .reprompt(Helpers.helpMsg(state.stage))
      .getResponse();
  }
};

const PlayerFinishHandler = {
  canHandle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const req = handlerInput.requestEnvelope.request;
    return (
      req.type === "IntentRequest" &&
      state.stage === config.STAGES.GAME &&
      req.intent.name === "PlayerFinish"
    );
  },
  handle(handlerInput) {
    /** Transfer control to the next active player */
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const stepDuration = Date.now() - state.stepTime;
    const curPlayer = state.players[state.stepPlayer];
    curPlayer.time += stepDuration;
    curPlayer.active = false;

    state.playersAmount -= 1;

    if (state.playersAmount !== 1) {
      state.stepPlayer = Helpers.nextPlayer(state.stepPlayer, state.players);
      state.stepTime = Date.now();

      return handlerInput.responseBuilder
        .speak(
          `Congrats ${curPlayer.color} gamer! ${
            state.players[state.stepPlayer].color
          } player's move!`
        )
        .reprompt(Helpers.helpMsg(state.stage))
        .getResponse();
    }

    /** game over */
    state.stage = config.STAGES.CLOSE;

    state.totalTime = Date.now() - state.totalTime;
    const totalTimeHuman = Helpers.humanTime(state.totalTime);

    let speakMsg = `Well well! Your game time: ${totalTimeHuman}. `;
    speakMsg += `Statistics${Helpers.playersStats(
      state.players
    )}. What you want to do now?`;

    return handlerInput.responseBuilder
      .speak(speakMsg)
      .reprompt(Helpers.helpMsg(state.stage))
      .getResponse();
  }
};

const ResultHandler = {
  canHandle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const req = handlerInput.requestEnvelope.request;
    return (
      req.type === "IntentRequest" &&
      state.stage === config.STAGES.CLOSE &&
      (req.intent.name === "Result" ||
        req.intent.name === "AMAZON.RepeatIntent")
    );
  },
  handle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const totalTimeHuman = Helpers.humanTime(state.totalTime);
    let speakMsg = `Game time: ${totalTimeHuman}. `;
    speakMsg += `Statistics${Helpers.playersStats(
      state.players
    )}. What you want to do now?`;

    return handlerInput.responseBuilder
      .speak(speakMsg)
      .reprompt(Helpers.helpMsg(state.stage))
      .getResponse();
  }
};

const RelaunchHandler = {
  canHandle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    const req = handlerInput.requestEnvelope.request;
    return (
      req.type === "IntentRequest" &&
      state.stage === config.STAGES.CLOSE &&
      (req.intent.name === "Relaunch" || req.intent.name === "AMAZON.YesIntent")
    );
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.state = Helpers.defaultState();
    attributes.state.stage = config.STAGES.INIT;

    return handlerInput.responseBuilder
      .speak(config.PREPARE_MSG)
      .reprompt(Helpers.helpMsg(state.stage))
      .getResponse();
  }
};

const HelpHandler = {
  canHandle(handlerInput) {
    const req = handlerInput.requestEnvelope.request;
    return (
      req.type === "IntentRequest" && req.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    return handlerInput.responseBuilder
      .speak(Helpers.helpMsg(state.stage))
      .reprompt(Helpers.helpMsg(state.stage))
      .getResponse();
  }
};

const ExitHandler = {
  canHandle(handlerInput) {
    const req = handlerInput.requestEnvelope.request;
    const state = handlerInput.attributesManager.getSessionAttributes().state;
    return (
      req.type === "IntentRequest" &&
      (req.intent.name === "AMAZON.StopIntent" ||
        req.intent.name === "AMAZON.CancelIntent" ||
        (state.stage === config.STAGES.CLOSE &&
          req.intent.name === "AMAZON.NoIntent"))
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(config.EXIT_MSG).getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${JSON.stringify(error)}`);
    console.log(`Handler Input: ${JSON.stringify(handlerInput)}`);

    return handlerInput.responseBuilder
      .speak("Sorry, I couldn't understand what you said. Please try again.")
      .reprompt(Helpers.helpMsg(config.STAGES.INIT))
      .getResponse();
  }
};

/* LAMBDA EXPORT */
module.exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    ClockLaunchHandler,
    PrepareHandler,
    PlayerSwitchHandler,
    PlayerPauseHandler,
    PlayerContinueHandler,
    PlayerFinishHandler,
    ResultHandler,
    RelaunchHandler,
    HelpHandler,
    ExitHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
