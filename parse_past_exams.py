import re
import json

def fix_ligatures(text: str) -> str:
    """Fix common PDF ligature extraction issues"""
    # Replace null characters and common ligature artifacts
    replacements = {
        '\u0000': 'fi',  # Most common - fi ligature
        '\ufb01': 'fi',  # Unicode fi ligature
        '\ufb02': 'fl',  # Unicode fl ligature
        '\ufb03': 'ffi', # Unicode ffi ligature
        '\ufb04': 'ffl', # Unicode ffl ligature
        'Ǹ': 'K',        # K-means encoding issue
        'К': 'K',        # Cyrillic K
        'В': 'B',        # Cyrillic B
        'Cl/CD': 'CI/CD',
        '  ': ' ',       # Double spaces
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    return text

def parse_past_exam_1(file_path: str) -> list:
    """Parse the simpler format past exam (no detailed explanations)"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix ligatures first
    content = fix_ligatures(content)
    
    questions = []
    
    # Split by page markers for cleaner parsing
    pages = content.split('--- Page ')
    
    for page in pages:
        # Find all questions on this page
        question_blocks = re.split(r'Question #(\d+) Topic \d+', page)
        
        i = 1
        while i < len(question_blocks) - 1:
            q_num = question_blocks[i]
            q_content = question_blocks[i + 1]
            i += 2
            
            # Skip HOTSPOT questions (ordering/matching)
            if 'HOTSPOT' in q_content:
                continue
            
            # Extract question text (before first option)
            text_match = re.search(r'^(.+?)(?=\n[A-E]\.\s)', q_content, re.DOTALL)
            if not text_match:
                continue
            question_text = text_match.group(1).strip().replace('\n', ' ').replace('  ', ' ')
            question_text = fix_ligatures(question_text)
            
            # Extract options
            options = []
            option_pattern = r'^([A-E])\.\s+(.+?)(?=\n[A-E]\.\s|\nCorrect Answer:|\nCommunity vote|$)'
            option_matches = re.findall(option_pattern, q_content, re.DOTALL | re.MULTILINE)
            
            for letter, text in option_matches:
                clean_text = text.strip().replace('\n', ' ').replace('  ', ' ')
                clean_text = fix_ligatures(clean_text)
                options.append(clean_text)
            
            # Extract correct answer
            answer_match = re.search(r'Correct Answer:\s*([A-E]+)', q_content)
            if answer_match:
                correct_answer = answer_match.group(1)
                if len(correct_answer) == 1:
                    correct_index = ord(correct_answer) - ord('A')
                else:
                    # Multi-answer - just use first
                    correct_index = ord(correct_answer[0]) - ord('A')
            else:
                correct_index = 0
                correct_answer = 'A'
            
            # Basic explanation
            explanation = f"Correct Answer: {correct_answer}"
            
            if len(options) >= 2 and len(options) <= 6:
                questions.append({
                    'id': f'past_q{q_num}',
                    'text': question_text,
                    'options': options,
                    'correctIndex': correct_index,
                    'explanation': explanation,
                    'topics': ['PAST_EXAM'],
                    'difficulty': 'MEDIUM',
                    'isPastExam': True
                })
    
    return questions

def main():
    # Use the simpler parsing approach for file 1 only
    questions = parse_past_exam_1('exam_files/past_exam_1.txt')
    
    print(f"Parsed {len(questions)} questions")
    
    # Deduplicate by question text similarity
    unique_questions = []
    seen_texts = set()
    
    for q in questions:
        # Create a simplified key
        key = q['text'][:100].lower()
        if key not in seen_texts:
            seen_texts.add(key)
            unique_questions.append(q)
    
    print(f"Unique questions: {len(unique_questions)}")
    
    # Sort by question number
    unique_questions.sort(key=lambda x: int(x['id'].replace('past_q', '')))
    
    # Save to JSON
    with open('src/data/past_exam_questions.json', 'w', encoding='utf-8') as f:
        json.dump(unique_questions, f, ensure_ascii=False, indent=2)
    
    print("Saved to src/data/past_exam_questions.json")
    
    # Verify no null characters remain
    with open('src/data/past_exam_questions.json', 'r', encoding='utf-8') as f:
        data = f.read()
        if '\u0000' in data:
            print("WARNING: Null characters still present!")
        else:
            print("OK: No null characters found")
    
    # Print first 3 samples
    print("\nSample questions:")
    for q in unique_questions[:3]:
        print(f"\n{q['id']}: {q['text'][:100]}...")
        print(f"  Options: {len(q['options'])}")
        print(f"  Correct: {q['correctIndex']}")

if __name__ == "__main__":
    main()
