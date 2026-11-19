/* ================= Rettina i18n: English ⇄ Hebrew (RTL) =================
   t(key, vars) for static/shared strings, tr(en, he) for inline copy in the flow modules.
   setLang() flips <html dir>, updates every [data-i18n] node, and fires a 'langchange' event
   so each module re-renders what is on screen. Language comes from #he / #en in the link,
   then the viewer's last choice, then English. */
const I18N = {
en: {
  'name.noa':'Noa', 'noa.initial':'N', demo:'Demo ▾',
  'nav.parent':'Parent', 'nav.dash':'Dashboard', 'nav.dash.s':'Yesterday · today · this year', 'nav.sched':"Today's schedule", 'nav.sources':'Sources', 'nav.sources.s':'Ministry · school · your files',
  'nav.switch':"Switch to Noa's mode", 'nav.modules':'Modules',
  'nav.convo':'Conversation', 'nav.convo.s':'Predictive words · sentence completion',
  'nav.learn':'Learn', 'nav.learn.s':'What would you like to learn?',
  'nav.hw':'Accessible Homework', 'nav.hw.s':'Assignment → questions',
  'nav.quiz':'Level Check', 'nav.quiz.s':'Adaptive quiz · knowledge map',
  'nav.student':'Student', 'nav.noa':'Noa · Grade 3', 'nav.noa.s':'Rett · gaze input',
  'set.input':'Input', 'set.pointer':'Pointer', 'opt.mouse':'Mouse', 'opt.gaze':'Webcam eye gaze', 'opt.head':'Webcam head pointer',
  'set.calibrate':'Calibrate', 'set.camera':'Camera', 'set.snap':'Snap radius', 'set.dwellOn':'Dwell select', 'set.dwellMs':'Dwell time',
  'set.llm':'Language model', 'set.model':'Model', 'opt.haiku':'Claude Haiku 5.5 (fastest)', 'set.key':'Set API key', 'set.theme':'Theme',
  'set.speech':'Speech', 'opt.en':'English', 'opt.he':'Hebrew',
  'st.room':'Room audio:', 'st.llm':'LLM:', 'st.input':'Input:',
  'hdr.last':'Last message:', 'hdr.signout':'Sign out', 'hdr.proto':'PROTOTYPE',
  'title.dash':'Dashboard', 'crumb.dash':'Noa · Grade 3',
  'title.sched':"Today's schedule", 'crumb.sched':'Review and confirm before Noa starts',
  'title.sources':'Sources', 'crumb.sources':'Official curriculum and your own files',
  'title.convo':'Conversation', 'crumb.convo':'Grade 3 · History · "Life in Medieval Times"',
  'title.learn':'Learn', 'crumb.learn':'Student-chosen topics · gaze keyboard with autocomplete',
  'title.hw':'Accessible Homework', 'crumb.hw':'Teacher workspace · AI drafts, teacher approves',
  'title.quiz':'Level Check', 'crumb.quiz':'Adaptive quiz from approved questions · questions shown in English',
  'convo.room':'Room context', 'convo.sim':'Simulate class', 'convo.pause':'Pause class', 'convo.restart':'Restart class',
  'convo.mic':'Listen (mic)', 'convo.micStop':'Stop listening',
  'convo.hint':'Speech runs in the background and only feeds the predictions. The student never has to read it.',
  'convo.board':"Noa's board", 'convo.kwph':'Pick a few words. Rettina finishes the sentence.',
  'convo.undo':'Undo', 'convo.clear':'Clear', 'convo.say':'Say my words as they are',
  'convo.sentPh':'sentence suggestions appear here', 'convo.noSent':'no suggestion', 'convo.predicting':'predicting…',
  'convo.says':'Noa says', 'convo.saysSub':"Spoken aloud and shown on the teacher's screen · {n} selections", 'convo.savings':'{p} selections → {w} words',
  'convo.room.name':'Room',
  core:['Yes','No','Teacher','I want','Ask',"I don't know"],
  'stt.idle':'idle', 'stt.sim':'simulated', 'stt.mic':'microphone (Chrome speech service)',
  'stt.noSR':'This browser has no speech recognition. Use Chrome, or Simulate class.', 'stt.denied':'Microphone permission was denied.',
  'llm.mockNoKey':'mock (no key)', 'llm.mock':'mock', 'llm.fallback':'fallback',
  'llm.keyPrompt':'Paste an Anthropic API key (stored only in this browser for this prototype). Leave empty to remove it and use the mock.',
  'hw.ph':'Paste an assignment, or describe a topic the child asked about…', 'hw.sample':'Use sample worksheet',
  'hw.later':'PDF / Word / photo upload comes later', 'hw.gen':'Generate questions',
  'hw.hello':"Hi! Paste an assignment and I'll turn it into multiple-choice questions Noa can answer by gaze.<br><span class=\"hint\">I only use what's in your text, no outside facts. Nothing reaches the student until you approve it.</span>",
  'hw.here':'Here are <b>{n} draft questions</b>. Approve the ones you want Noa to see.', 'hw.approve':'Approve', 'hw.approved':'Approved ✓',
  'hw.delete':'Delete', 'hw.source':'Source', 'hw.all':'Approve all', 'hw.toQuiz':'Send to Level Check →',
  'hw.none':"I couldn't find enough full sentences to build questions from. Try a longer passage.",
  'log.title':'Agent activity', 'log.events':'events',
  'stu.sound':'Sound', 'stu.muted':'Muted', 'stu.soundT':'Read aloud on / off', 'stu.parent':'Parent', 'stu.parentT':'Back to parent mode (PIN)',
  'gz.loading':'loading face model…', 'gz.perm':'waiting for camera permission…', 'gz.on':'camera on', 'gz.needCal':'needs calibration',
  'gz.noFace':'face not found', 'gz.off':'off', 'gz.err':'camera error: ', 'gz.eye':'eye gaze', 'gz.head':'head pointer',
  'cal.look':'Look at each dot until it shrinks. Keep your head comfortable and still.<br><small>Esc to cancel</small>',
  'cal.check':'Checking accuracy… keep looking at the dots.',
  'cal.done':'<b>Calibrated.</b> Median error: eye gaze {g}px (≈{gd}°), head pointer {h}px (≈{hd}°).<br><small>Targets are ~140px+, snapping covers the rest.</small>',
  'cal.noFace':'Could not see a face clearly. Check lighting and try again.',
  'camErr':'Camera unavailable: {e}',
  'lang.label':'Language: English or Hebrew',
},
he: {
  'name.noa':'נועה', 'noa.initial':'נ', demo:'הדגמה ▾',
  'nav.parent':'הורה', 'nav.dash':'לוח בקרה', 'nav.dash.s':'אתמול · היום · השנה', 'nav.sched':'הלו״ז של היום', 'nav.sources':'מקורות', 'nav.sources.s':'משרד החינוך · בית הספר · הקבצים שלכם',
  'nav.switch':'מעבר למצב של נועה', 'nav.modules':'מודולים',
  'nav.convo':'שיחה', 'nav.convo.s':'מילים חזויות · השלמת משפטים',
  'nav.learn':'למידה', 'nav.learn.s':'מה בא לך ללמוד?',
  'nav.hw':'שיעורי בית נגישים', 'nav.hw.s':'מטלה ← שאלות',
  'nav.quiz':'בדיקת רמה', 'nav.quiz.s':'שאלון מסתגל · מפת ידע',
  'nav.student':'תלמידה', 'nav.noa':'נועה · כיתה ג׳', 'nav.noa.s':'רט · קלט במבט',
  'set.input':'קלט', 'set.pointer':'הצבעה', 'opt.mouse':'עכבר', 'opt.gaze':'מבט עיניים (מצלמה)', 'opt.head':'הצבעה בראש (מצלמה)',
  'set.calibrate':'כיול', 'set.camera':'מצלמה', 'set.snap':'רדיוס הצמדה', 'set.dwellOn':'בחירה במבט', 'set.dwellMs':'זמן מבט',
  'set.llm':'מודל שפה', 'set.model':'מודל', 'opt.haiku':'Claude Haiku 5.5 (הכי מהיר)', 'set.key':'מפתח API', 'set.theme':'ערכת צבע',
  'set.speech':'דיבור', 'opt.en':'אנגלית', 'opt.he':'עברית',
  'st.room':'שמע בכיתה:', 'st.llm':'מודל:', 'st.input':'קלט:',
  'hdr.last':'הודעה אחרונה:', 'hdr.signout':'יציאה', 'hdr.proto':'אב־טיפוס',
  'title.dash':'לוח בקרה', 'crumb.dash':'נועה · כיתה ג׳',
  'title.sched':'הלו״ז של היום', 'crumb.sched':'בדיקה ואישור לפני שנועה מתחילה',
  'title.sources':'מקורות', 'crumb.sources':'תוכנית הלימודים הרשמית והקבצים שלכם',
  'title.convo':'שיחה', 'crumb.convo':'כיתה ג׳ · היסטוריה · "החיים בימי הביניים"',
  'title.learn':'למידה', 'crumb.learn':'נושאים שהתלמידה בוחרת · מקלדת מבט עם השלמה אוטומטית',
  'title.hw':'שיעורי בית נגישים', 'crumb.hw':'סביבת המורה · ה־AI מנסח, המורה מאשרת',
  'title.quiz':'בדיקת רמה', 'crumb.quiz':'שאלון מסתגל מתוך שאלות מאושרות · השאלות מוצגות באנגלית',
  'convo.room':'מה קורה בכיתה', 'convo.sim':'הדמיית שיעור', 'convo.pause':'השהיית השיעור', 'convo.restart':'שיעור מההתחלה',
  'convo.mic':'האזנה (מיקרופון)', 'convo.micStop':'עצירת האזנה',
  'convo.hint':'הדיבור בכיתה רץ ברקע ומשמש רק לחיזוי. התלמידה אף פעם לא צריכה לקרוא אותו.',
  'convo.board':'הלוח של נועה', 'convo.kwph':'בחרי כמה מילים. רטינה תשלים את המשפט.',
  'convo.undo':'ביטול', 'convo.clear':'ניקוי', 'convo.say':'להגיד את המילים שלי כמו שהן',
  'convo.sentPh':'כאן יופיעו הצעות למשפטים', 'convo.noSent':'אין הצעה', 'convo.predicting':'חוזה…',
  'convo.says':'נועה אומרת', 'convo.saysSub':'הוקרא בקול ומוצג במסך של המורה · {n} בחירות', 'convo.savings':'{p} בחירות ← {w} מילים',
  'convo.room.name':'כיתה',
  core:['כן','לא','המורה','אני רוצה','לשאול','אני לא יודעת'],
  'stt.idle':'במנוחה', 'stt.sim':'הדמיה', 'stt.mic':'מיקרופון (שירות הדיבור של Chrome)',
  'stt.noSR':'בדפדפן הזה אין זיהוי דיבור. אפשר להשתמש ב־Chrome, או בהדמיית שיעור.', 'stt.denied':'לא ניתנה הרשאה למיקרופון.',
  'llm.mockNoKey':'מדומה (אין מפתח)', 'llm.mock':'מדומה', 'llm.fallback':'גיבוי',
  'llm.keyPrompt':'הדביקו מפתח API של Anthropic (נשמר רק בדפדפן הזה). השאירו ריק כדי למחוק ולחזור למצב המדומה.',
  'hw.ph':'הדביקו מטלה, או תארו נושא שהילדה שאלה עליו…', 'hw.sample':'דף עבודה לדוגמה',
  'hw.later':'העלאת PDF / Word / תמונה תגיע בהמשך', 'hw.gen':'יצירת שאלות',
  'hw.hello':'שלום! הדביקו מטלה ואהפוך אותה לשאלות אמריקאיות שנועה יכולה לענות עליהן במבט.<br><span class="hint">אני משתמש רק במה שכתוב בטקסט שלכם, בלי עובדות מבחוץ. שום דבר לא מגיע לתלמידה לפני שאתם מאשרים.</span>',
  'hw.here':'הנה <b>{n} טיוטות שאלות</b>. אשרו את אלה שנועה תראה.', 'hw.approve':'אישור', 'hw.approved':'אושר ✓',
  'hw.delete':'מחיקה', 'hw.source':'מקור', 'hw.all':'אישור של הכול', 'hw.toQuiz':'שליחה לבדיקת רמה ←',
  'hw.none':'לא מצאתי מספיק משפטים שלמים כדי לבנות שאלות. נסו קטע ארוך יותר.',
  'log.title':'פעילות המערכת', 'log.events':'אירועים',
  'stu.sound':'קול', 'stu.muted':'מושתק', 'stu.soundT':'הקראה בקול: הפעלה / כיבוי', 'stu.parent':'הורה', 'stu.parentT':'חזרה למצב הורה (קוד)',
  'gz.loading':'טוען מודל פנים…', 'gz.perm':'מחכה להרשאת מצלמה…', 'gz.on':'המצלמה פועלת', 'gz.needCal':'צריך כיול',
  'gz.noFace':'לא נמצאו פנים', 'gz.off':'כבוי', 'gz.err':'שגיאת מצלמה: ', 'gz.eye':'מבט עיניים', 'gz.head':'הצבעה בראש',
  'cal.look':'תסתכלי על כל נקודה עד שהיא מתכווצת. הראש נשאר נוח ויציב.<br><small>Esc לביטול</small>',
  'cal.check':'בודקים דיוק… ממשיכים להסתכל על הנקודות.',
  'cal.done':'<b>הכיול הושלם.</b> סטייה חציונית: מבט עיניים {g} פיקסלים (≈{gd}°), הצבעה בראש {h} פיקסלים (≈{hd}°).<br><small>המטרות בגודל 140 פיקסלים ומעלה, וההצמדה משלימה את השאר.</small>',
  'cal.noFace':'לא הצלחתי לראות פנים בבירור. כדאי לבדוק את התאורה ולנסות שוב.',
  'camErr':'המצלמה לא זמינה: {e}',
  'lang.label':'שפה: אנגלית או עברית',
},
};

