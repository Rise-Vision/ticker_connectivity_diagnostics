// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test whether a DNS resolver is available to the browser.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.ResolverPresentTest');

goog.require('ccd.Test');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.TestVerdict');



/**
 * Test whether a DNS resolver is available to the browser.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.ResolverPresentTest = function() {
  this.testResult = new ccd.TestResult(ccd.TestId.DNS_RESOLVER_PRESENT);
};


/** @type {ccd.Test} */
ccd.ResolverPresentTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.ResolverPresentTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.ResolverPresentTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/**
 * Analyze test results.
 * @see trunk/src/chrome/common/extensions/api/experimental_dns.idl
 * @param {chrome.dns.ResolveCallbackResolveInfo} resolverResult
 *   DNS query result.
 */
ccd.ResolverPresentTest.prototype.analyzeResults = function(resolverResult) {
  if (resolverResult.resultCode != undefined &&
      resolverResult.resultCode == 0) {
    this.testResult.setTitle(
        chrome.i18n.getMessage('resolverpresenttest_noproblem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('resolverpresenttest_noproblem_subtitle'));
    this.testResult.addLogRecord(
        chrome.i18n.getMessage('resolverpresenttest_hostnameresult') +
        resolverResult.address);
    this.testResult.addLogRecord(
        chrome.i18n.getMessage('resolverpresenttest_statuscoderesultsuccess') +
        resolverResult.resultCode);
    this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
  } else {
    this.testResult.setTitle(
        chrome.i18n.getMessage('resolverpresenttest_problem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('resolverpresenttest_problem_subtitle'));
    this.testResult.addLogRecord(
        chrome.i18n.getMessage('resolverpresenttest_statuscoderesultfailure') +
        resolverResult.resultCode);
    this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
  }
};


/**
 * Handle the results of a DNS query.
 * @param {chrome.dns.ResolveCallbackResolveInfo} resolverResult
 *   DNS query result.
 * @private
 */
ccd.ResolverPresentTest.prototype.resolveCallback_ = function(resolverResult) {
  if (resolverResult == undefined) {
    this.testResult.addLogRecord(
        chrome.i18n.getMessage('resolverpresenttest_testfailed'));
    this.testResult.setTestVerdict(ccd.TestVerdict.TEST_FAILURE_OCCURRED);
  } else {
    this.testResult.addLogRecord(
        chrome.i18n.getMessage('resolverpresenttest_testcompleted'));
    this.analyzeResults(resolverResult);
  }
  this.executeCallback();
};


/**
 * @override
 */
ccd.ResolverPresentTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;

  var hostname = 'ccd-testing-v4.gstatic.com';
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('resolverpresenttest_gettinghostname') + hostname);
    
  if (typeof(chrome.dns) !== 'undefined') {
    chrome.dns.resolve(hostname, this.resolveCallback_.bind(this));
  }
};
