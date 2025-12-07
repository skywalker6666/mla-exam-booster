import re
import json

def parse_past_exam_1(file_path: str) -> list:
    """Parse the past exam file - handles MCQ, HOTSPOT, and multi-select questions"""
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
        
        # Check if multi-select
        is_multi_select = '(Choose two.)' in q_content or '(Choose three.)' in q_content
        
        if is_hotspot:
            # Parse HOTSPOT question differently
            # Extract question text (before first bullet point)
            text_match = re.search(r'^HOTSPOT -\s*(.+?)(?=\n•)', q_content, re.DOTALL)
            if text_match:
                question_text = text_match.group(1).strip().replace('\n', ' ').replace('  ', ' ')
            else:
                # Fallback
                lines = []
                for line in q_content.split('\n'):
                    line = line.strip()
                    if line and line != 'HOTSPOT -' and not line.startswith('•') and not line.startswith('Correct Answer'):
                        lines.append(line)
                    if line.startswith('•'):
                        break
                question_text = ' '.join(lines).replace('  ', ' ')
            
            # Extract bullet options
            bullet_options = re.findall(r'•\s*(.+?)(?=\n•|\nCorrect Answer|--- Page|$)', q_content, re.DOTALL)
            options = [opt.strip().replace('\n', ' ').replace('  ', ' ') for opt in bullet_options]
            
            # Determine how many to select
            select_count = 3  # Default for HOTSPOT
            if '(Select and order three.)' in question_text or '(Select three.)' in question_text:
                select_count = 3
            
            if len(options) >= 2:
                questions.append({
                    'id': f'past_q{q_num}',
                    'text': question_text,
                    'options': options[:5],  # Limit to 5 options
                    'correctIndex': 0,  # HOTSPOT - multiple correct answers
                    'explanation': f'This is a HOTSPOT question. Select and order {select_count} correct steps.',
                    'topics': ['PAST_EXAM'],
                    'difficulty': 'MEDIUM',
                    'isPastExam': True,
                    'isMultiSelect': True,
                    'selectCount': select_count
                })
        else:
            # Parse MCQ/Multi-select question
            lines = q_content.split('\n')
            
            question_lines = []
            options = []
            current_option = None
            correct_answer = None
            
            for line in lines:
                stripped = line.strip()
                if not stripped:
                    continue
                
                # Check for correct answer
                answer_match = re.match(r'Correct Answer:\s*([A-E]+)', stripped)
                if answer_match:
                    correct_answer = answer_match.group(1)
                    if current_option is not None:
                        options.append(current_option)
                    break
                
                # Check for community vote (end of options)
                if stripped.startswith('Community vote'):
                    if current_option is not None:
                        options.append(current_option)
                    break
                
                # Check for option start (A., B., C., D., E.)
                option_match = re.match(r'^([A-E])\.\s+(.+)$', stripped)
                if option_match:
                    if current_option is not None:
                        options.append(current_option)
                    current_option = option_match.group(2)
                elif current_option is not None:
                    current_option += ' ' + stripped
                else:
                    question_lines.append(stripped)
            
            # Clean up
            question_text = ' '.join(question_lines).replace('  ', ' ')
            
            # Determine correct indices
            if correct_answer:
                if len(correct_answer) == 1:
                    correct_index = ord(correct_answer) - ord('A')
                    correct_indices = [correct_index]
                else:
                    # Multi-answer (e.g., "AB", "AD")
                    correct_indices = [ord(c) - ord('A') for c in correct_answer]
                    correct_index = correct_indices[0]  # Keep first for backward compatibility
            else:
                correct_index = 0
                correct_indices = [0]
                correct_answer = 'A'
            
            # Clean options
            clean_options = []
            for opt in options:
                clean_opt = opt.replace('  ', ' ').strip()
                clean_options.append(clean_opt)
            
            if len(clean_options) >= 2 and len(clean_options) <= 6:
                q_data = {
                    'id': f'past_q{q_num}',
                    'text': question_text,
                    'options': clean_options,
                    'correctIndex': correct_index,
                    'explanation': f"Correct Answer: {correct_answer}",
                    'topics': ['PAST_EXAM'],
                    'difficulty': 'MEDIUM',
                    'isPastExam': True
                }
                
                # Mark multi-select questions
                if is_multi_select or len(correct_answer) > 1:
                    q_data['isMultiSelect'] = True
                    q_data['correctIndices'] = correct_indices
                    q_data['selectCount'] = len(correct_indices)
                
                questions.append(q_data)
    
    return questions

def check_duplicates(past_questions: list, existing_questions: list) -> tuple:
    """Check for duplicate questions"""
    existing_fingerprints = set()
    for q in existing_questions:
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
    
    # Count question types
    mcq_count = len([q for q in questions if not q.get('isMultiSelect')])
    multi_count = len([q for q in questions if q.get('isMultiSelect')])
    print(f"  - Single-choice (MCQ): {mcq_count}")
    print(f"  - Multi-select/HOTSPOT: {multi_count}")
    
    # List multi-select questions
    print("\nMulti-select questions:")
    for q in questions:
        if q.get('isMultiSelect'):
            select_count = q.get('selectCount', 2)
            print(f"  - {q['id']}: Select {select_count} (options: {len(q['options'])})")
    
    # Load existing questions
    with open('src/data/questions.json', 'r', encoding='utf-8') as f:
        existing_questions = json.load(f)
    
    print(f"\nExisting question bank has {len(existing_questions)} questions")
    
    # Check for duplicates
    unique_questions, duplicates = check_duplicates(questions, existing_questions)
    
    print(f"\nDuplicate analysis:")
    print(f"  - Unique past exam questions: {len(unique_questions)}")
    print(f"  - Duplicates found: {len(duplicates)}")
    
    # Sort by question number
    unique_questions.sort(key=lambda x: int(x['id'].replace('past_q', '')))
    
    # Save to JSON
    with open('src/data/past_exam_questions.json', 'w', encoding='utf-8') as f:
        json.dump(unique_questions, f, ensure_ascii=False, indent=2)
    
    print(f"\nSaved {len(unique_questions)} questions to src/data/past_exam_questions.json")

if __name__ == "__main__":
    main()
