
// Manually calculate the value along a Bezier curve given a percent(t) value.
// based on http://www.13thparallel.org/archive/bezier-curves/.

function B1(t) { return t * t * t }
function B2(t) { return 3 * t * t * (1 - t) }
function B3(t) { return 3 * t * (1 - t) * (1 - t) }
function B4(t) { return (1 - t) * (1 - t) * (1 - t) }

function bezier(t, curve) {
  let p1 = { x: curve.xDomain[0], y: curve.start };
  let {c2, c3} = curve;
  let p4 = { x: curve.xDomain[1], y: curve.end };
  return {
    x: p4.x * B1(t) + c3.x * B2(t) + c2.x * B3(t) + p1.x * B4(t),
    y: p4.y * B1(t) + c3.y * B2(t) + c2.y * B3(t) + p1.y * B4(t)
  };
}

// In order to find the bezier at a certain x value (as opposed to t)
// we need to do a binary search along the curve and test each t value
// until it returns an x that is close enough to our target.

bezier.fromX = function(xTarget, curve) {
  // Define a tolerance which dictates to what precision this algorithm will run.
  // A smaller tolerance will produce more iterations and will generate a more
  // precise result.
  const tolerance = 0.001;
  // establish bounds
  let lower = 0.0;
  let upper = 1.0;
  let t = (upper + lower) / 2;
  // Start with x at the center of the curve
  var x = bezier(t, curve).x;
  // loop until the tolerance has been reached
  while (Math.abs(xTarget - x) > tolerance) {
    // Move t up or down the curve
    if(xTarget > x) {
      lower = t;
    } else {
      upper = t;
    }
    t = (upper + lower) / 2;
    // and calculate a new x value
    x = bezier(t, curve).x;
  }
  // Once x is around xTarget we can return the bezier point at this t.
  return bezier(t, curve);
};


export default bezier;
