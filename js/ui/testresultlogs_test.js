// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Tests for utility functions in ccd.test.ui.TestResultLogs.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.test.ui.TestResultLogs');

goog.require('ccd.TestVerdict');
goog.require('ccd.ui.TestResultLogs');
goog.require('ccd.ui.globals');
goog.require('goog.testing.jsunit');

goog.setTestOnly('Tests for ccd.test.ui.TestResultLogs');


var SHOW_LOGS_TITLE_TEXT = 'Show Logs';
var HIDE_LOGS_TITLE_TEXT = 'Hide Logs';


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
function helpTestToggleShowLogs(event) {
  var containerElem = document.createElement('div');

  var logComponent = new ccd.ui.TestResultLogs(mockTestResult);
  logComponent.render(containerElem);

  // Logs should be hidden by default.
  assertEquals(logComponent.innerLogsContainer_.className,
      ccd.ui.globals.Css.HIDDEN);
  assertEquals(SHOW_LOGS_TITLE_TEXT,
      logComponent.toggleLogsTitle_.innerHTML);

  // Simulate event.
  logComponent.toggleLogsTitle_.dispatchEvent(event);

  // Logs should be exposed now.
  assertEquals(logComponent.innerLogsContainer_.className,
      'test-result-log-container');
  assertEquals(HIDE_LOGS_TITLE_TEXT,
      logComponent.toggleLogsTitle_.innerHTML);

  // Simulate event.
  logComponent.toggleLogsTitle_.dispatchEvent(event);

  // Logs should now be hidden again.
  assertEquals(logComponent.innerLogsContainer_.className,
      ccd.ui.globals.Css.HIDDEN);
  assertEquals(SHOW_LOGS_TITLE_TEXT,
      logComponent.toggleLogsTitle_.innerHTML);
}

function testToggleShowLogs_click() {
  var containerElem = document.createElement('div');

  var logComponent = new ccd.ui.TestResultLogs(mockTestResult);
  logComponent.render(containerElem);

  // Logs should be hidden by default.
  assertEquals(logComponent.innerLogsContainer_.className,
      ccd.ui.globals.Css.HIDDEN);
  assertEquals(SHOW_LOGS_TITLE_TEXT,
      logComponent.toggleLogsTitle_.innerHTML);

  // Simulate event.
  var clickEvent = new Event('click');
  logComponent.toggleLogsTitle_.dispatchEvent(clickEvent);

  // Logs should be exposed now.
  assertEquals(logComponent.innerLogsContainer_.className,
      'test-result-log-container');
  assertEquals(HIDE_LOGS_TITLE_TEXT,
      logComponent.toggleLogsTitle_.innerHTML);

  // Simulate event.
  var clickEvent = new Event('click');
  logComponent.toggleLogsTitle_.dispatchEvent(clickEvent);

  // Logs should now be hidden again.
  assertEquals(logComponent.innerLogsContainer_.className,
      ccd.ui.globals.Css.HIDDEN);
  assertEquals(SHOW_LOGS_TITLE_TEXT,
      logComponent.toggleLogsTitle_.innerHTML);
}


function testToggleShowLogs_enter() {
  var containerElem = document.createElement('div');

  var logComponent = new ccd.ui.TestResultLogs(mockTestResult);
  logComponent.render(containerElem);

  // Logs should be hidden by default.
  assertEquals(logComponent.innerLogsContainer_.className,
      ccd.ui.globals.Css.HIDDEN);
  assertEquals(SHOW_LOGS_TITLE_TEXT,
      logComponent.toggleLogsTitle_.innerHTML);

  // Simulate event.
  var enterEvent = new Event('keyup');
  enterEvent.type = 'keyup';
  enterEvent.keyCode = ccd.ui.globals.KeyCode.ENTER;
  logComponent.toggleLogsTitle_.dispatchEvent(enterEvent);

  // Logs should be exposed now.
  assertEquals(logComponent.innerLogsContainer_.className,
      'test-result-log-container');
  assertEquals(HIDE_LOGS_TITLE_TEXT,
      logComponent.toggleLogsTitle_.innerHTML);

  // Simulate event.
  var enterEvent = new Event('keyup');
  enterEvent.type = 'keyup';
  enterEvent.keyCode = ccd.ui.globals.KeyCode.ENTER;
  logComponent.toggleLogsTitle_.dispatchEvent(enterEvent);

  // Logs should now be hidden again.
  assertEquals(logComponent.innerLogsContainer_.className,
      ccd.ui.globals.Css.HIDDEN);
  assertEquals(SHOW_LOGS_TITLE_TEXT,
      logComponent.toggleLogsTitle_.innerHTML);
}
