const { Worker } = require('bullmq')
const connection = { url: process.env.REDIS_URL }
const queueName = 'reminders'

// Minimal processor: in real deployment replace with email/SMS provider.
const worker = new Worker(queueName, async (job) => {
  const { email, scholarshipName, deadline, daysBefore } = job.data
  // Placeholder: log to console; integrate with email service in production.
  console.log(`[reminder] send to ${email}: ${scholarshipName} deadline ${deadline} (notify ${daysBefore} days before)`) // eslint-disable-line no-console
  // Optional: call webhook/email provider here
  return { delivered: true }
}, { connection })

worker.on('completed', (job) => {
  console.log(`[reminder] completed job ${job.id}`) // eslint-disable-line no-console
})

worker.on('failed', (job, err) => {
  console.error(`[reminder] failed job ${job?.id}:`, err) // eslint-disable-line no-console
})
