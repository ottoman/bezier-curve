import React, { Component } from 'react';
import d3 from 'd3';
import Draggable from './Draggable';
import BezierCurve from './BezierCurve';
import colors from './colors';


class Graph extends Component {

  constructor(props) {
    super(props);
    let width = this.props.width - (this.props.gutter * 2),
        height = this.props.height - (this.props.gutter * 2),
        xScale = d3.scale.linear()
          .domain(this.props.xDomain)
          .range([0, width]),
        yScale = d3.scale.linear()
          .domain(this.props.yDomain)
          .range([height, 0]);

    this.state = {
      isDragging: undefined,
      chart: {
        width: width,
        height: height
      },
      scale: {
        x: xScale,
        y: yScale
      }
    };
  }

  handleDragPoint(point, drag) {
    let xInPixels = drag.delta.x;
    let yInPixels = drag.delta.y;
    let xInScale = this.state.scale.x.invert(xInPixels);
    let yInScale = this.state.scale.y.invert(yInPixels);
    // adjust the point proportionally to the number of pixels it was moved
    this.state.isDragging = point;
    this.setState(this.state);
    // notify parent
    this.props.onMovePoint(point,
      this.props.xDomain[0] - xInScale,
      this.props.yDomain[1] - yInScale
    );
  }

  handleReleasePoint() {
    this.setState({isDragging: ''});
  }

  renderCirclePoint(point) {
    let x = this.state.scale.x(point.x),
        y = this.state.scale.y(point.y);
    return (
      <circle style={{
        cursor: 'pointer',
        stroke: 'none',
        fill: colors.draggablePoint
      }} r="10" cx={x} cy={y} />
    );
  }

  renderSquarePoint(point) {
    let {scale} = this.state;
    let x = scale.x(point.x),
        y = scale.y(point.y);
    return (
      <rect style={{
          cursor: 'pointer',
          stroke: 'none',
          fill: colors.draggablePoint
        }} height="21" width="21"
        x={x-10.5} y={y-10.5}
        transform={`rotate(45,${x}, ${y})`}
      />
    );
  }

  renderLine(p1, p2) {
    return (
      <line stroke={colors.draggablePointLine}
        x1={this.state.scale.x(p1.x)}
        y1={this.state.scale.y(p1.y)}
        x2={this.state.scale.x(p2.x)}
        y2={this.state.scale.y(p2.y)}
      />
    );
  }

  renderDiamond(point, index) {
    let {scale} = this.state;
    let x = scale.x(point.x),
        y = scale.y(point.y);
    return (
      <rect key={index} style={{
          fill: colors.curve,
        }}
        height="11" width="11"
        x={x-5.5} y={y-5.5}
        transform={`rotate(45,${x}, ${y})`}
      />
    );
  }

