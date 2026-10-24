#!/usr/bin/env python3
"""Assemble Rootbound: Celestial Ascension into one standalone index.html.
   src/legacy.html  - the original game (with @@markers@@)
   src/css/*.css    - theme + components      -> @@CSS@@
   src/html/*.html  - extra DOM (login, hub)  -> @@HTML@@
   src/js/early/*.js- run before the save is loaded (config, quality, auth) -> @@EARLY@@
   src/js/late/*.js - run after the legacy game is defined (systems, UI)    -> @@LATE@@
Files are concatenated in filename order."""
import glob,os,sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def cat(pat,banner):
    out=[]
    for f in sorted(glob.glob(os.path.join(R,pat))):
        out.append('\n/* ========== %s: %s ========== */\n'%(banner,os.path.basename(f)))
        out.append(open(f,encoding='utf-8').read())
    return ''.join(out)
s=open(os.path.join(R,'src/legacy.html'),encoding='utf-8').read()
for k,v in (('<!--@@BOOT@@-->',open(os.path.join(R,'src/boot/boot.html'),encoding='utf-8').read()),('/*@@CSS@@*/',cat('src/css/*.css','CSS')),('<!--@@HTML@@-->',cat('src/html/*.html','HTML')),('/*@@EARLY@@*/',cat('src/js/early/*.js','EARLY')),('/*@@LATE@@*/',cat('src/js/late/*.js','LATE'))):
    assert s.count(k)==1,k
    s=s.replace(k,v)
cat_json=open(os.path.join(R,'server/catalog.json'),encoding='utf-8').read().replace('</','<\\/')
assert s.count('/*@@CATALOG@@*/{items:[]}')==1,'catalog marker'
s=s.replace('/*@@CATALOG@@*/{items:[]}',cat_json)
nb_json=open(os.path.join(R,'tools/new-blocks.json'),encoding='utf-8').read()
assert s.count('/*@@NEWBLOCKS@@*/[]')==1,'newblocks marker'
s=s.replace('/*@@NEWBLOCKS@@*/[]',nb_json.replace('</','<\\/'))
open(os.path.join(R,'index.html'),'w',encoding='utf-8').write(s)
print('built index.html',len(s),'bytes')
