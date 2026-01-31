/**
 * Challenge Service
 * Generates and validates TBSC (Time-Bound Semantic Challenge) challenges
 * for agent verification during registration and spot-checks.
 */

const crypto = require('crypto');

const CHALLENGE_TTL_MS = 30000; // 30 seconds
const TIMEOUT_MS = 2000;
const TIMING_BUFFER_MS = 500;
const CLEANUP_INTERVAL_MS = 60000; // 1 minute

// In-memory challenge store
const challenges = new Map();

// Cleanup expired challenges periodically
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [id, challenge] of challenges.entries()) {
    if (now - challenge.createdAt > CHALLENGE_TTL_MS) {
      challenges.delete(id);
    }
  }
}, CLEANUP_INTERVAL_MS);

// Don't prevent process exit
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

// Name pools for challenge generation
const FIRST_NAMES = [
  'Ahmet', 'Elif', 'Mehmet', 'Ayse', 'Fatma', 'Ali', 'Zeynep', 'Mustafa',
  'Hasan', 'Emre', 'Deniz', 'Cem', 'Selin', 'Baris', 'Yusuf', 'Leyla',
  'Omar', 'Sara', 'Kemal', 'Defne', 'Burak', 'Ceren', 'Tuna', 'Esra'
];

const CITIES = [
  'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'London', 'Paris',
  'Berlin', 'Tokyo', 'Seoul', 'New York', 'Sydney', 'Toronto', 'Dubai'
];

const ADJECTIVES = [
  'quick', 'lazy', 'bright', 'dark', 'tall', 'short', 'old', 'young',
  'heavy', 'light', 'fast', 'slow', 'warm', 'cold', 'dry', 'wet'
];

const NOUNS = [
  'fox', 'dog', 'cat', 'bird', 'fish', 'tree', 'river', 'mountain',
  'cloud', 'stone', 'bridge', 'garden', 'tower', 'forest', 'lake', 'ocean'
];

const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'proton.me', 'icloud.com'];

const EMAIL_NAMES = [
  'john', 'ali', 'veli', 'ayse', 'can', 'deniz', 'emma', 'liam',
  'mert', 'elif', 'noah', 'sophia', 'omar', 'yuki', 'chen', 'priya'
];

class ChallengeService {
  static generateChallenge(agentId = null) {
    const generators = [
      ChallengeService._generateSemanticMath,
      ChallengeService._generateCodeEval,
      ChallengeService._generateEntityGrouping,
      ChallengeService._generateTextTransform,
      ChallengeService._generatePattern
    ];

    const generator = generators[Math.floor(Math.random() * generators.length)];
    const { task, payload, instruction, answer } = generator();

    const challengeId = crypto.randomBytes(16).toString('hex');

    challenges.set(challengeId, {
      answer,
      createdAt: Date.now(),
      agentId
    });

    return {
      challenge_id: challengeId,
      task,
      payload,
      instruction,
      timeout_ms: TIMEOUT_MS
    };
  }

  static validateAnswer(challengeId, answer) {
    const challenge = challenges.get(challengeId);

    // Delete on any attempt (one-time use)
    challenges.delete(challengeId);

    if (!challenge) {
      return { valid: false, reason: 'Challenge not found or already used' };
    }

    const elapsed = Date.now() - challenge.createdAt;

    // Check TTL expiry
    if (elapsed > CHALLENGE_TTL_MS) {
      return { valid: false, reason: 'Challenge expired' };
    }

    // Check timing (must respond within timeout + buffer)
    if (elapsed > TIMEOUT_MS + TIMING_BUFFER_MS) {
      return { valid: false, reason: 'Response too slow' };
    }

    // Check correctness
    if (!ChallengeService._answersMatch(answer, challenge.answer)) {
      return { valid: false, reason: 'Incorrect answer' };
    }

    return { valid: true };
  }

  static _answersMatch(submitted, expected) {
    if (submitted === null || submitted === undefined) return false;
    if (typeof submitted !== 'object') return false;

    for (const key of Object.keys(expected)) {
      // Be lenient on the 'rule' field for pattern challenges
      if (key === 'rule') continue;

      const exp = expected[key];
      const sub = submitted[key];

      if (sub === undefined || sub === null) return false;

      if (Array.isArray(exp)) {
        if (!Array.isArray(sub)) return false;
        if (sub.length !== exp.length) return false;
        // Sort both for order-independent comparison of string arrays
        const sortedExp = [...exp].map(String).sort();
        const sortedSub = [...sub].map(String).sort();
        for (let i = 0; i < sortedExp.length; i++) {
          if (sortedExp[i] !== sortedSub[i]) return false;
        }
      } else if (typeof exp === 'object' && exp !== null) {
        // Deep compare for nested objects (entity grouping)
        if (typeof sub !== 'object' || sub === null) return false;
        const expKeys = Object.keys(exp).sort();
        const subKeys = Object.keys(sub).sort();
        if (expKeys.length !== subKeys.length) return false;
        for (let i = 0; i < expKeys.length; i++) {
          if (expKeys[i] !== subKeys[i]) return false;
          const expVal = exp[expKeys[i]];
          const subVal = sub[subKeys[i]];
          if (Array.isArray(expVal)) {
            if (!Array.isArray(subVal)) return false;
            if (expVal.length !== subVal.length) return false;
            const sortedExp = [...expVal].sort();
            const sortedSub = [...subVal].sort();
            for (let j = 0; j < sortedExp.length; j++) {
              if (String(sortedExp[j]) !== String(sortedSub[j])) return false;
            }
          } else {
            if (String(expVal) !== String(subVal)) return false;
          }
        }
      } else {
        if (Number(exp) === exp && Number(sub) === sub) {
          if (Number(exp) !== Number(sub)) return false;
        } else {
          if (String(exp) !== String(sub)) return false;
        }
      }
    }

    return true;
  }

