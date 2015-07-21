'use strict';

/* eslint-disable no-unused-vars */
import React, { Component, PropTypes } from 'react';
import decorate from 'common-web-ui/lib/decorate';
/* eslint-enable no-unused-vars */

import ConfirmDialog from 'common-web-ui/views/dialogs/Confirm';

import generateId from '../../lib/generateId';

import Rectangle from '../../lib/Rectangle';

@decorate({
  propTypes: {
    initialId: PropTypes.string
  },
  defaultProps: {
    initialId: null
  },
  contextTypes: {
    graphCanvas: PropTypes.any
  }
})
export default class GCLinkElement extends Component {

  static GCTypeEnum = {vector: true, link: true};

  get graphCanvas() {
    return this.context.graphCanvas;
  }

  get linksManager() {
    return this.graphCanvas.refs.links;
  }

  id = this.props.initialId || generateId('link');

  componentWillMount() {
    this.graphCanvas.register(this);
  }

  componentWillUnmount() {
    this.graphCanvas.unregister(this);
  }

  state = {
    hover: false
  }

  render() {
    try {
      // debugger;
      var fromSocket = this.graphCanvas.lookup(this.props.from),
          fromSocketElement = React.findDOMNode(fromSocket).querySelector('.GraphCanvasSocketIcon'),
          fromVector = this.linksManager.getSocketCenter(fromSocketElement);

      var toSocket = this.graphCanvas.lookup(this.props.to),
          toSocketElement = React.findDOMNode(toSocket).querySelector('.GraphCanvasSocketIcon'),
          toVector = this.linksManager.getSocketCenter(toSocketElement);

      var bounds = new Rectangle(fromVector.x, fromVector.y, toVector.x, toVector.y);
      // console.log('LINK', bounds);
      return this.renderVector(bounds);
    } catch (err) {
      console.warn(err);
      setTimeout(() => this.forceUpdate(), 500);
    }
    return null;
  }

  renderVector(bounds) {
    try {
      var //props = this.props,
          gutter = 5,
          stroke = 3,
          style = bounds.css;
      style.top -= gutter;
      style.left -= gutter;
      style.width += gutter + gutter;
      style.height += gutter + gutter;

      var dir = bounds.dir,
          minX = 0 + gutter,
          minY = 0 + gutter,
          maxX = style.width - gutter,
          maxY = style.height - gutter,
          halfX = style.width / 2,
          halfY = style.height / 2,
          hover = this.state.hover ? 'hover ' : '',
          path = '';

      if (!isFinite(halfX)) { halfX = 0; }
      if (!isFinite(halfY)) { halfY = 0; }

      if (dir.x === 1 && dir.y === 1) {
        path = ['M', maxX, maxY, 'Q', halfX, maxY, halfX, halfY, 'T', minX, minY].join(' ');
      }
      else if (dir.x === -1 && dir.y === -1) {
        path = ['M', minX, minY, 'Q', halfX, minY, halfX, halfY, 'T', maxX, maxY].join(' ');
      } else if (dir.x === 1 && dir.y === -1) {
        path = ['M', minX, maxY, 'Q', halfX, maxY, halfX, halfY, 'T', maxX, minY].join(' ');
      }
      else if (dir.x === -1 && dir.y === 1) {
        path = ['M', maxX, minY, 'Q', halfX, minY, halfX, halfY, 'T', minX, maxY].join(' ');
      }

      // NOTE: example is rendering links in the element space and not the vector space so positioning is off.

      // TODO
      var transform = 'translate(' + style.left + 'px, ' + style.top + 'px)';
      // var socket = this.props.model.socketOut || this.props.model.socketIn;
      // var color = socket && socket.port && socket.port.color || 'black';
      var color = 'black';

      // style={{overflow: 'visible'}}
      // <g transform={transform}>
      // TODO
      // style={{
      //   position: 'absolute', top: 0, left: 0,
      //   transform: transform
      // }}
      return (
        <svg
            className={'GraphCanvasLink ' + hover}
            data-id={null}
            width={style.width}
            height={style.height}
            x={style.left}
            y={style.top}
            onDoubleClick={this.removeLink.bind(this)}
            viewBox={[
              minX - gutter, minY - gutter,
              maxX + gutter, maxY + gutter
            ].join(' ')}
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg">
          <path
              d={path}
              fill="transparent"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              style={{
                pointerEvents: 'all',
                ':hover': {
                  stroke: 'red'
                }
              }}
              onMouseOver={this.onHoverCurve.bind(this)}
              onMouseMove={this.onHoverCurve.bind(this)}
              onMouseOut={this.onLeaveCurve.bind(this)} />
        </svg>
      );
    } catch (err) {
      console.error(err.stack || err);
    }
  }

  onHoverCurve() {
    // this.setState({hover: true});
  }

  onLeaveCurve() {
    // this.setState({hover: false});
  }

  removeLink(event) {
    var e = event.nativeEvent || event;
    e.stopPropagation();
    e.preventDefault();
    var confirmProps = {
      callback: (ok) => {
        if (ok) {
          this.graphCanvas.refs.links.removeLink(this.props.model);
        }
      },
      children: 'Are you sure you want to delete this link?',
      title: 'Confirm Delete:'
    };
    ConfirmDialog.create(confirmProps);
  }


}
