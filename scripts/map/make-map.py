# Regenerates public/map-base.svg (360 wide) from NYC borough boundaries and course.csv.
# Usage: python3 make-map.py borough-boundaries.geojson out.svg
#   (NYC Open Data "Borough Boundaries", GeoJSON). Its at() matches lib/course.ts.
# Note: the output includes a sample runner icon at halfway; the site draws its own live icon,
# so strip the `cloud` ellipse and `bob` group before copying it to public/.
import json, math, sys
src = sys.argv[1]; out = sys.argv[2]
d = json.load(open(src))
LON0, LON1, LAT0, LAT1 = -74.075, -73.905, 40.594, 40.830
k = math.cos(math.radians(40.71))
W = 360.0
sx = W / ((LON1-LON0)*k)
H = (LAT1-LAT0)*sx
def P(lon, lat): return ((lon-LON0)*k*sx, (LAT1-lat)*sx)
def rdp(pts, eps):
    if len(pts) < 3: return pts
    (x1,y1),(x2,y2) = pts[0], pts[-1]
    dx,dy = x2-x1, y2-y1; L = math.hypot(dx,dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1,len(pts)-1):
        x0,y0 = pts[i]; dd = (abs(dy*x0-dx*y0+x2*y1-y2*x1)/L) if L>1e-6 else math.hypot(x0-x1,y0-y1)
        if dd > dmax: dmax, idx = dd, i
    if dmax > eps:
        return rdp(pts[:idx+1],eps)[:-1] + rdp(pts[idx:],eps)
    return [pts[0], pts[-1]]
fills = {'Staten Island':'#E9DFB8','Brooklyn':'#CFE3A6','Queens':'#E4E8B0','Manhattan':'#F4EBCF','Bronx':'#D9E7C3'}
paths = []
for f in d['features']:
    name = f['properties']['BoroName']; dstr = ''
    for poly in f['geometry']['coordinates']:
        ring = poly[0]
        pts = [P(x,y) for x,y in ring]
        xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
        if max(xs) < -20 or min(xs) > W+20 or max(ys) < -20 or min(ys) > H+20: continue
        if (max(xs)-min(xs))*(max(ys)-min(ys)) < 4: continue
        s = rdp(pts, 0.35)
        if len(s) < 4: continue
        dstr += 'M' + ' L'.join('%.1f %.1f' % p for p in s) + ' Z '
    paths.append('<path d="%s" fill="%s" stroke="#16201A" stroke-width="1.2" stroke-linejoin="round"></path>' % (dstr.strip(), fills[name]))
course = [(40.6023,-74.0605),(40.6040,-74.0560),(40.6066,-74.0447),(40.6097,-74.0350),(40.6145,-74.0315),(40.6170,-74.0297),(40.6268,-74.0250),(40.6365,-74.0200),(40.6490,-74.0100),(40.6615,-73.9965),(40.6705,-73.9888),(40.6773,-73.9832),(40.6837,-73.9783),(40.6868,-73.9751),(40.6885,-73.9597),(40.6890,-73.9545),(40.6996,-73.9570),(40.7065,-73.9615),(40.7140,-73.9610),(40.7180,-73.9578),(40.7225,-73.9520),(40.7232,-73.9508),(40.7302,-73.9542),(40.7310,-73.9480),(40.7350,-73.9500),(40.7385,-73.9520),(40.7430,-73.9530),(40.7448,-73.9520),(40.7440,-73.9545),(40.7490,-73.9510),(40.7473,-73.9420),(40.7510,-73.9400),(40.7530,-73.9435),(40.7570,-73.9530),(40.7600,-73.9595),(40.7840,-73.9440),(40.8015,-73.9318),(40.8070,-73.9275),(40.8070,-73.9300),(40.8095,-73.9283),(40.8115,-73.9265),(40.8125,-73.9295),(40.8100,-73.9305),(40.8134,-73.9330),(40.8130,-73.9370),(40.8128,-73.9385),(40.8055,-73.9435),(40.8025,-73.9455),(40.7965,-73.9495),(40.7840,-73.9585),(40.7843,-73.9600),(40.7740,-73.9675),(40.7655,-73.9730),(40.7645,-73.9735),(40.7681,-73.9819),(40.7718,-73.9775)]
cp = [P(lon,lat) for lat,lon in course]
seg = [math.hypot(cp[i+1][0]-cp[i][0],cp[i+1][1]-cp[i][1]) for i in range(len(cp)-1)]
tot = sum(seg)
def at(mile):
    t = mile/26.2*tot; acc = 0
    for i,s in enumerate(seg):
        if acc+s >= t:
            r = (t-acc)/s; return (cp[i][0]+r*(cp[i+1][0]-cp[i][0]), cp[i][1]+r*(cp[i+1][1]-cp[i][1]))
        acc += s
    return cp[-1]
