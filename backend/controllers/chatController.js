/**
 * Chat Controller - Hook for the Chatbot Team
 * They can plug in Gemini API, OpenAI, Anthropic, or local LangChain
 */

const normalize = s => (s || '').replace(/[إأآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();

exports.handleChatMessage = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message field is required' });
  }

  // If Chatbot Team has configured an AI API key:
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey) {
    // Chatbot Team can integrate Google Generative AI / OpenAI here
    // Example:
    // const reply = await callLLM(message, apiKey);
    // return res.json({ reply });
  }

  // Default Heritage Knowledge Base
  const n = normalize(message);
  let reply = '';

  if (/خامات|ادوات|خشب/.test(n)) {
    reply = 'تعتمد صناعة المراكب بالإسكندرية على أخشاب متينة كالتوت والسنط والكافور واللبخ والخشب السويدي، بالإضافة للمسامير والدهانات وخيوط الكتان لسد الفواصل، وأدوات النجارة والحدادة.';
  } else if (/خطوات|كيف|ازاي|يصنع|تصنيع/.test(n)) {
    reply = 'رحلة صنع المركب تبدأ بتجهيز وتقطيع الأخشاب ← بناء العمود الفقري والضلوع ← تكسية الهيكل بالألواح ← سد الفواصل بخيوط الكتان لمنع تسرب المياه ← وأخيراً التشطيب والدهان.';
  } else if (/مكان|فين|اسكندريه|منطقه/.test(n)) {
    reply = 'الحرفة مسجلة بمحافظة الإسكندرية، وتحديداً في ورش الأنفوشي وأبو قير العريقة.';
  } else if (/مراكب|حرفه|فلوكه|سفن/.test(n)) {
    reply = 'صناعة المراكب والسفن التراثية هي فن تتوارثه أجيال من النجارين والحدادين في الموانئ المصرية، لتوفير مراكب الصيد والفلوكات التاريخية.';
  } else {
    reply = `أهلاً بك! لقد استلمت سؤالك: "${message}". أنا حكيم مصر، يمكنك سؤالي عن خامات وخطوات صناعة المراكب أو تاريخ ورش الإسكندرية، وفريق الذكاء الاصطناعي يعمل حالياً على توسيع قاعدة معرفتي لتشمل كل تراث مصر!`;
  }

  res.json({ reply });
};

