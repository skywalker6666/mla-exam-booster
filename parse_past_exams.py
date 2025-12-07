import re
import json

def parse_past_exam_1(file_path: str) -> list:
    """Parse the past exam file - handles both MCQ and HOTSPOT questions"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    questions = []
    
    # Find all question numbers
    question_pattern = r'Question #(\d+) Topic \d+'
    matches = list(re.finditer(question_pattern, content))
    
    for i, match in enumerate(matches):
        q_num = match.group(1)
        start_pos = match.end()
        
        # Find end position (next question or end of file)
        if i + 1 < len(matches):
            end_pos = matches[i + 1].start()
        else:
            end_pos = len(content)
        
        q_content = content[start_pos:end_pos].strip()
        
        # Check if HOTSPOT
        is_hotspot = q_content.startswith('HOTSPOT')
        
        if is_hotspot:
            # Parse HOTSPOT question differently
            # Extract question text
            text_lines = []
            for line in q_content.split('\n'):
                line = line.strip()
                if line and line != 'HOTSPOT -' and not line.startswith('•') and not line.startswith('Correct Answer'):
                    text_lines.append(line)
                if line.startswith('•'):
                    break
            
            question_text = ' '.join(text_lines).replace('  ', ' ')
            
            # Extract bullet options
            bullet_options = re.findall(r'•\s*(.+?)(?=\n•|\nCorrect Answer|$)', q_content, re.DOTALL)
            options = [opt.strip().replace('\n', ' ').replace('  ', ' ') for opt in bullet_options]
            
            if len(options) >= 2:
                questions.append({
                    'id': f'past_q{q_num}',
                    'text': question_text,
                    'options': options[:4],  # Limit to 4 options
                    'correctIndex': 0,  # HOTSPOT - no single correct answer
                    'explanation': 'This is a HOTSPOT/ordering question. Review the options carefully.',
                    'topics': ['PAST_EXAM'],
                    'difficulty': 'MEDIUM',
                    'isPastExam': True,
                    'isHotspot': True
                })
        else:
            # Parse MCQ question
            # Extract question text (before first option A.)
            text_match = re.search(r'^(.+?)(?=\n[A-E]\.\s)', q_content, re.DOTALL)
            if not text_match:
                continue
            question_text = text_match.group(1).strip().replace('\n', ' ').replace('  ', ' ')
            
            # Extract options
            options = []
            option_pattern = r'^([A-E])\.\s+(.+?)(?=\n[A-E]\.\s|\nCorrect Answer:|\nCommunity vote|$)'
            option_matches = re.findall(option_pattern, q_content, re.DOTALL | re.MULTILINE)
            
            for letter, text in option_matches:
                clean_text = text.strip().replace('\n', ' ').replace('  ', ' ')
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

def check_duplicates(past_questions: list, existing_questions: list) -> tuple:
    """Check for duplicate questions and return (unique_past, duplicates)"""
    
    # Create a simple fingerprint for each existing question
    existing_fingerprints = set()
    for q in existing_questions:
        # Use first 80 chars of question text as fingerprint
        fingerprint = q['text'][:80].lower().strip()
        existing_fingerprints.add(fingerprint)
    
    unique = []
    duplicates = []
    
    for q in past_questions:
        fingerprint = q['text'][:80].lower().strip()
        if fingerprint in existing_fingerprints:
            duplicates.append(q)
        else:
            unique.append(q)
    
    return unique, duplicates

def main():
    # Parse past exam file
    questions = parse_past_exam_1('exam_files/past_exam_1.txt')
    
    print(f"Parsed {len(questions)} questions from past_exam_1.txt")
    
    # Show question breakdown
    mcq_count = len([q for q in questions if not q.get('isHotspot')])
    hotspot_count = len([q for q in questions if q.get('isHotspot')])
    print(f"  - MCQ questions: {mcq_count}")
    print(f"  - HOTSPOT questions: {hotspot_count}")
    
    # Load existing questions
    with open('src/data/questions.json', 'r', encoding='utf-8') as f:
        existing_questions = json.load(f)
    
    print(f"\nExisting question bank has {len(existing_questions)} questions")
    
    # Check for duplicates
    unique_questions, duplicates = check_duplicates(questions, existing_questions)
    
    print(f"\nDuplicate analysis:")
    print(f"  - Unique past exam questions: {len(unique_questions)}")
    print(f"  - Duplicates found (will be removed): {len(duplicates)}")
    
    if duplicates:
        print("\nDuplicate questions found:")
        for d in duplicates[:5]:  # Show first 5
            print(f"  - {d['id']}: {d['text'][:60]}...")
    
    # Sort by question number
    unique_questions.sort(key=lambda x: int(x['id'].replace('past_q', '')))
    
    # Save to JSON
    with open('src/data/past_exam_questions.json', 'w', encoding='utf-8') as f:
        json.dump(unique_questions, f, ensure_ascii=False, indent=2)
    
    print(f"\nSaved {len(unique_questions)} unique past exam questions to src/data/past_exam_questions.json")

if __name__ == "__main__":
    main()
