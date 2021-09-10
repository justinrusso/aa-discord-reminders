const Conf = require("conf");
const path = require("path");

const configPath = path.join(process.cwd(), "configs");

const alarmsTypeSchema = {
  type: "array",
  contains: {
    type: "object",
    properties: {
      hour: {
        type: "number",
      },
      minute: {
        type: "number",
      },
      title: {
        type: "string",
      },
    },
  },
};

const config = new Conf({
  configName: "config",
  cwd: configPath,
  schema: {
    alarms: {
      type: "object",
      properties: {
        break: alarmsTypeSchema,
        checkin: alarmsTypeSchema,
        report: alarmsTypeSchema,
      },
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
          breakReminders: {
            type: "boolean",
          },
          checkinReminders: {
            type: "boolean",
          },
          reportReminders: {
            type: "boolean",
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
