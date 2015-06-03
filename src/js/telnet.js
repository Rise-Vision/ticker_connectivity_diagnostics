// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Model a basic Telnet client to send/receive TCP commuincations
 *               and test whether there is a firewall.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.Telnet');



/**
 * Open a TCP connection with a specific host on a specific port.
 * @param {string} host Hostname to open a connection with.
 * @param {number} port Port number to connect on.
 * @param {ccd.TestResult} testResult Manage output logs.
 * @constructor
 */
ccd.Telnet = function(host, port, testResult) {
  /**
   * The TCP hostname to connect to.
   * @private {string}
   */
  this.host_ = host;

  /**
   * TCP destination port to connect to.
   * @private {number}
   */
  this.port_ = port;

  /**
   * Test result container to store information on the connection.
   * @private {ccd.TestResult}
   */
  this.testResult_ = testResult;

  /**
   * Whether the socket has been destroyed. Necessary to prevent
   *   potentially calling destroy on the socket multiple times if the
   *   chrome socket issues a callback after this class invokes its own
   *   timeout.
   * @private {boolean}
   */
  this.socketDestroyed_ = false;

  /**
   * ID of the timeout set by this class for a connection.
   * @private {number}
   */
  this.timeoutId_ = 0;

  /**
   * ID of socket used to connect to host.
   * @private {number}
   */
  this.socketId_ = -1;

  /**
   * ArrayBuffer of binary data to send to destination host.
   * @private {?ArrayBuffer}
   */
  this.abDataToSend_ = null;

  /**
   * ASCII text to send.
   * @private {string}
   */
  this.strDataToSend_ = '';

  /**
   * Optional function to call upon successful completion of the telnet session.
   * @private {?function(string)}
   */
  this.completedCallbackFnc_ = null;

  /**
   * Function to callback upon failure of the telnet session.
   * @private {?function(number)}
   */
  this.failureCallbackFnc_ = null;

  /**
   * Function to callback upon connection status being known, either failure
   *   or success.
   * @private {?function(number)}
   */
  this.connectionStatusKnownCallbackFnc_ = null;
};


/**
 * Timeout length enforced by this class on TCP connections.
 * @private {number}
 * @const
 */
ccd.Telnet.TCP_SOCKET_TIMEOUT_MILSEC_ = 10000;


/**
 * @see http://src.chromium.org/svn/trunk/src/net/base/net_error_list.h
 * @enum {number}
 */
ccd.Telnet.TcpConnStatus = {
  // TCP connection established successfully.
  SUCCESS: 0,

  // Connection failed to establish in some form.
  CONNECTION_FAILURE: -1,

  // A connection attempt timed out.
  CONNECTION_TIMED_OUT: -118,

  // A timeout occurred.
  TIMED_OUT: -7,

  // The host name could not be resolved. DNS resolution failed.
  NAME_NOT_RESOLVED: -105,

  // A connection attempt was refused.
  CONNECTION_REFUSED: -102,

  // The internet is disconnected.
  INTERNET_DISCONNECTED: -106
};


/**
 * Attempt to open the TCP connection and send the data passed thus far.
 */
ccd.Telnet.prototype.startConnection = function() {
  this.createSocket_();
};


/**
 * Set function to be called when telnet is finished.
 * @param {function(string)} fnc Function to call upon completion of
 *    the telnet session.
 */
ccd.Telnet.prototype.setCompletedCallbackFnc = function(fnc) {
  this.completedCallbackFnc_ = fnc;
};


/**
 * Set function to be called if connection fails to be established and
 *    no setConnectionStatusKnownCallbackFnc is set.
 * @param {function(number)} fnc Function to call upon failure of
 *    the telnet session.
 * @see http://src.chromium.org/svn/trunk/src/net/base/net_error_list.h
 */
ccd.Telnet.prototype.setFailureCallbackFnc = function(fnc) {
  this.failureCallbackFnc_ = fnc;
};


/**
 * Set function to be called when telnet connection status is established.
 * This function will be triggered as soon as the connection status is known,
 *   either success or some type of failure.
 * @param {function(number)} fnc Function to call upon
 *   knowing the status of a TCP connection.
 */
ccd.Telnet.prototype.setConnectionStatusKnownCallbackFnc = function(fnc) {
  this.connectionStatusKnownCallbackFnc_ = fnc;
};


/**
 * Set the text to send to the host.
 * @param {string} textToSend Text to send to the host.
 */
ccd.Telnet.prototype.setPlainTextDataToSend = function(textToSend) {
  this.strDataToSend_ = textToSend;
};


/**
  * Converts an array buffer to a string.
  * @param {ArrayBuffer} buf The buffer to convert.
  * @param {function(string)} callback The function to call when conversion
  *    is complete.
  * @private
  */