cd = 'M' + ' L'.join('%.1f %.1f' % p for p in cp)
marks = ''
for m in [5,10,15,20,25]:
    x,y = at(m)
    marks += '<circle cx="%.1f" cy="%.1f" r="7" fill="#16201A"></circle><text x="%.1f" y="%.1f" font-family="Outfit" font-size="8" font-weight="800" fill="#FFFFFF" text-anchor="middle">%d</text>' % (x,y,x,y+2.8,m)
lx,ly = at(13.1)
sxp, syp = cp[0]; fx, fy = cp[-1]
svg = '''<svg viewBox="0 0 %d %d" width="100%%" role="img" aria-label="Map of New York's five boroughs with the 2026 marathon course" style="display: block">
<rect x="0" y="0" width="%d" height="%d" fill="#A9D4EE"></rect>
%s
<path d="%s" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="%s" fill="none" stroke="#16201A" stroke-width="2.4" stroke-dasharray="5 3.5" stroke-linecap="round" stroke-linejoin="round"></path>
%s
<g><rect x="%.1f" y="%.1f" width="44" height="16" rx="8" fill="#16201A"></rect><text x="%.1f" y="%.1f" font-family="Outfit" font-size="9" font-weight="800" fill="#FFFFFF" text-anchor="middle">START</text></g>
<g><rect x="%.1f" y="%.1f" width="48" height="16" rx="8" fill="#16201A"></rect><text x="%.1f" y="%.1f" font-family="Outfit" font-size="9" font-weight="800" fill="#FFFFFF" text-anchor="middle">FINISH</text></g>
<ellipse class="cloud" cx="%.1f" cy="%.1f" rx="24" ry="17" fill="#F26B2A" opacity="0.28"></ellipse>
<g class="bob"><circle cx="%.1f" cy="%.1f" r="6.5" fill="#F26B2A" stroke="#FFFFFF" stroke-width="2.5"></circle><path d="M%.1f %.1f Q%.1f %.1f %.1f %.1f Z" fill="#F26B2A" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"></path></g>
<text x="12" y="%.1f" font-family="Outfit" font-size="9" font-weight="600" fill="#2B5D7A" font-style="italic">Hudson (no swimming)</text>
<text x="%.1f" y="%.1f" font-family="Outfit" font-size="11" font-weight="800" fill="#16201A">BROOKLYN</text>
<text x="%.1f" y="%.1f" font-family="Outfit" font-size="11" font-weight="800" fill="#16201A">QUEENS</text>
<text x="%.1f" y="%.1f" font-family="Outfit" font-size="11" font-weight="800" fill="#16201A">BRONX</text>
<text x="%.1f" y="%.1f" font-family="Outfit" font-size="10" font-weight="800" fill="#16201A">STATEN IS.</text>
</svg>''' % (W, H, W, H, '\n'.join(paths), cd, cd, marks,
  sxp+4, syp-26, sxp+26, syp-15,
  fx-60, fy-8, fx-36, fy+3,
  lx, ly, lx, ly-15, lx-7, ly+5, lx, ly-14, lx+7, ly+5,
  H*0.50, *P(-73.965,40.645), *P(-73.935,40.760), *P(-73.925,40.825), *P(-74.074,40.5955))
open(out,'w').write(svg)
print('H=%.0f tot=%.0f' % (H, tot))
