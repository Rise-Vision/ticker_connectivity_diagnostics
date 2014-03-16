// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Tests for utility functions in ccd.test.ui.HeaderComponent.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.test.ui.HeaderComponent');

goog.require('ccd.test.i18nTest');
goog.require('ccd.ui.HeaderComponent');
goog.require('goog.testing.jsunit');

goog.setTestOnly('Tests for ccd.test.ui.HeaderComponent');

var testContainerElemenr = null;
var containerElement = null;
var headerComponent = null;
var clickEvent = null;

function setUp() {
  testContainerElemenr = document.createElement('div');
  testContainerElemenr.id = 'test-container';
  document.body.appendChild(testContainerElemenr);

  containerElement = document.createElement('div');
  headerComponent = new ccd.ui.HeaderComponent();
  headerComponent.render(containerElement);

  clickEvent = new Event('click');
}


function tearDown() {
  testContainerElemenr.parentNode.removeChild(testContainerElemenr);
}


function testCloseBtn_clicked() {
  var expected = 'abc';
  var EXPECTED_FINAL = 'xyz';
  window.close = function() {
    expected = EXPECTED_FINAL;
  };

  headerComponent.topCloseBtnElem_.dispatchEvent(clickEvent);
  assertEquals(EXPECTED_FINAL, expected);
}


function testMaximizeBtn_chrome_startupsize_clicked() {
  var expected = 'abc';
  var EXPECTED_FINAL = 'xyz';

  ccd.flags.INIT_APP_WIDTH = 600;
  ccd.flags.INIT_APP_HEIGHT = 800;

  ccd.util.isChromeOS = function() {
    return false;
  };

  chrome.app = {};
  chrome.app.window = {};
  chrome.app.window.current = function() {
    return {
      moveTo: function(x, y) {
        fail('moveTo should not be called');
      },
      resizeTo: function(x, y) {
        fail('resizeTo should not be called');
      },
      maximize: function() {
        expected = EXPECTED_FINAL;
      },
      isMaximized: function() {
        fail('isMaximized should not be called with Chrome browser');
      },
      getBounds: function() {
        return {
          width: 600
        };
      }
    };
  };

  headerComponent.topMaximizeBtnElem_.dispatchEvent(clickEvent);
  assertEquals(EXPECTED_FINAL, expected);
}


function testMaximizeBtn_chrome_maximized_clicked() {
  var expected = 'abc';
  var EXPECTED_FINAL = 'xyz';

  var INITIAL_APP_WIDTH = 600;
  var INITIAL_APP_HEIGHT = 800;
  ccd.flags.INIT_APP_WIDTH = INITIAL_APP_WIDTH;
  ccd.flags.INIT_APP_HEIGHT = INITIAL_APP_HEIGHT;

  ccd.util.isChromeOS = function() {
    return false;
  };

  chrome.app = {};
  chrome.app.window = {};
  chrome.app.window.current = function() {
    return {
      moveTo: function(x, y) {},
      resizeTo: function(x, y) {
        if (x !== INITIAL_APP_WIDTH && y !== INITIAL_APP_HEIGHT) {
          fail('resizeTo should not be called');
        }
        expected = EXPECTED_FINAL;
      },
      maximize: function() {
        fail('resizeTo should not be called');
      },
      isMaximized: function() {
        fail('isMaximized should not be called with Chrome browser');
      },
      getBounds: function() {
        return {
          width: 1024
        };
      }
    };
  };

  headerComponent.topMaximizeBtnElem_.dispatchEvent(clickEvent);
  assertEquals(EXPECTED_FINAL, expected);
}


function helpTestSettingsMenuContainerElem(event) {
  assertEquals(ccd.ui.globals.Css.HIDDEN,
      headerComponent.settingsMenuContainerElem_.className);
  headerComponent.topSettingsBtnElem_.dispatchEvent(clickEvent);
  assertEquals('settings-visible',
      headerComponent.settingsMenuContainerElem_.className);
  headerComponent.topSettingsBtnElem_.dispatchEvent(clickEvent);
  assertEquals(ccd.ui.globals.Css.HIDDEN,
      headerComponent.settingsMenuContainerElem_.className);
}


function testShowSettingsBtn_clicked() {
  var clickEvent = new Event('click');
  helpTestSettingsMenuContainerElem(clickEvent);
}


function testShowSettingsBtn_enter() {
  var enterEvent = new Event('keyup');
  enterEvent.type = 'keyup';
  enterEvent.keyCode = ccd.ui.globals.KeyCode.ENTER;
  helpTestSettingsMenuContainerElem(enterEvent);
}


function helpTestShowPassingTestsElem(event) {
  var SHOW_PASSING_TESTS_TITLE_TEXT = 'Show Tests';
  var HIDE_PASSING_TESTS_TITLE_TEXT = 'Hide Tests';

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
    if (message === 'setting_hide_passing_test') {
      return HIDE_PASSING_TESTS_TITLE_TEXT;
    } else if (message === 'setting_show_passing_test') {
      return SHOW_PASSING_TESTS_TITLE_TEXT;
    } else {
      return 'i18n Message';
    }
  };

  tearDown();
  setUp();
  ccd.ui.StateManager.instance_.passingTestsShown_ = false;

  headerComponent.openSettingsMenu_();

  assertEquals(SHOW_PASSING_TESTS_TITLE_TEXT,
      headerComponent.passingTestsLinkElem_.innerHTML);
  headerComponent.passingTestsLinkElem_.dispatchEvent(clickEvent);

  headerComponent.openSettingsMenu_();
  assertEquals(HIDE_PASSING_TESTS_TITLE_TEXT,
      headerComponent.passingTestsLinkElem_.innerHTML);
}


function testShowPassingTestBtn_clicked() {
  var clickEvent = new Event('click');
  helpTestShowPassingTestsElem(clickEvent);
}


function testShowPassingTestBtn_enter() {
  var enterEvent = new Event('keyup');
  enterEvent.type = 'keyup';
  enterEvent.keyCode = ccd.ui.globals.KeyCode.ENTER;
  helpTestShowPassingTestsElem(enterEvent);
}
