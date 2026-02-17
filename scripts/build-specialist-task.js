#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function loadSpecialists() {
  const filePath = path.resolve(process.cwd(), 'agents/specialists/index.json');
  if (!fs.existsSync(filePath)) fail('Missing agents/specialists/index.json');
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`Failed to parse specialists index: ${error.message}`);
  }
}

function parseArgs(argv) {
  const [specialistId, ...rest] = argv;
  if (!specialistId) {
    fail('Usage: node scripts/build-specialist-task.js <specialist-id> "<objective>"');
  }
  const objective = rest.join(' ').trim();
  if (!objective) {
    fail('Please provide an objective string.');
  }
  return { specialistId, objective };
}

function bulletize(items) {
  return items.map((x) => `- ${x}`).join('\n');
}

function buildPrompt(specialist, objective) {
  return [
    `You are operating as the ${specialist.name} for the DailyVerse project.`,
    '',
    'Mission:',
    `- ${specialist.mission}`,
    '',
    'Objective for this run:',
    `- ${objective}`,
    '',
    'Preferred skills:',
    bulletize(specialist.preferredSkills),
    '',
    'Expected outputs:',
    bulletize(specialist.defaultOutputs),
    '',
    'Quality bar:',
    bulletize(specialist.qualityBar),
    '',
    'Execution rules:',
    '- Keep changes scoped and production-minded.',
    '- Surface blockers clearly before finishing.',
    '- End with a concise summary and concrete next actions.'
  ].join('\n');
}

function main() {
  const { specialistId, objective } = parseArgs(process.argv.slice(2));
  const data = loadSpecialists();
  const specialist = (data.specialists || []).find((s) => s.id === specialistId);
  if (!specialist) {
    const known = (data.specialists || []).map((s) => s.id).join(', ');
    fail(`Unknown specialist '${specialistId}'. Available: ${known}`);
  }

  const prompt = buildPrompt(specialist, objective);
  process.stdout.write(prompt + '\n');
}

main();
