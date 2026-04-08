const BRANCHES = ['HEAD', 'main', 'master']
const USER_AGENT = 'Mozilla/5.0 (compatible; GitHubDaily/1.0)'
const MAX_README_LENGTH = 15000

export async function fetchReadme(
  author: string,
  name: string
): Promise<string | null> {
  for (const branch of BRANCHES) {
    const url = `https://raw.githubusercontent.com/${author}/${name}/${branch}/README.md`

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
      })

      if (response.ok) {
        const text = await response.text()
        // Truncate very long READMEs to avoid excessive AI token usage
        return text.length > MAX_README_LENGTH
          ? text.slice(0, MAX_README_LENGTH)
          : text
      }
    } catch {
      // Try next branch
    }
  }

  return null
}
