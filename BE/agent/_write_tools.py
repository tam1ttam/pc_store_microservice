import pathlib

p = pathlib.Path(r"d:\nhap\nhap_iluttmab\BE\agent\agent\tools.py")

content = p.read_text(encoding="utf-8")
print("CURRENT LINES:", len(content.splitlines()))
# Show lines around where f-strings appear
lines = content.splitlines()
for i in range(35, 55):
    print(f"{i+1}: {lines[i]!r}")
