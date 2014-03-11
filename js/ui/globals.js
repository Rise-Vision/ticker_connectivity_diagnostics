// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Globals for the UI.
 * @author ebeach@google.com (Eric Beach)
 */

goog.provide('ccd.ui.globals');


/**
 * The last tab index number.
 * @type {number}
 */
ccd.ui.globals.lastTabIndex = 100;


/** @enum {number} */
ccd.ui.globals.KeyCode = {
  ENTER: 13,
  TAB: 9,
  ESCAPE: 27
};


/** @enum {string} */
ccd.ui.globals.Css = {
  HIDDEN: 'element-hidden'
};


/** @enum {string} */
ccd.ui.globals.DomIds = {
  PASSING_TESTS_CONTAINER: 'passing-tests-container'
};
