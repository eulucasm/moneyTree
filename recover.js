const fs = require('fs');

const transcriptPath = 'C:\\Users\\lucas\\.gemini\\antigravity-ide\\brain\\047ad007-349b-4a18-8400-15e4385b9b2b\\.system_generated\\logs\\transcript.jsonl';
const transcript = fs.readFileSync(transcriptPath, 'utf-8');
const lines = transcript.split('\n');

let viewFileOutput = '';
for (const line of lines) {
  if (line.includes('Showing lines 1 to 800') && line.includes('investments.tsx')) {
    try {
      const obj = JSON.parse(line);
      // in transcript.jsonl, the tool output might be in obj.content or obj.tool_responses
      if (obj.content && obj.content.includes('Showing lines 1 to 800')) {
        viewFileOutput = obj.content;
      } else if (obj.tool_calls) {
        // usually in transcript full
      } else if (obj.type === 'TOOL_RESPONSE' && obj.content.includes('Showing lines 1 to 800')) {
         viewFileOutput = obj.content;
      }
    } catch (e) {
      // ignore
    }
  }
}

if (!viewFileOutput) {
  console.log('Could not find view_file output in transcript. Let me try a simpler string search.');
  const idx = transcript.indexOf('Showing lines 1 to 800\\nThe following code has been modified');
  if (idx !== -1) {
    const endIdx = transcript.indexOf('The above content does NOT show', idx);
    if (endIdx !== -1) {
       viewFileOutput = transcript.substring(idx, endIdx).replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
  }
}

if (!viewFileOutput) {
  console.log('Still could not find it. Failing.');
  process.exit(1);
}

const match = viewFileOutput.split('\n');
const recoveredLines = [];
let capturing = false;
for (const l of match) {
  if (l.startsWith('1: import')) capturing = true;
  if (capturing) {
    const m = l.match(/^\d+:\s?(.*)/);
    if (m) {
      recoveredLines.push(m[1]);
    } else if (l.startsWith('The above content does NOT show')) {
      capturing = false;
    }
  }
}

const currentFile = fs.readFileSync('frontend/src/app/(tabs)/investments.tsx', 'utf-8').split('\n');
const splitIndex = currentFile.findIndex(l => l.includes('// Emulate Sparkles'));
let endLines = [];
if (splitIndex !== -1) {
  endLines = currentFile.slice(splitIndex);
} else {
  console.log('Could not find split point in current file');
  process.exit(1);
}

fs.writeFileSync('frontend/src/app/(tabs)/investments.tsx', recoveredLines.join('\n') + '\n' + endLines.join('\n'));
console.log('Recovered successfully!');