/* the simulated Hebrew class for the Conversation module (same lesson as the English script) */
const CLASS_SCRIPT_HE = [
  ['המורה כהן','בוקר טוב לכולם. היום אנחנו מתחילים נושא חדש: ימי הביניים.'],
  ['המורה כהן','לפני הרבה זמן, הרבה אנשים באירופה גרו ליד טירה. המלך והאבירים גרו בתוך חומות הטירה.'],
  ['דן','היו לאבירים סוסים?'],
  ['המורה כהן','כן דן. אבירים רכבו על סוסים גדולים ולבשו שריון כבד ממתכת.'],
  ['המורה כהן','רוב האנשים היו חקלאים. הם גידלו חיטה, פרות, כבשים ותרנגולות.'],
  ['יעל','מה ילדים עשו? הם הלכו לבית ספר?'],
  ['המורה כהן','שאלה מצוינת, יעל. רוב הילדים לא הלכו לבית ספר. הם עזרו להורים בחווה.'],
  ['המורה כהן','חלק מהבנים התאמנו להיות אבירים. חלק מהבנות למדו לארוג בד ולאפות לחם.'],
  ['המורה כהן','נועה, יש לך שאלה על טירות או על אבירים?'],
  ['דן','אני רוצה להיות אביר עם חרב ומגן!'],
  ['המורה כהן','בואו נדמיין. אם הייתם חיים בימי הביניים, באיזו עבודה הייתם רוצים לעבוד?'],
  ['יעל','אני הייתי אופה, כי אני אוהבת לחם.'],
  ['המורה כהן','נועה, איזו עבודה את היית בוחרת?'],
  ['המורה כהן','מחר נצייר טירה משלנו, עם מגדלים וגשר זחיח.'],
];
const STOP_HE = new Set(`של את על עם זה זאת זו הם הן הוא היא אני אתה אתם אנחנו גם לא כן מה מי איך למה כי אם או אבל רק כל יש אין היה היו הייתה אז עוד מאוד כמו אל לנו להם לה לו לי לך שלי שלך שלה שלו שלנו שלהם היום בוקר טוב לכולם נועה דן יעל המורה מורה כהן הרבה לפני זמן שאלה מצוינת בואו נדמיין הייתם הייתי היית רוצים רוצה אוהבת מחר משלנו נושא חדש מתחילים בתוך ליד רוב חלק גרו אנשים לפני מהבנים מהבנות עשו הלכו חיים באיזו לעבוד בוחרת איזו לכם יכולים ביחד אחר אחרי כדי`.split(/\s+/));

