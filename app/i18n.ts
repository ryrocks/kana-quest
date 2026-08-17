export const LOCALES = ["en", "zh-Hant", "zh-Hans", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  "zh-Hant": "繁體中文",
  "zh-Hans": "简体中文",
  es: "Español",
};

export const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  "zh-Hant": "zh_TW",
  "zh-Hans": "zh_CN",
  es: "es_ES",
};

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const normalized = language.toLowerCase();
    if (normalized.startsWith("zh-hant") || normalized.includes("-tw") || normalized.includes("-hk") || normalized.includes("-mo")) return "zh-Hant";
    if (normalized.startsWith("zh")) return "zh-Hans";
    if (normalized.startsWith("es")) return "es";
    if (normalized.startsWith("en")) return "en";
  }
  return "en";
}

const en = {
  meta: { title: "Kana Quest — Learn Hiragana & Katakana", description: "A three-minute learning adventure for remembering hiragana and katakana." },
  brand: "Kana Quest",
  loading: "Unfolding your journey map…",
  chooseLanguage: "Choosing your language…",
  language: "Language",
  homeAria: "Return to journey home",
  settings: "Settings",
  starsTitle: "Total stars",
  streakTitle: "Learning streak",
  home: {
    kicker: "Three minutes a day · Learn both scripts together",
    title: "Follow the kana trail,",
    titleEmphasis: "bring every sound home.",
    lead: "You do not need to memorize the whole chart today. Take three sounds with you and meet them again at the right time.",
    start: "Start today's journey",
    duration: "About 3 minutes →",
    weak: "Weak spot training",
    progress: "Journey progress",
    mastered: (count: number) => `${count} / 46 pairs mastered`,
    current: (row: string) => `Now exploring “${row}”`,
    mapAria: "Kana journey map",
    map: "Journey map",
    collection: "Open collection",
    station: (index: number) => `Stop ${String(index).padStart(2, "0")}`,
    locked: "Complete the previous stop to unlock",
  },
  lesson: {
    pause: "← Pause journey",
    label: "Charm lesson",
    sameSound: "One sound · Two shapes",
    listen: "Sound  Hear it once",
    next: "Next pair",
    gate: "Enter the torii",
  },
  quiz: {
    pause: "← Pause",
    soundEyebrow: "Sound recognition",
    pairEyebrow: "Twin matching",
    recallEyebrow: "Active recall",
    pairQuestion: "Which katakana has the same sound?",
    recallQuestion: "Choose the hiragana for this sound",
    soundQuestion: "How is this kana read?",
    playSound: "Play pronunciation",
    correct: "Correct — the trail remembers you.",
    wrong: (hira: string, kata: string, romaji: string) => `Look again: ${hira} / ${kata} is ${romaji}`,
    mastery: "Mastery moved one step forward",
    retry: "This question will return in a few steps",
    continue: "Continue",
  },
  result: {
    kicker: "Journey complete",
    unlocked: "A new path has opened.",
    complete: "Today's footprints are here to stay.",
    summary: (answered: number, correct: number) => `You completed ${answered} recalls and answered ${correct} correctly. Missed kana are already scheduled for review.`,
    accuracy: "Session accuracy",
    mastered: "Pairs mastered",
    streak: "Journey streak",
    days: (count: number) => `${count} ${count === 1 ? "day" : "days"}`,
    back: "Return to journey map",
    again: "Play another round",
  },
  library: {
    kicker: "Traveler's collection",
    title: "Kana footprints",
    intro: "Hiragana and katakana are tracked separately. Deeper ink means a stronger memory.",
    locked: "Not reached yet",
    mastery: (level: number) => `Mastery ${level} / 5`,
  },
  settingsPanel: {
    kicker: "Journey settings",
    title: "Travel at your own pace",
    done: "Done",
    voice: "Japanese voice",
    voiceDescription: "Play kana pronunciation during lessons and questions",
    sound: "Game sounds",
    soundDescription: "Play a short sound after each answer",
    motion: "Reduce motion",
    motionDescription: "Disable floating, sliding, and decorative animation",
    restart: "Restart the journey",
    restartDescription: "Clear stars, mastery, and streaks on this device.",
    reset: "Reset progress",
    resetConfirm: "Clear every journey, star, and mastery record? This cannot be undone.",
  },
  footer: { slogan: "Kana Quest · Remember one small stretch at a time", local: "Progress stays on this device" },
  rows: ["Vowel Grove", "Wind Slope", "Cherry River", "Thunder Pass", "Bamboo Village", "Fire Garden", "Moon Field", "Night Bridge", "Dragon Path", "Final Torii"],
};

