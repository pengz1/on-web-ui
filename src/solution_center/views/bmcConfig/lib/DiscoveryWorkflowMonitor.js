// Copyright 2015, EMC, Inc.

import MessengerBus from 'src-common/messengers/MessengerBus';

export default class DiscoveryWorkflowMonitor {
  constructor(handlers) {
    this.startedEvents = new MessengerBus('on.events', '#.started.information.#');
    this.finishedEvents = new MessengerBus('on.events', '#.finished.information.#');
    this.discoveredEvents = new MessengerBus('on.events', '#.discovered.#');

    console.info('export default class DiscoveryWorkflowMonitor')

    if (handlers) { this.connect(handlers); }
    return this;
  }

  listen(handlers={}) {
    let {startedEvents, finishedEvents, discoveredEvents} = handlers;

    this.startedEvents.listen(startedEvents);
    this.finishedEvents.listen(finishedEvents);
    this.discoveredEvents.listen(discoveredEvents);
  }

  ignore() {
    this.startedEvents.ignore();
    this.discoveredEvents.ignore();
    this.finishedEvents.ignore();
  }

  connect(handlers) {
    this.listen(handlers);
    this.finishedEvents.connect();
    this.startedEvents.connect();
    this.discoveredEvents.connect();
  }

  disconnect() {
    this.ignore();
    this.finishedEvents.disconnect();
    this.startedEvents.disconnect();
    this.discoveredEvents.disconnect();
  }
}
