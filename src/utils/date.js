/**
 *
 * @param {} config
 * @param {Date} date
 */
function isHoliday(config, date) {
  return (
    config
      .get("holidays")
      .filter(
        (holidayDate) =>
          holidayDate[2] === date.getFullYear() &&
          holidayDate[0] === date.getMonth() + 1 &&
          holidayDate[1] === date.getDate()
      ).length > 0
  );
}

function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

module.exports = {
  isHoliday,
  isWeekend,
};
