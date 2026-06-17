#!/usr/bin/env python3
"""
selfdriven.you — foldable cyberdeck case (clamshell / mini-laptop)
Base cradles a keyboard with a Pi/battery bay behind it; lid flips up to hold a
screen. Joined by an interlocking pin hinge (3 mm steel rod / filament / long M3).

Reference model: sizes + Pi 58x49 mounting pattern are correct; keyboard pocket,
screen window and ports are generous. Verify against your exact parts.
"""
import os, numpy as np, trimesh
from trimesh.creation import box, cylinder

E = "manifold"
def B(sx,sy,sz,cx,cy,cz):
    m=box(extents=[sx,sy,sz]); m.apply_translation([cx,cy,cz]); return m
def Bc(x0,y0,z0,x1,y1,z1):
    return B(x1-x0,y1-y0,z1-z0,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2)
def cylz(r,z0,z1,cx,cy,s=44):
    m=cylinder(radius=r,height=z1-z0,sections=s); m.apply_translation([cx,cy,(z0+z1)/2]); return m
def cylx(r,x0,x1,cy,cz,s=44):
    return cylinder(radius=r,segment=[[x0,cy,cz],[x1,cy,cz]],sections=s)
def U(p): return trimesh.boolean.union(p,engine=E)
def D(a,b): return trimesh.boolean.difference([a]+b,engine=E)

# ---------------- parameters ----------------
WALL=2.8; FLOOR=2.5
Hb=30.0                         # base body height (component bay)
kb=(180.0,86.0); KB_H=12.0      # keyboard footprint + clearance (low-profile)
front=6.0; side=6.0
rear=62.0                       # rear bay depth (Pi + battery)
shelf_z=Hb-KB_H                 # keyboard rests on this shelf

innerW=kb[0]+2*side
OW=innerW+2*WALL
divider_y=WALL+front+kb[1]
OL=WALL+front+kb[1]+rear+WALL

hingeR=4.5; PIN=3.2
axis_y=OL-WALL-hingeR; axis_z=Hb
NK=7; gap=0.7
seg=innerW/NK
def seg_x(i): return (WALL+i*seg+gap/2, WALL+(i+1)*seg-gap/2)
base_k=[0,2,4,6]; lid_k=[1,3,5]

# Pi 5 in rear bay, centred in width, long edge (85) along X
pb=(85.0,56.0)
pcx=OW/2; pcy=divider_y+WALL+8+pb[1]/2     # board centre
px0,py0=pcx-pb[0]/2, pcy-pb[1]/2           # board min corner
SO=4.0; SOR=3.0                            # standoff h / r
hx=[px0+3.5,px0+3.5+58]; hy=[py0+3.5,py0+3.5+49]
holes=[(x,y) for x in hx for y in hy]

LID_T=13.0; zl0=Hb+0.6                      # lid sits just above base (closed pose)
POCK=5.0                                    # screen pocket depth
mod=(165.0,103.0); win=(150.0,90.0)
scx=OW/2; scy=WALL+front+kb[1]/2            # screen centred over keyboard

