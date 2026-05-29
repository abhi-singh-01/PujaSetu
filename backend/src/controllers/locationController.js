const indiaLocations = require('../data/india-locations.json');

exports.getStates = (req, res) => {
  const states = indiaLocations.states.map((s) => ({ code: s.code, name: s.name }));
  res.json({ success: true, states });
};

exports.getDistricts = (req, res) => {
  const state = indiaLocations.states.find(
    (s) => s.code === req.params.stateCode || s.name === req.params.stateCode
  );
  if (!state) {
    return res.status(404).json({ success: false, message: 'State not found' });
  }
  res.json({ success: true, districts: state.districts });
};

exports.getCities = (req, res) => {
  const state = indiaLocations.states.find(
    (s) => s.code === req.params.stateCode || s.name === req.params.stateCode
  );
  if (!state) return res.status(404).json({ success: false, message: 'State not found' });

  const district = state.districts.find(
    (d) => d.name === req.params.districtName || d.code === req.params.districtName
  );
  if (!district) {
    return res.status(404).json({ success: false, message: 'District not found' });
  }
  res.json({ success: true, cities: district.cities || [] });
};

exports.getAllLocations = (req, res) => {
  res.json({ success: true, data: indiaLocations });
};
