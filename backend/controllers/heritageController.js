const crafts = require('../data/crafts.json');

const normalize = s => (s || '').replace(/[إأآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();

exports.getHeritageItems = (req, res) => {
  const { category = 'all', province = 'all', era = 'all', search = '' } = req.query;
  const nSearch = normalize(search);

  const filtered = crafts.filter(item => {
    const matchCat = category === 'all' || item.category === category;
    const matchProv = province === 'all' || item.provinceId === province;
    const matchEra = era === 'all';
    const matchSearch = !nSearch || normalize(`${item.title} ${item.description} ${item.provinceName} ${item.regions}`).includes(nSearch);
    return matchCat && matchProv && matchEra && matchSearch;
  });

  res.json(filtered);
};

exports.getCraftById = (req, res) => {
  const craft = crafts.find(c => c.id === req.params.id);
  if (!craft) return res.status(404).json({ error: 'Craft not found' });
  res.json(craft);
};

