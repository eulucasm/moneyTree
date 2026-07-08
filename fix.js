const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/app/(tabs)/investments.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add useRouter import
content = content.replace(
  /import \{ View, Text, StyleSheet([^}]*)\} from 'react-native';/,
  "import { View, Text, StyleSheet$1} from 'react-native';\nimport { useRouter } from 'expo-router';"
);

// 2. Add router variable
content = content.replace(
  /export default function InvestmentsScreen\(\) \{\s+const \{ userProfile, updateProfile \} = useFinancials\(\);/,
  "export default function InvestmentsScreen() {\n  const router = useRouter();\n  const { userProfile, updateProfile } = useFinancials();"
);

// 3. Move Poupança block
const poupancaRegex = /\{\/\* CARD DE POUPANÇA E RESERVA DE EMERGÊNCIA \*\/\}[\s\S]*?<\/GlassCard>/;
const poupancaMatch = content.match(poupancaRegex);

if (poupancaMatch) {
  const poupancaBlock = poupancaMatch[0];
  content = content.replace(poupancaBlock, '');
  content = content.replace(
    /\{\/\* Modals here\.\.\. \*\/\}/,
    poupancaBlock + "\n\n      {/* Modals here... */}"
  );
} else {
  console.log("Could not find Poupanca block");
}

// 4. Modify Assets list map
content = content.replace(
  /\{portfolio\.assets\.map\(asset => \(/,
  "{[...portfolio.assets].reverse().slice(0, 5).map(asset => ("
);

// 5. Add "Mostrar todos" button
const endAssetsRegex = /(\s+)<\/View>\s+\)\}\s+<\/View>/;
if (endAssetsRegex.test(content)) {
  content = content.replace(
    endAssetsRegex,
    `$1</View>\n        )}\n        {portfolio.assets.length > 5 && (\n          <TouchableOpacity \n            style={{ marginTop: 16, padding: 12, alignItems: 'center', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8F9FA', borderRadius: 8, borderWidth: 1, borderColor: colors.borderGlass }}\n            onPress={() => router.push('/all-assets')}\n          >\n            <Text style={{ color: colors.text, fontWeight: '600' }}>Mostrar todos</Text>\n          </TouchableOpacity>\n        )}\n      </View>`
  );
} else {
  console.log("Could not find end of assets block");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("investments.tsx fixed successfully.");