export type Messages = typeof en;

const zhHant: Messages = {
  meta: { title: "假名旅人 Kana Quest", description: "每天三分鐘，用冒險闖關記住平假名與片假名。" },
  brand: "假名旅人",
  loading: "正在展開旅程地圖…",
  chooseLanguage: "正在選擇介面語言…",
  language: "語言",
  homeAria: "回到旅程首頁",
  settings: "設定",
  starsTitle: "累積星星",
  streakTitle: "連續學習天數",
  home: {
    kicker: "每日三分鐘 · 平片一起學",
    title: "沿著假名之路，",
    titleEmphasis: "把聲音找回來。",
    lead: "今天不用背整張表。帶走三組聲音，讓它們在對的時間再次出現。",
    start: "開始今日旅程",
    duration: "約 3 分鐘 →",
    weak: "弱點特訓",
    progress: "旅程進度",
    mastered: (count) => `${count} / 46 組已熟練`,
    current: (row) => `現在位於「${row}」`,
    mapAria: "五十音旅程地圖",
    map: "旅程地圖",
    collection: "打開圖鑑",
    station: (index) => `第 ${String(index).padStart(2, "0")} 站`,
    locked: "完成上一站後開啟",
  },
  lesson: { pause: "← 暫停旅程", label: "御守教學", sameSound: "同一個聲音 · 兩種字形", listen: "音 聽一次發音", next: "下一組", gate: "走進鳥居" },
  quiz: {
    pause: "← 暫停", soundEyebrow: "讀音辨認", pairEyebrow: "雙生配對", recallEyebrow: "主動回想",
    pairQuestion: "哪個片假名和它同音？", recallQuestion: "選出這個讀音的平假名", soundQuestion: "這個字怎麼念？", playSound: "播放發音",
    correct: "答對了，這條路記住你了。", wrong: (hira, kata, romaji) => `再看一次：${hira}／${kata} 是 ${romaji}`,
    mastery: "熟練度向前一步", retry: "這題會在幾步後再出現", continue: "繼續",
  },
  result: {
    kicker: "旅程完成", unlocked: "新的道路已經開啟。", complete: "今天的足跡，留下來了。",
    summary: (answered, correct) => `你完成了 ${answered} 次回想，答對 ${correct} 次。錯過的字已經排進下一次複習。`,
    accuracy: "本局正確率", mastered: "累積熟練", streak: "連續旅程", days: (count) => `${count} 天`, back: "回到旅程地圖", again: "再練一局",
  },
  library: { kicker: "旅人圖鑑", title: "五十音足跡", intro: "每一格分開記錄平假名與片假名；墨色越深，代表回想越穩固。", locked: "尚未抵達", mastery: (level) => `熟練 ${level} / 5` },
  settingsPanel: {
    kicker: "旅程設定", title: "照自己的步調走", done: "完成", voice: "日文語音", voiceDescription: "在教學與題目中播放假名讀音",
    sound: "遊戲音效", soundDescription: "每次回答後播放簡短提示音", motion: "減少動態效果", motionDescription: "關閉浮動、滑入與裝飾動畫",
    restart: "重新開始旅程", restartDescription: "清除這台裝置上的星星、熟練度與連續天數。", reset: "重設進度", resetConfirm: "確定要清除所有旅程、星星與熟練度嗎？這個動作無法復原。",
  },
  footer: { slogan: "假名旅人 · 每次只記住一小段路", local: "進度只保存在這台裝置" },
  rows: ["元音之森", "風之坡", "櫻之川", "雷之峠", "竹之里", "火之庭", "月之原", "夜之橋", "龍之徑", "終之鳥居"],
};

