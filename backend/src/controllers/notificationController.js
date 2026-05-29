const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, _id: { $in: req.body.ids || [] } },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
