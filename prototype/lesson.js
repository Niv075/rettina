/* ================= 8 · Lesson with Ollie / ינשופי (simulated AI teacher) =================
   Scripted, not a live model. The teacher teaches in short paragraphs, asks multiple-choice questions
   (look at an answer → a ✓ appears under it → look at ✓ to lock it in), and answers what Noa says
   through the word bank: one look for a phrase, or a word + one of three suggested sentences.
   Every script exists in English and Hebrew under the same topic id. */
(() => {
const W = (q, a) => ({ q, a });                  // word: three suggested sentences + the teacher's answer to each
const M = s => '⁦' + s + '⁩';          // keep "40 + 20" left-to-right inside Hebrew text

const PHRASES = {
  en: [ ['yes','thumbs-up','Yes'], ['no','thumbs-down','No'], ['again','repeat','Again, please'], ['huh','circle-help',"I don't understand"],
        ['more','lightbulb','Tell me more'], ['slow','snail','Slower, please'], ['like','heart','I like this!'], ['break','coffee','I need a break'] ],
  he: [ ['yes','thumbs-up','כן'], ['no','thumbs-down','לא'], ['again','repeat','שוב, בבקשה'], ['huh','circle-help','אני לא מבינה'],
        ['more','lightbulb','ספר לי עוד'], ['slow','snail','לאט יותר, בבקשה'], ['like','heart','אני אוהבת את זה!'], ['break','coffee','אני צריכה הפסקה'] ],
};

const SCRIPTS = { en: {
'Medieval castles': {
  like: 'Me too! Castles are amazing.',
  steps: [
    { p:"Hi Noa! Today we're going back to medieval times, about 800 years ago. Kings and queens lived in big stone castles. A castle was a home, but it was also built to keep everyone safe.",
      easy:'A castle is a big, strong house made of stone. Kings and queens lived there, and it kept them safe.',
      more:'Some castles took more than ten years to build, and hundreds of workers helped!' },
    { p:'Castles had thick, tall walls and towers. Guards stood on top of the towers so they could see far away. Around many castles there was a moat: a deep ditch filled with water.',
      easy:'Castles had high walls. Guards stood up high to watch. Some castles had water all around them, called a moat.',
      more:'Guards also walked along the top of the walls, on a path called the wall walk.' },
    { q:'Why did guards stand on top of the towers?', options:['To see far away','To take a nap','To cook dinner'], a:0,
      explain:'From up high, guards could see enemies coming from far away.', hint:'Think about it: what can you do when you climb up high?' },
    { p:'To get inside, people crossed a drawbridge. A drawbridge is a bridge that can be pulled up with strong chains. When enemies came, the guards pulled the drawbridge up, and the castle was closed!',
      easy:'The drawbridge could go up and down. Up meant closed. Down meant open.',
      more:'Behind the drawbridge there was often a heavy gate of wood and iron, called a portcullis.' },
    { q:'What did the guards do with the drawbridge when enemies came?', options:['Pulled it up','Painted it','Jumped over it'], a:0,
      explain:'Pulling the drawbridge up closed the castle, so enemies couldn\'t get in.', hint:'The drawbridge could go up and down. Which one closes the castle?' },
  ],
  words: {
    castle:     W(['What is a castle?','Why did people build castles?','Tell me more about castles.'],
                  ['A castle is a big, strong home made of stone. Kings, queens and knights lived there.','To stay safe! Thick stone walls were very hard for enemies to break.','Some castles had more than 100 rooms, and a giant kitchen for feasts!']),
    tower:      W(['What is a tower?','Why were towers so tall?','Tell me more about towers.'],
                  ['A tower is a tall, narrow part of the castle. From the top you can see very far.','So guards could see enemies coming from far away.','Many towers were round, because round walls were harder to knock down.']),
    moat:       W(['What is a moat?','Why did castles have a moat?','Tell me more about moats.'],
                  ['A moat is a deep ditch full of water, all around the castle.','The water stopped enemies from walking right up to the walls.','Some moats had no water at all. They were just very deep and hard to climb out of!']),
    drawbridge: W(['What is a drawbridge?','Why could the drawbridge go up?','Tell me more about drawbridges.'],
                  ['A drawbridge is a bridge that can be pulled up, like a door that closes the castle.','So the guards could close the castle fast when enemies came.','Big chains and a wheel inside the castle pulled the drawbridge up.']),
    guard:      W(['What did guards do?','Why did castles need guards?','Tell me more about guards.'],
                  ['Guards watched over the castle, day and night.','Someone had to look out for enemies all the time, even at night.','Guards took turns, so some could sleep while others watched.']),
    king:       W(['Who was the king?','Why did the king live in a castle?','Tell me more about kings.'],
                  ['The king was the ruler of the land. He lived in the castle with the queen.','The castle kept the king and his family safe.','Kings held big parties called feasts, with music and lots of food.']),
    knight:     W(['What is a knight?','Why did knights wear armor?','Tell me more about knights.'],
                  ['A knight was a soldier who rode a horse and protected the king.','Armor was like a metal shell. It protected the knight\'s body in a fight.','Boys started training to be knights at about seven years old, close to your age!']),
    wall:       W(['How thick were the walls?','Why were the walls so thick?','Tell me more about castle walls.'],
                  ['Some castle walls were as thick as a car is long!','Thick walls were very hard for enemies to break.','The top of the wall had gaps, so guards could look out and hide behind the stone.']),
  },
},
'Rhyming words': {
  like: 'Me too! Rhymes are fun, Noa.',
  steps: [
    { p:"Hi Noa! Today we're playing with rhymes. Two words rhyme when they end with the same sound. Cat and hat rhyme. Dog and log rhyme.",
      easy:'Rhyming words sound the same at the end. Cat, hat. Dog, log.',
      more:'Lots of songs and poems use rhymes, because rhymes are fun to say and easy to remember.' },
    { q:'Which word rhymes with “cat”?', options:['Hat','Dog','Sun'], a:0, explain:'Cat and hat both end with the sound “at”.', hint:'Say them out loud in your head: cat… which one ends the same way?' },
    { p:'Listen to these: star and car. Moon and spoon. Tree and bee. Can you hear that the endings sound the same?',
      easy:'Star, car. Moon, spoon. Tree, bee. Same sound at the end.',
      more:'Some rhymes look different but still sound the same, like “blue” and “shoe”.' },
    { q:'Which word rhymes with “star”?', options:['Car','Moon','Tree'], a:0, explain:'Star and car both end with the sound “ar”.', hint:'Star ends with “ar”. Which word ends with “ar” too?' },
  ],
  words: {
    rhyme: W(['What is a rhyme?','Why do poems rhyme?','Tell me more rhymes.'],
             ['Words rhyme when they end with the same sound, like cat and hat.','Rhymes make poems fun to say and easy to remember.','Here are more: fish and dish, cake and lake, bear and chair!']),
    sound: W(['What is the end sound?','Why does the end sound matter?','Tell me more about sounds.'],
             ['The end sound is the last part you hear, like “at” in cat.','Rhymes are all about the end sound, not the start.','Every word is made of small sounds. Cat has three: c, a, t.']),
    cat:   W(['What rhymes with cat?','Why do cat and hat rhyme?','Tell me a cat rhyme.'],
             ['Hat, bat, mat and rat all rhyme with cat!','They both end with the sound “at”.','A fat cat in a flat hat sat on a mat!']),
    hat:   W(['What rhymes with hat?','Why do hat and bat rhyme?','Tell me a hat rhyme.'],
             ['Cat, sat, bat and mat rhyme with hat.','They both end with “at”.','The cat in the hat sat on a mat!']),
    star:  W(['What rhymes with star?','Why do star and car rhyme?','Tell me a star rhyme.'],
             ['Car, far and jar rhyme with star.','They both end with the sound “ar”.','Twinkle, twinkle, little star, how I wonder what you are!']),
    moon:  W(['What rhymes with moon?','Why do moon and spoon rhyme?','Tell me a moon rhyme.'],
             ['Spoon, soon and balloon rhyme with moon.','They both end with the sound “oon”.','I saw the moon from my balloon, I\'ll fly back home very soon!']),
    poem:  W(['What is a poem?','Why do people write poems?','Tell me a short poem.'],
             ['A poem is short writing with a special beat, and it often rhymes.','Poems help people share feelings in a fun way.','Roses are red, violets are blue, sugar is sweet, and so are you!']),
    song:  W(['Do songs rhyme?','Why do songs have rhymes?','Tell me a rhyming song.'],
             ['Yes! Most songs have lots of rhymes.','Rhymes make songs easier to remember and sing.','Humpty Dumpty sat on a wall, Humpty Dumpty had a great fall!']),
  },
},
'Adding to 100': {
  like: "Me too! You're getting fast at adding.",
  steps: [
    { p:"Hi Noa! Let's add bigger numbers. Here's a trick: count the tens. 20 + 30 is 2 tens and 3 tens. That makes 5 tens, which is 50!",
      easy:'20 is 2 tens. 30 is 3 tens. 2 tens and 3 tens make 5 tens. 5 tens is 50.',
      more:'Ten tens make 100. That\'s why 100 is such a special number!' },
    { q:'What is 40 + 20?', options:['60','42','80'], a:0, explain:'4 tens and 2 tens make 6 tens. That\'s 60.', hint:'40 is 4 tens. 20 is 2 tens. How many tens all together?' },
    { p:'Now let\'s add ones too. For 23 + 5, keep the 2 tens. Then add the ones: 3 + 5 = 8. So 23 + 5 = 28.',
      easy:'23 + 5: the tens stay 2. The ones: 3 + 5 = 8. The answer is 28.',
      more:'You can check by counting up from 23: 24, 25, 26, 27, 28!' },
    { q:'What is 31 + 4?', options:['35','71','34'], a:0, explain:'Keep the 3 tens. Ones: 1 + 4 = 5. So 31 + 4 = 35.', hint:'The tens stay the same. What is 1 + 4?' },
  ],
  words: {
    add:    W(['What does add mean?','Why do we add?','Tell me more about adding.'],
              ['Add means putting numbers together to get more.','We add to find out how many there are all together.','You can add in any order: 2 + 3 is the same as 3 + 2.']),
    plus:   W(['What is plus?','Why do we write plus?','Tell me more about plus.'],
              ['Plus is the + sign. It means add.','It\'s a short way to write “put these together”.','When you see +, the answer gets bigger.']),
    tens:   W(['What are tens?','Why do we count tens?','Tell me more about tens.'],
              ['A ten is a group of 10. 30 is 3 tens.','Counting tens is much faster than counting one by one.','In 47, the 4 means 4 tens. That\'s 40.']),
    ones:   W(['What are ones?','Why do ones matter?','Tell me more about ones.'],
              ['Ones are what\'s left after the tens. In 23 there are 3 ones.','We add ones to ones, and tens to tens.','If the ones make 10 or more, they become a new ten!']),
    equals: W(['What is equals?','Why do we write equals?','Tell me more about equals.'],
              ['Equals is the = sign. It means “is the same as”.','It shows the answer: 2 + 2 = 4.','Both sides of = always have the same amount.']),
    '100':  W(['What is 100?','Why is 100 special?','Tell me more about 100.'],
              ['100 is ten tens.','It\'s the first number with three digits.','Counting to 100 by tens takes only 10 steps: 10, 20, 30…']),
    count:  W(['How do I count on?','Why does counting on help?','Tell me more about counting.'],
              ['Start at the big number and count up: 23, then 24, 25, 26.','It\'s faster than counting everything from 1.','You can count on by tens too: 23, 33, 43!']),
    carry:  W(['What is carrying?','Why do we carry?','Tell me more about carrying.'],
              ['When the ones make 10 or more, you carry a new ten over to the tens.','Because 10 ones are the same as 1 ten.','18 + 5: 8 + 5 = 13. That\'s 1 ten and 3 ones, so the answer is 23.']),
  },
},
'How plants grow': {
  like: 'Me too! Plants are amazing.',
  steps: [
    { p:'Hi Noa! A plant starts as a tiny seed. When the seed gets water and warmth in the soil, it opens, and a little root grows down.',
      easy:'A plant begins as a seed. Water helps the seed open. A root grows down.',
      more:'Some seeds are tiny like dust, and some, like a coconut, are as big as your head!' },
    { q:'What does a seed need to start growing?', options:['Water','Ice cream','A hat'], a:0, explain:'Seeds need water and warm soil to start growing.', hint:'What do we give plants in the garden every day?' },
    { p:'Then a green shoot grows up toward the sun. The leaves use sunlight to make food for the plant, and the roots drink water from the soil.',
      easy:'The plant grows up to the sun. Leaves make food from sunlight. Roots drink water.',
      more:'Plants also make the oxygen we breathe!' },
    { q:'What do leaves use to make food?', options:['Sunlight','Rocks','Music'], a:0, explain:'Leaves use sunlight to make food for the plant.', hint:'The plant grows up toward something bright in the sky…' },
  ],
  words: {
    seed:   W(['What is a seed?','Why do plants have seeds?','Tell me more about seeds.'],
              ['A seed is a tiny package with a baby plant inside.','Seeds let plants make new plants.','The wind, birds and animals carry seeds to new places.']),
    root:   W(['What is a root?','Why do plants need roots?','Tell me more about roots.'],
              ['A root is the part of the plant under the ground.','Roots drink water and hold the plant in place.','Carrots are roots that we eat!']),
    leaf:   W(['What is a leaf?','Why are leaves green?','Tell me more about leaves.'],
              ['A leaf is the flat green part of a plant.','Leaves have green stuff inside that catches sunlight.','In autumn, many leaves turn red, orange and yellow.']),
    sun:    W(['Why do plants need sun?','Why do plants grow toward the sun?','Tell me more about plants and sun.'],
              ['Plants use sunlight to make their food.','They want as much light as they can get.','A plant on a windowsill slowly bends toward the light!']),
    water:  W(['How do plants drink?','Why do plants need water?','Tell me more about water.'],
              ['Roots drink water from the soil.','Water carries food through the plant and keeps it strong.','Without water, a plant droops and gets soft.']),
    soil:   W(['What is soil?','Why do plants grow in soil?','Tell me more about soil.'],
              ['Soil is the dirt that plants grow in.','Soil holds water and food for the roots.','Worms live in soil and help keep it healthy.']),
    flower: W(['What is a flower?','Why do plants have flowers?','Tell me more about flowers.'],
              ['A flower is the colorful part of some plants.','Flowers make the seeds for new plants.','Bees visit flowers to drink sweet nectar.']),
    grow:   W(['How fast do plants grow?','Why do plants grow tall?','Tell me more about growing.'],
              ['Some grow in days, and trees take many years.','To reach more sunlight.','Bamboo can grow almost a meter in one day!']),
  },
},
}, he: {
'Medieval castles': {
  like: 'גם אני! טירות זה מדהים.',
  steps: [
    { p:'שלום נועה! היום נחזור לימי הביניים, לפני בערך 800 שנה. מלכים ומלכות גרו בטירות גדולות מאבן. טירה הייתה בית, אבל היא גם נבנתה כדי לשמור על כולם.',
      easy:'טירה היא בית גדול וחזק מאבן. מלכים ומלכות גרו בה, והיא שמרה עליהם.',
      more:'את חלק מהטירות בנו יותר מעשר שנים, ומאות פועלים עזרו!' },
    { p:'לטירות היו חומות עבות וגבוהות ומגדלים. שומרים עמדו בראש המגדלים כדי לראות רחוק. מסביב להרבה טירות היה חפיר: תעלה עמוקה מלאה במים.',
      easy:'לטירות היו חומות גבוהות. שומרים עמדו למעלה ושמרו. סביב חלק מהטירות היו מים, וזה נקרא חפיר.',
      more:'השומרים גם הלכו על ראש החומה, בשביל שנקרא "דרך החומה".' },
    { q:'למה השומרים עמדו בראש המגדלים?', options:['כדי לראות רחוק','כדי לישון','כדי לבשל ארוחת ערב'], a:0,
      explain:'מלמעלה השומרים יכלו לראות אויבים מגיעים מרחוק.', hint:'תחשבי: מה אפשר לעשות כשמטפסים גבוה?' },
    { p:'כדי להיכנס, אנשים עברו על גשר זחיח. גשר זחיח הוא גשר שאפשר להרים בשרשראות חזקות. כשאויבים הגיעו, השומרים הרימו את הגשר, והטירה נסגרה!',
      easy:'הגשר הזחיח יכול לעלות ולרדת. למעלה זה סגור. למטה זה פתוח.',
      more:'מאחורי הגשר היה לרוב שער כבד מעץ וברזל, שנקרא סורג.' },
    { q:'מה עשו השומרים עם הגשר הזחיח כשאויבים הגיעו?', options:['הרימו אותו','צבעו אותו','קפצו מעליו'], a:0,
      explain:'כשהרימו את הגשר, הטירה נסגרה ואויבים לא יכלו להיכנס.', hint:'הגשר יכול לעלות ולרדת. מה סוגר את הטירה?' },
  ],
  words: {
    'טירה':  W(['מה זו טירה?','למה בנו טירות?','ספר לי עוד על טירות.'],
               ['טירה היא בית גדול וחזק מאבן. מלכים, מלכות ואבירים גרו בה.','כדי להיות מוגנים! חומות אבן עבות היו קשות מאוד לשבירה.','בחלק מהטירות היו יותר מ־100 חדרים, ומטבח ענק למשתאות!']),
    'מגדל':  W(['מה זה מגדל?','למה המגדלים היו כל כך גבוהים?','ספר לי עוד על מגדלים.'],
               ['מגדל הוא חלק גבוה וצר של הטירה. מלמעלה רואים רחוק מאוד.','כדי שהשומרים יראו אויבים מגיעים מרחוק.','הרבה מגדלים היו עגולים, כי קשה יותר להפיל קיר עגול.']),
    'חפיר':  W(['מה זה חפיר?','למה לטירות היה חפיר?','ספר לי עוד על חפירים.'],
               ['חפיר הוא תעלה עמוקה מלאה במים, מסביב לטירה.','המים עצרו את האויבים מלהגיע עד החומות.','בחלק מהחפירים לא היו מים בכלל. הם פשוט היו עמוקים מאוד, וקשה היה לטפס מהם החוצה!']),
    'גשר':   W(['מה זה גשר זחיח?','למה אפשר היה להרים את הגשר?','ספר לי עוד על הגשר.'],
               ['גשר זחיח הוא גשר שאפשר להרים, כמו דלת שסוגרת את הטירה.','כדי שהשומרים יוכלו לסגור את הטירה מהר כשאויבים מגיעים.','שרשראות גדולות וגלגל בתוך הטירה הרימו את הגשר.']),
    'שומר':  W(['מה עשו השומרים?','למה טירה צריכה שומרים?','ספר לי עוד על שומרים.'],
               ['השומרים השגיחו על הטירה, ביום ובלילה.','מישהו היה צריך לחפש אויבים כל הזמן, גם בלילה.','השומרים התחלפו, כך שחלק ישנו וחלק שמרו.']),
    'מלך':   W(['מי היה המלך?','למה המלך גר בטירה?','ספר לי עוד על מלכים.'],
               ['המלך היה השליט של הארץ. הוא גר בטירה עם המלכה.','הטירה שמרה על המלך ועל המשפחה שלו.','מלכים ערכו מסיבות גדולות שנקראו משתאות, עם מוזיקה והרבה אוכל.']),
    'אביר':  W(['מה זה אביר?','למה אבירים לבשו שריון?','ספר לי עוד על אבירים.'],
               ['אביר היה לוחם שרכב על סוס ושמר על המלך.','שריון היה כמו קליפה ממתכת. הוא הגן על הגוף של האביר בקרב.','בנים התחילו להתאמן להיות אבירים בגיל שבע בערך, קרוב לגיל שלך!']),
    'חומה':  W(['כמה עבות היו החומות?','למה החומות היו כל כך עבות?','ספר לי עוד על החומות.'],
               ['חלק מחומות הטירה היו עבות כמו אורך של מכונית!','חומות עבות היו קשות מאוד לשבירה.','בראש החומה היו רווחים, כדי שהשומרים יוכלו להסתכל החוצה ולהסתתר מאחורי האבן.']),
  },
},
'Rhyming words': {
  like: 'גם אני! חרוזים זה כיף, נועה.',
  steps: [
    { p:'שלום נועה! היום נשחק בחרוזים. שתי מילים מתחרזות כשהן נגמרות באותו צליל. דג וחג מתחרזות. בית וזית מתחרזות.',
      easy:'מילים מתחרזות נשמעות אותו דבר בסוף. דג, חג. בית, זית.',
      more:'הרבה שירים משתמשים בחרוזים, כי כיף להגיד אותם וקל לזכור אותם.' },
    { q:'איזו מילה מתחרזת עם "דג"?', options:['חג','סוס','שמש'], a:0, explain:'דג וחג נגמרות שתיהן בצליל "אג".', hint:'תגידי בראש: דג… איזו מילה נגמרת אותו דבר?' },
    { p:'תקשיבי: ירח ופרח. שיר ועיר. פיל וגיל. שומעת שהסופים נשמעים אותו דבר?',
      easy:'ירח, פרח. שיר, עיר. אותו צליל בסוף.',
      more:'אפשר למצוא חרוז כמעט לכל מילה. למשל: כלב ולב, או ים וקם.' },
    { q:'איזו מילה מתחרזת עם "ירח"?', options:['פרח','כוכב','עץ'], a:0, explain:'ירח ופרח נגמרות שתיהן בצליל "רח".', hint:'ירח נגמרת ב"רח". איזו מילה נגמרת ב"רח" גם?' },
  ],
  words: {
    'חרוז': W(['מה זה חרוז?','למה שירים מתחרזים?','ספר לי עוד חרוזים.'],
              ['מילים מתחרזות כשהן נגמרות באותו צליל, כמו דג וחג.','חרוזים עושים שירים כיפיים וקלים לזכירה.','הנה עוד: כלב ולב, ים וקם, שיר ועיר!']),
    'צליל': W(['מה זה הצליל בסוף?','למה הסוף חשוב?','ספר לי עוד על צלילים.'],
              ['הצליל בסוף הוא החלק האחרון ששומעים, כמו "אג" בדג.','בחרוזים, מה שחשוב זה הסוף, לא ההתחלה.','כל מילה בנויה מצלילים קטנים. במילה "דג" יש שלושה צלילים.']),
    'דג':   W(['מה מתחרז עם דג?','למה דג וחג מתחרזות?','ספר לי חרוז על דג.'],
              ['חג וגג מתחרזות עם דג!','שתיהן נגמרות בצליל "אג".','דג קטן עלה על הגג, וחגג שם את החג!']),
    'חג':   W(['מה מתחרז עם חג?','למה חג ודג מתחרזות?','ספר לי חרוז על חג.'],
              ['דג וגג מתחרזות עם חג.','שתיהן נגמרות ב"אג".','בחג שמח אכלנו דג, ורקדנו על הגג!']),
    'ירח':  W(['מה מתחרז עם ירח?','למה ירח ופרח מתחרזות?','ספר לי חרוז על ירח.'],
              ['פרח, זרח ונפתח מתחרזות עם ירח.','שתיהן נגמרות בצליל "רח".','הירח זרח, והפרח נפתח!']),
    'פרח':  W(['מה מתחרז עם פרח?','למה פרח וירח מתחרזות?','ספר לי חרוז על פרח.'],
              ['ירח, זרח ונפתח מתחרזות עם פרח.','שתיהן נגמרות ב"רח".','פרח קטן בגינה, צמח מול השכנה!']),
    'שיר':  W(['מה זה שיר?','למה כותבים שירים?','ספר לי שיר קצר.'],
              ['שיר הוא כתיבה קצרה עם קצב מיוחד, והרבה פעמים יש בו חרוזים.','שירים עוזרים לשתף רגשות בדרך כיפית.','שמש בשמיים, מים בכנרת, ונועה שלנו היא כוכבת!']),
    'בית':  W(['מה מתחרז עם בית?','למה בית וזית מתחרזות?','ספר לי חרוז על בית.'],
              ['זית ושקית מתחרזות עם בית.','שתיהן נגמרות בצליל "ית".','ליד הבית שלי יש עץ זית, וקטפתי זיתים לשקית!']),
  },
},
'Adding to 100': {
  like: 'גם אני! את נהיית מהירה בחיבור.',
  steps: [
    { p:`שלום נועה! בואי נחבר מספרים גדולים. הנה טריק: סופרים עשרות. ${M('20 + 30')} זה 2 עשרות ועוד 3 עשרות. ביחד 5 עשרות, וזה 50!`,
      easy:'20 זה 2 עשרות. 30 זה 3 עשרות. 2 עשרות ועוד 3 עשרות הן 5 עשרות. 5 עשרות זה 50.',
      more:'עשר עשרות הן 100. בגלל זה 100 הוא מספר כל כך מיוחד!' },
    { q:`כמה זה ${M('40 + 20')}?`, options:['60','42','80'], a:0, explain:'4 עשרות ועוד 2 עשרות הן 6 עשרות. זה 60.', hint:'40 זה 4 עשרות. 20 זה 2 עשרות. כמה עשרות ביחד?' },
    { p:`עכשיו נחבר גם יחידות. ב־${M('23 + 5')} משאירים את 2 העשרות. ואז מחברים את היחידות: ${M('3 + 5 = 8')}. אז ${M('23 + 5 = 28')}.`,
      easy:`${M('23 + 5')}: העשרות נשארות 2. היחידות: ${M('3 + 5 = 8')}. התשובה היא 28.`,
      more:'אפשר לבדוק ולספור מ־23 והלאה: 24, 25, 26, 27, 28!' },
    { q:`כמה זה ${M('31 + 4')}?`, options:['35','71','34'], a:0, explain:`משאירים 3 עשרות. יחידות: ${M('1 + 4 = 5')}. אז ${M('31 + 4 = 35')}.`, hint:`העשרות נשארות אותו דבר. כמה זה ${M('1 + 4')}?` },
  ],
  words: {
    'חיבור':  W(['מה זה חיבור?','למה מחברים?','ספר לי עוד על חיבור.'],
                ['חיבור זה לשים מספרים ביחד כדי לקבל יותר.','מחברים כדי לדעת כמה יש בסך הכול.',`אפשר לחבר בכל סדר: ${M('2 + 3')} זה כמו ${M('3 + 2')}.`]),
    'פלוס':   W(['מה זה פלוס?','למה כותבים פלוס?','ספר לי עוד על פלוס.'],
                ['פלוס הוא הסימן +. הוא אומר לחבר.','זו דרך קצרה לכתוב "לשים ביחד".','כשרואים +, התשובה נהיית גדולה יותר.']),
    'עשרות':  W(['מה זה עשרות?','למה סופרים עשרות?','ספר לי עוד על עשרות.'],
                ['עשרת היא קבוצה של 10. 30 זה 3 עשרות.','לספור עשרות זה הרבה יותר מהר מלספור אחד־אחד.','ב־47, ה־4 אומר 4 עשרות. זה 40.']),
    'יחידות': W(['מה זה יחידות?','למה יחידות חשובות?','ספר לי עוד על יחידות.'],
                ['יחידות הן מה שנשאר אחרי העשרות. ב־23 יש 3 יחידות.','מחברים יחידות ליחידות, ועשרות לעשרות.','אם היחידות מגיעות ל־10 או יותר, הן הופכות לעשרת חדשה!']),
    'שווה':   W(['מה זה שווה?','למה כותבים שווה?','ספר לי עוד על שווה.'],
                ['שווה הוא הסימן =. הוא אומר "זה אותו דבר כמו".',`הוא מראה את התשובה: ${M('2 + 2 = 4')}.`,'בשני הצדדים של = תמיד יש אותה כמות.']),
    '100':    W(['מה זה 100?','למה 100 מיוחד?','ספר לי עוד על 100.'],
                ['100 זה עשר עשרות.','זה המספר הראשון עם שלוש ספרות.','לספור עד 100 בקפיצות של עשר לוקח רק 10 צעדים: 10, 20, 30…']),
    'לספור':  W(['איך סופרים הלאה?','למה ספירה הלאה עוזרת?','ספר לי עוד על ספירה.'],
                ['מתחילים מהמספר הגדול וסופרים למעלה: 23, ואז 24, 25, 26.','זה מהר יותר מלספור הכול מ־1.','אפשר לספור הלאה גם בעשרות: 23, 33, 43!']),
    'העברה':  W(['מה זו העברה?','למה מעבירים?','ספר לי עוד על העברה.'],
                ['כשהיחידות מגיעות ל־10 או יותר, מעבירים עשרת חדשה לעשרות.','כי 10 יחידות הן כמו עשרת אחת.',`${M('18 + 5')}: ${M('8 + 5 = 13')}. זו עשרת אחת ועוד 3 יחידות, אז התשובה היא 23.`]),
  },
},
'How plants grow': {
  like: 'גם אני! צמחים מדהימים.',
  steps: [
    { p:'שלום נועה! צמח מתחיל כזרע קטנטן. כשהזרע מקבל מים וחום באדמה, הוא נפתח, ושורש קטן גדל למטה.',
      easy:'צמח מתחיל מזרע. המים עוזרים לזרע להיפתח. שורש גדל למטה.',
      more:'יש זרעים קטנים כמו אבק, ויש זרעים, כמו קוקוס, גדולים כמו הראש שלך!' },
    { q:'מה זרע צריך כדי להתחיל לגדול?', options:['מים','גלידה','כובע'], a:0, explain:'זרעים צריכים מים ואדמה חמימה כדי להתחיל לגדול.', hint:'מה אנחנו נותנים לצמחים בגינה כל יום?' },
    { p:'אחר כך נבט ירוק גדל למעלה, לכיוון השמש. העלים משתמשים באור השמש כדי להכין אוכל לצמח, והשורשים שותים מים מהאדמה.',
      easy:'הצמח גדל למעלה אל השמש. העלים מכינים אוכל מאור השמש. השורשים שותים מים.',
      more:'צמחים גם מייצרים את החמצן שאנחנו נושמים!' },
    { q:'במה העלים משתמשים כדי להכין אוכל?', options:['אור השמש','אבנים','מוזיקה'], a:0, explain:'העלים משתמשים באור השמש כדי להכין אוכל לצמח.', hint:'הצמח גדל למעלה, אל משהו מאיר בשמיים…' },
  ],
  words: {
    'זרע':   W(['מה זה זרע?','למה לצמחים יש זרעים?','ספר לי עוד על זרעים.'],
               ['זרע הוא חבילה קטנה שיש בתוכה צמח תינוק.','זרעים עוזרים לצמחים ליצור צמחים חדשים.','הרוח, הציפורים והחיות לוקחים זרעים למקומות חדשים.']),
    'שורש':  W(['מה זה שורש?','למה צמחים צריכים שורשים?','ספר לי עוד על שורשים.'],
               ['שורש הוא החלק של הצמח שמתחת לאדמה.','שורשים שותים מים ומחזיקים את הצמח במקום.','גזר הוא שורש שאנחנו אוכלים!']),
    'עלה':   W(['מה זה עלה?','למה עלים ירוקים?','ספר לי עוד על עלים.'],
               ['עלה הוא החלק השטוח והירוק של הצמח.','בתוך העלים יש חומר ירוק שתופס את אור השמש.','בסתיו, הרבה עלים הופכים לאדומים, כתומים וצהובים.']),
    'שמש':   W(['למה צמחים צריכים שמש?','למה צמחים גדלים לכיוון השמש?','ספר לי עוד על צמחים ושמש.'],
               ['צמחים משתמשים באור השמש כדי להכין את האוכל שלהם.','הם רוצים כמה שיותר אור.','צמח על אדן החלון מתכופף לאט לכיוון האור!']),
    'מים':   W(['איך צמחים שותים?','למה צמחים צריכים מים?','ספר לי עוד על מים.'],
               ['השורשים שותים מים מהאדמה.','המים מובילים אוכל בתוך הצמח ושומרים עליו חזק.','בלי מים, צמח נובל ונהיה רך.']),
    'אדמה':  W(['מה זו אדמה?','למה צמחים גדלים באדמה?','ספר לי עוד על אדמה.'],
               ['אדמה היא העפר שצמחים גדלים בו.','האדמה מחזיקה מים ואוכל בשביל השורשים.','תולעים גרות באדמה ועוזרות לשמור עליה בריאה.']),
    'פרח':   W(['מה זה פרח?','למה לצמחים יש פרחים?','ספר לי עוד על פרחים.'],
               ['פרח הוא החלק הצבעוני של חלק מהצמחים.','פרחים מכינים את הזרעים לצמחים חדשים.','דבורות באות לפרחים כדי לשתות צוף מתוק.']),
    'לגדול': W(['כמה מהר צמחים גדלים?','למה צמחים גדלים לגובה?','ספר לי עוד על גדילה.'],
               ['יש שגדלים בכמה ימים, ועצים לוקחים הרבה שנים.','כדי להגיע ליותר אור שמש.','במבוק יכול לגדול כמעט מטר ביום אחד!']),
  },
},
} };
function generic(topic){
  if(Lang.cur==='he') return {
    like:'גם אני, נועה!',
    steps: [
      { p:`שלום נועה! היום נלמד על ${topic}. בגרסה המלאה, ינשופי בונה את השיעור הזה מחומרי הכיתה שלך ומספרי ילדים בדוקים.`,
        easy:`הנושא של היום הוא ${topic}.`, more:'באב־טיפוס הזה יש שיעורים מלאים על טירות בימי הביניים, מילים מתחרזות, חיבור עד 100 ואיך צמחים גדלים.' },
      { q:'על מה אנחנו לומדים היום?', options:[topic,'פיצה','קשת בענן'], a:0, explain:`הנושא של היום הוא ${topic}.`, hint:`תקשיבי שוב: "היום נלמד על ${topic}."` },
    ],
    words: { [topic]: W([`מה זה ${topic}?`,`למה לומדים ${topic}?`,`ספר לי עוד על ${topic}.`],
      ['שאלה מצוינת! בגרסה המלאה, ינשופי עונה מתוך חומרי השיעור שלך.','כי זה עוזר להבין את העולם, צעד אחר צעד.','בגרסה המלאה ינשופי היה מספר לך כאן עובדה מעניינת.']) },
  };
  return {
    like:'Me too, Noa!',
    steps: [
      { p:`Hi Noa! Today we're learning about ${topic}. In the full version, Ollie builds this lesson from your class materials and vetted children's books.`,
        easy:`Today's topic is ${topic}.`, more:'This prototype has full lessons for Medieval castles, Rhyming words, Adding to 100 and How plants grow.' },
      { q:'What are we learning about today?', options:[topic,'Pizza','Rainbows'], a:0, explain:`Today's topic is ${topic}.`, hint:`Listen again: “Today we're learning about ${topic}.”` },
    ],
    words: { [topic.toLowerCase()]: W([`What is ${topic}?`,`Why do we learn ${topic}?`,`Tell me more about ${topic}.`],
      ['Great question! In the full version, Ollie answers from your lesson materials.','Because it helps you understand the world, step by step.','In the full version, Ollie would tell you a fun fact here.']) },
  };
}

/* ---------------- state ---------------- */
let L = { on:false, id:0 }, stream, act, bankA, bankB;
const cap = s => Lang.cur==='he' ? s : s[0].toUpperCase() + s.slice(1);
const OWL = '<svg class="owl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 4.5 8 7M17.5 4.5 16 7"/><path d="M5 10c0-3.3 3-5 7-5s7 1.7 7 5v4.5c0 3.8-3 6.5-7 6.5s-7-2.7-7-6.5z"/><circle cx="9.2" cy="10.6" r="2.1"/><circle cx="14.8" cy="10.6" r="2.1"/><path d="m11.2 13.4.8 1.2.8-1.2"/><path d="M9.3 17.6c.9.6 1.8.9 2.7.9s1.8-.3 2.7-.9"/></svg>';
/* soft click when a frame tile selects (needs sound on and one earlier user gesture) */
let actx;
window.uiTick = () => {
  if(!App.sound) return;
  try{
    actx = actx || new AudioContext();
    const o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime;
    o.type = 'sine'; o.frequency.value = 660;
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.07, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + .12);
    o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + .13);
  }catch(e){}
};
const teacher = () => tr('Ollie','ינשופי');
const times = n => tr(`${n} time${n===1?'':'s'}`, n===1 ? 'פעם אחת' : `${n} פעמים`);

