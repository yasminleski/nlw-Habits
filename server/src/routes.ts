import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma";

export async function appRoutes(app: FastifyInstance) {
  app.post('/habits', async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6))
    })

    const { title, weekDays } = createHabitBody.parse(request.body)

    const today = dayjs().startOf('day').toDate()

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map(weekDay => {
            return {
              week_day: weekDay
            }
          })
        }
      }
    })
  })

  // retornar os habitos do dia
  app.get('/day', async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date()
    })

    const { date } = getDayParams.parse(request.query)

    const parsedDate = dayjs(date).startOf('day')
    const weekDay = dayjs(date).get('day') // retorna a posição no array 

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date // para não mostrar o habito futuro 
        },
        weekDays: {
          some: {
            week_day: weekDay
          }
        }
      }
    })

    // habitos completados
    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate()
      },
      include: {
        dayHabits: true
      }
    })

    const completedHabits = day?.dayHabits.map(dayHabit => {
      return dayHabit.habit_id
    })

    return { possibleHabits, completedHabits }
  })

  // marcar ou remover o habito
  app.patch('/habit/:id/toogle', async (request) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid()
    })

    const { id } = toggleHabitParams.parse(request.params)

    const today = dayjs().startOf('day').toDate()

    let day = await prisma.day.findUnique({
      where: {
        date: today
      }
    })

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today
        }
      })
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id
        }
      }
    })

    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id
        }
      })
    } else {
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id
        }
      })
    }
  })

  app.get('/summary', async (request) => {
    const summary = await prisma.$queryRaw`
      SELECT
        days.id,
        days.date,
        (
          SELECT cast(count(*) as float)
          FROM dayHabits 
          WHERE dayHabits.day_id = days.id
        ) as completed,
        (
          SELECT cast(count(*) as float)
          FROM habitWeekDays
          JOIN habits on habits.id = habitWeekDays.habit_id
          WHERE habitWeekDays.week_day = cast(strftime('%w', days.date/1000.0, 'unixepoch') as int)
          AND habits.created_at <= days.date
        ) as amount
        FROM days
    `

    return summary
  })
}