ccd.Telnet.prototype.arrayBufferToString_ = function(buf, callback) {
  // TODO(ebeach): Check data coming back from the socket to see if
  //   it is encoded in 16-bit chunks
  //   (e.g., "Content-Type:text/html; charset=utf-16") and then
  //   use a Unit16Array to view the ArrayBuffer data
  var str = String.fromCharCode.apply(null, new Uint8Array(buf));
  callback(str);
};


/**
 * Converts a string to an array buffer.
 * @param {string} str The string to convert.
 * @param {function(ArrayBuffer)} callback The function to call when
 *    conversion is complete.
 * @private
 */
ccd.Telnet.prototype.stringToArrayBuffer_ = function(str, callback) {
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  callback(buf);
};


/**
 * Receive string response from host.
 * @param {string} str Text received from destination host.
 * @private
 */
ccd.Telnet.prototype.receiveString_ = function(str) {
  this.testResult_.addLogRecord(
      chrome.i18n.getMessage('telnet_log_parsed_tcp_response') +
      str);
  var callback = this.completedCallbackFnc_;
  this.cleanup_();
  callback(str);
};


/**
 * Process the data read over the socket.
 * @param {chrome.socket.ReadInfo} readInfo Data read from the socket.
 * @see http://developer.chrome.com/apps/socket.html#type-ReadInfo
 * @private
 */
ccd.Telnet.prototype.onReadCompletedCallback_ = function(readInfo) {
  if (readInfo.resultCode > 0) {
    this.testResult_.addLogRecord(
        chrome.i18n.getMessage('telnet_log_parsed_response_size') +
        readInfo.resultCode);
    this.arrayBufferToString_(readInfo.data, this.receiveString_.bind(this));
  } else {
    this.testResult_.addLogRecord(
        chrome.i18n.getMessage('telnet_log_error_reading_tcp_data') +
        readInfo.resultCode);
    if (this.failureCallbackFnc_ != null) {
      var callback = this.failureCallbackFnc_;
      this.cleanup_();
      callback(readInfo.resultCode);
    }
  }
};


/**
 * Read data from the TCP socket.
 * @private
 */
ccd.Telnet.prototype.read_ = function() {
  chrome.socket.read(this.socketId_, this.onReadCompletedCallback_.bind(this));
};


/**
 * Function to call upon completing the writing of data.
 * @param {chrome.socket.WriteInfo} writeInfo Information about data
 *   written to host.
 * @see http://developer.chrome.com/apps/socket.html#type-WriteInfo
 * @private
 */
ccd.Telnet.prototype.onWriteCompleteCallback_ = function(writeInfo) {
  this.testResult_.addLogRecord(
      chrome.i18n.getMessage('telnet_log_successfully_sent_data') +
      writeInfo.bytesWritten);
  this.read_();
};


/**
 * Write binary data to destination host.
 * @private
 */
ccd.Telnet.prototype.write_ = function() {
  this.testResult_.addLogRecord(
      chrome.i18n.getMessage('telnet_log_preparing_to_send_data') +
      this.abDataToSend_.byteLength);

  chrome.socket.write(this.socketId_,
                      this.abDataToSend_,
                      this.onWriteCompleteCallback_.bind(this));
};


/**
 * Process socket information upon successful TCP connection with host.
 * ResultStatus is the network code specified in
 *   #chromium/src/net/base/net_error_list.h
 * @param {number} resultStatus Status code for TCP connection.
 * @private
 */
