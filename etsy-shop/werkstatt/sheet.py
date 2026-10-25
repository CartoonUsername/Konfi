import sys,glob
from PIL import Image
for slug in sys.argv[1:]:
    fs=sorted(glob.glob(f'dist/{slug}/etsy/etsy-*.jpg')); ims=[Image.open(f).resize((900,675)) for f in fs]
    g=Image.new('RGB',(3*906,2*681),'#777')
    for i,im in enumerate(ims): g.paste(im,((i%3)*906,(i//3)*681))
    g.save(f'dist/{slug}/etsy/sheet.jpg',quality=80)
