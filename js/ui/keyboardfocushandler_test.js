// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Tests for ccd.test.ui.KeyboardFocusHandler.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.test.ui.KeyboardFocusHandler');

goog.require('ccd.ui.KeyboardFocusHandler');
goog.require('ccd.ui.globals');
goog.require('goog.testing.jsunit');

goog.setTestOnly('Tests for ccd.test.ui.KeyboardFocusHandler');


function testKeyboardFocusHandler() {
  var tabEvent = new Event('keyup');
  tabEvent.type = 'keyup';
  tabEvent.keyCode = ccd.ui.globals.KeyCode.TAB;

  var clickEvent = new Event('click');

  var keyboardFocusHandler = ccd.ui.KeyboardFocusHandler.getInstance();
  keyboardFocusHandler.attachFocusListeners();

  assertEquals(document.body.className, '');

  keyboardFocusHandler.onKeyDown_(tabEvent);
  assertEquals(document.body.className, '');

  keyboardFocusHandler.onMouseDown_(clickEvent);
  assertEquals('no-focus-outline', document.body.className);
}