# ---------------- BASE ----------------
def build_base():
    outer=Bc(0,0,0,OW,OL,Hb)
    cav=Bc(WALL,WALL,FLOOR,OW-WALL,OL-WALL,Hb+2)
    shell=D(outer,[cav])
    adds=[shell]
    # keyboard shelf (front region floor raised so keys reach the rim)
    adds.append(Bc(WALL,WALL,FLOOR,OW-WALL,divider_y,shelf_z))
    # divider wall between keyboard well and Pi bay
    adds.append(Bc(WALL,divider_y,FLOOR,OW-WALL,divider_y+WALL,Hb))
    # Pi standoffs
    for (x,y) in holes: adds.append(cylz(SOR,FLOOR-0.01,FLOOR+SO,x,y))
    # hinge knuckles (base owns even segments) + web to rear wall
    for i in base_k:
        x0,x1=seg_x(i)
        adds.append(cylx(hingeR,x0,x1,axis_y,axis_z))
        adds.append(Bc(x0,axis_y-0.5,Hb-7,x1,OL-WALL+0.1,Hb+0.1))
    solid=U(adds)

    subs=[]
    for (x,y) in holes: subs.append(cylz(2.1/2,FLOOR+SO-6,FLOOR+SO+0.1,x,y))
    subs.append(cylx(PIN/2,-1,OW+1,axis_y,axis_z))                 # pin channel
    # keyboard USB cable hole through divider
    subs.append(Bc(scx-9,divider_y-1,shelf_z+2,scx+9,divider_y+WALL+1,shelf_z+9))
    # Pi ports: generous openings in the rear wall
    bt=FLOOR+SO+1.6
    subs.append(Bc(pcx-42,OL-WALL-1,bt-1,pcx+42,OL+1,bt+9))        # USB-C/HDMI long edge
    subs.append(Bc(pcx+pb[0]/2-1,py0+2,bt-1.5,OW+1,py0+54,bt+15))  # USB/LAN short edge (+X wall)
    # bottom vents under the Pi bay
    for i in range(5):
        off=(i-2)*6
        subs.append(Bc(pcx-30,pcy+off-1.2,-1,pcx+30,pcy+off+1.2,FLOOR+0.6))
    return D(solid,subs)

# ---------------- LID (modelled in closed pose, then dropped flat) ----------------
def build_lid_closed():
    plate=Bc(0,0,zl0,OW,axis_y,zl0+LID_T)
    adds=[plate]
    for i in lid_k:
        x0,x1=seg_x(i)
        adds.append(cylx(hingeR,x0,x1,axis_y,axis_z))
        adds.append(Bc(x0,axis_y-6,zl0-0.5,x1,axis_y+0.1,zl0+2))   # web up to plate
    lid=U(adds)
    subs=[]
    subs.append(cylx(PIN/2,-1,OW+1,axis_y,axis_z))
    subs.append(Bc(scx-win[0]/2,scy-win[1]/2,zl0-1,scx+win[0]/2,scy+win[1]/2,zl0+LID_T+1))   # window
    subs.append(Bc(scx-mod[0]/2,scy-mod[1]/2,zl0-0.01,scx+mod[0]/2,scy+mod[1]/2,zl0+POCK))    # panel pocket (underside)
    subs.append(Bc(scx-14,axis_y-12,zl0-1,scx+14,axis_y-3,zl0+LID_T+1))                       # ribbon/cable slot
    return D(lid,subs)

OUT="/mnt/user-data/outputs/selfdriven-you/cases"; os.makedirs(OUT,exist_ok=True)
base=build_base()
lid_closed=build_lid_closed()

# print-flat lid: it is already horizontal in closed pose; drop to z=0
lid_flat=lid_closed.copy(); lid_flat.apply_translation([0,0,-zl0])

for nm,me in [("folding-deck-base",base),("folding-deck-lid",lid_flat)]:
    assert me.is_watertight, nm+" not watertight"
    me.export(f"{OUT}/{nm}.stl")
    print(f"  {nm}: watertight={me.is_watertight} tris={len(me.faces)} bbox={np.round(me.extents,1)}")

print(f"Base outer: {OW:.1f} x {OL:.1f} x {Hb:.1f} mm")
print(f"Folded:     {OW:.1f} x {OL:.1f} x {Hb+0.6+LID_T:.1f} mm")
print(f"Hinge: {NK} knuckles, {PIN} mm pin, axis_y={axis_y:.1f}")

# stash geometry for the renderer
np.save(f"{OUT}/_meta.npy", dict(OW=OW,OL=OL,Hb=Hb,axis_y=axis_y,axis_z=axis_z,zl0=zl0,LID_T=LID_T), allow_pickle=True)
print("DONE")
