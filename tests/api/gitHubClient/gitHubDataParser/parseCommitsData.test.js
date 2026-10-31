import { describe, test, expect } from 'vitest'
import GitHubDataParser from '@/js/api/gitHubClient/gitHubDataParser'
import { createCommit } from '#/fixtures/github/dataParser'
import { expectInvalidParserResult } from '#/vitest/expectInvalidParserResult'

describe('parseCommitsData', () => {
  const parser = new GitHubDataParser()

  test('normalizes the message, author, links, and parents', () => {
    const commit = createCommit({
      message: 'Merge <feature> & cleanup\n\nSecond line with "quotes"',
      author: {
        name: "O'Brien & <dev>",
        email: 'dev@example.com',
        date: '2026-08-28T12:58:44Z',
      },
      githubAuthor: {
        avatar_url: 'https://avatars.githubusercontent.com/u/2?v=4',
        html_url: 'https://github.com/dev-user',
      },
      parents: [{ sha: '282fa46d7bdd39f183a8aa924211106fa250f9a3' }, { sha: '' }, {}],
    })

    const result = parser.parseCommitsData([commit])

    expect(result).toStrictEqual({
      success: true,
      commitsDetails: [
        {
          author: {
            name: 'O&#39;Brien &amp; &lt;dev&gt;',
            email: 'dev@example.com',
            avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
            url: 'https://github.com/dev-user',
            date: '2026-08-28T12:58:44Z',
          },
          title: 'Merge &lt;feature&gt; &amp; cleanup',
          description: '\nSecond line with &quot;quotes&quot;',
          hash: '51c497d',
          url: 'https://github.com/example/project/commit/51c497d0faee027f4b124401823c59416bda590a',
          sha: '51c497d0faee027f4b124401823c59416bda590a',
          parents: ['282fa46d7bdd39f183a8aa924211106fa250f9a3'],
        },
      ],
    })
  })

  test('falls back to empty avatar and URL when the GitHub author is missing', () => {
    const commit = createCommit({ githubAuthor: null })

    const result = parser.parseCommitsData([commit])

    expect(result.success).toBe(true)
    expect(result.commitsDetails[0].author).toStrictEqual({
      name: 'Test User',
      email: 'test@example.com',
      avatar: '',
      url: '',
      date: '2026-08-28T12:58:44Z',
    })
  })

  test.each([
    { label: 'an empty array', input: [] },
    { label: 'a missing list', input: undefined },
  ])('rejects $label', ({ input }) => {
    const result = parser.parseCommitsData(input)

    expectInvalidParserResult(result, 'parseCommitsData', input)
  })

  test.each([
    {
      label: 'a commit with a null author record',
      buildCommit: () => createCommit({ author: null }),
    },
    {
      label: 'a commit without a message',
      buildCommit: () => {
        const commit = createCommit()
        return { ...commit, commit: { ...commit.commit, message: undefined } }
      },
    },
    {
      label: 'a commit with an empty SHA',
      buildCommit: () => createCommit({ sha: '' }),
    },
  ])('rejects $label', ({ buildCommit }) => {
    const commit = buildCommit()

    const result = parser.parseCommitsData([commit])

    expectInvalidParserResult(result, 'parseCommitsData', commit)
  })
})
