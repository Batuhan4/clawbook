/**
 * Moltbook API Test Suite
 * 
 * Run: npm test
 */

const { 
  generateApiKey, 
  generateClaimToken, 
  generateVerificationCode,
  validateApiKey,
  extractToken,
  hashToken
} = require('../src/utils/auth');

const {
  ApiError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError
} = require('../src/utils/errors');

// Test framework
let passed = 0;
let failed = 0;
const tests = [];

function describe(name, fn) {
  tests.push({ type: 'describe', name });
  fn();
}

function test(name, fn) {
  tests.push({ type: 'test', name, fn });
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

async function runTests() {
  console.log('\nMoltbook API Test Suite\n');
  console.log('='.repeat(50));

  for (const item of tests) {
    if (item.type === 'describe') {
      console.log(`\n[${item.name}]\n`);
    } else {
      try {
        await item.fn();
        console.log(`  + ${item.name}`);
        passed++;
      } catch (error) {
        console.log(`  - ${item.name}`);
        console.log(`    Error: ${error.message}`);
        failed++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

// Tests

describe('Auth Utils', () => {
  test('generateApiKey creates valid key', () => {
    const key = generateApiKey();
    assert(key.startsWith('moltbook_'), 'Should have correct prefix');
    assertEqual(key.length, 73, 'Should have correct length');
  });

  test('generateClaimToken creates valid token', () => {
    const token = generateClaimToken();
    assert(token.startsWith('moltbook_claim_'), 'Should have correct prefix');
  });

  test('generateVerificationCode has correct format', () => {
    const code = generateVerificationCode();
    assert(/^[a-z]+-[A-F0-9]{4}$/.test(code), 'Should match pattern');
  });

  test('validateApiKey accepts valid key', () => {
    const key = generateApiKey();
    assert(validateApiKey(key), 'Should validate generated key');
  });

  test('validateApiKey rejects invalid key', () => {
    assert(!validateApiKey('invalid'), 'Should reject invalid');
    assert(!validateApiKey(null), 'Should reject null');
    assert(!validateApiKey('moltbook_short'), 'Should reject short key');
  });

  test('extractToken extracts from Bearer header', () => {
    const token = extractToken('Bearer moltbook_test123');
    assertEqual(token, 'moltbook_test123');
  });

  test('extractToken returns null for invalid header', () => {
    assertEqual(extractToken('Basic abc'), null);
    assertEqual(extractToken('Bearer'), null);
    assertEqual(extractToken(null), null);
  });

  test('hashToken creates consistent hash', () => {
    const hash1 = hashToken('test');
    const hash2 = hashToken('test');
    assertEqual(hash1, hash2, 'Same input should produce same hash');
  });
});

describe('Error Classes', () => {
  test('ApiError creates with status code', () => {
    const error = new ApiError('Test', 400);
    assertEqual(error.statusCode, 400);
    assertEqual(error.message, 'Test');
  });

  test('BadRequestError has status 400', () => {
    const error = new BadRequestError('Bad input');
    assertEqual(error.statusCode, 400);
  });

  test('NotFoundError has status 404', () => {
    const error = new NotFoundError('User');
    assertEqual(error.statusCode, 404);
    assert(error.message.includes('not found'));
  });

  test('UnauthorizedError has status 401', () => {
    const error = new UnauthorizedError();
    assertEqual(error.statusCode, 401);
  });

  test('ApiError toJSON returns correct format', () => {
    const error = new ApiError('Test', 400, 'TEST_CODE', 'Fix it');
    const json = error.toJSON();
    assertEqual(json.success, false);
    assertEqual(json.error, 'Test');
    assertEqual(json.code, 'TEST_CODE');
    assertEqual(json.hint, 'Fix it');
  });
});

describe('Config', () => {
  test('config loads without error', () => {
    const config = require('../src/config');
    assert(config.port, 'Should have port');
    assert(config.moltbook.tokenPrefix, 'Should have token prefix');
  });

  test('config has challenge rate limit', () => {
    const config = require('../src/config');
    assertEqual(config.rateLimits.challenges.max, 5);
    assertEqual(config.rateLimits.challenges.window, 600);
  });
});

describe('ChallengeService', () => {
  const ChallengeService = require('../src/services/ChallengeService');

  test('generateChallenge returns valid structure', () => {
    const challenge = ChallengeService.generateChallenge();
    assert(challenge.challenge_id, 'Should have challenge_id');
    assert(challenge.task, 'Should have task');
    assert(challenge.payload !== undefined, 'Should have payload');
    assert(challenge.instruction, 'Should have instruction');
    assertEqual(challenge.timeout_ms, 2000);
  });

  test('semantic_math generator produces valid challenge', () => {
    const result = ChallengeService._generateSemanticMath();
    assertEqual(result.task, 'semantic_math');
    assert(typeof result.answer.sum_of_numbers === 'number', 'sum_of_numbers should be a number');
    assert(Array.isArray(result.answer.names), 'names should be an array');
    assert(result.answer.names.length >= 2, 'Should have at least 2 names');
    // Verify names are sorted
    for (let i = 1; i < result.answer.names.length; i++) {
      assert(result.answer.names[i] >= result.answer.names[i - 1], 'Names should be sorted');
    }
  });

  test('code_eval generator produces valid challenge', () => {
    const result = ChallengeService._generateCodeEval();
    assertEqual(result.task, 'code_eval');
    assert(result.answer.output !== undefined, 'Should have output');
    assert(result.payload.includes('console.log'), 'Should contain console.log');
  });

  test('entity_grouping generator produces valid challenge', () => {
    const result = ChallengeService._generateEntityGrouping();
    assertEqual(result.task, 'entity_grouping');
    const domains = Object.keys(result.answer);
    assert(domains.length >= 1, 'Should have at least 1 domain');
    for (const domain of domains) {
      assert(Array.isArray(result.answer[domain]), 'Domain value should be an array');
      assert(domain.includes('.'), 'Domain should contain a dot');
    }
  });

  test('text_transform generator produces valid challenge', () => {
    const result = ChallengeService._generateTextTransform();
    assertEqual(result.task, 'text_transform');
    assert(Array.isArray(result.answer.uppercase_words), 'Should have uppercase_words array');
    assert(result.answer.uppercase_words.length >= 2, 'Should have at least 2 uppercase words');
    assert(typeof result.answer.word_count === 'number', 'word_count should be a number');
    // Verify all uppercase words are actually uppercase
    for (const word of result.answer.uppercase_words) {
      assertEqual(word, word.toUpperCase(), `${word} should be uppercase`);
    }
  });

  test('pattern generator produces valid challenge', () => {
    const result = ChallengeService._generatePattern();
    assertEqual(result.task, 'pattern');
    assert(typeof result.answer.next === 'number', 'next should be a number');
    assert(typeof result.answer.rule === 'string', 'rule should be a string');
    assert(result.payload.includes('?'), 'Payload should contain ?');
  });

  test('validateAnswer accepts correct answer', () => {
    const challenge = ChallengeService.generateChallenge();
    const store = ChallengeService._getStore();
    const stored = store.get(challenge.challenge_id);
    const result = ChallengeService.validateAnswer(challenge.challenge_id, stored.answer);
    assert(result.valid, 'Should accept correct answer');
  });

  test('validateAnswer rejects replayed challenge_id', () => {
    const challenge = ChallengeService.generateChallenge();
    const store = ChallengeService._getStore();
    const answer = store.get(challenge.challenge_id).answer;
    // First attempt consumes it
    ChallengeService.validateAnswer(challenge.challenge_id, answer);
    // Second attempt should fail
    const result = ChallengeService.validateAnswer(challenge.challenge_id, answer);
    assert(!result.valid, 'Should reject replayed challenge');
    assertEqual(result.reason, 'Challenge not found or already used');
  });

  test('validateAnswer rejects unknown challenge_id', () => {
    const result = ChallengeService.validateAnswer('nonexistent_id', { foo: 'bar' });
    assert(!result.valid, 'Should reject unknown challenge');
    assertEqual(result.reason, 'Challenge not found or already used');
  });

  test('_answersMatch handles exact match', () => {
    const expected = { sum_of_numbers: 42, names: ['Alice', 'Bob'] };
    const submitted = { sum_of_numbers: 42, names: ['Alice', 'Bob'] };
    assert(ChallengeService._answersMatch(submitted, expected), 'Should match');
  });

  test('_answersMatch rejects wrong values', () => {
    const expected = { sum_of_numbers: 42, names: ['Alice', 'Bob'] };
    const submitted = { sum_of_numbers: 99, names: ['Alice', 'Bob'] };
    assert(!ChallengeService._answersMatch(submitted, expected), 'Should not match');
  });

  test('_answersMatch ignores rule field', () => {
    const expected = { next: 162, rule: 'multiply by 3' };
    const submitted = { next: 162, rule: 'each number is 3x the previous' };
    assert(ChallengeService._answersMatch(submitted, expected), 'Should match ignoring rule');
  });

  test('_answersMatch rejects null/undefined', () => {
    assert(!ChallengeService._answersMatch(null, { x: 1 }), 'Should reject null');
    assert(!ChallengeService._answersMatch(undefined, { x: 1 }), 'Should reject undefined');
  });

  test('_answersMatch handles entity grouping (nested objects)', () => {
    const expected = { 'gmail.com': ['john', 'veli'], 'yahoo.com': ['ali'] };
    const submitted = { 'gmail.com': ['veli', 'john'], 'yahoo.com': ['ali'] };
    assert(ChallengeService._answersMatch(submitted, expected), 'Should match with sorted arrays');
  });

  test('_answersMatch rejects missing keys', () => {
    const expected = { sum_of_numbers: 42, names: ['Alice'] };
    const submitted = { sum_of_numbers: 42 };
    assert(!ChallengeService._answersMatch(submitted, expected), 'Should reject missing keys');
  });
});

// Run
runTests();
