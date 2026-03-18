const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const os = require('os');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] },
  transports: ['websocket','polling'],
  allowEIO3: true,
});
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));


const QUESTIONS = {
  vocab: [
    { q: "What does 'benevolent' mean?", a: "Kind and generous", ar: "ماذا تعني كلمة 'benevolent'؟" },
    { q: "What does 'eloquent' mean?", a: "Fluent and persuasive in speech", ar: "ماذا تعني كلمة 'eloquent'؟" },
    { q: "What does 'meticulous' mean?", a: "Very careful and precise", ar: "ماذا تعني كلمة 'meticulous'؟" },
    { q: "What does 'persevere' mean?", a: "To continue despite difficulty", ar: "ماذا تعني كلمة 'persevere'؟" },
    { q: "What does 'notorious' mean?", a: "Famous for something bad", ar: "ماذا تعني كلمة 'notorious'؟" },
    { q: "What does 'ambiguous' mean?", a: "Open to more than one interpretation", ar: "ماذا تعني كلمة 'ambiguous'؟" },
    { q: "What does 'resilient' mean?", a: "Able to recover quickly from difficulties", ar: "ماذا تعني كلمة 'resilient'؟" },
    { q: "What is a synonym for 'abundant'?", a: "Plentiful", ar: "ما مرادف كلمة 'abundant'؟" },
    { q: "What is the antonym of 'cowardly'?", a: "Brave", ar: "ما مضاد كلمة 'cowardly'؟" },
    { q: "What is a synonym for 'melancholy'?", a: "Sad", ar: "ما مرادف كلمة 'melancholy'؟" },
    { q: "What does 'scrutinize' mean?", a: "To examine closely and carefully", ar: "ماذا تعني كلمة 'scrutinize'؟" },
    { q: "What does 'apprehensive' mean?", a: "Anxious or fearful about something", ar: "ماذا تعني كلمة 'apprehensive'؟" },
    { q: "What does 'contemplate' mean?", a: "To think deeply about something", ar: "ماذا تعني كلمة 'contemplate'؟" },
    { q: "What does 'diligent' mean?", a: "Hard-working and careful", ar: "ماذا تعني كلمة 'diligent'؟" },
    { q: "What does 'eccentric' mean?", a: "Unusual or strange in behavior", ar: "ماذا تعني كلمة 'eccentric'؟" },
    { q: "What does 'fabricate' mean?", a: "To invent a lie or make something up", ar: "ماذا تعني كلمة 'fabricate'؟" },
    { q: "What does 'gratitude' mean?", a: "The feeling of being thankful", ar: "ماذا تعني كلمة 'gratitude'؟" },
    { q: "What does 'hesitate' mean?", a: "To pause before doing something", ar: "ماذا تعني كلمة 'hesitate'؟" },
    { q: "What does 'immense' mean?", a: "Extremely large or great", ar: "ماذا تعني كلمة 'immense'؟" },
    { q: "What does 'justify' mean?", a: "To give a reason for something", ar: "ماذا تعني كلمة 'justify'؟" },
    { q: "What does 'keen' mean?", a: "Eager or enthusiastic", ar: "ماذا تعني كلمة 'keen'؟" },
    { q: "What does 'lenient' mean?", a: "Not strict, easy-going", ar: "ماذا تعني كلمة 'lenient'؟" },
    { q: "What does 'manipulate' mean?", a: "To control someone unfairly", ar: "ماذا تعني كلمة 'manipulate'؟" },
    { q: "What does 'narrate' mean?", a: "To tell a story", ar: "ماذا تعني كلمة 'narrate'؟" },
    { q: "What does 'obscure' mean?", a: "Not well known or unclear", ar: "ماذا تعني كلمة 'obscure'؟" },
    { q: "What does 'pessimistic' mean?", a: "Expecting the worst to happen", ar: "ماذا تعني كلمة 'pessimistic'؟" },
    { q: "What does 'rational' mean?", a: "Based on reason and logic", ar: "ماذا تعني كلمة 'rational'؟" },
    { q: "What does 'serene' mean?", a: "Calm and peaceful", ar: "ماذا تعني كلمة 'serene'؟" },
    { q: "What does 'tedious' mean?", a: "Long, slow and boring", ar: "ماذا تعني كلمة 'tedious'؟" },
    { q: "What does 'vague' mean?", a: "Not clear or certain", ar: "ماذا تعني كلمة 'vague'؟" },
    { q: "What does 'wary' mean?", a: "Cautious about possible danger", ar: "ماذا تعني كلمة 'wary'؟" },
    { q: "What does 'yearn' mean?", a: "To have a strong desire for something", ar: "ماذا تعني كلمة 'yearn'؟" },
    { q: "What does 'zeal' mean?", a: "Great energy and enthusiasm", ar: "ماذا تعني كلمة 'zeal'؟" },
    { q: "What does 'adequate' mean?", a: "Enough or satisfactory", ar: "ماذا تعني كلمة 'adequate'؟" },
    { q: "What does 'candid' mean?", a: "Truthful and straightforward", ar: "ماذا تعني كلمة 'candid'؟" },
    { q: "What does 'deduce' mean?", a: "To reach a conclusion by reasoning", ar: "ماذا تعني كلمة 'deduce'؟" },
    { q: "What does 'elaborate' mean?", a: "Detailed and complicated", ar: "ماذا تعني كلمة 'elaborate'؟" },
    { q: "What does 'feeble' mean?", a: "Lacking strength or energy", ar: "ماذا تعني كلمة 'feeble'؟" },
    { q: "What does 'gloomy' mean?", a: "Dark or sad", ar: "ماذا تعني كلمة 'gloomy'؟" },
    { q: "What does 'hinder' mean?", a: "To make it difficult to do something", ar: "ماذا تعني كلمة 'hinder'؟" },
    { q: "What does 'infer' mean?", a: "To conclude from evidence", ar: "ماذا تعني كلمة 'infer'؟" },
    { q: "What does 'jovial' mean?", a: "Cheerful and friendly", ar: "ماذا تعني كلمة 'jovial'؟" },
    { q: "What is a synonym for 'courageous'?", a: "Brave", ar: "ما مرادف كلمة 'courageous'؟" },
    { q: "What is a synonym for 'intelligent'?", a: "Smart", ar: "ما مرادف كلمة 'intelligent'؟" },
    { q: "What is the antonym of 'generous'?", a: "Stingy", ar: "ما مضاد كلمة 'generous'؟" },
    { q: "What is the antonym of 'ancient'?", a: "Modern", ar: "ما مضاد كلمة 'ancient'؟" },
    { q: "What is the antonym of 'optimistic'?", a: "Pessimistic", ar: "ما مضاد كلمة 'optimistic'؟" },
    { q: "What is a synonym for 'hostile'?", a: "Aggressive", ar: "ما مرادف كلمة 'hostile'؟" },
    { q: "What does 'blunt' mean?", a: "Direct and honest, not polite", ar: "ماذا تعني كلمة 'blunt'؟" },
    { q: "What does 'query' mean?", a: "A question or doubt", ar: "ماذا تعني كلمة 'query'؟" },
  ],
  spelling: [
    { word: "necessary", hint: "Required or needed", ar: "ضروري" },
    { word: "accommodation", hint: "A place to stay", ar: "مكان للإقامة" },
    { word: "embarrass", hint: "To make someone feel awkward", ar: "يُحرج" },
    { word: "conscience", hint: "Inner sense of right and wrong", ar: "الضمير" },
    { word: "occurrence", hint: "An event or incident", ar: "حادثة" },
    { word: "apparently", hint: "Seems to be true", ar: "يبدو صحيحاً" },
    { word: "beginning", hint: "The start of something", ar: "البداية" },
    { word: "privilege", hint: "A special right or advantage", ar: "امتياز" },
    { word: "recommend", hint: "To suggest something", ar: "يقترح" },
    { word: "separate", hint: "To divide or keep apart", ar: "يفصل" },
    { word: "definitely", hint: "Without any doubt", ar: "بالتأكيد" },
    { word: "environment", hint: "The natural world around us", ar: "البيئة" },
    { word: "government", hint: "The group that rules a country", ar: "الحكومة" },
    { word: "independent", hint: "Not relying on others", ar: "مستقل" },
    { word: "knowledge", hint: "Information and skills", ar: "المعرفة" },
    { word: "language", hint: "A system of communication", ar: "اللغة" },
    { word: "mathematics", hint: "The study of numbers", ar: "الرياضيات" },
    { word: "opportunity", hint: "A chance to do something", ar: "فرصة" },
    { word: "responsible", hint: "Having a duty to do something", ar: "مسؤول" },
    { word: "successful", hint: "Having achieved a goal", ar: "ناجح" },
    { word: "temperature", hint: "How hot or cold something is", ar: "درجة الحرارة" },
    { word: "vocabulary", hint: "All the words you know", ar: "المفردات" },
    { word: "Wednesday", hint: "The middle day of the week", ar: "الأربعاء" },
    { word: "experience", hint: "Knowledge gained from doing things", ar: "الخبرة" },
    { word: "February", hint: "The shortest month of the year", ar: "فبراير" },
    { word: "immediately", hint: "Right away without delay", ar: "فوراً" },
    { word: "particularly", hint: "Especially or specifically", ar: "بشكل خاص" },
    { word: "receive", hint: "To get something given to you", ar: "يستلم" },
    { word: "schedule", hint: "A plan of times for activities", ar: "الجدول الزمني" },
    { word: "thoroughly", hint: "Completely and carefully", ar: "بشكل شامل" },
    { word: "vegetables", hint: "Plants we eat like carrots", ar: "الخضروات" },
    { word: "achievement", hint: "Something done successfully", ar: "إنجاز" },
    { word: "beautiful", hint: "Very pleasing to look at", ar: "جميل" },
    { word: "communicate", hint: "To share information with others", ar: "يتواصل" },
    { word: "discipline", hint: "Training to follow rules", ar: "الانضباط" },
    { word: "evidence", hint: "Facts that prove something", ar: "دليل" },
    { word: "fascinating", hint: "Extremely interesting", ar: "رائع" },
    { word: "guarantee", hint: "A promise that something will happen", ar: "ضمان" },
    { word: "interesting", hint: "Holding your attention", ar: "مثير للاهتمام" },
    { word: "journalism", hint: "The work of writing news", ar: "الصحافة" },
    { word: "millennium", hint: "A period of one thousand years", ar: "ألفية" },
    { word: "unnecessary", hint: "Not needed", ar: "غير ضروري" },
    { word: "horizontal", hint: "Going from left to right", ar: "أفقي" },
    { word: "lieutenant", hint: "A military officer rank", ar: "ملازم" },
    { word: "parliament", hint: "A group of elected lawmakers", ar: "البرلمان" },
    { word: "questionnaire", hint: "A set of questions for research", ar: "استبيان" },
    { word: "understand", hint: "To know the meaning of something", ar: "يفهم" },
    { word: "jealousy", hint: "Feeling upset about someone else's success", ar: "الغيرة" },
    { word: "kidnapping", hint: "Taking someone by force illegally", ar: "الاختطاف" },
    { word: "circumstances", hint: "The conditions affecting a situation", ar: "الظروف" },
  ],
  fillblank: [
    { q: "She has been studying English ___ two years.", a: "for", options: ["for","since","during","while"], ar: "درست الإنجليزية ___ عامين." },
    { q: "The news ___ very surprising yesterday.", a: "was", options: ["was","were","are","is"], ar: "كانت الأخبار ___ مفاجئة أمس." },
    { q: "I wish I ___ more time to study.", a: "had", options: ["had","have","has","will have"], ar: "أتمنى لو ___ وقتاً أكثر للدراسة." },
    { q: "Neither the students nor the teacher ___ ready.", a: "was", options: ["was","were","are","is"], ar: "لم يكن الطلاب ولا المعلم ___." },
    { q: "By next year, she ___ finished her studies.", a: "will have", options: ["will have","would have","had","has"], ar: "بحلول العام القادم ستكون ___ أنهت دراستها." },
    { q: "They suggested that he ___ the doctor.", a: "see", options: ["see","sees","saw","seen"], ar: "اقترحوا أن ___ الطبيب." },
    { q: "I have lived here ___ 2010.", a: "since", options: ["since","for","during","from"], ar: "أعيش هنا ___ عام 2010." },
    { q: "He is good ___ playing football.", a: "at", options: ["at","in","on","for"], ar: "هو جيد ___ لعب كرة القدم." },
    { q: "She arrived ___ the airport two hours early.", a: "at", options: ["at","in","to","on"], ar: "وصلت ___ المطار مبكراً." },
    { q: "We are looking forward ___ meeting you.", a: "to", options: ["to","for","at","of"], ar: "نتطلع ___ لقائك." },
    { q: "If it ___ tomorrow, we will cancel the trip.", a: "rains", options: ["rains","rained","rain","will rain"], ar: "إذا ___ غداً سنلغي الرحلة." },
    { q: "The book ___ by millions of people worldwide.", a: "has been read", options: ["has been read","was read","is reading","read"], ar: "تمت قراءة الكتاب ___ من قبل الملايين." },
    { q: "He would have passed if he ___ harder.", a: "had studied", options: ["had studied","studied","has studied","would study"], ar: "كان سيجتاز لو ___ بجهد أكبر." },
    { q: "I am interested ___ learning new languages.", a: "in", options: ["in","at","on","for"], ar: "أنا مهتم ___ تعلم لغات جديدة." },
    { q: "They have known each other ___ they were children.", a: "since", options: ["since","for","when","during"], ar: "عرفا بعضهما ___ كانا طفلين." },
    { q: "He spoke ___ quietly that nobody could hear him.", a: "so", options: ["so","such","too","very"], ar: "تحدث ___ بهدوء لم يسمعه أحد." },
    { q: "The teacher asked us ___ our books.", a: "to open", options: ["to open","open","opening","opened"], ar: "طلب منا المعلم ___ كتبنا." },
    { q: "She is ___ tallest girl in the class.", a: "the", options: ["the","a","an","—"], ar: "هي ___ أطول فتاة في الفصل." },
    { q: "We should ___ more water every day.", a: "drink", options: ["drink","drinking","drinks","to drink"], ar: "يجب أن ___ المزيد من الماء يومياً." },
    { q: "My friend ___ in London since last year.", a: "has lived", options: ["has lived","lived","is living","lives"], ar: "صديقي ___ في لندن منذ العام الماضي." },
    { q: "The children ___ playing when it started to rain.", a: "were", options: ["were","are","was","had"], ar: "كان الأطفال ___ يلعبون عندما بدأ المطر." },
    { q: "He is afraid ___ spiders.", a: "of", options: ["of","from","about","with"], ar: "هو خائف ___ العناكب." },
    { q: "___ she was tired, she continued working.", a: "Although", options: ["Although","Because","So","If"], ar: "___ كانت متعبة واصلت العمل." },
    { q: "I would rather ___ at home than go out.", a: "stay", options: ["stay","to stay","staying","stayed"], ar: "أفضل ___ في المنزل بدلاً من الخروج." },
    { q: "He has been working here ___ five years.", a: "for", options: ["for","since","during","from"], ar: "يعمل هنا ___ خمس سنوات." },
    { q: "She apologized ___ being late.", a: "for", options: ["for","about","of","to"], ar: "اعتذرت ___ التأخر." },
    { q: "He made me ___ the whole report again.", a: "rewrite", options: ["rewrite","to rewrite","rewriting","rewrote"], ar: "جعلني ___ التقرير مرة أخرى." },
    { q: "This bag is not ___ heavy for me to carry.", a: "too", options: ["too","so","such","very"], ar: "هذه الحقيبة ليست ___ ثقيلة لأحملها." },
    { q: "I wish I ___ harder last year.", a: "had worked", options: ["had worked","worked","have worked","would work"], ar: "أتمنى لو ___ بجهد أكبر العام الماضي." },
    { q: "The film is based ___ a true story.", a: "on", options: ["on","in","at","of"], ar: "الفيلم مبني ___ قصة حقيقية." },
    { q: "___ you mind closing the window?", a: "Would", options: ["Would","Do","Will","Could"], ar: "___ تمانع إغلاق النافذة؟" },
    { q: "They prevented us ___ entering the building.", a: "from", options: ["from","of","about","to"], ar: "منعونا ___ دخول المبنى." },
    { q: "He is used to ___ up early every morning.", a: "waking", options: ["waking","wake","wakes","woke"], ar: "هو معتاد على ___ مبكراً كل صباح." },
    { q: "By the time he arrived, the party ___.", a: "had ended", options: ["had ended","ended","has ended","was ending"], ar: "بحلول وقت وصوله كانت الحفلة ___." },
    { q: "I don't mind ___ for you if you are late.", a: "waiting", options: ["waiting","wait","to wait","waited"], ar: "لا أمانع ___ من أجلك إذا تأخرت." },
    { q: "He succeeded ___ passing the exam.", a: "in", options: ["in","at","on","with"], ar: "نجح ___ اجتياز الامتحان." },
    { q: "She ___ to be very shy when she was young.", a: "used", options: ["used","was used","is used","would"], ar: "كانت ___ خجولة جداً حين كانت صغيرة." },
    { q: "The more you practice, ___ you become.", a: "the better", options: ["the better","better","the best","best"], ar: "كلما تدربت أكثر أصبحت ___." },
    { q: "She had barely sat down ___ the phone rang.", a: "when", options: ["when","than","after","before"], ar: "بالكاد جلست ___ رن الهاتف." },
    { q: "It is no use ___ over spilled milk.", a: "crying", options: ["crying","cry","to cry","cried"], ar: "لا فائدة من ___ على اللبن المسكوب." },
    { q: "She was ___ shocked that she couldn't speak.", a: "so", options: ["so","such","too","very"], ar: "كانت ___ صدمة لدرجة أنها لم تتكلم." },
    { q: "I ___ rather have tea than coffee.", a: "would", options: ["would","will","should","could"], ar: "أنا ___ أفضل الشاي على القهوة." },
    { q: "Neither of them ___ the answer.", a: "knew", options: ["knew","know","knows","known"], ar: "لم يعرف أيٌّ منهم ___." },
    { q: "She ___ English for years before moving abroad.", a: "had studied", options: ["had studied","studied","has studied","was studying"], ar: "كانت ___ الإنجليزية لسنوات قبل السفر." },
    { q: "It is important ___ exercise regularly.", a: "to", options: ["to","for","that","of"], ar: "من المهم ___ ممارسة الرياضة بانتظام." },
    { q: "She speaks English as ___ as a native speaker.", a: "fluently", options: ["fluently","fluent","more fluently","most fluent"], ar: "تتحدث الإنجليزية ___ مثل الناطق الأصلي." },
    { q: "The exam ___ at 9 AM tomorrow.", a: "starts", options: ["starts","start","is starting","started"], ar: "يبدأ الامتحان ___ الساعة 9 غداً." },
    { q: "I ___ to the gym three times a week.", a: "go", options: ["go","goes","going","went"], ar: "أنا ___ إلى الصالة الرياضية ثلاث مرات أسبوعياً." },
    { q: "This is the most ___ movie I have ever seen.", a: "interesting", options: ["interesting","interested","interest","interestingly"], ar: "هذا أكثر فيلم ___ شاهدته." },
    { q: "He ___ to school on foot every morning.", a: "walks", options: ["walks","walk","is walking","walked"], ar: "هو ___ إلى المدرسة سيراً كل صباح." },
  ],
  scramble: [
    { scrambled: "PHALYP", answer: "HAPPY", hint: "Feeling of joy", ar: "شعور بالفرح" },
    { scrambled: "LECHANLEG", answer: "CHALLENGE", hint: "A difficult task", ar: "مهمة صعبة" },
    { scrambled: "WKEDGONLE", answer: "KNOWLEDGE", hint: "Information and skills", ar: "المعلومات والمهارات" },
    { scrambled: "RETFEP", answer: "PERFECT", hint: "Without any flaws", ar: "بدون أي عيوب" },
    { scrambled: "DEUCTIOA", answer: "EDUCATED", hint: "Having received schooling", ar: "تلقى تعليماً" },
    { scrambled: "DNFREID", answer: "FRIEND", hint: "A person you like and trust", ar: "شخص تحبه وتثق به" },
    { scrambled: "YELBIVE", answer: "BELIEVE", hint: "To think something is true", ar: "تعتقد أن شيئاً صحيح" },
    { scrambled: "GLNUAGEA", answer: "LANGUAGE", hint: "A system of communication", ar: "نظام للتواصل" },
    { scrambled: "ECCSUS", answer: "SUCCESS", hint: "Achieving a goal", ar: "تحقيق هدف" },
    { scrambled: "TULBAEIFUN", answer: "BEAUTIFUL", hint: "Very pleasing to look at", ar: "جميل جداً" },
    { scrambled: "NDEEFIFCNO", answer: "CONFIDENCE", hint: "Belief in yourself", ar: "الثقة بالنفس" },
    { scrambled: "TCPESER", answer: "RESPECT", hint: "To treat others with care", ar: "احترام الآخرين" },
    { scrambled: "EDROUMF", answer: "FREEDOM", hint: "The right to do what you want", ar: "الحرية" },
    { scrambled: "NRIWTG", answer: "WRITING", hint: "Putting words on paper", ar: "الكتابة" },
    { scrambled: "RDIENAGT", answer: "READING", hint: "Looking at words and understanding them", ar: "القراءة" },
    { scrambled: "GRITSNNE", answer: "LISTENING", hint: "Paying attention to sounds", ar: "الاستماع" },
    { scrambled: "KINASEPG", answer: "SPEAKING", hint: "Using your voice to communicate", ar: "التحدث" },
    { scrambled: "RMEOMYE", answer: "MEMORY", hint: "The ability to remember things", ar: "الذاكرة" },
    { scrambled: "ICTCAEVR", answer: "CREATIVE", hint: "Having new and original ideas", ar: "إبداعي" },
    { scrambled: "YTPOME", answer: "POETRY", hint: "Writing with rhythm and rhyme", ar: "الشعر" },
    { scrambled: "YRTOCISH", answer: "HISTORY", hint: "Study of past events", ar: "التاريخ" },
    { scrambled: "YOIRCVDE", answer: "DISCOVERY", hint: "Finding something new", ar: "اكتشاف" },
    { scrambled: "YNAREHOM", answer: "HARMONY", hint: "Agreement and peace", ar: "الانسجام" },
    { scrambled: "LAYTYL", answer: "LOYALTY", hint: "Being faithful to someone", ar: "الولاء" },
    { scrambled: "EARTBCE", answer: "CELEBRATE", hint: "To do something special for an event", ar: "يحتفل" },
    { scrambled: "TDECUAE", answer: "EDUCATE", hint: "To teach and train", ar: "يعلم" },
    { scrambled: "EGRUOCANE", answer: "ENCOURAGE", hint: "To give someone confidence", ar: "يشجع" },
    { scrambled: "TSEERSPIN", answer: "PERSISTENT", hint: "Continuing despite difficulty", ar: "مثابر" },
    { scrambled: "LBSVAUAE", answer: "VALUABLE", hint: "Worth a lot or important", ar: "قيّم" },
    { scrambled: "RITNEFED", answer: "DIFFERENT", hint: "Not the same as something else", ar: "مختلف" },
    { scrambled: "IECNTIS", answer: "SCIENCE", hint: "The study of the natural world", ar: "العلوم" },
    { scrambled: "DLENWOF", answer: "WONDERFUL", hint: "Extremely good or impressive", ar: "رائع" },
    { scrambled: "LNICEEVL", answer: "EXCELLENCE", hint: "The quality of being very good", ar: "التميز" },
    { scrambled: "TSEIFAV", answer: "FESTIVAL", hint: "A special celebration or event", ar: "مهرجان" },
    { scrambled: "INONATIMI", answer: "IMAGINATION", hint: "Forming pictures in your mind", ar: "الخيال" },
    { scrambled: "YVIITARECT", answer: "CREATIVITY", hint: "The use of imagination to create", ar: "الإبداع" },
    { scrambled: "TNAELCT", answer: "TALENTED", hint: "Having a natural ability", ar: "موهوب" },
    { scrambled: "RCTAHACER", answer: "CHARACTER", hint: "Qualities that make a person who they are", ar: "الشخصية" },
    { scrambled: "TICPRAEC", answer: "PRACTICE", hint: "Doing something repeatedly to improve", ar: "التدريب" },
    { scrambled: "ELAGRN", answer: "LEARNER", hint: "Someone who is learning", ar: "متعلم" },
    { scrambled: "DGRENA", answer: "DANGER", hint: "Possibility of harm", ar: "خطر" },
    { scrambled: "YTIXNEA", answer: "ANXIETY", hint: "Feeling worried and nervous", ar: "القلق" },
    { scrambled: "ECTLURE", answer: "LECTURE", hint: "A talk given to students", ar: "محاضرة" },
    { scrambled: "BLUPICH", answer: "REPUBLIC", hint: "A type of government", ar: "جمهورية" },
    { scrambled: "EPSDNIT", answer: "INSPIRED", hint: "Feeling motivated to create", ar: "ملهم" },
    { scrambled: "YIRTCOS", answer: "VICTORY", hint: "Winning a competition", ar: "النصر" },
    { scrambled: "LATRUUC", answer: "CULTURAL", hint: "Related to traditions of a group", ar: "ثقافي" },
    { scrambled: "ECDVANIE", answer: "EVIDENCE", hint: "Facts that prove something", ar: "دليل" },
    { scrambled: "MREYSJOU", answer: "JOURNEY", hint: "A long trip", ar: "رحلة" },
    { scrambled: "TNUELGT", answer: "TALENTED", hint: "Gifted with ability", ar: "موهوب" },
  ]
};

