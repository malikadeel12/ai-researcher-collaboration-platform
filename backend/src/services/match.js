/**
 * What changed: GPT matching against the local researcher dataset, with a keyword fallback.
 * Why: Client asked for OpenAI GPT only — no embeddings or vector database.
 * Related: backend/src/routes/match.js
 * Business rule: Recommendations must come only from the provided dataset.
 */
function compact(researcher) {
  return {
    id: researcher.id,
    fullName: researcher.fullName,
    academicPosition: researcher.academicPosition,
    primaryResearchAreas: researcher.primaryResearchAreas,
    specificInterests: researcher.specificInterests,
    keywords: researcher.keywords,
    currentProjects: researcher.currentProjects,
    pastProjects: researcher.pastProjects,
    technicalSkills: researcher.technicalSkills,
    additionalSkills: researcher.additionalSkills,
    opportunityTypes: researcher.opportunityTypes,
    preferredDuration: researcher.preferredDuration,
    availabilityStatus: researcher.availabilityStatus,
    willingnessToLead: researcher.willingnessToLead,
  }
}

function tokens(text = '') {
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9\u0600-\u06ff]+/i)
    .filter((word) => word.length > 2)
}

function haystack(researcher) {
  return tokens(
    [
      researcher.fullName,
      researcher.academicPosition,
      ...(researcher.primaryResearchAreas || []),
      ...(researcher.specificInterests || []),
      ...(researcher.keywords || []),
      ...(researcher.currentProjects || []),
      ...(researcher.pastProjects || []),
      ...(researcher.technicalSkills || []),
      researcher.additionalSkills,
      ...(researcher.opportunityTypes || []),
      researcher.preferredDuration,
      researcher.availabilityStatus,
      researcher.willingnessToLead ? 'lead leader willing' : '',
      researcher.bio,
    ].join(' '),
  )
}

function heuristicMatch(needText, researchers) {
  const query = tokens(needText)
  const wantsLead = /lead|قِياد|قياد/i.test(needText)
  const wantsShort = /short|قصير/i.test(needText)
  const wantsTeam = /team|فريق|complement/i.test(needText)

  const ranked = researchers
    .map((researcher) => {
      const bag = new Set(haystack(researcher))
      let score = query.reduce((sum, word) => sum + (bag.has(word) ? 8 : 0), 0)
      if (researcher.availabilityStatus === 'available') score += 10
      if (researcher.availabilityStatus === 'limited') score += 4
      if (wantsLead && researcher.willingnessToLead) score += 12
      if (wantsShort && /short/i.test(researcher.preferredDuration || '')) score += 6
      return { researcher, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  const top = (ranked.length ? ranked : researchers.map((researcher) => ({ researcher, score: 20 }))).slice(0, 5)

  const individuals = top.map((item) => ({
    id: item.researcher.id,
    score: Math.min(99, 60 + item.score),
    reason: buildReason(item.researcher, needText),
  }))

  let team = null
  if (wantsTeam || complementary(top.map((item) => item.researcher))) {
    const members = pickTeam(researchers, top.map((item) => item.researcher.id))
    if (members.length >= 2) {
      team = {
        ids: members.map((item) => item.id),
        reason: `Combined coverage across ${members.map((item) => (item.keywords || [])[0] || item.fullName).join(', ')}.`,
      }
    }
  }

  return { individuals, team }
}

function complementary(people) {
  const areas = new Set(people.flatMap((person) => person.primaryResearchAreas || []))
  return areas.size >= 3
}

function pickTeam(researchers, already) {
  const available = researchers.filter((person) => person.availabilityStatus !== 'unavailable')
  const first = available.find((person) => already.includes(person.id)) || available[0]
  const others = available.filter((person) => person.id !== first?.id)
  const picked = [first]
  for (const person of others) {
    const have = new Set(picked.flatMap((item) => item.primaryResearchAreas || []))
    const adds = (person.primaryResearchAreas || []).some((area) => !have.has(area))
    if (adds) picked.push(person)
    if (picked.length === 3) break
  }
  return picked.filter(Boolean)
}

function buildReason(researcher, needText) {
  const area = (researcher.primaryResearchAreas || [])[0] || 'this field'
  const avail = researcher.availabilityStatus === 'available' ? 'currently available' : 'has limited availability'
  const lead = researcher.willingnessToLead ? ' and is willing to lead' : ''
  return `${researcher.fullName} works in ${area}, is ${avail}${lead}, which aligns with “${needText.slice(0, 80)}”.`
}

function parseJson(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Model did not return JSON')
  return JSON.parse(text.slice(start, end + 1))
}

async function gptMatch(needText, researchers) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'You match a research need against a fixed researcher dataset. Return JSON only: {"individuals":[{"id","reason","score"}],"team":{"ids":[],"reason"}|null}. Recommend 4-6 individuals. Add a team only if complementary expertise is truly needed. Use only provided ids. Score is 1-99. Reasons must be short and specific.',
      },
      {
        role: 'user',
        content: JSON.stringify({ need: needText, researchers: researchers.map(compact) }),
      },
    ],
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI error: ${err.slice(0, 200)}`)
  }

  const data = await response.json()
  return parseJson(data.choices?.[0]?.message?.content || '{}')
}

function sanitize(result, researchers) {
  const byId = new Map(researchers.map((item) => [item.id, item]))
  const individuals = (result.individuals || [])
    .filter((item) => byId.has(item.id))
    .slice(0, 6)
    .map((item) => ({
      researcher: byId.get(item.id),
      reason: item.reason,
      score: item.score ?? null,
    }))

  let team = null
  const ids = result.team?.ids?.filter((id) => byId.has(id)) || []
  if (ids.length >= 2) {
    team = {
      members: ids.map((id) => byId.get(id)),
      reason: result.team.reason,
    }
  }

  return { individuals, team }
}

export async function matchResearchers(needText, researchers) {
  let raw
  try {
    raw = await gptMatch(needText, researchers)
  } catch (error) {
    console.warn('GPT matching fell back to heuristic:', error.message)
  }
  if (!raw) raw = heuristicMatch(needText, researchers)
  return sanitize(raw, researchers)
}