const Lang = { cur: 'en' };
(() => {
  const h = location.hash.slice(1).toLowerCase();
  let saved = null; try { saved = localStorage.getItem('rettina.lang'); } catch (e) {}
  Lang.cur = /(^|-)he(-|$)/.test(h) ? 'he' : /(^|-)en(-|$)/.test(h) ? 'en' : (saved === 'he' ? 'he' : 'en');
})();

function t(key, vars) {
  let s = I18N[Lang.cur][key] ?? I18N.en[key] ?? key;
  if (typeof s !== 'string' || !vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
}
function tr(en, he) { return Lang.cur === 'he' ? he : en; }
/* icons: <i data-lucide> placeholders, turned into inline SVG by Lucide whenever new ones appear */
const ic = (name, cls = '') => `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;
function lbl(sel, icon, key){ const el = document.querySelector(sel); if(el) el.innerHTML = `${ic(icon)} <span>${t(key)}</span>`; }
{ let queued = false;
  const paint = () => { queued = false; if (window.lucide) window.lucide.createIcons(); };
  new MutationObserver(() => { if (!queued && document.querySelector('i[data-lucide]')) { queued = true; requestAnimationFrame(paint); } })
    .observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('DOMContentLoaded', paint);
}
const langName = () => (document.getElementById('lang')?.value || 'en-US').startsWith('he') ? 'Hebrew' : 'English';
const isAddressed = s => /\bnoa\b/i.test(s) || s.includes('נועה');

function applyStatic() {
  const root = document.documentElement;
  root.lang = Lang.cur; root.dir = Lang.cur === 'he' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { const v = t(el.dataset.i18nPh); el.dataset.ph = v; if ('placeholder' in el) el.placeholder = v; });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('.lang-sw').forEach(paintSwitch);
}
function paintSwitch(b) {
  b.dataset.l = Lang.cur;
  b.setAttribute('role', 'switch');
  b.setAttribute('aria-checked', String(Lang.cur === 'he'));
  b.setAttribute('aria-label', t('lang.label'));
  b.title = 'English / עברית';
  if (!b.firstChild) b.innerHTML = '<span>EN</span><span>עב</span><i></i>';
}
function setLang(l) {
  if (l === Lang.cur) return;
  Lang.cur = l;
  try { localStorage.setItem('rettina.lang', l); } catch (e) {}
  const sel = document.getElementById('lang'); if (sel) sel.value = l === 'he' ? 'he-IL' : 'en-US';
  try { speechSynthesis.cancel(); } catch (e) {}
  applyStatic();
  dispatchEvent(new Event('langchange'));
}
document.addEventListener('click', e => {
  const b = e.target.closest('.lang-sw'); if (!b) return;
  setLang(Lang.cur === 'he' ? 'en' : 'he');
});

{ const sel = document.getElementById('lang'); if (sel) sel.value = Lang.cur === 'he' ? 'he-IL' : 'en-US'; }
applyStatic();
