const fs = require('fs');

const file = 'frontend/src/app/(tabs)/investments.tsx';
const content = fs.readFileSync(file, 'utf-8');
const lines = content.split('\n');

const startSavings = lines.findIndex(l => l.includes('{/* CARD DE POUPANÇA E RESERVA DE EMERGÊNCIA */}'));
const endSavings = lines.findIndex((l, i) => i > startSavings && l.includes('</GlassCard>'));

if (startSavings === -1 || endSavings === -1) {
  console.log('Could not find savings section');
  process.exit(1);
}

const savingsSection = lines.slice(startSavings, endSavings + 1);
const beforeSavings = lines.slice(0, startSavings);
const afterSavings = lines.slice(endSavings + 1);

const newLines = [...beforeSavings, ...afterSavings];
const insertIdx = newLines.findIndex(l => l.includes('{/* Modals here... */}'));

if (insertIdx === -1) {
  console.log('Could not find modals section');
  process.exit(1);
}

// Insert savings before modals
newLines.splice(insertIdx, 0, ...savingsSection, '');

fs.writeFileSync(file, newLines.join('\n'));
console.log('Moved savings section successfully');