let usedQuestions = { vocab: new Set(), spelling: new Set(), fillblank: new Set(), scramble: new Set() };
let customQuestions = { vocab: [], spelling: [], fillblank: [], scramble: [] };

function getUniqueQuestions(game, count, source) {
  const builtIn = source === 'custom' ? [] : (QUESTIONS[game] || []);
  const custom = customQuestions[game] || [];
  const pool = [...builtIn, ...custom];
  if (pool.length === 0) return [];
  const used = usedQuestions[game];
  if (used.size >= pool.length) usedQuestions[game] = new Set();
  const available = pool.map((q, i) => ({ q, i })).filter(({ i }) => !usedQuestions[game].has(i));
  const shuffled = available.sort(() => Math.random() - 0.5).slice(0, Math.min(count, available.length));
  shuffled.forEach(({ i }) => usedQuestions[game].add(i));
  return shuffled.map(({ q }) => q);
}

let state = {
  phase: 'lobby', game: null, players: {}, currentQ: -1,
  questions: [], buzzed: null, timerMax: 15, timerLeft: 0, timerHandle: null,
};

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

function resetState() {
  clearInterval(state.timerHandle);
  state = { phase:'lobby', game:null, players:{}, currentQ:-1, questions:[], buzzed:null, timerMax:15, timerLeft:0, timerHandle:null };
}

