// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test whether firewall is blocking a specific TCP port.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.TcpFirewallTest');

goog.require('ccd.Telnet');
goog.require('ccd.Test');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.TestVerdict');



/**
 * Test for a firewall on a specific port.
 * @param {number} port TCP port number to test.
 * @param {ccd.TestId} testId Test ID.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.TcpFirewallTest = function(port, testId) {
  this.testResult = new ccd.TestResult(testId);

  /**
   * Test ID being executed.
   * @private {?ccd.TestId}
   */
  this.testId_ = testId;

  /**
   * The number of retries of a request remaining.
   * @private {number}
   */
  this.numRetriesRemaining_ = ccd.TcpFirewallTest.NUM_QUERIES_TO_RETRY_;

  /**
   * Array of TCP connection statuses.
   * @see http://src.chromium.org/svn/trunk/src/net/base/net_error_list.h
   * @private {!Array.<number>}
   */
  this.connectionStatusCodes_ = [];

  /**
   * TCP destination port to test for a firewall.
   * @private {number}
   */
  this.portToTest_ = port;

  /**
   * Number of TCP connections attempted.
   * @private {number}
   */
  this.numTestsCompleted_ = 0;

  /**
   * ID for window.timeout().
   * @private {number}
   */
  this.timeoutId_ = 0;

  /**
   * Array of hostnames to test.
   * @private {!Array.<string>}
   */
  this.hostnamesToTest_ = ['ticker.risedisplay.com', 's3.amazonaws.com', 'contentfinancial2.appspot.com',
                           'contentsports.appspot.com', 'content-news.appspot.com',
                           'connect.risevision.com', '54.172.249.25'];
};


/** @type {ccd.Test} */
ccd.TcpFirewallTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.TcpFirewallTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.TcpFirewallTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/**
 * The number of milliseconds to wait between each TCP request.
 * @private {number}
 * @const
 */
ccd.TcpFirewallTest.FIREWALL_TCP_REQUEST_TIMEOUT_MILSEC_ = 500;


/**
 * Threashold for the number of times INTERNET_DISCONNECTED is returned
 *   above which we conclude that the internet is entirely disconnected
 *   and therefore the inability to open TCP connections is not a firewall
 *   but just not being connected.
 * @private {number}
 * @const
 */
ccd.TcpFirewallTest.NETWORK_DISCONNECTED_THRESHOLD_ = 0.8;


/**
 * @private {number}
 * @const
 */
ccd.TcpFirewallTest.NUM_QUERIES_TO_RETRY_ = 3;


/**
 * Status codes on which to retry the TCP connection.
 * @private {Array.<number>}
 * @see http://src.chromium.org/svn/trunk/src/net/base/net_error_list.h
 * @const
 */
ccd.TcpFirewallTest.RESPONSE_CODES_TO_RETRY_ = [
  ccd.Telnet.TcpConnStatus.TIMED_OUT,
  ccd.Telnet.TcpConnStatus.CONNECTION_TIMED_OUT
];


/**
 * Analyze test results.
 * Compute the number of TCP connections that failed. Then, determine whether
 *   these failures occurred due to a firewall or due to another reason that
 *   should not trigger the firewall.
 */
