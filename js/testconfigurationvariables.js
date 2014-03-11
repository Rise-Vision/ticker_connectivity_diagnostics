// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Store configuration variables for tests.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.TestConfVars');


/**
 * Enum to store various configuration variables for tests.
 * @enum {number}
 */
ccd.TestConfVars = {
  RESOLVER_LATENCY_SLEEP_MILSEC: 100,

  TOTAL_TESTS_TIMEOUT_SEC: 120,

  XHR_SLEEP_MILSEC: 200
};
