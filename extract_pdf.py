import pdfplumber
import sys
import re

def fix_ligatures(text: str) -> str:
    """Fix common PDF ligature extraction issues"""
    if text is None:
        return ""
    
    # Replace null characters and common ligature artifacts
    replacements = {
        '\u0000': 'fi',  # Most common - fi ligature
        '\x00': 'fi',    # Another null representation
        '\ufb01': 'fi',  # Unicode fi ligature
        '\ufb02': 'fl',  # Unicode fl ligature
        '\ufb03': 'ffi', # Unicode ffi ligature
        '\ufb04': 'ffl', # Unicode ffl ligature
        'Ǹ': 'K',        # K-means encoding issue
        'К': 'K',        # Cyrillic K
        'В': 'B',        # Cyrillic B
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Clean up double spaces
    text = re.sub(r'  +', ' ', text)
    
    return text

pdf_path = sys.argv[1]
output_path = sys.argv[2] if len(sys.argv) > 2 else "output.txt"

all_text = []
with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        if text:
            # Fix ligatures immediately after extraction
            fixed_text = fix_ligatures(text)
            all_text.append(f"--- Page {i+1} ---\n{fixed_text}\n")

with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(all_text))

print(f"Extracted {len(all_text)} pages to {output_path}")

# Verify no null characters
with open(output_path, 'r', encoding='utf-8') as f:
    content = f.read()
    null_count = content.count('\x00') + content.count('\u0000')
    if null_count > 0:
        print(f"WARNING: {null_count} null characters still present!")
    else:
        print("OK: No null characters found")