const zhHans: Messages = {
  ...zhHant,
  meta: { title: "假名旅人 Kana Quest", description: "每天三分钟，用冒险闯关记住平假名与片假名。" },
  loading: "正在展开旅程地图…", chooseLanguage: "正在选择界面语言…", language: "语言", homeAria: "回到旅程首页", settings: "设置", starsTitle: "累计星星", streakTitle: "连续学习天数",
  home: {
    ...zhHant.home, kicker: "每天三分钟 · 平片一起学", title: "沿着假名之路，", titleEmphasis: "把声音找回来。", lead: "今天不用背整张表。带走三组声音，让它们在对的时间再次出现。",
    start: "开始今日旅程", duration: "约 3 分钟 →", weak: "弱点特训", progress: "旅程进度", mastered: (count) => `${count} / 46 组已熟练`, current: (row) => `现在位于“${row}”`, mapAria: "五十音旅程地图", map: "旅程地图", collection: "打开图鉴", station: (index) => `第 ${String(index).padStart(2, "0")} 站`, locked: "完成上一站后开启",
  },
  lesson: { pause: "← 暂停旅程", label: "御守教学", sameSound: "同一个声音 · 两种字形", listen: "音 听一次发音", next: "下一组", gate: "走进鸟居" },
  quiz: {
    pause: "← 暂停", soundEyebrow: "读音辨认", pairEyebrow: "双生配对", recallEyebrow: "主动回想", pairQuestion: "哪个片假名和它同音？", recallQuestion: "选出这个读音的平假名", soundQuestion: "这个字怎么念？", playSound: "播放发音",
    correct: "答对了，这条路记住你了。", wrong: (hira, kata, romaji) => `再看一次：${hira}／${kata} 是 ${romaji}`, mastery: "熟练度向前一步", retry: "这题会在几步后再出现", continue: "继续",
  },
  result: {
    kicker: "旅程完成", unlocked: "新的道路已经开启。", complete: "今天的足迹，留下来了。", summary: (answered, correct) => `你完成了 ${answered} 次回想，答对 ${correct} 次。错过的字已经排进下一次复习。`, accuracy: "本局正确率", mastered: "累计熟练", streak: "连续旅程", days: (count) => `${count} 天`, back: "回到旅程地图", again: "再练一局",
  },
  library: { kicker: "旅人图鉴", title: "五十音足迹", intro: "每一格分别记录平假名与片假名；墨色越深，代表回想越稳固。", locked: "尚未抵达", mastery: (level) => `熟练 ${level} / 5` },
  settingsPanel: {
    kicker: "旅程设置", title: "照自己的步调走", done: "完成", voice: "日文语音", voiceDescription: "在教学与题目中播放假名读音", sound: "游戏音效", soundDescription: "每次回答后播放简短提示音", motion: "减少动态效果", motionDescription: "关闭浮动、滑入与装饰动画", restart: "重新开始旅程", restartDescription: "清除这台设备上的星星、熟练度与连续天数。", reset: "重置进度", resetConfirm: "确定要清除所有旅程、星星与熟练度吗？这个操作无法撤销。",
  },
  footer: { slogan: "假名旅人 · 每次只记住一小段路", local: "进度只保存在这台设备" },
  rows: ["元音之森", "风之坡", "樱之川", "雷之岭", "竹之里", "火之庭", "月之原", "夜之桥", "龙之径", "终之鸟居"],
};

