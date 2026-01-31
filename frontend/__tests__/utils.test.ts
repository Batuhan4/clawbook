import {
  formatScore,
  truncate,
  extractDomain,
  getInitials,
  pluralize,
  getPostUrl,
  getSubmoltUrl,
  getAgentUrl,
} from '@/lib/utils';

describe('formatScore', () => {
  it('returns small numbers as-is', () => {
    expect(formatScore(0)).toBe('0');
    expect(formatScore(42)).toBe('42');
    expect(formatScore(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatScore(1000)).toBe('1K');
    expect(formatScore(1500)).toBe('1.5K');
    expect(formatScore(12345)).toBe('12.3K');
    expect(formatScore(999999)).toBe('1000K');
  });

  it('formats millions with M suffix', () => {
    expect(formatScore(1000000)).toBe('1M');
    expect(formatScore(2500000)).toBe('2.5M');
  });

  it('handles negative numbers', () => {
    expect(formatScore(-1)).toBe('-1');
    expect(formatScore(-1500)).toBe('-1.5K');
    expect(formatScore(-1000000)).toBe('-1M');
  });
});

describe('truncate', () => {
  it('returns short text unchanged', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates long text with ellipsis', () => {
    expect(truncate('hello world this is long', 10)).toBe('hello w...');
  });

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('extractDomain', () => {
  it('extracts domain from URL', () => {
    expect(extractDomain('https://example.com/path')).toBe('example.com');
    expect(extractDomain('https://www.example.com')).toBe('example.com');
  });

  it('returns null for invalid URLs', () => {
    expect(extractDomain('not a url')).toBeNull();
  });
});

describe('getInitials', () => {
  it('returns initials from name', () => {
    expect(getInitials('Agent Smith')).toBe('AS');
    expect(getInitials('cool_bot')).toBe('CB');
    expect(getInitials('x')).toBe('X');
  });
});

describe('pluralize', () => {
  it('returns singular for count of 1', () => {
    expect(pluralize(1, 'post')).toBe('post');
  });

  it('returns plural for other counts', () => {
    expect(pluralize(0, 'post')).toBe('posts');
    expect(pluralize(2, 'post')).toBe('posts');
    expect(pluralize(5, 'reply', 'replies')).toBe('replies');
  });
});

describe('URL helpers', () => {
  it('getPostUrl generates correct URL', () => {
    expect(getPostUrl('abc123')).toBe('/post/abc123');
    expect(getPostUrl('abc123', 'funny')).toBe('/m/funny/post/abc123');
  });

  it('getSubmoltUrl generates correct URL', () => {
    expect(getSubmoltUrl('funny')).toBe('/m/funny');
  });

  it('getAgentUrl generates correct URL', () => {
    expect(getAgentUrl('bot1')).toBe('/u/bot1');
  });
});
