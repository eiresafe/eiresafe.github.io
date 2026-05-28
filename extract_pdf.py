import PyPDF2
reader = PyPDF2.PdfReader('b:\\WebApps\\stab\\knife-related-crime-2015-to-2024.pdf')
text = ''
for page in reader.pages:
    text += page.extract_text() + '\n'
with open('b:\\WebApps\\stab\\pdf_text.txt', 'w', encoding='utf-8') as f:
    f.write(text)
