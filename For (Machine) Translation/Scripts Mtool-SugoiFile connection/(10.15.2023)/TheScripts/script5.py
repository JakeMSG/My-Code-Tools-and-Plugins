import codecs

def add_newlines(text, num_newlines):
    # Split the text into sentences based on the occurrences of "\n"
    sentences = text.split('\n')

    # Filter out empty sentences
    sentences = [sentence for sentence in sentences if sentence.strip()]

    # Group the sentences into chunks of 'num_newlines + 1'
    chunks = [sentences[i:i+num_newlines+1] for i in range(0, len(sentences), num_newlines+1)]

    # Join the sentences in each chunk with newlines
    modified_chunks = ['\n'.join(chunk) for chunk in chunks]

    # Join all chunks with newlines and return the modified text
    modified_text = '\n'.join(modified_chunks)
    return modified_text


def process_lines(input_file, output_file, x):
    # Read the content of the input file as a list of lines

    with codecs.open(input_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    # Open the output file in write mode
    with codecs.open(output_file, 'w', encoding='utf-8') as file:
        for line in lines:
            # Initialize variables
            modified_line = line.strip()
            line_length = len(modified_line)

            # Apply different modifications based on the value of 'x'
            if x == 1:
                # Divide the line into two lines
                middle_position = line_length // 2
                nearest_space = modified_line.rfind(' ', 0, middle_position)
                if nearest_space != -1:
                    modified_line = modified_line[:nearest_space] + '\\n' + modified_line[nearest_space+1:]
            elif x == 2:
                # Divide the line into three lines
                middle_position1 = line_length // 3
                nearest_space1 = modified_line.rfind(' ', 0, middle_position1)
                if nearest_space1 != -1:
                    modified_line = modified_line[:nearest_space1] + '\\n' + modified_line[nearest_space1+1:]
                middle_position2 = (line_length // 3) * 2
                nearest_space2 = modified_line.rfind(' ', middle_position1, middle_position2)
                if nearest_space2 != -1:
                    modified_line = modified_line[:nearest_space2] + '\\n' + modified_line[nearest_space2+1:]
            elif x == 3:
                # Divide the line into four lines
                middle_position1 = line_length // 4
                nearest_space1 = modified_line.rfind(' ', 0, middle_position1)
                if nearest_space1 != -1:
                    modified_line = modified_line[:nearest_space1] + '\\n' + modified_line[nearest_space1+1:]
                middle_position2 = (line_length // 4) * 2
                nearest_space2 = modified_line.rfind(' ', middle_position1, middle_position2)
                if nearest_space2 != -1:
                    modified_line = modified_line[:nearest_space2] + '\\n' + modified_line[nearest_space2+1:]
                middle_position3 = (line_length // 4) * 3
                nearest_space3 = modified_line.rfind(' ', middle_position2, middle_position3)
                if nearest_space3 != -1:
                    modified_line = modified_line[:nearest_space3] + '\\n' + modified_line[nearest_space3+1:]

            # Write the modified line to the output file
            file.write(modified_line + '\n')

# Process each input file from "string__0_slash-n-amount.txt" to "string__3_slash-n-amount.txt"
for x in range(4):  # Loop from 0 to 3 (inclusive)
    input_file_name = f"string__{x}_slash-n-amount.txt"
    output_file_name = f"string__{x}_slash-n-amount_modified.txt"
    try:
        process_lines(input_file_name, output_file_name, x)
    except FileNotFoundError:
        continue