function stop(){
  L.on = false; clearInterval(L.timer);
  try{ speechSynthesis.cancel(); }catch(e){}
}
/* carry = { si, right, total, stars, said, done } resumes after a language switch */
function start(item, hooks, carry){
  stop();
  const script = SCRIPTS[Lang.cur][item.topic] || generic(App.tp(item.topic)), S = App.SUBJ[item.subj];
  L = { on:true, id:L.id+1, item, hooks, script, si:-1, rate:.92, right:0, total:0, stars:0, said:0,
        word:null, cur:null, mcq:null, q:Promise.resolve(), left:item.min*60, paused:false, done:false,
        frame:!!App.settings.frame, drawer:false };
  if(carry){ Object.assign(L, { right:carry.right, total:carry.total, stars:carry.stars, said:carry.said, left:carry.left }); L.si = carry.si - 1; }
  const stage = $('#sStage');
  if(L.frame){
    stage.innerHTML = `
  <div class="fr" id="fr">
    <div class="fr-head lz-head">
      <span class="subj">${S.em} <b>${App.sn(item.subj)}</b> · ${esc(App.tp(item.topic))}</span>
      <div class="lz-steps" id="lzSteps"></div>
      <span class="sp"></span>
      <span class="meta" id="lzStars">${ic('star')} ${L.stars}</span>
      <span class="meta" id="lzTime"></span>
    </div>
    <div class="fr-start">
      <div class="fz dw fr-tile" id="frBack" data-dwell="2">${ic('house')}<b>${tr('Today','היום')}</b><small>${tr('look a little longer','מבט קצת ארוך')}</small></div>
      <div class="fz dw fr-tile fr-talk" id="frTalk">${ic('message-circle')}<b>${tr('Talk','לדבר')}</b><small>${tr('to Ollie','עם ינשופי')}</small></div>
    </div>
    <div class="fr-center quiet">
      <div class="fr-ollie lz-ollie" id="lzOllie"><div class="face">${OWL}</div><div><b>${teacher()}</b><small>${tr('your teacher · simulated AI','המורה שלך · AI מדומה')}</small></div></div>
      <div class="lz-stream" id="lzStream"></div>
      <div class="fr-hint" id="frHint"></div>
    </div>
    <div class="fr-end">
      <div class="fz dw fr-tile" id="frAgain">${ic('repeat')}<b>${tr('Again','שוב')}</b><small>${tr('hear it again','לשמוע שוב')}</small></div>
      <div class="fr-slot" id="frFwd"><div class="fr-ph"></div></div>
    </div>
    <div class="fr-ans" id="frAns"></div>
    <div class="fr-drawer" id="frDrawer" hidden>
      <div class="lbl"><span>${ic('message-circle')} ${tr('Talk to Ollie','לדבר עם ינשופי')}</span><span id="lzHint"></span></div>
      <div class="bank-row fr-bank" id="bankA"></div>
      <div class="bank-row fr-bank" id="bankB"></div>
    </div>
  </div>`;
    $('#frBack').onclick = () => L.hooks.onHome();
    $('#frTalk').onclick = () => drawer(!L.drawer);
    $('#frAgain').onclick = () => phrase('again');
  } else {
  stage.innerHTML = `
  <div class="lz-head">
    <span class="subj">${S.em} <b>${App.sn(item.subj)}</b> · ${esc(App.tp(item.topic))}</span>
    <div class="lz-steps" id="lzSteps"></div>
    <span class="sp"></span>
    <span class="meta" id="lzStars">${ic('star')} ${L.stars}</span>
    <span class="meta" id="lzTime"></span>
  </div>
  <div class="lz-main">
    <div class="lz-ollie" id="lzOllie"><div class="face">${OWL}</div><b>${teacher()}</b><small>${tr('your teacher','המורה שלך')}</small><span class="sim">${tr('simulated AI','AI מדומה')}</span></div>
    <div class="lz-right"><div class="lz-stream" id="lzStream"></div><div class="lz-act" id="lzAct"></div></div>
  </div>
  <div class="lz-bank">
    <div class="lbl"><span>${ic('message-circle')} ${tr('Talk to Ollie','לדבר עם ינשופי')}</span><span id="lzHint"></span></div>
    <div class="bank-row" id="bankA"></div>
    <div class="bank-row" id="bankB"></div>
  </div>`;
  }
  stream = $('#lzStream'); act = $('#lzAct'); bankA = $('#bankA'); bankB = $('#bankB');
  bankA.onclick = onBankA; bankB.onclick = onBankB;
  renderBank(); drawSteps(); tick(true);
  L.timer = setInterval(tick, 1000);
  log('lesson.start', `${item.subj} · ${item.topic} · ${Lang.cur} · ${L.frame?'frame':'classic'} layout · scripted teacher · ${item.min} min${carry?` · resumed at step ${carry.si+1}`:''}`);
  if(carry?.done) queue(() => finish(true)); else queue(next);
}
function state(){ return L.on ? { si:Math.max(0, L.si), right:L.right, total:L.total, stars:L.stars, said:L.said, left:L.left, done:L.done } : null; }
function tick(first){
  if(!L.on) return;
  if(!first && !L.paused && L.left > 0) L.left--;
  const el = $('#lzTime'); if(!el) return;
  const mm = `${Math.floor(L.left/60)}:${String(L.left%60).padStart(2,'0')}`;
  el.innerHTML = L.left > 0 ? `${ic('timer')} <span dir="ltr">${mm}</span> ${tr('left','נשארו')}` : `${ic('timer')} ${tr("time's up: finish when you're ready",'הזמן נגמר: אפשר לסיים בנחת')}`;
}
function queue(fn){ const id = L.id; L.q = L.q.then(() => (L.on && id===L.id) ? fn() : null).catch(e => console.error(e)); return L.q; }
function drawSteps(){
  const el = $('#lzSteps'); if(!el) return;
  el.innerHTML = L.script.steps.map((s,i) => `<i class="${s.q?'q':''} ${i<L.si?'done':i===L.si?'cur':''}" title="${s.q?tr('Question','שאלה'):tr('Lesson','שיעור')}"></i>`).join('');
}

