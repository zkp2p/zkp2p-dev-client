import Rollbar from 'rollbar';

export const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: "developer-production",
  captureUncaught: true,
  captureUnhandledRejections: true,
  autoInstrument: {
    log: false,
    network: false,
    dom: false,
    navigation: false,
  }
});