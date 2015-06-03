// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test whether the internet is disconnected on a Chrome
 *   browser (and not ChromeOS).
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.ChromeInternetDisconnectedTest');

goog.require('ccd.Test');
goog.require('ccd.TestConfVars');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.TestVerdict');



/**
 * Test whether an internet connection is available in the Chrome browser.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.ChromeInternetDisconnectedTest = function() {
  this.testResult = new ccd.TestResult(ccd.TestId.INTERNET_DISCONNECTED);

  /**
   * The number of hostnames that have been tested.
   * @private {number}
   */
  this.numTestsCompleted_ = 0;

  /**
   * Array of TCP connection statuses.
   * @see http://src.chromium.org/svn/trunk/src/net/base/net_error_list.h
   * @private {!Array.<number>}
   */
  this.connectionStatusCodes_ = [];

  /**
   * TCP destination port to test for whether the internet is disconnected.
   * @private {number}
   * @const
   */
  this.portToTest_ = 80;

  /**
   * ID for window.timeout().
   * @private {number}
   */
  this.timeoutId_ = 0;

  /**
   * Hostnames to test to determine whether the internet is disconnected.
   * @private {Array.<string>}
   * @const
   */
  this.hostnamesToTest_ = ['contentfinancial2.appspot.com'];
};


/** @type {ccd.Test} */
ccd.ChromeInternetDisconnectedTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.ChromeInternetDisconnectedTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.ChromeInternetDisconnectedTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/**
 * Status code given by the Chrome network stack that denotes the
 *   internet being disconnected.
 * @private {number}
 * @see #chromium/src/net/base/net_error_list.h
 * @const
 */
ccd.ChromeInternetDisconnectedTest.INTERNET_DISCONNECTED_STATUS_CODE_ = -106;


/**
 * Length of time to wait between TCP requests.
 * @private {number}
 * @const
 */
ccd.ChromeInternetDisconnectedTest.TCP_REQUEST_TIMEOUT_MILSEC_ = 500;


/**
 * @override
 */
ccd.ChromeInternetDisconnectedTest.prototype.analyzeResults = function() {
  if (this.isDisconnected_()) {
    this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
    this.testResult.setTitle(
        chrome.i18n.getMessage(
            'chromeinternetdisconnectedtest_problem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage(
            'chromeinternetdisconnectedtest_problem_subtitle'));
  } else {
    this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
    this.testResult.setTitle(
        chrome.i18n.getMessage(
            'chromeinternetdisconnectedtest_noproblem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage(
            'chromeinternetdisconnectedtest_noproblem_subtitle'));
  }
};


/**
 * @override
 */
ccd.ChromeInternetDisconnectedTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;
  this.attemptConnection_();
};


/**
 * Function to be called when the TCP connection status is known.
 * @param {number} respStatus Status of the
 *   TCP connection. See also #chromium/src/net/base/net_error_list.h.
 * @private
 */
ccd.ChromeInternetDisconnectedTest.prototype.connectionStatusKnown_ =
    function(respStatus) {
  window.clearTimeout(this.timeoutId_);

  this.testResult.addLogRecord('# ' + this.numTestsCompleted_ +
      chrome.i18n.getMessage(
          'chromeinternetdisconnectedtest_log_connection_status_known') +
      + respStatus);

  this.connectionStatusCodes_[this.numTestsCompleted_] = respStatus;

  this.numTestsCompleted_++;
  if (this.numTestsCompleted_ < this.hostnamesToTest_.length) {
    if (ccd.ChromeInternetDisconnectedTest.TCP_REQUEST_TIMEOUT_MILSEC_ == 0) {
      this.attemptConnection_();
    } else {
      this.timeoutId_ = window.setTimeout(this.attemptConnection_.bind(this),
          ccd.ChromeInternetDisconnectedTest.TCP_REQUEST_TIMEOUT_MILSEC_);
    }
  } else {
    this.analyzeResults();
    this.executeCallback();
  }
};


/**
 * Return a Telnet object. Implemented for easier testing.
 * @param {string} hostname Hostname to connect to.
 * @param {number} port TCP port number.
 * @param {ccd.TestResult} testResult Test result container.
 * @return {ccd.Telnet} Telnet object.
 * @private
 */
ccd.ChromeInternetDisconnectedTest.prototype.getTelnet_ = function(hostname,
                                                          port, testResult) {
  return new ccd.Telnet(hostname, port, testResult);
};


/**
 * Attempt to make TCP connection to the specified host on the specified port.
 * @private
 */
ccd.ChromeInternetDisconnectedTest.prototype.attemptConnection_ = function() {
  var hostname = this.hostnamesToTest_[this.numTestsCompleted_];
  this.testResult.addLogRecord(
      chrome.i18n.getMessage(
          'chromeinternetdisconnectedtest_log_connection_beginning') +
      this.numTestsCompleted_ + ' / ' + hostname + ' / ' + this.portToTest_);

  var telnet = this.getTelnet_(hostname, this.portToTest_, this.testResult);

  telnet.setConnectionStatusKnownCallbackFnc(
      this.connectionStatusKnown_.bind(this));

  // As we are simply testing whether the connection is open, the
  //   specific data that is sent doesn't matter.
  telnet.setPlainTextDataToSend('GET / HTTP/1.1');
  telnet.startConnection();
};


/**
 * Determine whether the computer is disconnected from the internet.
 * @return {boolean} Whether the internet is disconnected.
 * @private
 */
ccd.ChromeInternetDisconnectedTest.prototype.isDisconnected_ = function() {
  var numDisconnectedResults = 0;
  for (var i = 0; i < this.connectionStatusCodes_.length; i++) {
    if (this.connectionStatusCodes_[i] ==
        ccd.Telnet.TcpConnStatus.INTERNET_DISCONNECTED) {
      numDisconnectedResults++;
    }
  }

  return numDisconnectedResults == this.connectionStatusCodes_.length;
};
