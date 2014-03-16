// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  UI Feedback service.
 * @author ebeach@google.com (Eric Beach)
 */

goog.provide('ccd.service.FeedbackService');



/**
 * @constructor
 */
ccd.service.FeedbackService = function() {
  /**
   * @private {!Array.<function(boolean)>}
   */
  this.passingTestsChangeCallbacks_ = [];

  /**
   * @private {!Array.<function()>}
   */
  this.rerunTestsCallbacks_ = [];

  /**
   * @private {boolean}
   */
  this.passingTestsShown_ = false;

  /**
   * @private {Object.<ccd.TestId,
   *                   ccd.service.FeedbackService.TestResultFeedback_>}
   */
  this.testResultsFeedback_ = {};
};


/** @private {ccd.service.FeedbackService} */
ccd.service.FeedbackService.instance_ = null;



/**
 * Object to store test result feedback.
 * @param {ccd.TestId} testId ID of test whose result we are saving.
 * @param {ccd.TestVerdict} verdict Result of test.
 * @param {number} timeTaken Number of milliseconds that the test took.
 * @constructor
 * @private
 */
ccd.service.FeedbackService.TestResultFeedback_ = function(testId,
                                                          verdict,
                                                          timeTaken) {
  /** @private {ccd.TestId} */
  this.testId_ = testId;

  /** @private {ccd.TestVerdict} */
  this.testVerdict_ = verdict;

  /** @private {number} */
  this.testTimeTaken_ = timeTaken;
};


/**
 * @private {string}
 * @const
 */
ccd.service.FeedbackService.FEEDBACK_EXTENSION_ID_ =
    'gfdkimpbcpahaombhbimeihdjnejgicl';


/**
 * Get singleton instance of object.
 * @return {!ccd.service.FeedbackService} Return singleton instance.
 */
ccd.service.FeedbackService.getInstance = function() {
  if (!ccd.service.FeedbackService.instance_) {
    ccd.service.FeedbackService.instance_ = new ccd.service.FeedbackService();
  }
  return ccd.service.FeedbackService.instance_;
};


/**
 * Send feedback.
 */
ccd.service.FeedbackService.prototype.sendFeedback = function() {
  if (!ccd.flags.MENU_OPTION_TO_SEND_CHROME_FEEDBACK) {
    return;
  }
  var feedbackMessage = this.getFeedbackInfoObject_();
  chrome.runtime.sendMessage(ccd.service.FeedbackService.FEEDBACK_EXTENSION_ID_,
      feedbackMessage, function() {});
};


/**
 * @param {ccd.TestId} testId ID of test whose result we are saving.
 * @param {ccd.TestVerdict} verdict Result of test.
 * @param {number} timeTaken Number of milliseconds that the test took.
 */
ccd.service.FeedbackService.prototype.saveTestResult = function(testId,
                                                                verdict,
                                                                timeTaken) {
  if (this.testResultsFeedback_[testId] !== undefined) {
    return;
  }

  /**
   * @type {ccd.service.FeedbackService.TestResultFeedback_}
   */
  var feedback = new ccd.service.FeedbackService.TestResultFeedback_(testId,
                                                                     verdict,
                                                                     timeTaken);

  this.testResultsFeedback_[testId] = feedback;
};


/**
 * @return {Object} Feedback message object to be sent to CrOS server.
 * @see #chromium/src/chrome/common/extensions/api/feedback_private.idl&l=19
 * @private
 */
ccd.service.FeedbackService.prototype.getFeedbackInfoObject_ = function() {
  var message = {};
  message.feedbackInfo = {};

  message.requestFeedback = true;
  message.feedbackInfo.description = '';

  var info1 = {key: 'CCD_APP_VERSION_NUMBER', value: ccd.util.getAppVersion()};
  var info2 = {key: 'DIAGNOSTICS', value: 'Connectivity'};

  var testResults = '';
  for (var testId in this.testResultsFeedback_) {
    testId = parseInt(testId, 10);
    testId = /** @type {ccd.TestId} */ (testId);
    var fObj = this.testResultsFeedback_[testId];
    testResults += 'Test ID: ' + fObj.testId_ +
                   ', Test Verdict: ' + fObj.testVerdict_ +
                   ', Time Elapsed: ' + fObj.testTimeTaken_ + '\n';
  }

  var info3 = {key: 'CCD_APP_TEST_RESULTS', value: testResults};
  message.feedbackInfo.systemInformation = [info1, info2, info3];

  var flagsData = '';
  for (var flagName in ccd.flags) {
    if (ccd.flags[flagName].toString == undefined) {
      continue;
    }
    flagsData += 'Name: ' + flagName + ', Value: ' +
                 ccd.flags[flagName].toString() + '\n';
  }
  var flagInfoObj = {key: 'CCD_APP_FLAGS_' + flagName,
                      value: flagsData};
  message.feedbackInfo.systemInformation.push(flagInfoObj);

  return message;
};
