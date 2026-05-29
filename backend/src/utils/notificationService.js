const Notification = require('../models/Notification');
const User = require('../models/User');

const sendPushNotification = async (userId, title, body, data = {}) => {
  const user = await User.findById(userId);
  if (!user?.fcmToken || !process.env.FIREBASE_SERVER_KEY) {
    return;
  }

  try {
    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: user.fcmToken,
        notification: { title, body },
        data,
      }),
    });
  } catch (err) {
    console.error('FCM push failed:', err.message);
  }
};

const createNotification = async (userId, title, body, type = 'general', data = {}) => {
  await Notification.create({ user: userId, title, body, type, data });
  await sendPushNotification(userId, title, body, data);
};

module.exports = { createNotification, sendPushNotification };
