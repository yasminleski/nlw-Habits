import dayjs from 'dayjs';

export function generateDatesFromYearBeginnig() {
  const fistDayOfTheYear = dayjs().startOf('year')
  const today = new Date()
  const dates = []
  let compareDate = fistDayOfTheYear

  while (compareDate.isBefore(today)) {
    dates.push(compareDate.toDate())

    compareDate = compareDate.add(1, 'day')
  }

  return dates
}