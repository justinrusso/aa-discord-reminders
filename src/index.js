const { Client, Intents, GuildChannel, ThreadChannel } = require("discord.js");

const { config, db, secret } = require("./configs");
const { isHoliday, isWeekend } = require("./utils/date");
const { capitalize } = require("./utils/string");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// https://discord.com/api/oauth2/authorize?client_id=879881286460784690&permissions=134144&scope=bot

let previousDay = new Date().getDay();

const alarmStatus = {
  break: {
    lunch: false,
    afternoon: false,
  },
  checkin: {
    morning: false,
    lunch: false,
    afternoon: false,
  },
  report: {
    report: false,
  },
};

function resetAlarms() {
  for (const key in alarmStatus) {
    for (const subKey in alarmStatus[key]) {
      alarmStatus[key][subKey] = false;
    }
  }
}

/**
 *
 * @param {Date} date
 * @returns {{title: string, type: string}} The title and type of reminder
 */
function getReminder(date) {
  if (isWeekend(date) || isHoliday(config, date)) {
    return;
  }

  const reminders = config.get("reminders");
  for (const reminderType in reminders) {
    for (let i = 0; i < reminders[reminderType].length; i++) {
      const reminderData = reminders[reminderType][i];

      if (
        date.getHours() === reminderData.hour &&
        date.getMinutes() === reminderData.minute &&
        alarmStatus[reminderType][reminderData.title] === false
      ) {
        return {
          title: reminderData.title,
          type: reminderType,
        };
      }
    }
  }
}

/**
 *
 * @param {sting} title
 * @param {sting} type
 * @returns {string}
 */
function generateReminderMessage(title, type) {
  switch (type) {
    case "break": {
      const breakPeriod =
        title === "lunch" ? "1 hour and 15 minute" : "15 minute";
      return `Your ${breakPeriod} ${title} break has started.`;
    }
    case "checkin":
      return `${capitalize(title)} check-in reminder!`;
    case "report":
      return "Remember to fill out your daily report!";
    default:
      console.error("Unsupported reminder data type:", type);
  }
}

/**
 *
 * @param {{title: string, type: string}} reminderData
 */
function sendReminders({ title, type }) {
  alarmStatus[type][title] = true;

  const message = generateReminderMessage(title, type);

  if (!message) {
    return;
  }

  db.get("alertChannels")?.forEach((guildData) => {
    if (type === "break" && !guildData.breakReminders) {
      return;
    }
    if (type === "checkin" && !guildData.checkinReminders) {
      return;
    }
    if (type === "report" && !guildData.reportReminders) {
      return;
    }

    const guild = client.guilds.cache.get(guildData.guildId);
    const channel = guild?.channels.cache.get(guildData.channelId);

    if (channel) {
      sendReminder(channel, message);
    }
  });
}

/**
 *
 * @param {GuildChannel | ThreadChannel} channel the channel to send the reminder to
 * @param {string} message the message to send
 */
function sendReminder(channel, message) {
  channel.send(`@everyone ${message}`);
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  setInterval(() => {
    const date = new Date();
    date.getMinutes();

    const reminderTime = getReminder(date);
    // Check if the alarm for this reminder time has been done already
    if (reminderTime !== undefined && !alarmStatus[reminderTime]) {
      sendReminders(reminderTime);
    } else if (previousDay !== date.getDay()) {
      previousDay = date.getDay();
      resetAlarms();
    }
  }, 15 * 1000); // Check 15 every seconds
});

client.login(secret.get("loginToken"));
