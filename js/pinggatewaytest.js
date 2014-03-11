// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test whether a machine can ping the gateway.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.PingGatewayTest');

goog.require('ccd.Test');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.TestVerdict');
goog.require('ccd.util');



/**
 * Test whether a the machine can ping the gateway.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.PingGatewayTest = function() {
  this.testResult = new ccd.TestResult(ccd.TestId.PING_GATEWAY);
};


/** @type {ccd.Test} */
ccd.PingGatewayTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.PingGatewayTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.PingGatewayTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/** @override */
ccd.PingGatewayTest.prototype.canRun = function() {
  return (ccd.util.isChromeOS() && chrome.diagnostics !== undefined &&
          chrome.diagnostics.sendPacket !== undefined);
};


/**
 * @private {number}
 * const
 */
ccd.PingGatewayTest.PROBLEM_LATENCY_ = 1500;


/**
 * Analyze test results.
 * @see #chromium/src/chrome/common/extensions/api/diagnostics.idl
 * @param {chrome.diagnostics.SendPacketResult} sendPacketResult
 *   ICMP query result.
 */
ccd.PingGatewayTest.prototype.analyzeResults = function(sendPacketResult) {
  if (sendPacketResult == undefined || sendPacketResult.latency == undefined ||
      sendPacketResult.latency == 0 ||
      sendPacketResult.latency > ccd.PingGatewayTest.PROBLEM_LATENCY_) {
    this.testResult.setTitle(
        chrome.i18n.getMessage('pinggatewaytest_problem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('pinggatewaytest_problem_subtitle'));
    this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
  } else {
    this.testResult.setTitle(
        chrome.i18n.getMessage('pinggatewaytest_noproblem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('pinggatewaytest_noproblem_subtitle'));
    this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
  }
};


/** @override */
ccd.PingGatewayTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;

  /**
   * @param {string} gatewayIp The IP of the gateway.
   * @this {ccd.PingGatewayTest}
   */
  var gatewayKnownCallback_ = function(gatewayIp) {
    var sendOptions = {'ip': gatewayIp, 'ttl': 1};
    chrome.diagnostics.sendPacket(
        /** @type {chrome.diagnostics.SendPacketOptions} */ (sendOptions),
                                  this.pingCallback_.bind(this));
  };
  this.getGateway_(gatewayKnownCallback_.bind(this));
};


/**
 * @param {function(string)} callbackFnc Gateway IP callback.
 * @private
 */
ccd.PingGatewayTest.prototype.getGateway_ = function(callbackFnc) {
  /**
   * @param {chrome.diagnostics.SendPacketResult} sendPacketResult
   *   ICMP query result.
   */
  var gatewayCallback_ = function(sendPacketResult) {
    callbackFnc(sendPacketResult['ip']);
  };

  var sendOptions = {'ip': '8.8.8.8', 'ttl': 1};
  chrome.diagnostics.sendPacket(
      /** @type {chrome.diagnostics.SendPacketOptions} */ (sendOptions),
                                gatewayCallback_.bind(this));
};


/**
 * Handle the results of a ICMP query.
 * @param {chrome.diagnostics.SendPacketResult} sendPacketResult
 *   ICMP query result.
 * @private
 */
ccd.PingGatewayTest.prototype.pingCallback_ = function(sendPacketResult) {
  if (sendPacketResult == undefined || sendPacketResult.latency == 0) {
    this.testResult.addLogRecord(
        chrome.i18n.getMessage('pinggatewaytest_log_failure'));
  } else {
    this.testResult.addLogRecord(
        chrome.i18n.getMessage('pinggatewaytest_log_latency') +
        sendPacketResult.latency);
  }
  this.analyzeResults(sendPacketResult);
  this.executeCallback();
};
