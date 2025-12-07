import pdfplumber
import sys
import json

pdf_path = sys.argv[1]
output_path = sys.argv[2] if len(sys.argv) > 2 else "output.txt"

all_text = []
with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        if text:
            all_text.append(f"--- Page {i+1} ---\n{text}\n")

with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(all_text))

print(f"Extracted {len(all_text)} pages to {output_path}")
