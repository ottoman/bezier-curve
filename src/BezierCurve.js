import React, { Component } from 'react';
import d3 from 'd3';
import colors from './colors';

class BezierCurve extends Component {

  renderXAxis(xMarkerLocations) {
    let {scale, height} = this.props;
    // create path data for vertical grid lines at each marker location
    let createPathData = d3.svg.line().x(scale.x).y(height + 10)
      .interpolate((points) => points.join(` V ${-10} M `) );
    let xPathData = createPathData(xMarkerLocations) + 'V 0';
    return (
        <path d={xPathData} />
    );
  }

  renderYAxis(yMarkerLocations) {
    let {scale, width} = this.props;
    // create path data for horizontal grid lines at each marker location
    let createPathData = d3.svg.line().x(width + 10).y(scale.y)
      .interpolate((points) => points.join(` H ${-10} M `) );
    let yPathData = createPathData(yMarkerLocations) + 'H 0';
    return (
        <path d={yPathData} />
    );
  }

  renderXLabels(xMarkerLocations) {
    let {scale, height} = this.props;
    let renderLabel = (anchor, item, index) =>
      <text className="graph-label" key={index} textAnchor="middle"
        transform={`translate(${scale.x(item)}, 36)`}>
        {Math.round(item * 100, 2) + '%'}
      </text>

    return (
      <g>
        <g transform={`translate(0, ${height})`}>
          {xMarkerLocations.map(renderLabel.bind(this, 'middle'))}
        </g>
      </g>
    );
  }

  renderYLabels(yMarkerLocations) {
    let {width, height, scale} = this.props;
    // render y axis label
    let renderLabel = (anchor, item, index) =>
      <text className="graph-label" key={index} textAnchor={anchor}
        transform={`translate(0, ${scale.y(item) + 6})`}>
        {Math.round(item * 100, 2) + '%'}
      </text>
    return (
      <g>
        <g transform={`translate(-26, 0)`}>
          {yMarkerLocations.map(renderLabel.bind(this, 'end'))}
        </g>
        <g transform={`translate(${width + 26}, 0)`}>
          {yMarkerLocations.map(renderLabel.bind(this, 'start'))}
        </g>
      </g>
    );
  }

  render() {
    let {width, height, scale} = this.props;
    // use d3 to calculate x and y axis tick locations
    let skipStartAndEnd = (value) => value !== 0.0 && value !== 1.0;
    let yAxis = d3.svg.axis().scale(scale.y).orient('left').ticks(5);
    let yMarkerLocations = yAxis.scale().ticks(yAxis.ticks()).filter(skipStartAndEnd);
    let xAxis = d3.svg.axis().scale(scale.x).orient('bottom').ticks(5);
    let xMarkerLocations = xAxis.scale().ticks(xAxis.ticks()).filter(skipStartAndEnd);

    return (
      <g>
        
        {/* background gradient */}
        <rect fill="url(#chartBG)" width={width} height={height} stroke={colors.graphBGLines} />

        {/* background gridlines */}
        <g stroke={colors.graphBGLines}>
          {this.renderXAxis(xMarkerLocations)}
          {this.renderYAxis(yMarkerLocations)}
        </g>

        <g clipPath="url(#graph)">
          {/* bezier curve background */}
          <path d={this.props.closedBezierPath} fill="url(#bezierBG)"/>

          {/* grid lines inside bezier curve */}
          <g clipPath="url(#closedBezierPath)" stroke="url(#bezierBGLines)">
            {this.renderXAxis(xMarkerLocations)}
            {this.renderYAxis(yMarkerLocations)}
          </g> 
          
          {/* the bezier curve */}
          <path d={this.props.bezierPath} fill="none" stroke={colors.curve} strokeWidth="3" />
        </g>

        {/* labels along both axys */}
        <g fontSize="17" fill="#aaa">
          {this.renderXLabels(xMarkerLocations)}
          {this.renderYLabels(yMarkerLocations)}
        </g>

      </g>
    );
  }
}

export default BezierCurve;