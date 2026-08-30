import re

with open('src/App.jsx', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Replace const i18n = { ... }; with import { i18n } from "./i18n";
pattern = r'// ─── COMPREHENSIVE STRICT TRANSLATION DICTIONARY ───.*?const i18n = \{.*?\n\};\n'
replacement = '// ─── COMPREHENSIVE STRICT TRANSLATION DICTIONARY ───\nimport { i18n } from "./i18n";\n'

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated src/App.jsx successfully!")
