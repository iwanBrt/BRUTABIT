// src/lib/notifications.ts
// Browser Push Notification menggunakan Web Notification API + Firebase FCM

export const requestWebNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

export const sendBrowserNotification = (title: string, body: string, icon = '/icon.png') => {
  if (Notification.permission !== 'granted') return
  new Notification(title, { body, icon, badge: '/icon.png' })
}

// Schedule daily reminder using setTimeout (works while tab is open)
// For true background notifications, use Service Worker + FCM
const scheduledTimers: Record<string, ReturnType<typeof setTimeout>> = {}

export const scheduleDailyReminder = (
  id: string,
  hour: number,
  minute: number,
  title: string,
  body: string
) => {
  // Cancel existing
  if (scheduledTimers[id]) clearTimeout(scheduledTimers[id])

  const now = new Date()
  const next = new Date()
  next.setHours(hour, minute, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)

  const msUntil = next.getTime() - now.getTime()
  scheduledTimers[id] = setTimeout(() => {
    sendBrowserNotification(title, body)
    // Reschedule for next day
    scheduleDailyReminder(id, hour, minute, title, body)
  }, msUntil)
}

export const cancelReminder = (id: string) => {
  if (scheduledTimers[id]) {
    clearTimeout(scheduledTimers[id])
    delete scheduledTimers[id]
  }
}

export const cancelAllReminders = () => {
  Object.keys(scheduledTimers).forEach(cancelReminder)
}

// Register service worker for background notifications
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      console.log('SW registered:', reg.scope)
      return reg
    } catch (err) {
      console.log('SW registration failed:', err)
    }
  }
}
