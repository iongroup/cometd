/*
 * Copyright (c) 2008 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A registry for transports used by the CometD object.
 */
export function TransportRegistry() {
    let _types = [];
    let _transports = {};

    this.getTransportTypes = () => _types.slice(0);

    this.findTransportTypes = (version, crossDomain, url) => {
        const result = [];
        for (let i = 0; i < _types.length; ++i) {
            const type = _types[i];
            if (_transports[type].accept(version, crossDomain, url) === true) {
                result.push(type);
            }
        }
        return result;
    };

    this.negotiateTransport = (types, version, crossDomain, url) => {
        for (let i = 0; i < _types.length; ++i) {
            const type = _types[i];
            for (let j = 0; j < types.length; ++j) {
                if (type === types[j]) {
                    const transport = _transports[type];
                    if (transport.accept(version, crossDomain, url) === true) {
                        return transport;
                    }
                }
            }
        }
        return null;
    };

    this.add = (type, transport, index) => {
        let existing = false;
        for (let i = 0; i < _types.length; ++i) {
            if (_types[i] === type) {
                existing = true;
                break;
            }
        }

        if (!existing) {
            if (typeof index !== "number") {
                _types.push(type);
            } else {
                _types.splice(index, 0, type);
            }
            _transports[type] = transport;
        }

        return !existing;
    };

    this.find = (type) => {
        for (let i = 0; i < _types.length; ++i) {
            if (_types[i] === type) {
                return _transports[type];
            }
        }
        return null;
    };

    this.remove = (type) => {
        for (let i = 0; i < _types.length; ++i) {
            if (_types[i] === type) {
                _types.splice(i, 1);
                const transport = _transports[type];
                delete _transports[type];
                return transport;
            }
        }
        return null;
    };

    this.clear = () => {
        _types = [];
        _transports = {};
    };

    this.reset = (init) => {
        for (let i = 0; i < _types.length; ++i) {
            _transports[_types[i]].reset(init);
        }
    };
}
