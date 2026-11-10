const artisans = require('../data/artisans.json');

// Arabic-aware normalization: hamza forms, ى/ي, ة/ه — mirrors frontend logic
const normalize = s => (s || '').replace(/[إأآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase().trim();

exports.getArtisans = (req, res) => {
  const { craftId = 'all', provinceId = 'all', search = '' } = req.query;
  const nSearch = normalize(search);

  const filtered = artisans.filter(a => {
    const matchCraft = craftId === 'all' || a.craftId === craftId;
    const matchProv = provinceId === 'all' || a.provinceId === provinceId;
    const matchSearch = !nSearch || normalize(`${a.name} ${a.craftName} ${a.workshop} ${a.bio} ${a.provinceName}`).includes(nSearch);
    return matchCraft && matchProv && matchSearch;
  });

  res.json(filtered);
};

exports.getArtisanById = (req, res) => {
  const artisan = artisans.find(a => a.id === req.params.id);
  if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
  res.json(artisan);
};
