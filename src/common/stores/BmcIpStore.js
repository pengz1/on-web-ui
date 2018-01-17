// Copyright 2018, EMC, Inc.

import Store from 'src-common/lib/Store';
import RackHDRestAPIv2_0 from '../messengers/RackHDRestAPIv2_0';

export  default class IpmiStore extends Store {

    create(ip, username, password) {
        return RackHDRestAPIv2_0.api.bmcIpsPost({
            bmcIp: ip,
            username: username,
            password: password
        }).catch(err => console.log(err));
    }

    list() {
        return RackHDRestAPIv2_0.api.bmcIpsGet()
            .then(res => {
                let ips = [];
                res.obj.forEach(o => {
                    ips.push(o.bmcIp);
                });
                return ips;
            });
    }

}
