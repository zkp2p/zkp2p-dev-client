const funnyProofGenerationMessages = [
  "🔐 Your secrets are safe with us... we literally can't read them even if we wanted to!",
  "🧙‍♂️ Doing some mathematical magic... don't worry, no rabbits were harmed",
  "🤫 Shhh... your payment is going incognito mode",
  "🎭 Making your transaction so private, even your wallet needs clearance to see it",
  "🌟 Sprinkling some zero-knowledge fairy dust on your transaction",
  "🎪 Welcome to the crypto circus, where your privacy is the main act!",
  "🕵️‍♂️ Mission Impossible: Making your payment invisible to everyone (except you)",
  "🎲 Rolling the crypto dice... just kidding, this is actually super secure",
  "🎩 Abracadabra! Your payment is now you-know-what (but we don't-know-what)",
  "🚀 Launching your transaction into the privacy stratosphere",
  "🎮 Loading privacy level: MAXIMUM",
  "🌈 Making your transaction disappear like a rainbow ninja",
  "🧪 Mixing some cryptographic potions for extra privacy",
  "🎭 Putting on the mask of anonymity (very fashionable this season)",
  "🎪 Step right up to the greatest privacy show on Earth!",
];

export const getRandomFunnyMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * funnyProofGenerationMessages.length);
  return funnyProofGenerationMessages[randomIndex];
};

export const getAllFunnyMessages = (): string[] => {
  return funnyProofGenerationMessages;
};


const funnyRestrictionsMessages = [
  "Make You a Sandwich",
  "Play Your Favorite Music",
  "Change Your Desktop Wallpaper",
  "Send You Daily Jokes",
  "Order Your Coffee",
  "Organize Your To-Do List",
  "Suggest Movie Nights",
  "Track Your Step Count",
  "Schedule Your Naps",
  "Decorate Virtual Office Space",
  "Send Motivational Quotes",
  "Plan Your Weekend Activities",
  "Manage Your Grocery List"
];

export const getRandomFunnyRestrictionsMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * funnyRestrictionsMessages.length);
  return funnyRestrictionsMessages[randomIndex];
};

export const getAllFunnyRestrictionsMessages = (): string[] => {
  return funnyRestrictionsMessages;
};


