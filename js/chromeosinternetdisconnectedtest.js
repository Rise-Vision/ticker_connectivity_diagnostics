// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test whether the internet is disconnected on a ChromeOS
 *   device.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.ChromeOSInternetDisconnectedTest');

goog.require('ccd.Test');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.TestVerdict');



/**
 * Test whether ChromeOS has a working network connection.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.ChromeOSInternetDisconnectedTest = function() {
  this.testResult = new ccd.TestResult(ccd.TestId.INTERNET_DISCONNECTED);

  /**
   * Whether the network is disconnected.
   * @private {boolean}
   */
  this.isDisconnected_ = true;
};


/** @type {ccd.Test} */
ccd.ChromeOSInternetDisconnectedTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.ChromeOSInternetDisconnectedTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.ChromeOSInternetDisconnectedTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/** @override */
ccd.ChromeOSInternetDisconnectedTest.prototype.analyzeResults = function() {
  if (this.isDisconnected_) {
    this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
    this.testResult.setTitle(
        chrome.i18n.getMessage(
            'chromeosinternetdisconnectedtest_problem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage(
            'chromeosinternetdisconnectedtest_problem_subtitle'));
  } else {
    this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
    this.testResult.setTitle(
        chrome.i18n.getMessage(
            'chromeosinternetdisconnectedtest_noproblem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage(
            'chromeosinternetdisconnectedtest_noproblem_subtitle'));
  }
};


/** @override */
ccd.ChromeOSInternetDisconnectedTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;
  chrome.networkingPrivate.getVisibleNetworks('All',
      this.processNicInfo_.bind(this));
};


/**
 * Process network interface information.
 * @param {Array.<chrome.networkingPrivate.NetworkProperties>} dt
 *    Network interface information.
 * @private
 */
ccd.ChromeOSInternetDisconnectedTest.prototype.processNicInfo_ = function(dt) {
  this.testResult.addLogRecord(
      chrome.i18n.getMessage(
          'chromeosinternetdisconnectedtest_log_available_networks') +
      dt.length);
  if (dt.length == 0) {
    this.isDisconnected_ = true;
  } else {
    for (var i = 0; i < dt.length; i++) {
      if (dt[i].ConnectionState == 'Connected') {
        this.isDisconnected_ = false;
        break;
      }
    }
  }
  this.analyzeResults();
  this.executeCallback();
};
