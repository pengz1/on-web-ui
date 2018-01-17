// Copyright 2015, EMC, Inc.

import url from 'url';
import config from 'src-config';

import Messenger from 'src-common/lib/Messenger';

export default class MessengerBus extends Messenger {
  handlers = ['item'];

  constructor(exchange, routingKey, host, secure) {
    super('mq',
      host || config.RackHD_WSS,
      secure || config.check('Enable_RackHD_SSL'));
    this.exchange = exchange;
    this.routingKey = routingKey;
  }

  item(msg) {
    if (this.handler) this.handler(msg);
  }

  listen(handler) {
    this.ignore();
    setTimeout(() => {
      this.handler = handler;
      this.watch({
        exchange: this.exchange,
        routingKey: this.routingKey
      });
    }, 100);
  }

  ignore() {
    this.stop({
      exchange: this.exchange,
      routingKey: this.routingKey
    });
  }
}
