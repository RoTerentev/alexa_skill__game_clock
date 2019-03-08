module.exports = {
  WELCOME_MSG:
    "Welcome to the Game Clock! When you are ready, please ask me to start the clock.",
  PREPARE_MSG: "Let's start! First, tell me the number of players.",
  EXIT_MSG: "Thanks for the game! See you later, bye!",
  PAUSE_MSG_PREFIX: "Get pause for", // e.g:  get pause for {username}
  RESUME_MSG_POSTFIX: "continue !", // e.g: {username} continue!

  MAX_PLAYERS_AMOUNT: 8,

  COLORS: [
    "amaranth",
    "amber",
    "amethyst",
    "apricot",
    "aquamarine",
    "azure",
    "baby blue",
    "beige",
    "black",
    "blue",
    "blue green",
    "blue violet",
    "blush",
    "bronze",
    "brown",
    "burgundy",
    "byzantium",
    "carmine",
    "cerise",
    "cerulean",
    "champagne",
    "chartreuse green",
    "chocolate",
    "cobalt blue",
    "coffee",
    "copper",
    "coral",
    "crimson",
    "cyan",
    "desert sand",
    "electric blue",
    "emerald",
    "erin",
    "gold",
    "gray",
    "green",
    "harlequin",
    "indigo",
    "ivory",
    "jade",
    "jungle green",
    "lavender",
    "lemon",
    "lilac",
    "lime",
    "magenta",
    "magenta rose",
    "maroon",
    "mauve",
    "navy blue",
    "ocher",
    "olive",
    "orange",
    "orange red",
    "orchid",
    "peach",
    "pear",
    "periwinkle",
    "persian blue",
    "pink",
    "plum",
    "prussian blue",
    "puce",
    "purple",
    "raspberry",
    "red",
    "red violet",
    "rose",
    "ruby",
    "salmon",
    "sangria",
    "sapphire",
    "scarlet",
    "silver",
    "slate gray",
    "spring bud",
    "spring green",
    "tan",
    "taupe",
    "teal",
    "turquoise",
    "ultramarine",
    "violet",
    "viridian",
    "white",
    "yellow"
  ],

  /**
   * Main stages of skill workflow
   */
  STAGES: {
    INIT: 0,
    PREPARE: 5,
    GAME: 10,
    PAUSE: 11,
    CLOSE: 15
  }
};
