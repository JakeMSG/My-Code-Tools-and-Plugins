name_start = "combined__"
name_end = "_slash-n-amount.txt"
output_file = "combined_onlyJap.txt"

combined_content = []

for x in range(4):
    input_file = name_start + str(x) + name_end
    try:
        with open(input_file, "r", encoding="utf-8") as file:
            lines = file.readlines()

        combined_content.extend(lines)
    except FileNotFoundError:
        continue

with open(output_file, "w", encoding="utf-8") as file:
    file.write("".join(combined_content))