const es: Messages = {
  meta: { title: "Kana Quest — Aprende hiragana y katakana", description: "Una aventura de tres minutos para recordar hiragana y katakana." },
  brand: "Kana Quest", loading: "Desplegando el mapa del viaje…", chooseLanguage: "Eligiendo tu idioma…", language: "Idioma", homeAria: "Volver al inicio del viaje", settings: "Ajustes", starsTitle: "Estrellas acumuladas", streakTitle: "Racha de aprendizaje",
  home: {
    kicker: "Tres minutos al día · Aprende ambos silabarios", title: "Sigue el camino kana,", titleEmphasis: "recupera cada sonido.", lead: "Hoy no tienes que memorizar toda la tabla. Llévate tres sonidos y vuelve a encontrarlos en el momento adecuado.",
    start: "Empezar el viaje de hoy", duration: "Unos 3 minutos →", weak: "Practicar puntos débiles", progress: "Progreso del viaje", mastered: (count) => `${count} / 46 pares dominados`, current: (row) => `Ahora estás en «${row}»`, mapAria: "Mapa del viaje kana", map: "Mapa del viaje", collection: "Abrir colección", station: (index) => `Parada ${String(index).padStart(2, "0")}`, locked: "Completa la parada anterior para abrir",
  },
  lesson: { pause: "← Pausar viaje", label: "Lección amuleto", sameSound: "Un sonido · Dos formas", listen: "Sonido  Escuchar", next: "Siguiente par", gate: "Cruzar el torii" },
  quiz: {
    pause: "← Pausar", soundEyebrow: "Reconocer el sonido", pairEyebrow: "Emparejar gemelos", recallEyebrow: "Recuerdo activo", pairQuestion: "¿Qué katakana tiene el mismo sonido?", recallQuestion: "Elige el hiragana de este sonido", soundQuestion: "¿Cómo se lee este kana?", playSound: "Reproducir pronunciación",
    correct: "¡Correcto! El camino ya te recuerda.", wrong: (hira, kata, romaji) => `Mira otra vez: ${hira} / ${kata} es ${romaji}`, mastery: "Tu dominio avanzó un paso", retry: "Esta pregunta volverá dentro de poco", continue: "Continuar",
  },
  result: {
    kicker: "Viaje completado", unlocked: "Se ha abierto un nuevo camino.", complete: "Las huellas de hoy permanecerán.", summary: (answered, correct) => `Completaste ${answered} recuerdos y acertaste ${correct}. Los kana fallados ya están programados para repasar.`, accuracy: "Precisión de la ronda", mastered: "Pares dominados", streak: "Racha de viaje", days: (count) => `${count} ${count === 1 ? "día" : "días"}`, back: "Volver al mapa", again: "Jugar otra ronda",
  },
  library: { kicker: "Colección del viajero", title: "Huellas kana", intro: "Hiragana y katakana se registran por separado. Cuanto más oscura la tinta, más fuerte el recuerdo.", locked: "Aún no alcanzado", mastery: (level) => `Dominio ${level} / 5` },
  settingsPanel: {
    kicker: "Ajustes del viaje", title: "Viaja a tu propio ritmo", done: "Listo", voice: "Voz japonesa", voiceDescription: "Reproduce la pronunciación durante las lecciones y preguntas", sound: "Sonidos del juego", soundDescription: "Reproduce un sonido breve después de cada respuesta", motion: "Reducir movimiento", motionDescription: "Desactiva movimientos y animaciones decorativas", restart: "Reiniciar el viaje", restartDescription: "Borra estrellas, dominio y rachas de este dispositivo.", reset: "Reiniciar progreso", resetConfirm: "¿Quieres borrar todos los viajes, estrellas y registros de dominio? No se puede deshacer.",
  },
  footer: { slogan: "Kana Quest · Recuerda un pequeño tramo cada vez", local: "El progreso permanece en este dispositivo" },
  rows: ["Bosque Vocal", "Cuesta del Viento", "Río de Cerezos", "Paso del Trueno", "Aldea de Bambú", "Jardín de Fuego", "Llanura Lunar", "Puente Nocturno", "Sendero del Dragón", "Torii Final"],
};