ccd.TcpFirewallTest.prototype.analyzeResults = function() {
  var numFailedConnections = 0;
  var errorDetails = '';
  for (var i = 0; i < this.hostnamesToTest_.length; i++) {
    if (this.connectionStatusCodes_[i] !==
        ccd.Telnet.TcpConnStatus.SUCCESS) {
      this.testResult.addLogRecord('#' + i +
          chrome.i18n.getMessage('tcpfirewalltest_log_count_failed_attempt') +
          this.connectionStatusCodes_[i]);
      errorDetails = errorDetails + '#' + i + " - Unable to connect to " + this.hostnamesToTest_[i] + " on port " + this.portToTest_ + ". Error code " + this.connectionStatusCodes_[i] + "\n" ;
      numFailedConnections++;
    }
  }

  /**
   * Check for the circumstances under which no firewall exists:
   *   (1) The number of failed connections is less than a threshold of the
   *       total number of connections.
   */
  if (numFailedConnections <
          ((1 - ccd.TcpFirewallTest.NETWORK_DISCONNECTED_THRESHOLD_) *
          this.hostnamesToTest_.length)) {
    // No firewall exists.
    this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
    this.testResult.setTitle(
        chrome.i18n.getMessage('tcpfirewalltest_noproblem_title') +
        this.portToTest_);
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('tcpfirewalltest_noproblem_subtitle') +
        this.portToTest_);
  } else if (numFailedConnections >= this.hostnamesToTest_.length) {
    // A firewall exists.
    this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
    this.testResult.setTitle(
        chrome.i18n.getMessage('tcpfirewalltest_problem_title') +
        this.portToTest_);
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('tcpfirewalltest_problem_subtitle') + '\n\n' + errorDetails);
  } else {
    // A firewall probably exists.
    this.testResult.setTestVerdict(ccd.TestVerdict.POTENTIAL_PROBLEM);
    this.testResult.setTitle(
        chrome.i18n.getMessage('tcpfirewalltest_potentialproblem_title') +
        this.portToTest_);
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('tcpfirewalltest_potentialproblem_subtitle') + '\n\n' + errorDetails);
  }

  this.testResult.addLogRecord(
      chrome.i18n.getMessage('tcpfirewalltest_log_analysis_summary') +
      this.numTestsCompleted_ + ' / ' + this.portToTest_ +
      ' / ' + numFailedConnections);
};


/**
 * @override
 */
ccd.TcpFirewallTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;
  this.attemptConnection_();
};


/**
 * Function to be called when the TCP connection status is known.
 * @param {number} respStatus Status of the
 *   TCP connection. See also #chromium/src/net/base/net_error_list.h.
 * @private
 */
ccd.TcpFirewallTest.prototype.connectionStatusKnown_ = function(respStatus) {
  window.clearTimeout(this.timeoutId_);

  if (ccd.TcpFirewallTest.
          RESPONSE_CODES_TO_RETRY_.indexOf(respStatus) > -1 &&
      this.numRetriesRemaining_ > 0) {
    this.numTestsCompleted_--;
    this.numRetriesRemaining_--;
  } else {
    this.testResult.addLogRecord('# ' + this.numTestsCompleted_ +
        chrome.i18n.getMessage('tcpfirewalltest_log_connection_status_known') +
        + respStatus);
    this.connectionStatusCodes_[this.numTestsCompleted_] = respStatus;
  }

  this.numTestsCompleted_++;
  if (this.numTestsCompleted_ < this.hostnamesToTest_.length) {
    if (ccd.TcpFirewallTest.FIREWALL_TCP_REQUEST_TIMEOUT_MILSEC_ == 0) {
      this.attemptConnection_();
    } else {
      this.timeoutId_ = window.setTimeout(this.attemptConnection_.bind(this),
          ccd.TcpFirewallTest.FIREWALL_TCP_REQUEST_TIMEOUT_MILSEC_);
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
ccd.TcpFirewallTest.prototype.getTelnet_ = function(hostname,
                                                    port, testResult) {
  return new ccd.Telnet(hostname, port, testResult);
};


/**
 * Attempt to make TCP connection to the specified host on the specified port.
 * @private
 */
ccd.TcpFirewallTest.prototype.attemptConnection_ = function() {
  var hostname = this.hostnamesToTest_[this.numTestsCompleted_];
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('tcpfirewalltest_log_connection_about_begun') +
      this.numTestsCompleted_ + ' / ' + hostname + ' / ' + this.portToTest_);

  var telnet = this.getTelnet_(hostname, this.portToTest_, this.testResult);

  telnet.setConnectionStatusKnownCallbackFnc(
      this.connectionStatusKnown_.bind(this));

  // As we are simply testing whether the connection is open, the
  //   specific data that is sent doesn't matter.
  telnet.setPlainTextDataToSend('GET / HTTP/1.1');
  telnet.startConnection();
};
