def merge_files(temp_file, string_file, output_file):
    with open(temp_file, 'r', encoding='utf-8') as temp, open(string_file, 'r', encoding='utf-8') as strings:
        temp_lines = [line.strip() for line in temp.readlines()]
        string_lines = [line.strip() for line in strings.readlines()]

        # Merge the temp_lines and string_lines directly
        merged_content = ""
        for temp_line, string_line in zip(temp_lines, string_lines):
            temp_key = temp_line.split(':')[0].strip().strip('"')
            string_value = string_line.strip().strip('"')

            merged_value = string_value if string_value != '' else temp_key
            merged_content += f'{temp_key}: {merged_value}\n'

        with open(output_file, 'w', encoding='utf-8') as output:
            output.write(merged_content)

# Process each input file from "string__0_slash-n-amount.txt" to "string__3_slash-n-amount.txt"
for x in range(4):  # Loop from 0 to 3 (inclusive)
    temp_file = f'temp__{x}_slash-n-amount.txt'
    string_file = f'string__{x}_slash-n-amount_modified.txt'
    output_file = f'combined__{x}_slash-n-amount.txt'

    try:
        merge_files(temp_file, string_file, output_file)
    except FileNotFoundError:
        continue