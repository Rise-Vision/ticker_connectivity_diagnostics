// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Tests for utility functions in ccd.test.ui.StateManager.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.test.ui.StateManager');

goog.require('ccd.ui.StateManager');
goog.require('goog.testing.jsunit');

goog.setTestOnly('Tests for ccd.test.ui.StateManager');


function testEventRegistry() {
  var stateManager = ccd.ui.StateManager.getInstance();

  var aExpected = 'abc';
  var aActual = '';
  var isVisible = true;
  stateManager.addPassingTestsChangeCallback(function(isSetVisible) {
    aActual = aExpected;
    assertEquals(isVisible, isSetVisible);
  });
  stateManager.togglePassingTestVisibility();
  assertEquals(aActual, aExpected);

  // Reset A back to '' to ensure first registered function is still called.
  var aExpected = 'new_abc';
  var bExpected = 'xyz';
  var bActual = '';
  stateManager.addPassingTestsChangeCallback(function(isSetVisible) {
    bActual = bExpected;
    assertEquals(isVisible, isSetVisible);
  });
  isVisible = false;
  stateManager.togglePassingTestVisibility();
  assertEquals(bActual, bExpected);
  assertEquals(aActual, aExpected);
}
