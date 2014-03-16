// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Test whether a the machine is connected to the Internet.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.InternetDisconnectedTest');

goog.require('ccd.ChromeInternetDisconnectedTest');
goog.require('ccd.ChromeOSInternetDisconnectedTest');



/**
 * Test whether a firewall is blocking HTTP port 80.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.InternetDisconnectedTest = function() {};


/** @type {ccd.Test} */
ccd.InternetDisconnectedTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.InternetDisconnectedTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.InternetDisconnectedTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/** @override */
ccd.InternetDisconnectedTest.prototype.canRun = function() {
  var test = null;
  if (ccd.util.isChromeOS()) {
    test = new ccd.ChromeOSInternetDisconnectedTest();
  } else {
    test = new ccd.ChromeInternetDisconnectedTest();
  }
  return test.canRun();
};


/** @override */
ccd.InternetDisconnectedTest.prototype.runTest = function(callbackFnc) {
  var test = null;
  if (ccd.util.isChromeOS()) {
    test = new ccd.ChromeOSInternetDisconnectedTest();
  } else {
    test = new ccd.ChromeInternetDisconnectedTest();
  }
  test.runTest(callbackFnc);
};
