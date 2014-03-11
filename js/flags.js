// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Flags for the CCD application.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.flags');


/**
 * @enum {string|number|boolean}
 */
ccd.flags = {
  LAUNCH_SOURCE: 'OfflineChromeOS',
  INIT_APP_WIDTH: 676,
  INIT_APP_HEIGHT: 600,
  MENU_OPTION_TO_RERUN_TESTS: true,
  MENU_OPTION_TO_SEND_CHROME_FEEDBACK: true,
  RUN_TEST_CHROMEOS_VERSION: false,
  RUN_TEST_CHROME_VERSION: false
};
