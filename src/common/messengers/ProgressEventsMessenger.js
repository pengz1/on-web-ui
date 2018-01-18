// Copyright 2015, EMC, Inc.

import url from 'url';
import config from 'src-config';

import Messenger from 'src-common/lib/Messenger';

export default class ProgressEventsMessenger extends Messenger {
  handlers = ['item'];

  constructor(host, secure) {
    super('mq',
      host || config.MonoRail_WSS,
      secure || config.check('Enable_RackHD_SSL'));
  }

  item(msg) {
    if (this.handler) this.handler(msg);
  }

  listen(handler) {
    this.ignore();
    setTimeout(() => {
      this.handler = handler;
      this.watch({
        exchange: 'on.events',
        routingKey: 'graph.progress.#'
      });
    }, 100);
  }

  ignore() {
    this.stop({
      exchange: 'on.events',
      routingKey: 'graph.progress.#'
    });
  }
}