  render() {
    let {chart, scale} = this.state;
    let bezierLine = d3.svg.line()
      .x((d, i) => scale.x(d.x))
      .y((d, i) => scale.y(d.y))
      .interpolate('cardinal');
    // use d3 to create the svg path data attribute
    let bezierPath = bezierLine(this.props.data.t);
    let closedBezierPath = bezierLine(this.props.data.t) + `L ${chart.width}, ${chart.height} L 0, ${chart.height}  Z`;
    // create the four bezier points
    let p1 = { x: this.props.xDomain[0], y: this.props.start },
        c2 = this.props.c2,
        c3 = this.props.c3,
        p4 = { x: this.props.xDomain[1], y: this.props.end };
    return (
      <svg xmlns="http://www.w3.org/2000/svg" style={{width: '100%', height: '100%', position: 'absolute', xIndex: 1,}}>
        <defs>
          <linearGradient id="chartBG" x1="0" x2="0" y1="0" y2="1" >
            <stop offset="0%" stopColor={colors.graphBG.from} />
            <stop offset="100%" stopColor={colors.graphBG.to} />
          </linearGradient>
          <linearGradient id="bezierBG" x1="0" x2="0" y1="0" y2="1" >
            <stop offset="0%" stopColor={colors.bezierBG.from} />
            <stop offset="100%" stopColor={colors.bezierBG.to} />
          </linearGradient>
          <linearGradient id="bezierBGLines" x1="0" x2="0" y1="0" y2="1" >
            <stop offset="0%" stopColor={colors.bezierBGLines.from} />
            <stop offset="100%" stopColor={colors.bezierBGLines.to} />
          </linearGradient>
          <clipPath id="closedBezierPath">
            <path d={closedBezierPath} />
          </clipPath>
          <clipPath id="graph">
            <rect width={chart.width} height={chart.height} />
          </clipPath>
        </defs>

        <g transform={`translate(${this.props.gutter - 0.5}, ${this.props.gutter - 0.5})`}>

          {/* draw the curve with a set of paths */}
          <BezierCurve width={chart.width} height={chart.height} scale={scale} bezierPath={bezierPath} closedBezierPath={closedBezierPath} />

          {/* render a marker for each sample point */}
          <g clipPath="url(#graph)">
            {this.props.data.x.slice(1, -1).map(this.renderDiamond.bind(this))}
          </g>

          {/* line from start to first control point */}
          {this.renderLine(p1, c2)}
          {/* line from end to second control point */}
          {this.renderLine(p4, c3)}

          {/* markers for start and end points */}
          <Draggable onDrag={this.handleDragPoint.bind(this, 'start')} axis={{y: true}}>
            {this.renderSquarePoint(p1)}
          </Draggable>
          <Draggable onDrag={this.handleDragPoint.bind(this, 'end')} axis={{y: true}}>
            {this.renderSquarePoint(p4)}
          </Draggable>

          {/* circles for both controls points */}
          <Draggable onDrag={this.handleDragPoint.bind(this, 'c2')} onRelease={this.handleReleasePoint.bind(this, 'c2')}>
            {this.renderCirclePoint(c2)}
          </Draggable>
          <Draggable onDrag={this.handleDragPoint.bind(this, 'c3')} onRelease={this.handleReleasePoint.bind(this, 'c3')}>
            {this.renderCirclePoint(c3)}
          </Draggable>


          {
            /* render text hints if no points have been moved yet */
            this.state.isDragging === undefined? (
            <path transform={`translate(${scale.x(c3.x)}, ${scale.y(c3.y)})`} style={{
                fill: 'none',
                stroke: colors.text,
                strokeWidth: '3px' ,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeMiterlimit: '4',
                strokeDasharray: 'none'
              }}
              d="m 20.474614,-109.04338 c 1.388105,7.49974 2.635164,15.01231 4.816781,22.33604 -2.466192,-9.59684 -3.659641,-16.01182 -4.816781,-22.33604 z m 8.068616,31.88831 c -0.974132,-3.30516 -4.190106,-0.54145 -3.190863,0.73166 2.506996,6.01249 7.327172,0.83496 4.715161,-3.65831 m -17.519262,11.42203 4.329005,-2.41855 c 1.167383,-0.65144 -1.037647,-2.69068 -2.784384,-2.64211 -3.870497,0.95927 -4.7433867,7.75301 -1.605593,9.40999 1.667664,0.89266 3.855896,0.89317 5.182612,-0.69101 0.979681,-1.09294 1.554156,-2.45914 1.890129,-3.92253 m -82.230773,-0.99584 c 0.48399,3.65692 1.496534,7.17072 2.621792,10.48717 -1.441538,-5.21607 -2.358296,-9.65313 -2.621792,-10.48717 z m 2.621792,10.48717 c 1.091856,3.95078 2.485651,8.326675 4.14609,11.970818 -0.966894,-3.559088 -2.65831,-7.585908 -4.14609,-11.970818 z m 69.3860243,-3.75994 c -1.0199641,-1.66912 -2.874824,-3.69978 -4.1460899,-3.92252 l -1.1787903,-0.24389 -0.5487472,0 -1.8494813,2.35758 m -26.3258976,3.46231 c -9.869827,10.234773 2.194085,14.82576 4.877193,4.00943 l -1.341382,-3.78026 c 2.631047,7.189559 6.953263,14.694626 4.633866,22.722204 -0.958238,3.69735 -3.916231,6.952339 -7.641813,6.80853 M 1.4717018,-65.04199 c -0.79543794,-0.58097 -1.87787635,-1.0935 -2.8860038,-1.09749 l -2.3223631,4.65399 -1.6586181,-1.93328 4.93609073,7.57177 M -38.444565,-56.44495 c -4.817015,0.82465 -5.050588,9.715967 -1.097494,11.584666 5.981542,0.40328 4.899215,-6.121014 3.63799,-10.222956 z m 2.540496,1.36171 0.589395,0.345507 -1.036522,-1.666567 z m 0.589395,0.345507 c 1.474038,1.928176 2.673959,2.343467 5.175257,2.246296 z m -9.356505,-1.930217 -5.317401,4.592657 3.73961,9.999393 -2.276284,-7.418249 c -1.573011,-2.356527 5.228359,-8.360781 3.854075,-7.173801 z m -20.273099,15.034567 c 0.423916,4.164235 4.727252,7.14196 7.90328,4.55718 2.211541,-2.421297 2.273248,-5.580071 1.402354,-9.308378 l -2.418552,-2.723412 c -4.403662,0.04436 -7.964838,1.938828 -6.887082,7.47461 z m 9.305634,-4.751198 0.569071,0.630043 -0.812959,-1.666566 z m 0.569071,0.630043 c 1.56399,3.02046 3.324943,5.271153 5.263908,5.873627 z m -17.824122,10.466844 c -31.968845,15.502241 1.031951,89.214307 46.989013,48.65559 m -3.150209,-3.251835 6.706904,-0.06094 2.520172,-0.873931 -2.499848,-0.121944 -6.808524,0.975551 m 7.499539,7.763756 -0.264212,-7.743465 -0.447127,0 -3.556695,3.312807"
            />
            ) : null
          }
        </g>

     </svg>
    );
  }
}

export default Graph;