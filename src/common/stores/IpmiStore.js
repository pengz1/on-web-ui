// Copyright 2018, EMC, Inc.

import Store from 'src-common/lib/Store';
import RackHDRestAPIv2_0 from '../messengers/RackHDRestAPIv2_0';

export  default class IpmiStore extends Store {

    api = RackHDRestAPIv2_0.url;
    resource = 'ipmi';

    run(user, passwd, host, command, prefix) {
        prefix = prefix ? prefix : '';
        let script = prefix + ' ipmitool -I lanplus -U ' + user + ' -P ' + passwd + ' -H ' + host + ' ' + command;
        return RackHDRestAPIv2_0.api.ipmiGet({ipmiCommand: script});
    }
}
