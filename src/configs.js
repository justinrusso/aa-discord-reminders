const Conf = require("conf");
const path = require("path");

const configPath = path.join(process.cwd(), "configs");

const config = new Conf({
  configName: "config",
  cwd: configPath,
  schema: {
    alarms: {
      type: "array",
    },
    holidays: {
      type: "array",
    },
  },
});

const db = new Conf({
  configName: "db",
  cwd: configPath,
  schema: {
    alertChannels: {
      type: "array",
      contains: {
        type: "object",
        properties: {
          channelId: {
            type: "string",
          },
          guildId: {
            type: "string",
          },
        },
      },
    },
  },
});

const secret = new Conf({
  configName: "secret",
  cwd: configPath,
  schema: {
    loginToken: {
      type: "string",
    },
  },
});

module.exports = {
  config,
  db,
  secret,
};
