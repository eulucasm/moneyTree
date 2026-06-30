const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const filePath = 'c:\\Users\\lucas\\OneDrive\\Documentos\\projetos\\moneyTreeVerdeCo\\skill\\New Contas 2025.xlsx';

if (!fs.existsSync(filePath)) {
  console.error('Planilha não encontrada no caminho:', filePath);
  process.exit(1);
}

console.log('Lendo a planilha...');
const workbook = xlsx.readFile(filePath);

console.log('\n--- ABAS ENCONTRADAS ---');
console.log(workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n=== Aba: ${sheetName} ===`);
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  if (data.length === 0) {
    console.log('Aba vazia.');
    return;
  }
  
  console.log('Primeiras 5 linhas (cabeçalho e exemplos):');
  data.slice(0, 5).forEach((row, i) => {
    console.log(`Linha ${i + 1}:`, row);
  });
});
