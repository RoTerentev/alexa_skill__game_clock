### There is draft example of Amazon Alexa's skill

Code not for production stage (refactoring required) :-)
Just attempt to show basic interaction with Alexa

#### Purpose

Accounting for playing time for each player

#### Rules

Each player is named color (up to 8 players).
The task of the skill is to take into account how much time the players have spent in total on their moves.

#### Algorithm (very rough)

##### 0. Init

Prepare state (saved in `handlerInput.attributesManager.getSessionAttributes()` )

##### 1. Prepare

| side    | intent      | slots           | description                    |
| ------- | ----------- | --------------- | ------------------------------ |
| user >  | ClockLaunch |                 | Launch game clock              |
| < alexa |             |                 | ask amount of players, max = 8 |
| user >  |             | {playersAmount} | tell players amount            |
| < alexa |             |                 | ask color for each player      |
| user >  |             | {playerColor}   | tell gemer's color             |
| < ...   |
| ... >   |
| < alexa |             |                 | ok, start the game             |

##### 2. Game

| side    | intent         | slots                    | description                                           |
| ------- | -------------- | ------------------------ | ----------------------------------------------------- |
| user >  | PlayerSwitch   |                          | trannsition to another player                         |
| < alexa |                |                          | 'plays {playerColor}'                                 |
| ... >   |
| < ...   |
| ... >   |
| user >  | PlayersPause   | {playerColor} from state | pause game time counter for this player step          |
| < alexa |                |                          | ok, ask me to continue when will be ready             |
| user >  | PlayerContinue | {playerColor} from state | resume game time counter for this player step         |
| < alexa |                |                          | {playerColor} continue the game                       |
| < ...   |
| ... >   |
| user >  | PlayerFinish   |                          | player finish game                                    |
| < alexa |                |                          | 'congragulation player {playerColor}, next player'    |
| ... >   |
| < ...   |
| user >  | PlayerFinish   | {playerColor}            | when last player finish game                          |
| < alexa |                |                          | ok, total time {totalTime}, players time is ... (ASC) |
| < alexa |                |                          | repeat results? restart game? exit?                   |

##### 3. Close

| side    | intent            | slots | description            |
| ------- | ----------------- | ----- | ---------------------- |
| user >  | Result            |       | get stats              |
| user >  | Relaunch          |       | start new game         |
| user >  | AMAZON.StopIntent |       | close skill            |
| < alexa |                   |       | bye, see you next time |

##### Reproduction

1. Open your **Alexa Developer Console**
1. Choose _**JSON Editor**_ (look up in sidebar) > copy content of **interactionModel.json** and paste it here > _**Save Model**_ > _**Build Model**_
1. _**Endpoint**_ > check **AWS Lambda ARN** > save
1. Choose _**Code**_ tab (in top bar) > copy contents of **lambda/** directory to **Skill Code/lambda** > **Save** > **Deploy**
1. Open _**Test**_ tab > test interaction (you can find neccessary phrases for each intent in **interactionModel.json** samples)
