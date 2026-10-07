"""Keep v1.2 baselines unchanged; exclude only intentional nav/version changes."""
import sys,json
from PIL import Image,ImageChops,ImageDraw
expected=Image.open(sys.argv[1]).convert('RGB');actual=Image.open(sys.argv[2]).convert('RGB')
if expected.size!=actual.size:raise SystemExit(f'Layout dimensions changed: {expected.size} -> {actual.size}')
for x,y,w,h in json.loads(sys.argv[3]):
    box=(int(x)-2,int(y)-2,int(x+w)+2,int(y+h)+2)
    ImageDraw.Draw(expected).rectangle(box,fill=(0,0,0));ImageDraw.Draw(actual).rectangle(box,fill=(0,0,0))
diff=ImageChops.difference(expected,actual);pixels=list(diff.getdata());changed=sum(max(p)>40 for p in pixels);ratio=changed/len(pixels)
print(json.dumps({'changedPixels':changed,'totalPixels':len(pixels),'ratio':ratio}))
if ratio>0.015:raise SystemExit('Unexpected change outside the intentional Money navigation/version areas')
