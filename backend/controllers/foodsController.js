const foods = require('../data/foods.json');

// Arabic-aware normalization: hamza forms, ى/ي, ة/ه — mirrors frontend logic
const normalize = s => (s || '').replace(/[إأآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase().trim();

exports.getFoods = (req, res) => {
  const { province = 'all', search = '' } = req.query;
  const nSearch = normalize(search);

  const filtered = foods.filter(item => {
    const matchProv = province === 'all' || item.provinceId === province;
    const matchSearch = !nSearch || normalize(`${item.title} ${item.summary} ${item.description} ${item.provinceName} ${item.regions} ${item.ingredients}`).includes(nSearch);
    return matchProv && matchSearch;
  });

  res.json(filtered);
};

exports.getFoodById = (req, res) => {
  const food = foods.find(f => f.id === req.params.id);
  if (!food) return res.status(404).json({ error: 'Food not found' });
  res.json(food);
};
