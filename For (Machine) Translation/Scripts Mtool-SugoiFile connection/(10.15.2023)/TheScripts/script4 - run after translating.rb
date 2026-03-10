def remove_unk_from_file(file_path)
  content = File.read(file_path)

  # Remove "<unk>", "<unk>"" (with double quotation marks), and "unk>"
  content_without_unk = content.gsub(/<unk>|<unk>\"|unk>|"/, "")

  # Write the updated content back to the file
  File.open(file_path, "w") do |file|
    file.write(content_without_unk)
  end
end

# Process each input file from "string__0_slash-n-amount.txt" to "string__5_slash-n-amount.txt"
(0..5).each do |x|
  file_path = "string__#{x}_slash-n-amount.txt"
  begin
    remove_unk_from_file(file_path)
    puts "Occurrences of '<unk>', '<unk>\"', and 'unk>' have been removed from the file: #{file_path}"
  rescue Errno::ENOENT => e
    puts "File not found: #{file_path}. Skipping..."
  end
end