  // --- Challenge Generators ---

  static _generateSemanticMath() {
    const nameCount = 2 + Math.floor(Math.random() * 3); // 2-4 names
    const usedNames = [];
    const availableNames = [...FIRST_NAMES];

    for (let i = 0; i < nameCount; i++) {
      const idx = Math.floor(Math.random() * availableNames.length);
      usedNames.push(availableNames.splice(idx, 1)[0]);
    }

    const numbers = [];
    const sentences = [];

    for (const name of usedNames) {
      const age = 18 + Math.floor(Math.random() * 50);
      const num2 = 1 + Math.floor(Math.random() * 100);
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      numbers.push(age, num2);

      const templates = [
        `${name} is ${age} years old and has ${num2} books.`,
        `${name} is ${age} years old, weighs ${num2} kg, and lives in ${city}.`,
        `${name}, aged ${age}, has lived in ${city} for ${num2} years.`,
        `${name} is ${age} and has ${num2} pets at home.`
      ];
      sentences.push(templates[Math.floor(Math.random() * templates.length)]);
    }

    const payload = sentences.join(' ');
    const sum = numbers.reduce((a, b) => a + b, 0);
    const sortedNames = [...usedNames].sort();

    return {
      task: 'semantic_math',
      payload,
      instruction: 'Return JSON: {"sum_of_numbers": <sum of all numbers>, "names": <alphabetically sorted array of person names>}',
      answer: { sum_of_numbers: sum, names: sortedNames }
    };
  }

  static _generateCodeEval() {
    const templates = ChallengeService._codeTemplates();
    const template = templates[Math.floor(Math.random() * templates.length)];
    return {
      task: 'code_eval',
      payload: template.code,
      instruction: 'Return JSON: {"output": <the console output>}',
      answer: { output: template.output }
    };
  }

  static _codeTemplates() {
    const templates = [];

    // Filter + length
    {
      const a = [];
      const b = [];
      for (let i = 0; i < 5; i++) a.push(1 + Math.floor(Math.random() * 9));
      for (let i = 0; i < 5; i++) b.push(1 + Math.floor(Math.random() * 9));
      const output = a.filter(x => b.includes(x)).length;
      templates.push({
        code: `function f(a,b) { return a.filter(x => b.includes(x)).length }\nconsole.log(f([${a.join(',')}], [${b.join(',')}]))`,
        output
      });
    }

    // Reduce sum
    {
      const arr = [];
      for (let i = 0; i < 4 + Math.floor(Math.random() * 3); i++) {
        arr.push(1 + Math.floor(Math.random() * 20));
      }
      const output = arr.reduce((a, b) => a + b, 0);
      templates.push({
        code: `const arr = [${arr.join(',')}];\nconsole.log(arr.reduce((a,b) => a + b, 0))`,
        output
      });
    }

    // Set size (unique elements)
    {
      const arr = [];
      for (let i = 0; i < 7; i++) {
        arr.push(1 + Math.floor(Math.random() * 5));
      }
      const output = new Set(arr).size;
      templates.push({
        code: `console.log(new Set([${arr.join(',')}]).size)`,
        output
      });
    }

    // Map + join
    {
      const arr = [];
      for (let i = 0; i < 4; i++) {
        arr.push(1 + Math.floor(Math.random() * 9));
      }
      const multiplier = 2 + Math.floor(Math.random() * 4);
      const output = arr.map(x => x * multiplier).join('-');
      templates.push({
        code: `console.log([${arr.join(',')}].map(x => x * ${multiplier}).join('-'))`,
        output
      });
    }

    // Filter even + length
    {
      const arr = [];
      for (let i = 0; i < 6; i++) {
        arr.push(1 + Math.floor(Math.random() * 20));
      }
      const output = arr.filter(x => x % 2 === 0).length;
      templates.push({
        code: `console.log([${arr.join(',')}].filter(x => x % 2 === 0).length)`,
        output
      });
    }

    return templates;
  }

