/**
 * What changed: Browser-side heuristic matching for the Vercel dummy demo.
 * Why: Production has no Express/OpenAI host; the client still needs real recommendations.
 * Related: backend/src/services/match.js
 * Business rule: Names still come only from the provided dataset.
 */
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

function buildReason(researcher, needText) {
  const area = (researcher.primaryResearchAreas || [])[0] || 'this field'
  const avail = researcher.availabilityStatus === 'available' ? 'currently available' : 'has limited availability'
  const lead = researcher.willingnessToLead ? ' and is willing to lead' : ''
  return `${researcher.fullName} works in ${area}, is ${avail}${lead}, which aligns with “${needText.slice(0, 80)}”.`
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

export function matchResearchers(needText, researchers) {
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
    researcher: item.researcher,
    score: Math.min(99, 60 + item.score),
    reason: buildReason(item.researcher, needText),
  }))

  let team = null
  const areas = new Set(top.flatMap((item) => item.researcher.primaryResearchAreas || []))
  if (wantsTeam || areas.size >= 3) {
    const members = pickTeam(researchers, top.map((item) => item.researcher.id))
    if (members.length >= 2) {
      team = {
        members,
        reason: `Combined coverage across ${members.map((item) => (item.keywords || [])[0] || item.fullName).join(', ')}.`,
      }
    }
  }

  return { individuals, team }
}
