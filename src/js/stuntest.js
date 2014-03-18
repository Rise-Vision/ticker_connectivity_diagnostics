// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test whether STUN is allowed.
 */


goog.provide('ccd.StunTest');

goog.require('ccd.Telnet');
goog.require('ccd.Test');
goog.require('ccd.TestConfVars');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.TestVerdict');



/**
 * Connectivity test for STUN.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.StunTest = function() {
  this.testResult = new ccd.TestResult(ccd.TestId.CONNECTIFY_STUN);

  /**
   * Number of test STUN requests completed.
   * @private {number}
   */
  this.numTestsCompleted_ = 0;

  /**
   * Length of STUN response, for each HTTP test.
   * @private {!Array.<number>}
   */
  this.fullResponseLength_ = [];

  /**
   * STUN response status code (if STUN request succeeds) or
   *    Chrome network stack error code (if no UDP socket throws an error)
   *    for each STUN test.
   * @private {!Array.<number>}
   */
  this.responseCode_ = [];

  /**
   * ID of window timeout used to implement sleep between STUN requests.
   * @private {number}
   */
  this.timeoutId_ = 0;

  /**
   * Hostnames to query in an attempt to determine whether STUN is allowed.
   * @private {Array.<string>}
   */
  this.hostnamesToQuery_ = [];
  this.hostnamesToQuery_.push(['stun.l.google.com', 19302]);
    
  this.hostnamesToQuery_.push(['stun.l.connectifyswitchboard.com', 3478]);

  this.hostnamesToQuery_.push(['sb-fr-paris-1.connectify.me', 3478]);
  this.hostnamesToQuery_.push(['sb-us-nyc-1.connectify.me', 3478]);
  this.hostnamesToQuery_.push(['sb-us-nova-1.connectify.me', 3478]);
  this.hostnamesToQuery_.push(['sb-sg-singapore-1.connectify.me', 3478]);
  this.hostnamesToQuery_.push(['sb-us-dallas-1.connectify.me', 3478]);
  this.hostnamesToQuery_.push(['sb-us-chicago-1.connectify.me', 3478]);
  this.hostnamesToQuery_.push(['sb-us-sanjose-1.connectify.me', 3478]);
  this.hostnamesToQuery_.push(['sb-us-la-1.connectify.me', 3478]);
  this.hostnamesToQuery_.push(['sb-br-saopaulo-1.connectify.me', 3478]);
  this.hostnamesToQuery_.push(['sb-au-sydney-1.connectify.me', 3478]);
  this.hostnamesToQuery_.push(['sb-jp-tokyo-1.connectify.me', 3478]);
  this.hostnamesToQuery_.push(['sb-in-chennai-1.connectify.me', 3478]);
    
  // uncomment these if you want to see a failure
  //this.hostnamesToQuery_.push(['this-will-not-resolve.connectifyswitchboard.com', 3478]);
  //this.hostnamesToQuery_.push(['stun.l.connectifyswitchboard.com', 80]);
};

/** @type {ccd.Test} */
ccd.StunTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.StunTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.StunTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);

var stuntest_noproblem_title = 'STUN traffic not blocked';
var stuntest_noproblem_subtitle = 'No restrictions on STUN traffic were detected on your Internet connection';
var stuntest_problem_title = 'STUN traffic is being blocked';
var stuntest_problem_subtitle = 'Your Internet connection appears to be blocking STUN traffic. STUN is used to help establish UDP connectivity to your machine.';

/**
 * Analyze the test results to determine whether STUN is allowed.
 */
ccd.StunTest.prototype.analyzeResults = function() {
  // Start by assuming that STUN is allowed.
  this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
  this.testResult.setTitle(stuntest_noproblem_title);
  this.testResult.setSubtitle(stuntest_noproblem_subtitle);

  for (var i = 0; i < this.hostnamesToQuery_.length; i++) {
    if (this.responseCode_[i] != true) {
      this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
      this.testResult.setTitle(stuntest_problem_title);
      this.testResult.setSubtitle(stuntest_problem_subtitle);
      return;
    }
  }
};

var stuntest_log_response_server = 'Received your public IP from the STUN server at ';
var stuntest_log_response_result = 'It appears that your public IP is ';

/**
 * Receive the full response of the STUN request.
 * @param {string} resultData The full content of the STUN response.
 * @private
 */
ccd.StunTest.prototype.responseReceived_ = function(resultData) {
  if (resultData !== '') {
    var mappedAddress = resultData.address;
    var validMappedAddress = (typeof(mappedAddress) === 'string') ? true : false;
    console.log('in responseReceived_('+mappedAddress+')');
    this.fullResponseLength_.push(mappedAddress.length);
    this.responseCode_.push(validMappedAddress);

    var reqNum = this.numTestsCompleted_;
    this.testResult.addLogRecord(stuntest_log_response_server +
      this.hostnamesToQuery_[reqNum][0] + ':' + 
      this.hostnamesToQuery_[reqNum][1] +
      ' (' + (reqNum + 1) + ' / ' + mappedAddress.length + ')');
    //this.testResult.addLogRecord(stuntest_log_response_result + mappedAddress);

    this.numTestsCompleted_++;
  }
  window.clearTimeout(this.timeoutId_);
  if (this.numTestsCompleted_ < this.hostnamesToQuery_.length) {
    if (ccd.TestConfVars.XHR_SLEEP_MILSEC > 0) {
      this.timeoutId_ = setTimeout(this.stunRequest_.bind(this),
                                   ccd.TestConfVars.XHR_SLEEP_MILSEC);
    } else {
      this.stunRequest_();
    }
  } else {
    this.analyzeResults();
    this.executeCallback();
  }
};

var stuntest_log_network_error = 'A network error occurred that prevented the test from completing: ';

/**
 * Handle a UDP socket error. This is not a STUN error.
 * @param {number} errorStatus The Chrome network error status code.
 * @see http://src.chromium.org/svn/trunk/src/net/base/net_error_list.h
 * @private
 */
ccd.StunTest.prototype.requestError_ = function(errorStatus) {
  var reqNum = this.numTestsCompleted_;
  this.testResult.addLogRecord(
      stuntest_log_network_error +
      'server: ' + this.hostnamesToQuery_[reqNum][0] + ':' +
                   this.hostnamesToQuery_[reqNum][1] + ', ' +
      'err code: ' + errorStatus);

  this.fullResponseLength_.push(null);
  this.responseCode_.push(false);
  this.numTestsCompleted_++;
  this.responseReceived_('');
};


/**
 * Make an HTTP request.
 * @private
 */
ccd.StunTest.prototype.stunRequest_ = function() {
  var reqNum = this.numTestsCompleted_;
  NodeStunTest.newStunRequest(this.hostnamesToQuery_[reqNum][0],
                              this.hostnamesToQuery_[reqNum][1],
                              this.responseReceived_.bind(this),
                              this.requestError_.bind(this));
  // what to do with this.testResult?
};


/**
 * Run the STUN test.
 * @param {function(ccd.TestResult)} callbackFnc
 *   Function to execute upon completion of test.
 */
ccd.StunTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;
  this.stunRequest_();
};