  static _generateEntityGrouping() {
    const emailCount = 4 + Math.floor(Math.random() * 4); // 4-7 emails
    const availableNames = [...EMAIL_NAMES];
    const emails = [];

    for (let i = 0; i < emailCount; i++) {
      const nameIdx = Math.floor(Math.random() * availableNames.length);
      const localPart = availableNames.splice(nameIdx, 1)[0];
      const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
      emails.push({ local: localPart, domain, full: `${localPart}@${domain}` });
    }

    const connectors = [
      'said that', 'mentioned that', 'told', 'emailed', 'notified', 'wrote to'
    ];
    const parts = [];
    for (let i = 0; i < emails.length; i++) {
      if (i === 0) {
        parts.push(emails[i].full);
      } else if (i === emails.length - 1) {
        parts.push(`and ${emails[i].full}`);
      } else {
        const conn = connectors[Math.floor(Math.random() * connectors.length)];
        parts.push(`${conn} ${emails[i].full}`);
      }
    }
    const payload = parts.join(' ') + ' will meet tomorrow.';

    // Group by domain
    const grouped = {};
    for (const email of emails) {
      if (!grouped[email.domain]) {
        grouped[email.domain] = [];
      }
      grouped[email.domain].push(email.local);
    }
    // Sort local parts within each domain
    for (const domain of Object.keys(grouped)) {
      grouped[domain].sort();
    }

    return {
      task: 'entity_grouping',
      payload,
      instruction: 'Extract all emails, group by domain. Return JSON: {"<domain>": ["<local_parts>"]}',
      answer: grouped
    };
  }

  static _generateTextTransform() {
    const wordCount = 8 + Math.floor(Math.random() * 6); // 8-13 words
    const words = [];
    const uppercaseWords = [];

    for (let i = 0; i < wordCount; i++) {
      const pool = Math.random() < 0.5 ? ADJECTIVES : NOUNS;
      let word = pool[Math.floor(Math.random() * pool.length)];

      if (Math.random() < 0.35) {
        word = word.toUpperCase();
        uppercaseWords.push(word);
      }

      words.push(word);
    }

    // Ensure at least 2 uppercase words
    if (uppercaseWords.length < 2) {
      for (let i = 0; i < words.length && uppercaseWords.length < 2; i++) {
        if (words[i] === words[i].toLowerCase()) {
          words[i] = words[i].toUpperCase();
          uppercaseWords.push(words[i]);
        }
      }
    }

    // Rebuild uppercase list in order
    const orderedUppercase = words.filter(w => w === w.toUpperCase() && w !== w.toLowerCase());

    const payload = words.join(' ');

    return {
      task: 'text_transform',
      payload,
      instruction: 'Return JSON: {"uppercase_words": <array of words that are fully uppercase, in order>, "word_count": <total words>}',
      answer: { uppercase_words: orderedUppercase, word_count: words.length }
    };
  }

  static _generatePattern() {
    const patterns = ChallengeService._patternTemplates();
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return {
      task: 'pattern',
      payload: pattern.sequence,
      instruction: 'Return JSON: {"next": <next number in sequence>, "rule": <short description of pattern>}',
      answer: { next: pattern.next, rule: pattern.rule }
    };
  }

  static _patternTemplates() {
    const templates = [];

    // Multiply by N
    {
      const multiplier = 2 + Math.floor(Math.random() * 4); // 2-5
      const start = 1 + Math.floor(Math.random() * 5);
      const seq = [start];
      for (let i = 1; i < 4; i++) seq.push(seq[i - 1] * multiplier);
      const next = seq[3] * multiplier;
      templates.push({
        sequence: `[${seq.join(', ')}, ?]`,
        next,
        rule: `multiply by ${multiplier}`
      });
    }

    // Add N
    {
      const delta = 3 + Math.floor(Math.random() * 10); // 3-12
      const start = 1 + Math.floor(Math.random() * 10);
      const seq = [start];
      for (let i = 1; i < 4; i++) seq.push(seq[i - 1] + delta);
      const next = seq[3] + delta;
      templates.push({
        sequence: `[${seq.join(', ')}, ?]`,
        next,
        rule: `add ${delta}`
      });
    }

    // Powers of N
    {
      const base = 2 + Math.floor(Math.random() * 3); // 2-4
      const seq = [];
      for (let i = 1; i <= 4; i++) seq.push(Math.pow(base, i));
      const next = Math.pow(base, 5);
      templates.push({
        sequence: `[${seq.join(', ')}, ?]`,
        next,
        rule: `powers of ${base}`
      });
    }

    // Increasing delta (1, 2, 3, 4...)
    {
      const start = 1 + Math.floor(Math.random() * 5);
      const seq = [start];
      for (let i = 1; i < 5; i++) seq.push(seq[i - 1] + i);
      const next = seq[4] + 5;
      templates.push({
        sequence: `[${seq.join(', ')}, ?]`,
        next,
        rule: 'increasing difference'
      });
    }

    return templates;
  }

  // Expose for testing
  static _getStore() {
    return challenges;
  }
}

module.exports = ChallengeService;
