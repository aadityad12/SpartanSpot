"""Generate offline SVG paths from OSM extracts (no tile service or API key at runtime).

Usage: python3 scripts/generate-campus-map.py /path/main-campus.osm /path/south-campus.osm
Download extracts from api.openstreetmap.org/api/0.6/map?bbox=west,south,east,north.
Sources, bounding boxes and licensing are documented in docs/map-sources.md.
"""
from pathlib import Path
import json, math, sys, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
C = math.cos(math.radians(30)); S = math.sin(math.radians(30))

def tags(element):
    return {t.get('k'): t.get('v') for t in element.findall('tag')}

def xy(lon, lat, center):
    e = (lon-center[0])*111319.49*math.cos(math.radians(center[1]))
    n = (lat-center[1])*111319.49
    return e*C+n*S, e*S-n*C

def geometry(source, center, width, height):
    root = ET.parse(source).getroot()
    nodes = {n.get('id'): (float(n.get('lon')),float(n.get('lat'))) for n in root.findall('node')}
    ways = {w.get('id'): w for w in root.findall('way')}
    inherited = {}
    for relation in root.findall('relation'):
        t = tags(relation)
        if t.get('type') == 'multipolygon':
            for member in relation.findall('member'):
                if member.get('type')=='way' and member.get('role')=='outer':
                    inherited[member.get('ref')] = t
    layers = {key: [] for key in ['land','buildings','garages','roads','walkways']}
    for key, way in ways.items():
        t = {**inherited.get(key, {}), **tags(way)}
        ps = [nodes[n.get('ref')] for n in way.findall('nd') if n.get('ref') in nodes]
        if len(ps)<2: continue
        points = [xy(*p,center) for p in ps]
        # OSM includes complete ways well outside the requested bbox.
        if max(p[0] for p in points)<-width/2 or min(p[0] for p in points)>width/2 or max(p[1] for p in points)<-height/2 or min(p[1] for p in points)>height/2: continue
        layer=None
        if t.get('building'):
            layer = 'garages' if t.get('parking')=='multi-storey' or key in ['1009045160','25774762','25774765','956530357'] else 'buildings'
        elif t.get('highway') in ['primary','secondary','tertiary','residential','unclassified','living_street']: layer='roads'
        elif t.get('highway') in ['footway','pedestrian','path','cycleway']: layer='walkways'
        elif t.get('landuse') in ['grass','recreation_ground'] or t.get('leisure') in ['park','garden','pitch'] or t.get('natural') in ['grassland','wood']: layer='land'
        if not layer: continue
        # Remove sub-meter vertices while preserving footprints and curved paths.
        reduced=[points[0]]
        for p in points[1:-1]:
            if math.dist(p,reduced[-1])>=1:reduced.append(p)
        reduced.append(points[-1])
        path='M'+'L'.join(f'{p[0]+width/2:.1f},{p[1]+height/2:.1f}' for p in reduced)
        if ps[0]==ps[-1]:path+='Z'
        layers[layer].append(path)
    # Merge each same-style layer into one path to keep native rendering cheap.
    labels = []
    targets = {
      'main': [('East San Fernando Street', 'E. San Fernando St', (650,160)), ('East San Salvador Street','E. San Salvador St',(480,740)), ('South 4th Street','S. 4th St',(120,400)), ('South 10th Street','S. 10th St',(770,430))],
      'south': [('East Alma Avenue','E. Alma Ave',(480,530)), ('South 10th Street','S. 10th St',(430,250))],
    }['main' if width == 900 else 'south']
    for name, short, target in targets:
        candidates=[]
        for way in ways.values():
            if tags(way).get('name')!=name: continue
            ps=[xy(*nodes[n.get('ref')],center) for n in way.findall('nd') if n.get('ref') in nodes]
            for a,b in zip(ps,ps[1:]):
                mid=((a[0]+b[0])/2+width/2,(a[1]+b[1])/2+height/2)
                if math.dist(a,b)<3:continue
                angle=math.degrees(math.atan2(b[1]-a[1],b[0]-a[0]))
                if angle>90:angle-=180
                if angle<-90:angle+=180
                candidates.append((math.dist(mid,target),mid,angle))
        if candidates:
            _,mid,angle=min(candidates)
            labels.append({'name':short,'x':round(mid[0],1),'y':round(mid[1],1),'angle':round(angle,1)})
    return {key: ''.join(value) for key,value in layers.items()}, labels

views = {
 'main': {'center':[-121.88225,37.3358], 'width':900,'height':900},
 'south': {'center':[-121.8669,37.3208], 'width':850,'height':700},
}
for area, file in zip(views,sys.argv[1:]):
    view=views[area]
    view['paths'],view['labels']=geometry(file,view['center'],view['width'],view['height'])
if len(sys.argv)!=3:raise SystemExit(__doc__)
(ROOT/'src/maps/campusGeometry.ts').write_text('// Generated from OpenStreetMap, © contributors, ODbL 1.0. See docs/map-sources.md.\nexport const campusGeometry = '+json.dumps(views,separators=(',',':'))+' as const;\n')
print('Generated offline campus geometry:', {k:{layer:len(path) for layer,path in v['paths'].items()} for k,v in views.items()})
