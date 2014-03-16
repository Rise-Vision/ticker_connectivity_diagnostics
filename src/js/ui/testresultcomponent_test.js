// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Tests for utility functions in ccd.test.ui.TestResultComponent.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.test.ui.TestResultComponent');

goog.require('ccd.ui.TestResultComponent');
goog.require('goog.testing.jsunit');

goog.setTestOnly('Tests for ccd.test.ui.TestResultComponent');


var SHOW_LOGS_TITLE_TEXT = 'Show Logs';
var HIDE_LOGS_TITLE_TEXT = 'Show Logs';


/**
 * @const
 */
chrome.i18n = {};


/**
 * Stub implementation of getMessage()
 * @param {string} message Name of message to get.
 * @return {string} Stub Internationalized text.
 */
chrome.i18n.getMessage = function(message) {
  switch (true) {
    case (message === 'test_result_hide_logs'):
      return HIDE_LOGS_TITLE_TEXT;
    case (message === 'test_result_show_logs'):
      return SHOW_LOGS_TITLE_TEXT;
    default:
      return 'i18n Message';
  }
};


var mockTestResult = {
  getTitle: function() {
    return 'title';
  },
  getSubtitle: function() {
    return 'subtitle';
  },
  getTestId: function() {
    return 1;
  },
  getTestVerdict: function() {
    return ccd.TestVerdict.NO_PROBLEM;
  },
  getLogs: function() {
    return ['log1', 'log2', 'log3'];
  }
};


function setUp() {
  document.body.innerHTML = '';
}


/**
 * @param {Event} event Event to dispatch.
 */
function helpTestToggleShowMoreInformation(event) {
  var containerElem = document.createElement('div');

  var resultComponent = new ccd.ui.TestResultComponent(mockTestResult);
  resultComponent.render(containerElem);

  // More Information should be hidden by default.
  assertEquals(resultComponent.moreInfoElem_.className,
      ccd.ui.globals.Css.HIDDEN);

  // Simulate event.
  resultComponent.resultFrame_.dispatchEvent(event);

  // More Information should be expanded now.
  assertEquals(resultComponent.moreInfoElem_.className,
      'element-block');

  // Simulate event.
  resultComponent.resultFrame_.dispatchEvent(event);

  // More Information should be hidden now.
  assertEquals(resultComponent.moreInfoElem_.className,
      ccd.ui.globals.Css.HIDDEN);
}

function testToggleShowMoreInformation_click() {
  var clickEvent = new Event('click');
  helpTestToggleShowMoreInformation(clickEvent);
}


function testToggleShowMoreInformation_enter() {
  var enterEvent = new Event('keyup');
  enterEvent.type = 'keyup';
  enterEvent.keyCode = ccd.ui.globals.KeyCode.ENTER;
  helpTestToggleShowMoreInformation(enterEvent);
}
