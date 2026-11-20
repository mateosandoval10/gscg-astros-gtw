"""Find the next ready request in the team doc text (stdin).
A request starts with a paragraph beginning "Request:" and may span several paragraphs.
It is ready when a paragraph ends with "(Name)" and has no [Working]/[Done]/[Failed] tag.
Prints JSON {request, line} or nothing."""
import json, re, sys
lines = [l.rstrip() for l in sys.stdin.read().replace('\r', '').split('\n')]
start = next((i for i, l in enumerate(lines) if re.match(r'^#\s+requests\s*$', l, re.I)), None)
if start is None: sys.exit(0)
NAME = re.compile(r'\(([A-Za-z][^()\[\]]{0,40})\)\s*$')
block = None
for l in lines[start + 1:]:
    t = l.strip()
    if not t: continue
    if t.startswith('#'): break
    if re.match(r'^request\s*:', t, re.I): block = [t]
    elif block is not None: block.append(t)
    else: continue
    if '[' in t and re.search(r'\[(Working|Done|Failed|Queued)', t): block = None; continue
    if NAME.search(t):
        text = '\n\n'.join(block); text = re.sub(r'^request\s*:\s*', '', text, flags=re.I)
        print(json.dumps({'request': text, 'line': t})); break
