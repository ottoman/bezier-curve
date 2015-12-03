import React, { Component } from 'react';
import bezier from './bezier';
import Graph from './Graph.js';
import _ from 'lodash';
import colors from './colors';


export default class App extends Component {

  static propTypes = {
    start: React.PropTypes.number.isRequired,
    c2: React.PropTypes.object.isRequired,
    c3: React.PropTypes.object.isRequired,
    end: React.PropTypes.number.isRequired
  }

  static defaultProps = {
    width: 700,
    height: 500,
    gutter: 100,
    yDomain: [0, 1],
    xDomain: [0, 1],
    start: 0.25,
    c2: {x: 0.6, y: 0.25},   // 1st control point
    c3: {x: 0.38, y: 0.75},   // 2nd control point
    end: 0.8,
    pointCount: 5,
    sampleCount: 10
  }

  constructor(props) {
    super(props);
    this.state = {
      xDomain: this.props.xDomain,
      yDomain: this.props.yDomain,
      start: this.props.start,
      c2: this.props.c2,
      c3: this.props.c3,
      end: this.props.end,
      data: this.calcData(this.props)
    };
  }

  calcData(curve) {
    let {pointCount, sampleCount} = this.props;
    // From the given curve (the bezier points) we calculate 2 lists of points:
    // 1. Points given a set of t values from 0..1. These will be used
    //    to render the bezier path line.
    // 2. Points given a set of x values. These will be plotted alongside the path curve.
    return {
      t: _.range(pointCount + 1).map(index => bezier(index / pointCount, curve)),
      x: _.range(sampleCount + 1).map(index => bezier.fromX(index / sampleCount, curve))
    };
  }

  handleMovePoint(point, x, y) {
    // When user drags a point, we need to update the bezier points here.
    if (point === 'start' || point === 'end') {
      this.state[point] -= y;
    } else {
      this.state[point].x -= x;
      this.state[point].y -= y;
    }
    this.setState({data: this.calcData(this.state)});
  }

  renderTableRow(point, index) {
    return (
      <tr key={index} style={{
        borderColor: colors.gridBottomBorder,
        borderTopStyle: 'solid',
        borderTopWidth: index === 0? '0px' : '1px',
      }}>
        <td style={{
          textAlign: 'center',
          padding: '10px',
          width: '50%'
        }}>{Math.round(point.x * 100, 2)}%</td>
        <td style={{
          textAlign: 'center',
          padding: '10px',
          width: '50%'
        }}>{Math.round(point.y * 100, 2)}%</td>
      </tr>
    );
  }

  render() {
    return (
      <div style={{
        color: colors.text,
        lineHeight: 1.8,
        textAlign: 'justify'
      }}
    >
        <div style={{
          width: 300,
          position: 'absolute',
          xIndex: 0,
          top: this.props.gutter,
          left: this.props.width}}
        >
          <h1 style={{ lineHeight: 1.5}}>Resolving Y from X</h1>
          <p>
            The blue diamonds that are plotted along the curve show the <em>Y</em> values
            that are calculated given a step along the <em>X</em> axis.
          </p>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: colors.text,
            fontSize: '17px',
            lineHeight: 1,
            marginTop: '1em'
          }}>

            <thead>
              <tr>
                <th style={{
                  textAlign: 'center'
                }}>X</th>
                <th style={{
                  textAlign: 'center'
                }}>Y</th>
              </tr>
            </thead>

            <tbody>
              {this.state.data.x.map(this.renderTableRow.bind(this))}
            </tbody>
          </table>
        </div>

        <div style={{
          position: 'absolute',
          xIndex: 0,
          top: this.props.height,
          left: 100,
          width: this.props.width - (this.props.gutter * 2)
        }}>
          <h1 style={{ lineHeight: 1.5}}>Cubic Bezier</h1>

          <p>
            The <a href="https://www.jasondavies.com/animated-bezier/">Bezier</a> curve above is plotted using&nbsp;
            <a href="http://d3js.org/">D3</a> to render to an SVG element. However,
            the curve is calculated using <a href="http://www.13thparallel.org/archive/bezier-curves/.">Bezier math</a> and 
            is not relying on the <em>&lt;path&gt;</em> elements´s ability to render a Bezier curve.
          </p>
          <p>
            A point {'{x y}'} in a Bezier curve is calculated given <em>t</em> in <em>[0 ,1]</em> space, i.e. the percent length
            of the line. But this doesn´t work when we want to find the point at a speicifc position on the <em>X</em> axis.
            In order to find <em>Y</em> given <em>X</em> this
            algorithm <a href="http://stackoverflow.com/questions/7348009/y-coordinate-for-a-given-x-cubic-bezier">searches</a> the
            path for the first suitable
            point. Since <em>p1</em> and <em>p2</em> are nicely bounded at 0.0 and 1.0 we will always find a point along the X axis.
          </p>

        </div>

        <Graph
          width={this.props.width}
          height={this.props.height}
          gutter={this.props.gutter}
          {...this.state}
          onMovePoint={this.handleMovePoint.bind(this)}
        />

      </div>
    );
  }

}
