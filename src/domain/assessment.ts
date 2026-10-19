export type MistakeCategory = 'missing-bound' | 'wrong-growth-rate' | 'counting-assumption' | 'incomplete-reasoning'
export interface AssessmentFinding { category: MistakeCategory; label: string; feedback: string }
export interface AssessmentResult { score: number; maxScore: number; findings: AssessmentFinding[]; strengths: string[] }

/** Transparent heuristic feedback for a first prototype; not a substitute for instructor grading. */
export function assessOperationCount(answer: string, pattern: 'constant' | 'linear' | 'nested', n: number): AssessmentResult {
  const text = answer.toLowerCase().replace(/\s+/g, ' ')
  const findings: AssessmentFinding[] = []
  const strengths: string[] = []
  const expected = pattern === 'constant' ? ['o(1)', 'theta(1)', 'ω(1)', 'constant'] : pattern === 'linear' ? ['o(n)', 'theta(n)', 'ω(n)', 'linear'] : ['o(n^2)', 'o(n²)', 'theta(n^2)', 'theta(n²)', 'quadratic']
  const hasBound = expected.some(term => text.includes(term))
  const hasCount = pattern === 'constant' ? /\b(1|2|3)\b/.test(text) : pattern === 'linear' ? /\bn\b/.test(text) : /n\s*(\^\s*2|²|\*\s*n)/.test(text) || text.includes('n*n') || text.includes('n × n')
  const mentionsAssumptions = /assum|ram model|constant time|unit cost|primitive operation/.test(text)
  const explainsReason = /because|therefore|since|each iteration|nested|loop|body execution|dominant term/.test(text)
  if (hasBound) strengths.push('A relevant asymptotic bound is present.')
  else findings.push({ category: 'wrong-growth-rate', label: 'Growth-rate claim missing or mismatched', feedback: `State the expected growth class for this pattern: ${pattern === 'constant' ? 'constant, Θ(1)' : pattern === 'linear' ? 'linear, Θ(n)' : 'quadratic, Θ(n²)'}.` })
  if (hasCount) strengths.push('The response includes a plausible operation-count expression.')
  else findings.push({ category: 'missing-bound', label: 'Exact count is unclear', feedback: `Write an explicit count before simplifying it. For this selected input size n=${n}, show how the number of body executions is obtained.` })
  if (mentionsAssumptions) strengths.push('The cost model or assumptions are acknowledged.')
  else findings.push({ category: 'counting-assumption', label: 'Cost-model assumptions omitted', feedback: 'State what you count as one operation and that the RAM model treats the selected primitive operations as constant cost.' })
  if (explainsReason) strengths.push('Reasoning is expressed in words.')
  else findings.push({ category: 'incomplete-reasoning', label: 'Derivation needs explanation', feedback: 'Add one or two sentences explaining why the loop structure leads to your count.' })
  const score = Math.round((strengths.length / 4) * 100)
  return { score, maxScore: 100, findings, strengths }
}
