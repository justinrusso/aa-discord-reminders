const { Client, Intents, GuildChannel, ThreadChannel } = require("discord.js");

const { config, db, secret } = require("./configs");
const { isHoliday, isWeekend } = require("./utils/date");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// https://discord.com/api/oauth2/authorize?client_id=879881286460784690&permissions=134144&scope=bot

let previousDay = new Date().getDay();

const alarmStatus = {
  morning: false,
  lunch: false,
  afternoon: false,
  report: false,
};

function resetAlarms() {
  alarmStatus.morning = false;
  alarmStatus.lunch = false;
  alarmStatus.afternoon = false;
  alarmStatus.report = false;
}

/**
 *
 * @param {Date} date
 */
function getReminder(date) {
  if (isWeekend(date) || isHoliday(config, date)) {
    return;
  }

  for (let i = 0; i < config.get("reminders").length; i++) {
    const alarm = config.get("reminders")[i];
    if (date.getHours() === alarm[0] && date.getMinutes() === alarm[1]) {
      return alarm[2];
    }
  }
}

/**
 *
 * @param {string} timeOfDay key of alarmStatus to mark as true
 */
function sendReminders(timeOfDay) {
  alarmStatus[timeOfDay] = true;

  db.get("alertChannels")?.forEach((guildChannelInfo) => {
    const guild = client.guilds.cache.get(guildChannelInfo.guildId);
    const channel = guild?.channels.cache.get(guildChannelInfo.channelId);

    if (channel) {
      sendReminder(channel, timeOfDay);
    }
  });
}

/**
 *
 * @param {GuildChannel | ThreadChannel} channel the channel to send the reminder to
 * @param {string} timeOfDay key of alarmStatus to mark as true
 */
function sendReminder(channel, timeOfDay) {
  if (timeOfDay === "report") {
    channel.send("@everyone Remember to fill out your daily report!");
  } else {
    channel.send("@everyone Time to check in!");
  }
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
