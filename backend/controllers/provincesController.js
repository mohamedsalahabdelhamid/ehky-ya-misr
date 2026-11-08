const provinces = require('../data/provinces.json');

exports.getAllProvinces = (req, res) => {
  res.json(provinces);
};

exports.getProvinceById = (req, res) => {
  const p = provinces.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Province not found' });
  res.json(p);
};