function broadcastState() {
  const players = Object.values(state.players).map(p => ({ name: p.name, score: p.score, lives: p.lives, active: p.active }));
  io.emit('state_update', { phase: state.phase, game: state.game, players, currentQ: state.currentQ, total: state.questions.length, buzzed: state.buzzed ? state.players[state.buzzed]?.name : null, timerLeft: state.timerLeft, timerMax: state.timerMax });
}

function sendQuestion() {
  const q = state.questions[state.currentQ];
  if (!q) return;
  state.buzzed = null;
  Object.values(state.players).forEach(p => p.answered = false);
  let payload = { index: state.currentQ, total: state.questions.length, game: state.game };
  if (state.game === 'vocab') {
    payload.question = q.q; payload.answer = q.a;
  } else if (state.game === 'spelling') {
    payload.hint = q.hint; payload.answer = q.word;
  } else if (state.game === 'fillblank') {
    payload.question = q.q; payload.options = q.options; payload.answer = q.a;
  } else if (state.game === 'scramble') {
    payload.scrambled = q.scrambled; payload.hint = q.hint; payload.answer = q.answer;
  } else if (state.game === 'islamic') {
    payload.question = q.q; payload.answer = q.a; payload.category = q.category || 'general';
  }
  io.emit('question', payload);
  broadcastState();
  startTimer();
}

