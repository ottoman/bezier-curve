import React, { Component } from 'react';

class Draggable extends Component {

  static defaultProps = {
    axis: {x: true, y: true}
  }

  constructor(props) {
    super(props);
    // bind handlers to this instance
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    // initial state
    this.state = {
      mouse: {
        x: 0,
        y: 0
      },
      isPressed: false
    };
  }

  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleTouchEnd);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleTouchStart(event) {
    event.stopPropagation();
    event.preventDefault();
    this.setIsDragging(event.touches[0]);
  }

  handleTouchMove(event) {
    event.stopPropagation();
    let {pageX, pageY} = event.touches[0];
    this.setDragLocation(pageX, pageY);
  }

  handleTouchEnd() {
    event.stopPropagation();
    this.setDraggingReleased();
  }

  handleMouseDown(event) {
    event.stopPropagation();
    event.preventDefault();
    this.setIsDragging(event);
  }

  handleMouseMove(event) {
    event.stopPropagation();
    event.preventDefault();
    this.setDragLocation(event.pageX, event.pageY);
  }

  handleMouseUp(event) {
    event.stopPropagation();
    this.setDraggingReleased();
  }

  setIsDragging(event) {
    let mouse = this.state.mouse;
    this.setState({
      mouse: {
        x: event.pageX,
        y: event.pageY
      },
      isPressed: true
    });
  }

  setDragLocation(pageX, pageY) {
    if (this.state.isPressed) {
      let {axis} = this.props;
      let {mouse} = this.state;  
      this.setState({
        mouse: {
          x: pageX,
          y: pageY
        }
      });
      this.props.onDrag({
        mouse: {
          x: mouse.x,
          y: mouse.y
        },
        delta: {
          x: axis.x? pageX - mouse.x : 0,
          y: axis.y? pageY - mouse.y : 0
        }
      });
    }
  }

  setDraggingReleased() {
    let mouse = this.state.mouse;
    if (this.state.isPressed) {
      this.setState({
        isPressed: false,
        mouse: mouse
      });
      if (this.props.onRelease) {
        this.props.onRelease();
      }
    }
  }

  render() {
    let child = React.Children.only(this.props.children);
    return <g 
      onTouchStart={this.handleTouchStart.bind(this)} 
      onMouseDown={this.handleMouseDown.bind(this)}
    >
      {child}
    </g>;
  }

}

export default Draggable;