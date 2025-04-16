import Rollbar from 'rollbar';

export const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: process.env.DEPLOYMENT_ENVIRONMENT,
  captureUncaught: true,
  captureUnhandledRejections: true,
  autoInstrument: {
    log: false,
    network: false,
    dom: false,
    navigation: false,
  }
});