export const MESSAGES: Record<Locale, Messages> = { en, "zh-Hant": zhHant, "zh-Hans": zhHans, es };

const zhHantHints: Record<string, string> = {
  a: "像張開嘴巴說 a", i: "兩筆並肩，短短的 i", u: "上方一點，嘴巴收成 u", e: "轉個彎，發出清楚的 e", o: "圓圓收尾，記住 o",
  ka: "像風箏被風吹開：ka", ki: "交叉的樹枝：ki", ku: "小鳥張嘴說 ku", ke: "直線旁伸出手：ke", ko: "兩道平行小徑：ko",
  sa: "櫻花枝輕輕交錯：sa", shi: "彎彎的微笑：shi", su: "打個小結再滑走：su", se: "三筆相遇：se", so: "一筆順勢落下：so",
  ta: "像踏出有力一步：ta", chi: "彎鉤接住聲音：chi", tsu: "浪花捲起來：tsu", te: "伸手向前：te", to: "小點跟著直線走：to",
  na: "竹葉交錯：na", ni: "兩道水平線：ni", nu: "繩子打了圈：nu", ne: "尾巴繞回來：ne", no: "一個流暢圓圈：no",
  ha: "兩邊展開呼氣：ha", hi: "笑臉彎起來：hi", fu: "輕輕吹一口氣：fu", he: "一座小山峰：he", ho: "十字旁立一根柱：ho",
  ma: "月光繞過橫線：ma", mi: "三道光線：mi", mu: "尾巴捲成圈：mu", me: "兩筆交會成眼睛：me", mo: "兩道橫線掛在鉤上：mo",
  ya: "像岔路張開：ya", yu: "溫泉水繞一圈：yu", yo: "三層小塔：yo",
  ra: "先點一下再轉彎：ra", ri: "兩道水流：ri", ru: "尾端繞成小圈：ru", re: "一筆向右滑行：re", ro: "方形入口：ro",
  wa: "柔軟地繞過去：wa", wo: "三筆合成古老的 wo", n: "最後輕收鼻音：n",
};

const enHints: Record<string, string> = {
  a: "Open your mouth wide for a", i: "Two slim strokes stand side by side", u: "A small mark above a rounded u", e: "Turn the corner and say e", o: "Finish with a round loop for o",
  ka: "A kite opens in the wind: ka", ki: "Crossed tree branches: ki", ku: "A little bird opens its beak: ku", ke: "A hand reaches from a tall line: ke", ko: "Two parallel paths: ko",
  sa: "Cherry branches cross softly: sa", shi: "A curved, gentle smile: shi", su: "Tie a loop, then slide away: su", se: "Three strokes meet: se", so: "One stroke falls with the flow: so",
  ta: "Take one strong step: ta", chi: "A curved hook catches chi", tsu: "A wave curls upward: tsu", te: "A hand reaches forward: te", to: "A small dot follows a straight path: to",
  na: "Bamboo leaves cross: na", ni: "Two horizontal lines: ni", nu: "A rope makes a loop: nu", ne: "The tail curls back: ne", no: "One smooth circle: no",
  ha: "Two sides open with a breath: ha", hi: "A smiling curve: hi", fu: "Blow a gentle breath: fu", he: "A small mountain peak: he", ho: "A pillar stands beside a cross: ho",
  ma: "Moonlight winds past two lines: ma", mi: "Three rays of light: mi", mu: "A tail curls into a loop: mu", me: "Two strokes meet like an eye: me", mo: "Two bars hang from a hook: mo",
  ya: "A fork in the road opens: ya", yu: "Hot-spring water circles around: yu", yo: "A little three-story tower: yo",
  ra: "Tap once, then turn: ra", ri: "Two streams of water: ri", ru: "The tail ends in a small loop: ru", re: "One stroke glides right: re", ro: "A square entrance: ro",
  wa: "A soft line winds around: wa", wo: "Three strokes form the old wo", n: "Finish with a soft nasal n",
};

