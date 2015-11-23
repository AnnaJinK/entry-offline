(function() {
	'use strict';

	var VERSION = 1.0;

	// initialize options
	var options = {};
	var gui = require('nw.gui');
	gui.App.argv.forEach(function(item, index) {
		if(item == '-debug') {
			options.debug = true;
		}
	});

	// gui.Window.get().showDevTools();

	// show devtools if console
	var win = gui.Window.get();
	if(options.debug) {
		win.showDevTools();
	}

	// language
	var translator = require('translator');
	var lang = translator.getLanguage();
	console.log('language: ' + lang);

	// logger
	var logger = {
		v: function(str) {
			console.log(str);
		},
		i: function(str) {
			console.info('%c' + str, 'color: dodgerblue');
		},
		w: function(str) {
			console.warn('%c' + str, 'color: orange');
		},
		e: function(str) {
			console.error('%c' + str, 'color: red');
		}
	};
	require('logger').set(logger);

	// server
	var server = require('entry');
	server.open(logger);

	// router
	var router = require('router').init(server);
	window.router = router;

	// flasher
	var flasher = require('flasher');

	// ui & control
	$('#driver').text(translator.translate('Install Device Driver'));
	$('#firmware').text(translator.translate('Install Firmware'));
	$('#other-robot .text').text(translator.translate('Connect Other Hardware'));
	$('#entry .text').text(translator.translate('Show Entry Web Page'));
	$('#reconnect .text').text(translator.translate('Reconnect Hardware'));

	var ui = {
		countRobot: 0,
		showRobotList: function() {
			router.close();
			$('#title').text(translator.translate('Select hardware'));
			$('#hwList').show();
			$('#hwPanel').hide();
			ui.showIeGuide();
			this.hideAlert();
		},
		showConnecting: function() {
			$('#title').text(translator.translate('hardware > connecting'));
			$('#hwList').hide();
			$('#hwPanel').show();
			ui.hideIeGuide();
			this.showAlert(translator.translate('Connecting Hardware'));
		},
		showConnected: function() {
			$('#title').text(translator.translate('hardware > connected'));
			$('#hwList').hide();
			$('#hwPanel').show();
			ui.hideIeGuide();
			this.showAlert(translator.translate('Hardware Device Connected.'), 2000);
		},
		showAlert: function(message, duration) {
			$('#alert').text(message);

			$('#alert').css({
				height: '0px'
			});
			$('#alert').animate({
				height: '35px'
			});

			if (duration) {
				setTimeout(function(){
					$('#alert').animate({
						height: '0px'
					});
				}, duration);
			}
		},
		hideAlert: function(message) {
			$('#alert').animate({
				height: '0px'
			});
		},
		addRobot: function(config) {
			ui.showRobotList();
			var name;
			if(config.name) {
				name = config.name[lang] || config.name['en'];
			}

			$('#hwList').append(
					'<div class="hardwareType" id="' + config.id + '">' +
					'<img class="hwThumb" src="../modules/' + config.icon + '">' +
					'<h2 class="hwTitle">' + name + '</h2></div>');

			$('#' + config.id).click(function() {
				ui.hardware = config.id.substring(0, 4);
				ui.numLevel = 1;
				if(config.level) {
					ui.numLevel = parseInt(config.level);
				}
				ui.showConnecting();
				router.startScan(config);

				var icon = '../modules/' + config.icon;
				$('#selectedHWThumb').attr('src', icon);

				$('#reconnect').click(function() {
					ui.showConnecting();
					router.startScan(config);
				});

				$('#driver').hide();
				$('#firmware').hide();
				if(config.driver) {
					var os = process.platform + '-' + (isOSWin64() ? 'x64' : process.arch);
					var driverPath = config.driver[os];
					if(driverPath) {
						$('#driver').show();
						$('#driver').unbind('click');
						$('#driver').click(function() {
							var path = require('path');
							gui.Shell.openItem(path.join(process.cwd() + '/drivers/', driverPath));
						});
					}
					if (config.firmware) {
						$('#firmware').show();
						$('#firmware').unbind('click');

						$('#firmware').click(function() {
							ui.flashFirmware(config.firmware, config);
						});
					}
				}
				if(config.description) {
					var connection = config.description.connection;
					if(connection) {
						var description = connection[lang] || connection['en'];
						$('#description').text(description);
					}
				}
			});
		},
		flashFirmware: function(firmware, config) {
			$('#firmware').hide();
			if (!router.connector) {
				alert(translator.translate('Hardware Device Is Not Connected'));
				return;
			}
			ui.showAlert(translator.translate("Firmware Uploading..."));
			var port = router.connector.sp.path;
			router.close();
			flasher.flash(
				firmware,
				port,
				function(error, stdout, stderr) {
					$('#firmware').show();
					console.log(error, stdout, stderr);
					ui.showAlert(translator.translate("Firmware Uploaded!"));
					router.startScan(config);
				}
			);
		},
		setState: function(state) {
			if(state == 'connected') {
				ui.showConnected();
				if(ui.numLevel > 1) {
					ui.showLevelPanel();
				} else {
					ui.level = 1;
				}
			} else if(state == 'lost') {
				$('#message').text(translator.translate('Connecting...'));
			} else if(state == 'disconnected') {
				ui.showConnecting();
				ui.showReconnectButton(true);
			}
		},
		quit: function() {
			win.close();
		},
		showIeGuide: function() {
			$('#ieGuide').show();
		},
		hideIeGuide: function() {
			$('#ieGuide').hide();
		}
	};

	$('#back.navigate_button').click(function(e) {
		ui.showRobotList();
	});

	$('.chromeButton').click(function(e) {
		window.open("https://www.google.com/chrome/browser/desktop/index.html");
	});


	function isOSWin64() {
  		return process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
	};

	// close
	win.on('close', function() {
		this.hide();
		router.close();
		server.close();
		if(ui.winEntry) {
			ui.winEntry.close(true);
			ui.winEntry = undefined;
		}
		this.close(true);
	});

	// state
	router.on('state', function(state) {
		ui.setState(state);
		server.setState(state);
	});

	// configuration
	var fs = require('fs');
	fs.readdir('./modules', function(error, files) {
		if(error) {
			logger.e(error);
			return;
		}
		files.filter(function(file) {
			return /(?:\.([^.]+))?$/.exec(file)[1] == 'json';
		}).forEach(function(file) {
			try {
				var config = fs.readFileSync('./modules/' + file);
				ui.addRobot(JSON.parse(config));
			} catch(e) {}
		});
	});
}());
