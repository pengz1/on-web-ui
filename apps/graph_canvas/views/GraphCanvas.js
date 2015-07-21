'use strict';

import { EventEmitter } from 'events';

import React, // eslint-disable-line no-unused-vars
  { Component, PropTypes } from 'react';

import radium from 'radium';
import mixin from 'react-mixin';
import decorate from 'common-web-ui/lib/decorate';

import CoordinateHelpers from '../mixins/CoordinateHelpers';

import generateId from '../lib/generateId';

// import Graph from '../lib/Graph';
import Vector from '../lib/Vector';
// import Rectangle from '../lib/Rectangle';

import GCViewport from './Viewport';
import GCWorld from './World';

import GCGroupsManager from './managers/Groups';
import GCLinksManager from './managers/Links';
import GCMarksManager from './managers/Marks';
import GCNodesManager from './managers/Nodes';

import './GraphCanvas.less';
import GCGroupElement from './elements/Group';
import GCLinkElement from './elements/Link';
import GCNodeElement from './elements/Node';
import GCPortElement from './elements/Port';
import GCSocketElement from './elements/Socket';

export { GCGroupElement as GCGroup };
export { GCLinkElement as GCLink };
export { GCNodeElement as GCNode };
export { GCPortElement as GCPort };
export { GCSocketElement as GCSocket };

/**
# GraphCanvas

@object
  @type class
  @extends React.Component
  @name GraphCanvas
  @desc
*/

@radium
@mixin.decorate(CoordinateHelpers)
@decorate({
  propTypes: {
    className: PropTypes.string,
    css: PropTypes.object,
    enableMarks: PropTypes.bool,
    initialScale: PropTypes.number,
    initialX: PropTypes.number,
    initialY: PropTypes.number,
    style: PropTypes.object,
    viewHeight: PropTypes.number,
    viewWidth: PropTypes.number,
    worldHeight: PropTypes.number,
    worldWidth: PropTypes.number
  },
  defaultProps: {
    className: 'GraphCanvas',
    css: {},
    enableMarks: false,
    initialScale: 1,
    initialX: 0,
    initialY: 0,
    style: {},
    viewHeight: 600,
    viewWidth: 800,
    worldHeight: 2000,
    worldWidth: 2000
  },
  childContextTypes: {
    graphCanvas: PropTypes.any
  }
})
export default class GraphCanvas extends Component {

  get graphCanvas() {
    return this;
  }

  index = {};
  history = []; // TODO: keep track of each action as a separate mutation for undo/redo
  selected = [];

  state = {
    position: new Vector(
      this.props.initialX,
      this.props.initialY
    ),
    scale: this.props.initialScale
  };

  css = {
    root: {
      overflow: 'hidden'
    }
  };

  getChildContext() {
    return {
      graphCanvas: this
    };
  }

  componentWillMount() {
    this.events = new EventEmitter();
  }

  componentWillUnmount() {
    this.events.removeAllListeners();
  }

  /**
  @method
    @name render
    @desc
  */
  render() {
    try {
      let props = this.props,
          css = [this.css.root, this.cssViewSize, props.css.root, props.style];

      React.Children.forEach(props.children, child => {
        // NOTE: Context seems to be based on lexical scope, this will ensure Graph Canvas
        //       children have a graphCanvas in their context which is required for GC elements.
        if (child && child._context) {
          child._context.graphCanvas = this;
        }
      });

      return (
        <div className={props.className} style={css}>
          <GCGroupsManager ref="groups" />
          <GCLinksManager ref="links" />
          <GCNodesManager ref="nodes" />
          {this.props.enableMarks && <GCMarksManager ref="marks" />}

          <GCViewport ref="viewport">
            <GCWorld ref="world"
                initialElements={this.elements}
                initialVectors={this.vectors}>
              {props.children}
            </GCWorld>
          </GCViewport>
        </div>
      );
    } catch (err) {
      console.error(err.stack || err);
    }
  }

  get cssViewSize() {
    return {
      width: this.props.viewWidth,
      height: this.props.viewHeight
    };
  }

  get cssWorldSize() {
    return {
      width: this.props.worldWidth,
      height: this.props.worldHeight
    };
  }

  get elements() {
    var elements = [],
        world = this.refs.world;
    if (world) {
      if (this.refs.marks) {
        elements = elements.concat(this.refs.marks.markElements);
      }
    }
    return elements;
  }

  get vectors() {
    var vectors = [],
        world = this.refs.world;
    if (world) {
      if (this.refs.marks) {
        vectors = vectors.concat(this.refs.marks.markVectors);
      }
    }
    return vectors;
  }

  updatePosition(position) {
    this.setState({ position });
  }

  updateScale(scale) {
    this.setState({ scale });
  }

  // updateGraph(graph) {
  //   this.graph = graph || this.graph;
  //   this.setState({nodes: this.graph.nodes});
  //   console.log(this.graph.nodes);
  //   setTimeout(() => {
  //     console.log(this.graph.links);
  //     this.setState({links: this.fixLinkPositions(this.graph.links)});
  //   }, 0);
  // }
  //
  // fixLinkPositions(links) {
  //   links = links || this.graph.links;
  //   var getSocketPosition = (link, k) => {
  //     var socket = link['socket' + k],
  //         port = socket.port,
  //         node = port.node;
  //     var nodeRef = this.refs[node.id],
  //         portRef = nodeRef.refs[port.name],
  //         socketRef = portRef.refs[socket.type];
  //     return this.getSocketCenter(
  //       React.findDOMNode(socketRef).querySelector('.GraphCanvasSocketIcon')
  //     );
  //   };
  //   console.log('fix links', links.length);
  //   links.forEach(link => {
  //     var a = getSocketPosition(link, 'Out'),
  //         b = getSocketPosition(link, 'In');
  //     link.data.bounds = new Rectangle(a.x, a.y, b.x, b.y);
  //   });
  //   return links;
  // }

  selectNode(node, shiftKey) {
    this.refs.world.selectNode(node, shiftKey);
  }

  onSelect(callback) {
    this.events.on('selection', callback);
  }

  selectionHandler(selection) {
    this.events.emit('selection', selection);
  }

  lookup(id) {
    // debugger;
    let obj = this.index[id];
    if (!obj) {
      throw new Error('GraphCanvas: Unable to find element with id: ' + id);
    }
    if (obj.matches) {
      if (obj.matches.length === 1) { return obj.matches[0]; }
      return obj.matches;
    }
  }

  register(child) {
    // debugger;
    let id = child.id = child.id || generateId();
    let obj = this.index[id] = (this.index[id] || {matches: []});
    if (obj.matches.indexOf(child) === -1) {
      obj.matches.push(child);
    }
  }

  unregister(child) {
    // debugger;
    let id = child.id;
    if (!id) {
      throw new Error('GraphCanvas: Cannot unregister invalid child without id.');
    }
    let obj = this.index[id];
    if (obj && obj.matches) {
      let index = obj.matches.indexOf(child);
      if (index !== -1) {
        obj.matches.splice(index, 1);
      }
    }
  }

}
