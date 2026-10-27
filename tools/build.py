#!/usr/bin/env python3
"""Build the deployable pages from the single source file, src/sign_builder.html.

  python3 tools/build.py

Writes:
  index.html             standalone page (GitHub Pages, any web host, or open locally)
  apps-script/Index.html Google Apps Script HtmlService page (pair with apps-script/Code.gs)
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
src = (ROOT / "src" / "sign_builder.html").read_text(encoding="utf-8")

# The source is a page fragment: <title>, font links and <style> first, then the app markup and scripts.
src = src.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
split = src.index('<div class="app">')
head_part, body_part = src[:split], src[split:]

RESET = ("<style>html,body{margin:0}body{font:14px system-ui,-apple-system,'Segoe UI',sans-serif}"
         "img{max-width:100%}[hidden]{display:none!important}</style>\n")

index = ("<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
         "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
         + RESET + head_part + "</head>\n<body>\n" + body_part + "\n</body>\n</html>\n")
(ROOT / "index.html").write_text(index, encoding="utf-8")

apps_head = head_part.replace("<title>3D Sign Builder</title>\n", "")
apps = ("<!DOCTYPE html>\n<html>\n<head>\n<base target=\"_top\">\n<meta charset=\"utf-8\">\n"
        + RESET + apps_head + "</head>\n<body>\n" + body_part + "\n</body>\n</html>\n")
(ROOT / "apps-script" / "Index.html").write_text(apps, encoding="utf-8")
print("Built index.html and apps-script/Index.html")
