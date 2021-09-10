const moment = require("moment-timezone");

const timezone = "America/Los_Angeles";

function createDate() {
  return moment().tz(timezone);
}

/**
 *
 * @param {} config
 * @param {moment.Moment} date
 */
function isHoliday(config, date) {
  return (
    config
      .get("holidays")
      .filter(
        (holidayDate) =>
          holidayDate[2] === date.year() &&
          holidayDate[0] === date.month() + 1 &&
          holidayDate[1] === date.date()
      ).length > 0
  );
}

/**
 *
 * @param {moment.Moment} date
 */
function isWeekend(date) {
  return date.day() === 0 || date.day() === 6;
}

module.exports = {
  createDate,
  isHoliday,
  isWeekend,
  timezone,
};