const zhHansHints: Record<string, string> = Object.fromEntries(Object.entries(zhHantHints).map(([key, value]) => [key, value
  .replaceAll("張", "张").replaceAll("聲", "声").replaceAll("轉", "转").replaceAll("圓", "圆").replaceAll("風", "风").replaceAll("箏", "筝")
  .replaceAll("開", "开").replaceAll("鳥", "鸟").replaceAll("線", "线").replaceAll("櫻", "樱").replaceAll("輕", "轻").replaceAll("彎", "弯")
  .replaceAll("結", "结").replaceAll("順", "顺").replaceAll("實", "实").replaceAll("鉤", "钩").replaceAll("繩", "绳").replaceAll("個", "个")
  .replaceAll("暢", "畅").replaceAll("邊", "边").replaceAll("氣", "气").replaceAll("兩", "两").replaceAll("溫", "温").replaceAll("龍", "龙")
  .replaceAll("徑", "径").replaceAll("過", "过").replaceAll("聲", "声").replaceAll("與", "与").replaceAll("發", "发")])) as Record<string, string>;

const esHints: Record<string, string> = {
  a: "Abre bien la boca para decir a", i: "Dos trazos delgados caminan juntos", u: "Una marca pequeña corona la u", e: "Gira la esquina y pronuncia e", o: "Termina con un círculo para o",
  ka: "Una cometa se abre al viento: ka", ki: "Ramas de árbol cruzadas: ki", ku: "Un pajarito abre el pico: ku", ke: "Una mano sale de una línea alta: ke", ko: "Dos caminos paralelos: ko",
  sa: "Ramas de cerezo se cruzan: sa", shi: "Una sonrisa curva: shi", su: "Haz un lazo y deslízate: su", se: "Tres trazos se encuentran: se", so: "Un trazo cae con suavidad: so",
  ta: "Da un paso firme: ta", chi: "Un gancho curvo atrapa chi", tsu: "Una ola se curva hacia arriba: tsu", te: "Una mano se extiende: te", to: "Un punto sigue una línea recta: to",
  na: "Hojas de bambú cruzadas: na", ni: "Dos líneas horizontales: ni", nu: "Una cuerda forma un lazo: nu", ne: "La cola vuelve en curva: ne", no: "Un círculo suave: no",
  ha: "Dos lados se abren al respirar: ha", hi: "Una curva sonriente: hi", fu: "Sopla suavemente: fu", he: "La cima de una montaña: he", ho: "Un pilar junto a una cruz: ho",
  ma: "La luz de luna rodea dos líneas: ma", mi: "Tres rayos de luz: mi", mu: "Una cola termina en lazo: mu", me: "Dos trazos forman un ojo: me", mo: "Dos barras cuelgan de un gancho: mo",
  ya: "Se abre una bifurcación: ya", yu: "El agua termal da una vuelta: yu", yo: "Una pequeña torre de tres pisos: yo",
  ra: "Toca una vez y gira: ra", ri: "Dos corrientes de agua: ri", ru: "La cola acaba en un lazo: ru", re: "Un trazo se desliza a la derecha: re", ro: "Una entrada cuadrada: ro",
  wa: "Una línea suave da la vuelta: wa", wo: "Tres trazos forman el antiguo wo", n: "Termina con una n nasal suave",
};

export const KANA_HINTS: Record<Locale, Record<string, string>> = { en: enHints, "zh-Hant": zhHantHints, "zh-Hans": zhHansHints, es: esHints };