function startTimer() {
  clearInterval(state.timerHandle);
  state.timerLeft = state.timerMax;
  io.emit('timer', { left: state.timerLeft, max: state.timerMax });
  state.timerHandle = setInterval(() => {
    state.timerLeft--;
    io.emit('timer', { left: state.timerLeft, max: state.timerMax });
    if (state.timerLeft <= 0) { clearInterval(state.timerHandle); io.emit('time_up', {}); }
  }, 1000);
}

function stopTimer() { clearInterval(state.timerHandle); }
function getLeaderboard() { return Object.values(state.players).sort((a, b) => b.score - a.score).map(p => ({ name: p.name, score: p.score })); }
function endGame() { stopTimer(); state.phase = 'results'; io.emit('game_over', { leaderboard: getLeaderboard() }); broadcastState(); }

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('teacher_join', () => {
    socket.join('teacher');
    socket.emit('player_list', Object.values(state.players).map(p => p.name));
    broadcastState();
  });

  socket.on('student_join', ({ name }) => {
    if (Object.keys(state.players).length >= 30) { socket.emit('error_msg', 'Room is full (max 30 students)'); return; }
    if (state.phase !== 'lobby') { socket.emit('error_msg', 'Game already started'); return; }
    state.players[socket.id] = { name, score: 0, lives: 3, active: true, answered: false };
    io.to('teacher').emit('player_list', Object.values(state.players).map(p => p.name));
    socket.emit('joined', { name });
    broadcastState();
  });

  socket.on('start_game', ({ game, timerMax, questionCount, source }) => {
    if (Object.keys(state.players).length < 1) return;
    const src = source || 'all';
    if (src === 'custom' && (customQuestions[game] || []).length === 0) {
      socket.emit('error_msg', 'No custom questions found! Add questions in Manage Questions first.');
      return;
    }
    const questions = getUniqueQuestions(game, questionCount || 10, src);
    if (questions.length === 0) { socket.emit('error_msg', 'No questions available! Please add questions first.'); return; }
    state.game = game; state.phase = 'playing'; state.timerMax = timerMax || 15;
    state.questions = questions; state.currentQ = -1;
    Object.values(state.players).forEach(p => { p.score = 0; p.lives = 3; p.active = true; });
    io.emit('game_started', { game }); broadcastState();
  });

  socket.on('next_question', () => {
    state.currentQ++;
    if (state.currentQ >= state.questions.length) { endGame(); return; }
    sendQuestion();
  });

  socket.on('buzz', () => {
    if (state.buzzed || !state.players[socket.id]?.active) return;
    stopTimer(); state.buzzed = socket.id;
    io.emit('buzzed', { name: state.players[socket.id].name, socketId: socket.id }); broadcastState();
  });

  socket.on('submit_answer', ({ answer }) => {
    const player = state.players[socket.id];
    if (!player || !player.active || player.answered) return;
    const q = state.questions[state.currentQ];
    if (!q) return;
    const qAnswer = (q.answer || q.a || q.word || '').trim().toLowerCase();
    const correct = answer.trim().toLowerCase() === qAnswer;
    player.answered = true;
    if (correct) { stopTimer(); player.score += 10; io.emit('correct_answer', { name: player.name, answer: q.answer || q.a || q.word }); }
    else { socket.emit('wrong_answer', { correct: false }); }
    broadcastState();
  });

  socket.on('mark_correct', () => {
    const targetId = state.buzzed;
    if (!targetId || !state.players[targetId]) return;
    state.players[targetId].score += 10;
    const q = state.questions[state.currentQ];
    io.emit('correct_answer', { name: state.players[targetId].name, answer: q.answer || q.a || q.word });
    state.buzzed = null; broadcastState();
  });

  socket.on('mark_wrong', ({ socketId }) => {
    const tid = socketId || state.buzzed;
    if (!tid || !state.players[tid]) return;
    state.players[tid].lives--;
    if (state.players[tid].lives <= 0) { state.players[tid].active = false; io.emit('player_eliminated', { name: state.players[tid].name }); }
    state.buzzed = null;
    const activePlayers = Object.values(state.players).filter(p => p.active);
    if (activePlayers.length <= 1) { endGame(); return; }
    io.emit('wrong_buzz', { name: state.players[tid]?.name }); broadcastState();
    if (state.game === 'vocab') startTimer();
  });

  socket.on('reveal_answer', () => {
    stopTimer();
    const q = state.questions[state.currentQ];
    if (!q) { socket.emit('error_msg', 'No question loaded yet'); return; }
    const answer = q.answer || q.a || q.word || 'N/A';
    io.emit('answer_revealed', { answer });
    state.buzzed = null; broadcastState();
  });

  socket.on('end_game', () => endGame());
  socket.on('reset_lobby', () => { resetState(); io.emit('lobby_reset', {}); });

  socket.on('disconnect', () => {
    if (state.players[socket.id]) {
      const name = state.players[socket.id].name;
      delete state.players[socket.id];
      io.to('teacher').emit('player_list', Object.values(state.players).map(p => p.name));
      io.emit('player_left', { name }); broadcastState();
    }
  });
});

