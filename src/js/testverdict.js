// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Enum to represent the verdict of a test.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.TestVerdict');


/**
 * Enum to store the result/verdict of a specific test (e.g., whether a
 *   problem was detected).
 * @enum {number}
 */
ccd.TestVerdict = {
  // Test successfully and found no connectivity problem.
  NO_PROBLEM: 0,

  // Test completed successfully and found a possible connectivity problem.
  POTENTIAL_PROBLEM: 1,

  // Test completed successfully and found a connectivity problem.
  PROBLEM: 2,

  // During the process of the test, a failure occurred and the test did
  //   not complete running.
  // A failure is different than a PROBLEM or POTENTIAL_PROBLEM as
  //   a failure indicates that the test couldn't even complete to reach
  //   a verdict (regardless of whether that verdict is PROBLEM or NO_PROBLEM).
  TEST_FAILURE_OCCURRED: 3,

  // The test has not been run.
  TEST_NOT_RUN: 4
};
