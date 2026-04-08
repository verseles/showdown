import json
import os

messages_dir = 'messages'
files = os.listdir(messages_dir)

translations = {
    'en.json': 'Unknown',
    'pt-BR.json': 'Desconhecido',
    'zh.json': '未知',
    'es.json': 'Desconocido',
    'ar.json': 'غير معروف',
    'id.json': 'Tidak diketahui',
    'ru.json': 'Неизвестно',
    'de.json': 'Unbekannt',
    'fr.json': 'Inconnu',
    'ja.json': '不明',
    'arz.json': 'غير معروف',
    'bn.json': 'অজানা',
    'fa.json': 'ناشناخته',
    'hi.json': 'अज्ञात',
    'it.json': 'Sconosciuto',
    'ko.json': '알 수 없음',
    'nl.json': 'Onbekend',
    'pl.json': 'Nieznany',
    'sv.json': 'Okänd',
    'th.json': 'ไม่ทราบ',
    'tr.json': 'Bilinmeyen',
    'ur.json': 'نامعلوم',
    'vi.json': 'Không xác định'
}

for file in files:
    if file.endswith('.json'):
        path = os.path.join(messages_dir, file)
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Get translation if available, otherwise fallback to English
        val = translations.get(file, 'Unknown')
        data['common_unknown'] = val

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        # Add new line at EOF
        with open(path, 'a', encoding='utf-8') as f:
            f.write('\n')

print("Added common_unknown to all translation files.")
