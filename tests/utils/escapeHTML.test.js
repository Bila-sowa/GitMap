import { describe, test, expect } from 'vitest'
import { escapeHTML } from '@/js/utils/utils'

describe('escapeHTML', () => {
  test.each([
    { character: '&', expected: '&amp;' },
    { character: '<', expected: '&lt;' },
    { character: '>', expected: '&gt;' },
    { character: '"', expected: '&quot;' },
    { character: "'", expected: '&#39;' },
  ])('checks escaping for the $character', ({ character, expected }) => {
    const result = escapeHTML(character)
    expect(result).toBe(expected)
  })

  test.each([
    {
      pattern: `<input style="display: none;" type="text" value="" onfocus="alert('XSS')" autofocus>`,
      expected:
        '&lt;input style=&quot;display: none;&quot; type=&quot;text&quot; value=&quot;&quot; onfocus=&quot;alert(&#39;XSS&#39;)&quot; autofocus&gt;',
      id: 1,
    },
    {
      pattern: `<script>alert("XSS")</script>`,
      expected: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
      id: 2,
    },
    {
      pattern: `<textarea style="display: none;"><img src=x onerror=alert('XSS')></textarea>`,
      expected:
        '&lt;textarea style=&quot;display: none;&quot;&gt;&lt;img src=x onerror=alert(&#39;XSS&#39;)&gt;&lt;/textarea&gt;',
      id: 3,
    },
  ])('checks escaping for the pattern #$id', ({ pattern, expected }) => {
    const result = escapeHTML(pattern)
    expect(result).toBe(expected)
  })

  test('handles empty string safely', () => {
    const result = escapeHTML('')
    expect(result).toBe('')
  })

  test('returns unchanged string when no special characters are present', () => {
    const result = escapeHTML('plain text without special characters')
    expect(result).toBe('plain text without special characters')
  })

  test('escapes multiple and consecutive special characters', () => {
    const result = escapeHTML('&& >> << "" \'\'')
    expect(result).toBe('&amp;&amp; &gt;&gt; &lt;&lt; &quot;&quot; &#39;&#39;')
  })

  test('converts non-string values to string and escapes them', () => {
    const result = escapeHTML(12345)
    expect(result).toBe('12345')
  })
})
