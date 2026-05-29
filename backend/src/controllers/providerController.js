const Provider = require('../models/Provider');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');

exports.registerProvider = async (req, res, next) => {
  try {
    const existing = await Provider.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Provider profile already exists' });
    }

    const providerType = req.body.providerType || req.user.role;
    if (!['pandit', 'nau'].includes(providerType)) {
      return res.status(400).json({ success: false, message: 'Invalid provider type' });
    }

    const provider = await Provider.create({
      ...req.body,
      user: req.user._id,
      mobile: req.user.mobile,
      providerType,
    });

    req.user.role = providerType;
    await req.user.save();

    res.status(201).json({ success: true, provider });
  } catch (err) {
    next(err);
  }
};

exports.getMyProviderProfile = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id }).populate('user', 'name mobile');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    res.json({ success: true, provider });
  } catch (err) {
    next(err);
  }
};

exports.updateProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    const allowed = [
      'fullName', 'profilePhoto', 'experienceYears', 'languages', 'services',
      'charges', 'servicePricing', 'location', 'availability', 'bio', 'documents',
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) provider[key] = req.body[key];
    });

    if (req.body.documents?.length) {
      provider.verificationStatus = 'pending';
    }

    await provider.save();
    res.json({ success: true, provider });
  } catch (err) {
    next(err);
  }
};

exports.searchProviders = async (req, res, next) => {
  try {
    const {
      providerType,
      state,
      district,
      city,
      service,
      minRating,
      maxHourlyCharge,
      verified,
      availableDate,
      lat,
      lng,
      radiusKm = 50,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isActive: true, verificationStatus: 'approved' };

    if (providerType) filter.providerType = providerType;
    if (state) filter['location.state'] = state;
    if (district) filter['location.district'] = district;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (service) filter.services = service;
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };
    if (maxHourlyCharge) filter['charges.hourly'] = { $lte: parseInt(maxHourlyCharge, 10) };
    if (verified === 'true') filter.isVerified = true;

    if (availableDate) {
      filter['availability.date'] = new Date(availableDate);
      filter['availability.isAvailable'] = true;
    }

    let query = Provider.find(filter).populate('user', 'name profilePhoto');

    if (lat && lng) {
      query = Provider.find({
        ...filter,
        'location.coordinates': {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseFloat(radiusKm) * 1000,
          },
        },
      }).populate('user', 'name profilePhoto');
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [providers, total] = await Promise.all([
      query.skip(skip).limit(parseInt(limit, 10)).sort({ rating: -1 }),
      Provider.countDocuments(filter),
    ]);

    res.json({
      success: true,
      providers,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
    });
  } catch (err) {
    next(err);
  }
};

exports.getProviderById = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('user', 'name mobile profilePhoto');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    res.json({ success: true, provider });
  } catch (err) {
    next(err);
  }
};

/** Provider sets base charges (hourly, half-day, full-day, multi-day) */
exports.updatePricing = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    if (req.body.charges) {
      provider.charges = { ...provider.charges.toObject?.() || provider.charges, ...req.body.charges };
    }
    if (req.body.servicePricing !== undefined) {
      provider.servicePricing = req.body.servicePricing;
    }

    await provider.save();
    res.json({
      success: true,
      message: 'Pricing updated successfully',
      charges: provider.charges,
      servicePricing: provider.servicePricing,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPricing = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    res.json({
      success: true,
      charges: provider.charges,
      servicePricing: provider.servicePricing,
      services: provider.services,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    provider.availability = req.body.availability || [];
    await provider.save();
    res.json({ success: true, availability: provider.availability });
  } catch (err) {
    next(err);
  }
};

exports.approveProvider = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    provider.verificationStatus = status;
    provider.isVerified = status === 'approved';
    if (status === 'rejected') provider.rejectionReason = rejectionReason;

    if (status === 'approved') {
      provider.documents.forEach((doc) => {
        doc.verified = true;
        doc.verifiedAt = new Date();
        doc.verifiedBy = req.user._id;
      });
    }

    await provider.save();

    const user = await User.findById(provider.user);
    await createNotification(
      provider.user,
      status === 'approved' ? 'Registration Approved' : 'Registration Rejected',
      status === 'approved'
        ? 'Your PujaSetu provider profile is now live!'
        : `Application rejected: ${rejectionReason || 'Contact support'}`,
      'approval'
    );

    res.json({ success: true, provider });
  } catch (err) {
    next(err);
  }
};

exports.listPendingProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find({ verificationStatus: 'pending' })
      .populate('user', 'name mobile')
      .sort({ createdAt: -1 });
    res.json({ success: true, providers });
  } catch (err) {
    next(err);
  }
};