// ── Teacher Auth ─────────────────────────────────────────────
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || 'teacher123';

app.use(express.json());

app.post('/auth', (req, res) => {
  const { password } = req.body;
  if (password === TEACHER_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Wrong password' });
  }
});

app.get('/qr', async (req, res) => {
  // Auto-detect host from request headers — works on Railway, local, everywhere
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || (getLocalIP() + ':' + PORT);
  const url = proto + '://' + host + '/student.html';
  try {
    const qr = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#0f1923', light: '#ffffff' } });
    res.json({ qr, url });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log(`\n✅ Quiz Battle Server running!`);
  console.log(`👩‍🏫 Teacher opens: http://localhost:${PORT}/teacher.html`);
  console.log(`📱 Students scan QR or go to: http://${ip}:${PORT}/student.html\n`);
});

// ── Custom Question Socket Handlers (appended) ────────────────
// Override teacher_join to also send custom questions
const _origConn = io.listeners('connection')[0];
io.removeAllListeners('connection');
io.on('connection', (socket) => {
  _origConn(socket);

  socket.on('add_custom_question', ({ game, question }) => {
    if (!customQuestions[game]) return;
    customQuestions[game].push(question);
    usedQuestions[game] = new Set();
    io.to('teacher').emit('custom_questions_update', customQuestions);
    console.log('Custom question added to', game);
  });

  socket.on('delete_custom_question', ({ game, index }) => {
    if (!customQuestions[game]) return;
    customQuestions[game].splice(index, 1);
    usedQuestions[game] = new Set();
    io.to('teacher').emit('custom_questions_update', customQuestions);
  });

  socket.on('clear_custom_questions', ({ game }) => {
    customQuestions[game] = [];
    usedQuestions[game] = new Set();
    io.to('teacher').emit('custom_questions_update', customQuestions);
  });

  socket.on('get_custom_questions', () => {
    socket.emit('custom_questions_update', customQuestions);
    socket.emit('default_counts', {
      vocab: QUESTIONS.vocab.length,
      spelling: QUESTIONS.spelling.length,
      fillblank: QUESTIONS.fillblank.length,
      scramble: QUESTIONS.scramble.length
    });
  });
});
