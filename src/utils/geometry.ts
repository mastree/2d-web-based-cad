export function isInsideTrigon(pt: number[], vert: number[]): boolean{
    let as_x = pt[0];
    let as_y = pt[1];

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
    
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;
  
    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;
  
    var xx, yy;
  
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
  
    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}
