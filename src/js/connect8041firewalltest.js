// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Test whether a firewall blocks HTTPS port 443.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.Connect8041FirewallTest');

goog.require('ccd.TcpFirewallTest');
goog.require('ccd.TestId');



/**
 * Test whether a firewall is blocking HTTP port 80.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.Connect8041FirewallTest = function() {};


/** @type {ccd.Test} */
ccd.Connect8041FirewallTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.Connect8041FirewallTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.Connect8041FirewallTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/** @override */
ccd.Connect8041FirewallTest.prototype.runTest = function(callbackFnc) {
  var hostnamesToTest = ['connect.risevision.com'];
                           
  var firewallTest = new ccd.TcpFirewallTest(8041, hostnamesToTest, ccd.TestId.FIREWALL_8041);
  firewallTest.runTest(callbackFnc);
};
