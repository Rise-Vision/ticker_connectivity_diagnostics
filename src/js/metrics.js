// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Manage recording metrics for CCD.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.metrics');


goog.require('ccd.TestId');
goog.require('ccd.TestVerdict');


/**
 * @private {string}
 * @const
 */
ccd.metrics.NAMESPACE_ = 'ConnectivityDiagnostics';


/**
 * @private {string}
 * @const
 */
ccd.metrics.USERACTION_ = 'UA';


/**
 * @private {number}
 * @const
 * @see #chromium/src/chrome/common/extensions/api/metrics_private.json&l=133
 */
ccd.metrics.MAX_MEDIUM_TIME_LENGTH_ = 1000 * 60 * 3;


/**
 * Record user action.
 * @param {string} name An user action name.
 */
ccd.metrics.recordUserAction = function(name) {
  var fullName = ccd.metrics.NAMESPACE_ + '.' +
      ccd.metrics.USERACTION_ + '.' + name;
  if (chrome.metricsPrivate) {
    chrome.metricsPrivate.recordUserAction(fullName);
  }
};


/**
 * Records an elapsed time of no more than 3 minutes.
 * Time is limited to 3 minutes by underlying chrome.metricsPrivate
 *   behavior.
 * @param {string} metricName Name of the metric to be recorded.
 * @param {number} milliseconds Elapsed length of time (in milliseconds).
 */
ccd.metrics.recordMediumTime = function(metricName, milliseconds) {
  var finalTime = Math.round(milliseconds);
  var fullName = ccd.metrics.NAMESPACE_ + '.' + metricName;
  if (chrome.metricsPrivate &&
      finalTime < ccd.metrics.MAX_MEDIUM_TIME_LENGTH_) {
    chrome.metricsPrivate.recordMediumTime(fullName, finalTime);
  }
};


/**
 * Record a numerical value on a historgram plot.
 * @param {string} metricName Name of metric to be recorded.
 * @param {number} metricValue Value to be recorded.
 * @param {number} min Minimum sample value to be recoded.
 *   Must be greater than zero.
 * @param {number} max Maximum sample value to be recoded.
 * @param {number} buckets Number of buckets to use when separating
 *   the recorded values.
 * @see #chromium/src/chrome/common/extensions/api/metrics_private.json
 */
ccd.metrics.recordHistogramValue = function(metricName, metricValue,
                                   min, max, buckets) {
  var fullName = ccd.metrics.NAMESPACE_ + '.' + metricName;
  var metricDescr = {
    'metricName': fullName,
    'type': 'histogram-linear',
    'min': Math.round(min),
    'max': Math.round(max),
    'buckets': Math.round(buckets)
  };

  if (chrome.metricsPrivate) {
    chrome.metricsPrivate.recordValue(metricDescr, metricValue);
  }
};


/**
 * Wrapper function to record the result of a connectivity test.
 * @param {ccd.TestId} testId ID of test whose verdict is being recorded.
 * @param {ccd.TestVerdict} testVerdict Test verdict (i.e., problem).
 */
ccd.metrics.recordTestVerdict = function(testId, testVerdict) {
  var fullName = 'TestVerdict.' + testId;
  ccd.metrics.recordHistogramValue(fullName, testVerdict, 0,
      Object.keys(ccd.TestVerdict).length - 1,
      Object.keys(ccd.TestVerdict).length);
};


/**
 * Wrapper function to standardize naming for recording test times.
 * @param {ccd.TestId} testId ID of test whose verdict is being recorded.
 * @param {number} millisecondsTaken Time test took (in milliseconds).
 */
ccd.metrics.recordTestTimeTaken = function(testId, millisecondsTaken) {
  ccd.metrics.recordMediumTime('TimeTaken.' + testId, millisecondsTaken);
};


/**
 * Record the version of CCD.
 * 0.5.5 becomes 55. and 1.3.2 becomes 132.
 * @param {string} appVersion Version of CCD.
 */
ccd.metrics.recordAppVersion = function(appVersion) {
  var recordVersion = appVersion.replace(/\./g, '');
  recordVersion = parseInt(recordVersion, 10);
  ccd.metrics.recordHistogramValue('AppVersion', recordVersion,
      0, 1000, 50);
};


/**
 * Record the method through which the CCD application was launched (e.g.,
 *   webstore app or ChromeOS offline page).
 * @param {string} source Means CCD was launched.
 */
ccd.metrics.recordLaunchSource = function(source) {
  var fullName = ccd.metrics.NAMESPACE_ + '.LaunchSource.' + source;
  if (chrome.metricsPrivate) {
    chrome.metricsPrivate.recordUserAction(fullName);
  }
};
