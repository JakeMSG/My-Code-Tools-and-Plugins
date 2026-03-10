import json

def process_newline(text):
    # Replace '\\n' with '\n'
    return text.replace('\\\\n', '\\n')

inputOnlyJap = "combined_onlyJap.txt"
inputOnlyNotJap = "ManualTransFile_onlyNotJap.json"
output = "combined_final.json"

# Read the content of "combined_onlyJap.txt" and create a dictionary
combined_dict = {}
with open(inputOnlyJap, "r", encoding="utf-8") as file:
    for line in file:
        line = line.strip()
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        combined_dict[key.strip()] = value.strip()

# Read the content of "ManualTransFile_onlyNotJap.json"
with open(inputOnlyNotJap, "r", encoding="utf-8") as file:
    not_jap_data = json.load(file)

# Merge the dictionaries
merged_dict = {**combined_dict, **not_jap_data}

# Write the merged dictionary to "combined_final.txt" in JSON format
with open(output, "w", encoding="utf-8") as file:
    merged_json = json.dumps(merged_dict, indent=4, ensure_ascii=False)
    merged_json = process_newline(merged_json)
    file.write(merged_json)