ccd.Telnet.prototype.onConnectedCallback_ = function(resultStatus) {
  this.testResult_.addLogRecord(
      chrome.i18n.getMessage('telnet_log_connection_established') +
      this.host_ +
      ' / ' + this.port_ + ' / ' + resultStatus);

  if (this.connectionStatusKnownCallbackFnc_ != null) {
    var callback = this.connectionStatusKnownCallbackFnc_;
    this.cleanup_();
    callback(resultStatus);

    // Return to prevent this function from continuing execution after the
    //   flow stops at in the callback.
    return;
  }

  var failureCallback = this.failureCallbackFnc_;
  if (resultStatus == ccd.Telnet.TcpConnStatus.CONNECTION_FAILURE) {
    this.testResult_.addLogRecord(
        chrome.i18n.getMessage('telnet_log_connection_failure') +
        this.host_ +
        ' / ' + this.port_ + ' / ' + resultStatus);
    this.testResult_.addLogRecord(
        chrome.i18n.getMessage('telnet_log_connection_failure_unknown'));
    this.cleanup_();
    failureCallback(ccd.Telnet.TcpConnStatus.CONNECTION_FAILURE);
    return;
  } else if (resultStatus == ccd.Telnet.TcpConnStatus.CONNECTION_TIMED_OUT) {
    this.testResult_.addLogRecord(
        chrome.i18n.getMessage('telnet_log_connection_failure') +
        this.host_ +
        ' / ' + this.port_ + ' / ' + resultStatus);
    this.testResult_.addLogRecord(
        chrome.i18n.getMessage('telnet_log_connection_failure_timeout'));
    this.cleanup_();
    failureCallback(ccd.Telnet.TcpConnStatus.CONNECTION_TIMED_OUT);
    return;
  } else if (resultStatus == ccd.Telnet.TcpConnStatus.CONNECTION_REFUSED) {
    this.testResult_.addLogRecord(
        chrome.i18n.getMessage('telnet_log_connection_failure') +
        this.host_ +
        ' / ' + this.port_ + ' / ' + resultStatus);
    this.testResult_.addLogRecord(
        chrome.i18n.getMessage('telnet_log_connection_failure_refused'));
    this.cleanup_();
    failureCallback(ccd.Telnet.TcpConnStatus.CONNECTION_REFUSED);
    return;
  }

  this.testResult_.addLogRecord(
      chrome.i18n.getMessage('telnet_log_connection_established_successfully') +
      this.host_ +
      ' / ' + this.port_);

  /**
   * Receive converted ArrayBuffer.
   * @param {ArrayBuffer} ab ArrayBuffer of information to send.
   * @private
   * @this {ccd.Telnet}
   */
  function receiveArrBuffer_(ab) {
    this.abDataToSend_ = ab;

    // Socket open, data converted to binary, ready to send it.
    this.write_();
  }
  this.testResult_.addLogRecord('going to write to host: ' + this.host_ + ' Data: ' + this.strDataToSend_);
  this.stringToArrayBuffer_(this.strDataToSend_, receiveArrBuffer_.bind(this));
};


/**
 * Create a TCP socket.
 * @private
 */
ccd.Telnet.prototype.createSocket_ = function() {
  /**
   * Process created socket information.
   * @see http://developer.chrome.com/apps/socket.html#type-CreateInfo
   * @param {chrome.socket.CreateInfo} createInfo Info on created socket.
   * @this {ccd.Telnet}
   * @private
   */
  function onCreated_(createInfo) {
    this.socketId_ = createInfo.socketId;
    this.testResult_.addLogRecord(
        chrome.i18n.getMessage('telnet_log_socket_created') +
        this.socketId_ + ' / ' + this.host_ + ' / ' + this.port_);
    chrome.socket.connect(this.socketId_,
                          this.host_,
                          this.port_,
                          this.onConnectedCallback_.bind(this));
  }

  // Set a timeout that is lower than the native TCP timeout.
  this.testResult_.addLogRecord(
      chrome.i18n.getMessage('telnet_log_tcp_timeout_setting') +
      ccd.Telnet.TCP_SOCKET_TIMEOUT_MILSEC_);
  if (ccd.Telnet.TCP_SOCKET_TIMEOUT_MILSEC_ > 0) {
    this.timeoutId_ = window.setTimeout(this.timeoutCallback_.bind(this),
                                        ccd.Telnet.TCP_SOCKET_TIMEOUT_MILSEC_);
  }

  chrome.socket.create('tcp', {}, onCreated_.bind(this));
};


/**
 * Perform operations to clean up the TCP socket and this cleass.
 * @private
 */
ccd.Telnet.prototype.cleanup_ = function() {
  window.clearTimeout(this.timeoutId_);

  // Check to see whether the socket still exists. It is possible that a
  //   the timeout specified in this.timeoutId_ triggered and the socket
  //   was destroyed, then a callback set before this.timeoutId_ triggered
  //   ran and this function was run again. An error will occur if we
  //   attempt to delete the same socket twice.
  if (this.socketDestroyed_) {
    return;
  }

  // Prevent the callback functions from potentially triggering if
  //   a function is executed from within chrome.socket that would
  //   otherwise trigger either the failure or timeout callback.
  this.failureCallbackFnc_ = null;
  this.connectionStatusKnownCallbackFnc_ = null;
  this.completedCallbackFnc_ = null;

  chrome.socket.disconnect(this.socketId_);
  chrome.socket.destroy(this.socketId_);
  this.socketDestroyed_ = true;
};


/**
 * The timeout implemented by this class has fired. See if there is a
 *   callback that should be executed and, if so, execute it.
 * @private
 */
ccd.Telnet.prototype.timeoutCallback_ = function() {
  if (this.connectionStatusKnownCallbackFnc_ != null) {
    var callback = this.connectionStatusKnownCallbackFnc_;
    this.cleanup_();
    callback(ccd.Telnet.TcpConnStatus.CONNECTION_TIMED_OUT);
  } else if (this.failureCallbackFnc_ != null) {
    var callback = this.failureCallbackFnc_;
    this.cleanup_();
    callback(ccd.Telnet.TcpConnStatus.CONNECTION_TIMED_OUT);
  }
};
