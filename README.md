Rise Ticker Network Diagnostics Utility
========================

Rise Ticker Network Diagnostics Utility is a Chrome App to debug various network connectivity issues.

It is a fork of the Connectivity Diagnostics tool included in Chromium and Chromium OS ([available here](https://chromium.googlesource.com/chromiumos/platform/assets/+/master/connectivity_diagnostics/))

I have modified it to use Node.js libraries to test STUN (with the help of [Browserify](http://browserify.org/) and [chrome-app-socket](https://github.com/feross/chrome-app-socket)).  Normally it is a compiled Closure app, but I have also configured it to run the original uncompiled source to make debugging possible.

To run the App unpackaged in Chrome, follow these steps:
  1. Download this project's source code to your computer
  2. Go to "Tools" -> "Extensions"
  3. Click the "Developer Mode" checkbox
  4. Click the "Load Unpacked Extension" button, and browse to this project's source code

The app should then run in a new window, without the usual chrome around the window.

To debug the app while it is running, right click anywhere on it and select "Inspect Element".  That should bring up the normal Chrome Developer Tools.

To compile the App, follow these steps:
  1. Make sure you have [Node.js](http://nodejs.org) installed.
  2. Install Grunt CLI globally (npm install -g grunt-cli).
  3. Install all Node dependencies (npm install).
  4. Install the Closure Compiler, following the instructions [here](https://github.com/gmarty/grunt-closure-compiler#closure-compiler-installation-from-source).
  5. Build the archive (grunt).
