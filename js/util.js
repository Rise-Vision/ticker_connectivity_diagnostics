// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Abstract utility class with helpful functions.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.util');


/**
 * Determine whether the client is running ChromeOS.
 * @return {boolean} Whether client running ChromeOS.
 */
ccd.util.isChromeOS = function() {
  var userAgent = ccd.util.getUserAgent();
  return (userAgent.indexOf(' CrOS ') != -1);
};


/**
 * Translate a microsecond timestamp (e.g., 1372094836900) to a string
 *   (e.g., "Mon Jun 24 2013 13:27:16 GMT-0400 (EDT)")
 * @param {number} microTimestamp Unix microtimestamp.
 * @return {string} Date formatted as "Mon Jun 24 2013 13:27:16 GMT-0400 (EDT)".
 */
ccd.util.printMicroTimestamp = function(microTimestamp) {
  var date = new Date(microTimestamp);
  return date.toString();
};


/**
 * Generate a random string.
 * @param {number} len Length of the random string to generate.
 * @return {string} Random string.
 */
ccd.util.getRandomString = function(len) {
  var randStr = '';
  var possibleChars = 'abcdefghijklmnopqrstuvwxyz';
  for (var i = 0; i < len; i++) {
    var rand = Math.floor(Math.random() * possibleChars.length);
    randStr += possibleChars.charAt(rand);
  }
  return randStr;
};


/**
 * Return the v2 packaged app version number.
 * @see http://developer.chrome.com/extensions/runtime.html#method-getManifest
 * @return {string} App version number.
 */
ccd.util.getAppVersion = function() {
  var manifest = chrome.runtime.getManifest();
  return manifest.version;
};


/**
 * Return the app's HTTP user-agent.
 * @return {string} CCD HTTP user-agent.
 */
ccd.util.getCcdUserAgent = function() {
  return ccd.util.getUserAgent() + ' CCD:' + ccd.util.getAppVersion();
};


/**
 * Get the HTTP user-agent.
 * @return {string} HTTP user-agent.
 */
ccd.util.getUserAgent = function() {
  return navigator.userAgent;
};
