name_start = "ManualTransFile_onlyJap__"
name_end = "_slash-n-amount"

for x in range(4):
    input_file = name_start + str(x) + name_end + ".json"
    temp_file = "temp__" + str(x) + name_end + ".txt"
    string_file = "string__" + str(x) + name_end + ".txt"

    with open(input_file, "r", encoding="utf-8") as file:
        lines = file.readlines()

    # Check if the file contains only {} and skip if it does
    if len(lines) == 0 or (len(lines) == 1 and lines[0].strip() == "{}"):
        print(f"Input file {input_file} is empty. Skipping...")
        continue

    temp_strings = []
    string_strings = []

    for line in lines:
        line = line.strip()
        if line.startswith('"') and line.endswith('",'):
            parts = line.split('":')
            temp_strings.append(parts[0] + '": "",')
            # string_strings.append(parts[1].strip(","))
            string_strings.append(parts[1].strip(",").replace('\\n',' ').replace('  ',' ').replace('  ',' '))

    with open(temp_file, "w", encoding="utf-8") as file:
        file.write("\n".join(temp_strings))

    with open(string_file, "w", encoding="utf-8") as file:
        file.write("\n".join(string_strings).replace('"', ""))
