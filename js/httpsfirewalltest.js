// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Test whether a firewall blocks HTTPS port 443.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.HttpsFirewallTest');

goog.require('ccd.TcpFirewallTest');
goog.require('ccd.TestId');



/**
 * Test whether a firewall is blocking HTTP port 80.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.HttpsFirewallTest = function() {};


/** @type {ccd.Test} */
ccd.HttpsFirewallTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.HttpsFirewallTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.HttpsFirewallTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/** @override */
ccd.HttpsFirewallTest.prototype.runTest = function(callbackFnc) {
  var firewallTest = new ccd.TcpFirewallTest(443, ccd.TestId.FIREWALL_443);
  firewallTest.runTest(callbackFnc);
};
