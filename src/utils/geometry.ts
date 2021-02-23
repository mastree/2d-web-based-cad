export function isInsideTrigon(pt: number[], vert: number[]): boolean{
    let as_x = pt[0] - vert[0];
    let as_y = pt[1] - vert[1];

    let sx = pt[0];
    let sy = pt[1];
    let ax = vert[0];
    let ay = vert[1];
    let bx = vert[2];
    let by = vert[3];
    let cx = vert[4];
    let cy = vert[5];

    let s_ab: boolean = (bx - ax) * as_y - (by - ay) * as_x > 0;
    if ((cx - ax) * as_y - (cy - ay) * as_x > 0 == s_ab) return false;
    if((cx - bx) * (sy - by) - (cy - by) * (sx - bx) > 0 != s_ab) return false;
    return true;
}

export function pointToPointDistance(pt1: number[], pt2: number[]): number{
    let delx = Math.abs(pt1[0] - pt2[0]);
    let dely = Math.abs(pt1[1] - pt2[1]);
    return Math.sqrt(delx * delx + dely * dely);
}

export function pointToLineDistance(pt: number[], line: number[]): number{
    let x = pt[0];
    let y = pt[1];
    let x1 = line[0];
    let y1 = line[1];
    let x2 = line[2];
    let y2 = line[3];
    
    let A = x - x1;
    let B = y - y1;
    let C = x2 - x1;
    let D = y2 - y1;
  
    let dot = A * C + B * D;
    let len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;
  
    let xx, yy;
  
    if (param < 0) {
        xx = x1;
        yy = y1;
    }
    else if (param > 1) {
        xx = x2;
        yy = y2;
    }
    else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
  
    let dx = x - xx;
    let dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

export function sortPoint(pt: number[]): number[]{
    // Array of points;
    let points: {x: number, y:number}[] = [];
    let len = pt.length / 2;
    for (let i=0;i<len;i++){
        points.push({x: pt[i * 2], y: pt[i * 2 + 1]});
    }

    // Find min max to get center
    // Sort from top to bottom
    points.sort((a,b)=>a.y - b.y);

    // Get center y
    const cy = (points[0].y + points[points.length -1].y) / 2;

    // Sort from right to left
    points.sort((a,b)=>b.x - a.x);

    // Get center x
    const cx = (points[0].x + points[points.length -1].x) / 2;

    // Center point
    const center = {x:cx,y:cy};

    // Pre calculate the angles as it will be slow in the sort
    // As the points are sorted from right to left the first point
    // is the rightmost

    // Starting angle used to reference other angles
    let startAng;
    points.forEach(point => {
        let ang = Math.atan2(point.y - center.y,point.x - center.x);
        if(!startAng){ startAng = ang }
        else {
            if(ang < startAng){  // ensure that all points are clockwise of the start point
                ang += Math.PI * 2;
            }
        }
        point.angle = ang; // add the angle to the point
    });


    // Sort clockwise;
    points.sort((a,b)=> a.angle - b.angle);

    let ret: number[] = [];
    for (const obj of points){
        ret.push(obj.x);
        ret.push(obj.y);
    }
    return ret;
}
