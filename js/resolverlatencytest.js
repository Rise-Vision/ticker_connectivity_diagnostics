// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test whether there is latency in performing DNS queries.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.ResolverLatencyTest');

goog.require('ccd.Test');
goog.require('ccd.TestConfVars');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.metrics');



/**
 * Test the latency of the DNS resolver.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.ResolverLatencyTest = function() {
  this.testResult = new ccd.TestResult(ccd.TestId.RESOLVER_LATENCY);

  /**
   * @private {number}
   */
  // TODO(ebeach): Start at index 1
  this.numTestsCompleted_ = 0;

  /**
   * @private {number}
   */
  this.totalTimeToResolve_ = 0;

  /**
   * @private {number}
   */
  this.testStartMilsec_ = 0;

  /**
   * @private {Array.<string>}
   * @const
   */
  this.hostnamesToQuery_ = [];
  for (var i = 0; i < 3; i++) {
    this.hostnamesToQuery_.push(
        ccd.util.getRandomString(8) + '-ccd-testing-v4.metric.gstatic.com');
  }
};


/** @type {ccd.Test} */
ccd.ResolverLatencyTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.ResolverLatencyTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.ResolverLatencyTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/**
 * The number of milliseconds at which a potential DNS latency problem exists.
 * @private {number}
 * @const
 */
ccd.ResolverLatencyTest.RESOLVER_LATENCY_NO_PROBLEM_MSEC_ = 400;


/**
 * The number of milliseconds at which a potential DNS latency problem exists.
 * @private {number}
 * @const
 */
ccd.ResolverLatencyTest.RESOLVER_LATENCY_POTENTIAL_PROBLEM_MSEC_ = 500;


/**
 * @override
 */
ccd.ResolverLatencyTest.prototype.analyzeResults = function() {
  var avgTime = this.totalTimeToResolve_ / this.hostnamesToQuery_.length;
  avgTime = Math.round(avgTime * 100) / 100;
  ccd.metrics.recordMediumTime('RESOLVER_LATENCY', avgTime);

  this.testResult.addLogRecord(
      chrome.i18n.getMessage('resolverlatencytest_total_resolution_time') +
      this.totalTimeToResolve_);
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('resolverlatencytest_total_hosts_resolved') +
      this.hostnamesToQuery_.length);
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('resolverlatencytest_average_resolution_time') +
      avgTime);

  if (avgTime < ccd.ResolverLatencyTest.RESOLVER_LATENCY_NO_PROBLEM_MSEC_) {
    this.testResult.setTitle(
        chrome.i18n.getMessage('resolverlatencytest_noproblem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('resolverlatencytest_noproblem_subtitle'));
    this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
  } else if (avgTime <
             ccd.ResolverLatencyTest.RESOLVER_LATENCY_POTENTIAL_PROBLEM_MSEC_) {
    this.testResult.setTitle(
        chrome.i18n.getMessage('resolverlatencytest_potentialproblem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage(
            'resolverlatencytest_potential_problem_subtitle'));
    this.testResult.setTestVerdict(ccd.TestVerdict.POTENTIAL_PROBLEM);
  } else {
    this.testResult.setTitle(
        chrome.i18n.getMessage('resolverlatencytest_problem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('resolverlatencytest_problem_subtitle'));
    this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
  }
};


/**
 * Process a DNS query response.
 * See #chromium/src/chrome/common/extensions/api/experimental_dns.idl
 * @param {chrome.dns.ResolveCallbackResolveInfo} resultInfo
 *   DNS query result info.
 * @private
 */
ccd.ResolverLatencyTest.prototype.resolvedCallback_ = function(resultInfo) {
  // TODO(ebeach): Pending feedback from GTC SRE, restructure test.
  var currMilliseconds = (new Date).getTime();
  var millisecondsTaken = currMilliseconds - this.testStartMilsec_;
  this.totalTimeToResolve_ += millisecondsTaken;
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('resolverlatencytest_queryresult_received') +
      this.numTestsCompleted_ + ' / ' + currMilliseconds + ' / ' +
      millisecondsTaken + ' / ' + this.testStartMilsec_);

  this.numTestsCompleted_++;
  window.clearTimeout(this.timeoutId_);
  if (this.numTestsCompleted_ < this.hostnamesToQuery_.length) {
    // Allow code to be run synchronously to make testing easier.
    if (ccd.TestConfVars.RESOLVER_LATENCY_SLEEP_MILSEC > 0) {
      this.timeoutId_ = window.setTimeout(this.resolveHostname_.bind(this),
          ccd.TestConfVars.RESOLVER_LATENCY_SLEEP_MILSEC);
    } else {
      this.resolveHostname_();
    }
  } else {
    this.analyzeResults();
    this.executeCallback();
  }
};


/**
 * Make a DNS request.
 * @private
 */
ccd.ResolverLatencyTest.prototype.resolveHostname_ = function() {
  var hostname = this.hostnamesToQuery_[this.numTestsCompleted_];

  this.testStartMilsec_ = (new Date).getTime();
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('resolverlatencytest_beginning_resolution') +
      this.numTestsCompleted_ + ' ' + hostname);

  if (typeof(chrome.dns) !== 'undefined') {
    chrome.dns.resolve(hostname, this.resolvedCallback_.bind(this));
  }
};


/**
 * @override
 */
ccd.ResolverLatencyTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;
  this.resolveHostname_();
};
