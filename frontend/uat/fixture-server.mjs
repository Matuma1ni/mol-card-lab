/** NON-PRODUCTION local fixture server for deterministic Phase 2 browser UAT. */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const HOST = '127.0.0.1'
const PORT = 8000
const scenarioPath = fileURLToPath(new URL('./fixtures/scenarios.json', import.meta.url))
const scenarios = JSON.parse(await readFile(scenarioPath, 'utf8'))
const scenarioNames = ['success', 'slow-success', 'partial', 'empty', 'error']

function isConformer(item) {
  return item && typeof item.id === 'string' && typeof item.smiles === 'string'
    && typeof item.molBlock === 'string' && item.molBlock.trim()
    && Number.isFinite(item.num_atoms) && Array.isArray(item.coordinates)
    && item.metadata && typeof item.metadata.reference_source === 'string'
}

function validateFixtures() {
  if (Object.keys(scenarios).sort().join() !== [...scenarioNames].sort().join()) {
    throw new Error('Fixture names must match the five documented scenarios exactly')
  }
  for (const name of scenarioNames) {
    const scenario = scenarios[name]
    if (!Number.isInteger(scenario.status) || !Number.isInteger(scenario.delayMs)) {
      throw new Error(`${name}: status and delayMs are required integers`)
    }
    if (name === 'error') {
      if (scenario.status !== 500 || typeof scenario.body?.detail !== 'string') {
        throw new Error('error: expected HTTP 500 detail body')
      }
      continue
    }
    const { body } = scenario
    if (scenario.status !== 200 || !Array.isArray(body?.conformers)
      || body.count !== body.conformers.length || !body.conformers.every(isConformer)) {
      throw new Error(`${name}: invalid conformer response contract`)
    }
    if (!body.metadata || !Array.isArray(body.metadata.warnings)
      || body.metadata.warning_count !== body.metadata.warnings.length) {
      throw new Error(`${name}: invalid generation metadata`)
    }
  }
  if (scenarios.success.body.conformers.length < 8) throw new Error('success must force selector overflow')
  if (scenarios.partial.body.metadata.num_failed < 1) throw new Error('partial must report failures')
  if (scenarios.empty.body.conformers.length !== 0) throw new Error('empty must have no conformers')
  if (scenarios['slow-success'].delayMs < 1000) throw new Error('slow-success must be observably delayed')
}

validateFixtures()
if (process.argv.includes('--self-test')) {
  console.log('Phase 2 UAT fixture self-test passed: success, slow-success, partial, empty, error')
  process.exit(0)
}

let activeScenario = 'success'

function send(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

async function readJson(request) {
  let raw = ''
  for await (const chunk of request) raw += chunk
  return raw ? JSON.parse(raw) : {}
}

const server = createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/__scenario') {
    try {
      const body = await readJson(request)
      if (!scenarioNames.includes(body.scenario)) {
        send(response, 422, { detail: `scenario must be one of: ${scenarioNames.join(', ')}` })
        return
      }
      activeScenario = body.scenario
      send(response, 200, { scenario: activeScenario })
    } catch {
      send(response, 400, { detail: 'Invalid JSON body' })
    }
    return
  }

  if (request.method === 'POST' && request.url === '/generate') {
    const fixture = scenarios[activeScenario]
    if (fixture.delayMs) await new Promise((resolve) => setTimeout(resolve, fixture.delayMs))
    send(response, fixture.status, fixture.body)
    return
  }

  send(response, 404, { detail: 'UAT fixture route not found' })
})

server.listen(PORT, HOST, () => {
  console.log(`NON-PRODUCTION Phase 2 UAT fixture listening on http://${HOST}:${PORT}`)
  console.log(`Active scenario: ${activeScenario}`)
})