/* ---------------- the teacher talks ---------------- */
function ollie(on){ $('#lzOllie')?.classList.toggle('talking', on); }
function say(text, mine){
  if(!App.sound || !App.settings.readAloud) return;
  try{
    const u = new SpeechSynthesisUtterance(text.replace(/[⭐🎉🐢😊☕“”"⁦⁩]/gu, ''));
    u.lang = $('#lang').value; u.rate = mine ? 1 : L.rate; u.pitch = mine ? 1.3 : 1;
    speechSynthesis.speak(u);
  }catch(e){}
}
function bubble(cls, html){
  const b = document.createElement('div'); b.className = 'bub ' + cls; b.innerHTML = html;
  stream.append(b);
  const bs = [...stream.children]; bs.forEach((x,i) => x.classList.toggle('old', i < bs.length-3));
  while(stream.children.length > 8) stream.firstChild.remove();
  return b;
}
async function type(text, cls=''){
  const id = L.id, b = bubble(cls, ''), words = text.split(' ');
  ollie(true); say(text);
  for(let i=0; i<words.length; i++){
    if(id!==L.id || !L.on) return;
    b.textContent = words.slice(0, i+1).join(' ');
    await sleep(55);
  }
  ollie(false);
}
function reply(text, cls=''){
  queue(async () => {
    const th = bubble('', '<span class="dots"><i></i><i></i><i></i></span>');
    await sleep(700);
    th.remove();
    await type(text, cls);
  });
}

/* ---------------- layout helpers: classic puts actions under the text, the frame puts them on the edges ---------------- */
const PH = '<div class="fr-ph"></div>';
function setFwd(html){ if(L.frame){ const f = $('#frFwd'); if(f) f.innerHTML = html || PH; } else act.innerHTML = html || ''; }
function clearAct(){ setFwd(''); if(L.frame){ const a = $('#frAns'); if(a) a.innerHTML = ''; hint(''); } }
function hint(html){ const h = L.frame ? $('#frHint') : $('#mcqHint'); if(h) h.innerHTML = html; }
const ansBox = () => L.frame ? $('#frAns') : act;
const fwdIcon = () => ic(Lang.cur==='he' ? 'arrow-left' : 'arrow-right');
function drawer(open){
  if(!L.frame) return;
  L.drawer = open;
  $('#frDrawer').hidden = !open;
  $('#fr').classList.toggle('drawer-open', open);
  $('#frTalk').innerHTML = open ? `${ic('x')}<b>${tr('Close','סגירה')}</b><small>${tr('back to the lesson','חזרה לשיעור')}</small>`
                                : `${ic('message-circle')}<b>${tr('Talk','לדבר')}</b><small>${tr('to Ollie','עם ינשופי')}</small>`;
  if(!open && L.word){ L.word = null; renderBank(); }
  log('lesson.talk', open ? 'drawer opened' : 'drawer closed');
}

/* ---------------- lesson steps ---------------- */
function next(){
  L.si++; drawSteps();
  const s = L.script.steps[L.si];
  if(!s) return finish();
  return s.q ? ask(s) : teach(s);
}
async function teach(s){
  L.cur = s; L.mcq = null; clearAct();
  await type(s.p);
  if(L.on) contTile();
}
function contTile(){
  setFwd(L.frame
    ? `<div class="fz dw fr-tile fr-go" id="lzCont">${fwdIcon()}<b>${tr('Next','הבא')}</b></div>`
    : `<div class="lz-cont dw" id="lzCont">${tr('Next','הבא')}&nbsp;${fwdIcon()}</div>`);
  $('#lzCont').onclick = () => { setFwd(''); queue(next); };
}
async function ask(s){
  L.cur = s; clearAct();
  await type(s.q, 'q');
  if(!L.on) return;
  L.mcq = { s, chosen:null, rev:0, answered:false, t0:performance.now() };
  const order = [...s.options.keys()].sort(() => Math.random() - .5);
  const hintTxt = App.settings.confirmStep
    ? (L.frame ? tr('Look at an answer. Then look at ✓ in the corner to choose it.','תסתכלי על תשובה. אחר כך תסתכלי על ✓ בפינה כדי לבחור אותה.')
               : tr('Look at an answer. Then look at ✓ under it to choose it.','תסתכלי על תשובה. אחר כך תסתכלי על ✓ שמתחתיה כדי לבחור אותה.'))
    : tr('Look at an answer to choose it.','תסתכלי על תשובה כדי לבחור אותה.');
  if(L.frame){
    $('#frAns').innerHTML = order.map(i => `<div class="fz opt dw" data-o="${i}"><span>${esc(s.options[i])}</span></div>`).join('');
    hint(hintTxt);
    $('#frAns').querySelectorAll('[data-o]').forEach(el => el.onclick = () => choose(+el.dataset.o));
    return;
  }
  act.innerHTML = `
    <div class="mcq">${order.map(i => `<div class="mcq-col"><div class="opt dw" data-o="${i}">${esc(s.options[i])}</div><div class="cf" data-cf="${i}"><span>✓</span>${tr('Yes, this one','כן, את זאת')}</div></div>`).join('')}</div>
    <div class="mcq-hint" id="mcqHint">${App.settings.confirmStep ? tr('Look at an answer. Then look at ✓ under it to choose it.','תסתכלי על תשובה. אחר כך תסתכלי על ✓ שמתחתיה כדי לבחור אותה.') : tr('Look at an answer to choose it.','תסתכלי על תשובה כדי לבחור אותה.')}</div>`;
  act.querySelectorAll('[data-o]').forEach(el => el.onclick = () => choose(+el.dataset.o));
  act.querySelectorAll('[data-cf]').forEach(el => el.onclick = () => { if(el.classList.contains('on')) commit(+el.dataset.cf); });
}
/* first look picks an answer; the ✓ under it (and only it) becomes selectable */
function choose(i){
  const m = L.mcq; if(!m || m.answered) return;
  if(!App.settings.confirmStep) return commit(i);
  if(m.chosen===i) return;
  if(m.chosen!==null) m.rev++;
  m.chosen = i;
  ansBox().querySelectorAll('[data-o]').forEach(el => el.classList.toggle('chosen', +el.dataset.o===i));
  const o = esc(m.s.options[i]);
  if(L.frame){
    /* the ✓ always appears in the same forward corner */
    setFwd(`<div class="fz dw fr-tile fr-go ok cf on" data-cf="${i}">${ic('check')}<b>${tr('Yes, this one','כן, את זאת')}</b><small>“${o}”</small></div>`);
    $('#frFwd [data-cf]').onclick = () => commit(i);
    hint(tr(`You picked <b>“${o}”</b>. Look at ✓ to lock it in, or look at another answer.`, `בחרת <b>"${o}"</b>. תסתכלי על ✓ כדי לנעול, או על תשובה אחרת.`));
    say(m.s.options[i], true);
    log('lesson.choose', `“${m.s.options[i]}”${m.rev?` (changed ${m.rev}×)`:''} · waiting for ✓ (frame)`);
    return;
  }
  act.querySelectorAll('[data-cf]').forEach(el => { const on = +el.dataset.cf===i; el.classList.toggle('on', on); el.classList.toggle('dw', on); });
  $('#mcqHint').innerHTML = tr(`You picked <b>“${o}”</b>. Look at ✓ to lock it in, or look at another answer.`, `בחרת <b>"${o}"</b>. תסתכלי על ✓ כדי לנעול, או על תשובה אחרת.`);
  say(m.s.options[i], true);
  log('lesson.choose', `“${m.s.options[i]}”${m.rev?` (changed ${m.rev}×)`:''} · waiting for ✓`);
}
function commit(i){
  const m = L.mcq; if(!m || m.answered) return;
  m.answered = true;
  const s = m.s, ok = i===s.a, secs = ((performance.now()-m.t0)/1000).toFixed(1), quality = m.rev ? 'uncertain' : 'valid', ans = s.options[s.a];
  const box = ansBox();
  box.querySelectorAll('[data-o],[data-cf]').forEach(el => el.classList.remove('dw','on','chosen'));
  box.querySelector(`[data-o="${i}"]`).classList.add(ok ? 'right' : 'wrong');
  if(!ok) box.querySelector(`[data-o="${s.a}"]`).classList.add('right');
  if(L.frame) setFwd('');
  hint(esc(ok ? tr('Correct!','נכון!') : tr(`The answer is “${ans}”.`, `התשובה היא "${ans}".`)));
  L.total++; if(ok){ L.right++; L.stars++; $('#lzStars').innerHTML = `${ic('star')} ${L.stars}`; }
  App.today.answers.push({ topic:L.item.topic, q:s.q, ok, quality });
  log('lesson.answer', `${ok?'correct':'wrong'} · ${quality} (${m.rev} change${m.rev===1?'':'s'} of mind) · ${secs}s · “${s.q}”`);
  queue(async () => {
    await sleep(500);
    await type(ok ? tr(`Yes! ${s.explain}`, `נכון! ${s.explain}`)
                  : tr(`Good try, Noa! The answer is “${ans}”. ${s.explain}`, `ניסיון יפה, נועה! התשובה היא "${ans}". ${s.explain}`), ok ? 'good' : '');
    if(L.on) contTile();
  });
}
async function finish(resumed){
  L.cur = null; L.mcq = null; L.done = true; L.si = L.script.steps.length; drawSteps();
  if(!resumed){
    App.markDone(L.item, L.right, L.total);
    log('lesson.done', `${L.item.topic} · ${L.right}/${L.total} · said ${L.said} thing${L.said===1?'':'s'} to the teacher`);
  }
  await type(tr(`Great work, Noa! You got ${L.right} of ${L.total} right${L.said ? `, and you talked with me ${times(L.said)}` : ''}. I'm proud of you!`,
                `עבודה מצוינת, נועה! ענית נכון על ${L.right} מתוך ${L.total}${L.said ? `, ודיברת איתי ${times(L.said)}` : ''}. אני גאה בך!`), 'good');
  if(!L.on) return;
  const nx = App.nextItem();
  if(L.frame){
    const a = $('#frAns'); if(a) a.innerHTML = ''; hint('');
    setFwd(nx ? `<div class="fz dw fr-tile fr-go" id="lzNext">${App.SUBJ[nx.subj].em}<b>${tr('Next','הבא')}: ${esc(App.topicLabel(nx))}</b><small>${nx.min} ${tr('min','דק׳')}</small></div>`
              : `<div class="fz dw fr-tile fr-go" id="lzHome">${ic('house')}<b>${tr('Back to today','חזרה להיום')}</b></div>`);
    if(nx) $('#lzNext').onclick = () => L.hooks.onNext(nx); else $('#lzHome').onclick = () => L.hooks.onHome();
    return;
  }
  act.innerHTML = `<div class="lz-end">
    ${nx ? `<div class="st-tile go dw" id="lzNext"><span class="em">${App.SUBJ[nx.subj].em}</span>${tr('Next','הבא')}: ${esc(App.topicLabel(nx))}<small>${nx.min} ${tr('min','דק׳')}</small></div>` : ''}
    <div class="st-tile dw" id="lzHome" ${nx?'':'style="grid-column:1/-1"'}><span class="em">${ic('house')}</span>${tr('Back to today','חזרה להיום')}</div></div>`;
  if(nx) $('#lzNext').onclick = () => L.hooks.onNext(nx);
  $('#lzHome').onclick = () => L.hooks.onHome();
}

/* ---------------- word bank: Noa talks to the teacher ---------------- */
const fz = () => L.frame ? 'fz' : '';
function renderBank(){
  const words = Object.keys(L.script.words).slice(0, 8);
  if(L.word){
    const d = L.script.words[L.word];
    bankA.innerHTML = d.q.map((s,i) => `<div class="bk sent dw ${fz()}" data-sq="${i}">${esc(s)}</div>`).join('')
      + `<div class="bk dw ${fz()}" data-say>“${esc(cap(L.word))}?”<small>${tr('just my word','רק המילה שלי')}</small></div><div class="bk ph dw ${fz()}" data-cancel><span class="e">${ic('undo-2')}</span>${tr('Back','חזרה')}</div>`;
    $('#lzHint').textContent = tr(`Pick a sentence about “${L.word}”, or say just the word`, `בחרי משפט על "${L.word}", או הגידי רק את המילה`);
  } else {
    bankA.innerHTML = PHRASES[Lang.cur].map(([k,e,txt]) => `<div class="bk ph dw ${fz()}" data-ph="${k}"><span class="e">${ic(e)}</span>${esc(txt)}</div>`).join('');
    $('#lzHint').textContent = tr('One look says a phrase · a word asks about it', 'מבט אחד אומר משפט · מילה שואלת עליה');
  }
  bankB.innerHTML = words.map(w => `<div class="bk word dw ${fz()} ${w===L.word?'picked':''}" data-w="${esc(w)}">${esc(w)}</div>`).join('')
    + Array(8 - words.length).fill('<div class="bk off"></div>').join('');
}
const looks = n => tr(n===1 ? '1 look' : `${n} looks`, n===1 ? 'מבט אחד' : `${n} מבטים`);
function onBankA(e){
  const el = e.target.closest('.dw'); if(!el || !L.on) return;
  const d = el.dataset;
  if(d.ph){ if(L.drawer) drawer(false); return phrase(d.ph); }
  if(d.sq !== undefined){ const w = L.word, x = L.script.words[w]; L.word = null; renderBank(); if(L.drawer) drawer(false); me(x.q[+d.sq], `${tr('AI-completed','השלמת AI')} · ${looks(2)}`); return reply(x.a[+d.sq]); }
  if(d.say !== undefined){ const w = L.word; L.word = null; renderBank(); if(L.drawer) drawer(false); me(`${cap(w)}?`, `${tr('her exact words','המילים שלה בדיוק')} · ${looks(2)}`); return reply(L.script.words[w].a[0]); }
  if(d.cancel !== undefined){ L.word = null; renderBank(); }
}
function onBankB(e){
  const el = e.target.closest('[data-w]'); if(!el || !L.on) return;
  L.word = el.dataset.w; renderBank();
  log('lesson.word', `“${L.word}” → 3 suggested sentences`);
}
function me(text, kind){
  bubble('me', `${esc(text)}<small>${t('name.noa')} · ${kind}</small>`);
  say(text, true);
  L.said++;
  App.today.said.push({ text, kind:`${kind} · ${App.tp(L.item.topic)}` });
  log('lesson.noa_says', `“${text}” · ${kind}`);
}
function phrase(k){
  const p = PHRASES[Lang.cur].find(x => x[0]===k);
  me(p[2], `${tr('her exact words','המילים שלה בדיוק')} · ${looks(1)}`);
  if(k==='break') return queue(takeBreak);
  const c = L.cur || {}, waiting = L.mcq && !L.mcq.answered;
  const r = {
    yes:   waiting ? tr('Great! Look at an answer, then look at ✓ to choose it.','מעולה! תסתכלי על תשובה, ואז על ✓ כדי לבחור אותה.') : tr('Great!','מעולה!'),
    no:    L.frame ? tr("That's okay. Look at Talk to tell me what you need.",'זה בסדר. אפשר להסתכל על "לדבר" כדי להגיד לי מה את צריכה.')
               : tr("That's okay. Use the words below to tell me what you need.",'זה בסדר. אפשר להשתמש במילים למטה כדי להגיד לי מה את צריכה.'),
    again: c.q || c.p || tr('Sure!','בטח!'),
    huh:   c.q ? (c.hint || tr('Let me help: listen to the question again, slowly.','בואי ננסה ביחד: תקשיבי לשאלה שוב, לאט.'))
               : c.easy ? tr(`Let me say it another way. ${c.easy}`, `אגיד את זה אחרת. ${c.easy}`) : tr('Let me say it another way.','אגיד את זה אחרת.'),
    more:  c.q ? tr("Let's answer this question first, then I'll tell you more!",'קודם נענה על השאלה, ואז אספר לך עוד!') : (c.more || L.script.like),
    slow:  tr("Okay, I'll talk slower.",'בסדר, אדבר לאט יותר.'),
    like:  L.script.like,
  }[k];
  if(k==='slow') L.rate = .72;
  reply(r);
}
async function takeBreak(){
  App.today.breaks++;
  const name = esc(App.adultName()), topic = esc(App.tp(L.item.topic));
  if(App.settings.notify) toast(tr(`${ic('bell-ring')} <b>${name} was notified</b><small>Noa is taking a break during ${topic}</small>`, `${ic('bell-ring')} <b>${name} קיבלה התראה</b><small>נועה לוקחת הפסקה בשיעור ${topic}</small>`), 5000);
  log('lesson.break', `Noa asked for a break · ${App.adultName()} notified`);
  await type(tr("Of course! Rest your eyes. I'll wait right here.",'בטח! תני לעיניים לנוח. אני מחכה לך כאן.'));
  if(!L.on) return;
  L.paused = true;
  const stage = $('#sStage'), ov = document.createElement('div');
  let secs = 120;
  ov.className = 'st-over';
  ov.innerHTML = `<div class="st-big">${ic('coffee')}</div><div class="st-title">${tr('Break time','זמן הפסקה')}</div><div class="st-sub">${tr(`Rest your eyes. ${teacher()} will wait for you.`,`תני לעיניים לנוח. ${teacher()} מחכה לך.`)}</div>
    <div class="clock" id="brkClock" dir="ltr">2:00</div><div class="st-tile go dw" id="brkDone"><span class="em">${ic('play')}</span>${tr("I'm ready",'אני מוכנה')}</div>`;
  stage.append(ov); stage.classList.add('paused');
  const id = L.id, tm = setInterval(() => {
    if(id!==L.id){ clearInterval(tm); return; }
    secs = Math.max(0, secs-1); const c = $('#brkClock'); if(c) c.textContent = `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;
  }, 1000);
  await new Promise(res => $('#brkDone').onclick = res);
  clearInterval(tm); ov.remove(); stage.classList.remove('paused'); L.paused = false;
  await type(tr("Welcome back, Noa! Let's keep going.",'ברוכה השבה, נועה! בואי נמשיך.'));
}

window.Lesson = { start, stop, state };
})();
