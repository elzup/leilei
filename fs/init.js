load("api_config.js");
load("api_mqtt.js");
load("api_net.js");
load("api_sys.js");
load("api_timer.js");
load("api_i2c.js");

load("secret.js");

let taddr = 0x44;
let daddr = 0x3e;
let bus = I2C.get_default();

let _clear = "\x0c";
let _displayOn = "\x01";
let _line1 = "\x02";
let _line2 = "\xc0";
let _data = "\x40";

let _loadTmp = "\x2C\x06";
let _softReset = "\x00\x06";

let command = function(code, addr) {
	I2C.write(bus, addr, code, code.length, true);
	Sys.usleep(100);
};

let commandReg = function(code, addr) {
	I2C.writeRegN(bus, addr, 0x00, code.length, code);
	Sys.usleep(100);
};

let get_temps = function() {
	// Get raw data
	command(_loadTmp, taddr);

	let data = I2C.read(bus, taddr, 6, false);
	command(_softReset, taddr);

	let temp = data.at(0) * 256 + data.at(1);
	let cTemp = -45 + 175 * temp / 65535.0;
	let fTemp = -49 + 315 * temp / 65535.0;
	let humidity = 100 * (data.at(3) * 256 + data.at(4)) / 65535.0;

	return [temp, cTemp, fTemp, humidity];
};

let writeLCD = function(d, line) {
	commandReg(line, daddr);
	I2C.writeRegN(bus, daddr, 0x40, d.length, d);
};

let initDisplay = function() {
	commandReg("\x38", daddr);
	commandReg("\x39", daddr);
	commandReg("\x14", daddr);
	commandReg("\x70", daddr);
	commandReg("\x56", daddr);
	commandReg("\x6c", daddr);
	commandReg("\x38", daddr);
	commandReg("\x06", daddr);
	commandReg(_clear, daddr);
	commandReg(_displayOn, daddr);
};

let LC_T = "\x54";
let LC_H = "\x48";
let LC_COLON = "\x3a";
let LC_DOT = "\x2e";
let LC_EMP = "\x20";
let LC_NUM = [
	"\x30",
	"\x31",
	"\x32",
	"\x33",
	"\x34",
	"\x35",
	"\x36",
	"\x37",
	"\x38",
	"\x39"
];

function writeLCDTemp(v) {
	let d = LC_T + LC_COLON + LC_EMP + fdataToLC(v);
	writeLCD(d, _line1);
}

function writeLCDHumi(v) {
	let d = LC_H + LC_COLON + LC_EMP + fdataToLC(v);
	writeLCD(d, _line2);
}

function fdataToLC(fv) {
	let d3 = (fv / 100) % 10;
	let d2 = (fv / 10) % 10;
	let d1 = fv % 10;
	let df = (fv * 10) % 10;
	return (
		(d3 > 0 ? LC_NUM[d3] : LC_EMP) +
		LC_NUM[d2] +
		LC_NUM[d1] +
		LC_DOT +
		LC_NUM[df]
	);
}

// main

function tsval(v) {
	return JSON.stringify(((v * 100) % 1) / 100);
}

initDisplay();
Timer.set(
	1000 * 60,
	true /* repeat */,
	function() {
		let res = get_temps();
		writeLCDTemp(res[1]);
		writeLCDHumi(res[3]);
		let v = "field1=" + tsval(res[1]) + "&field2=" + tsval(res[3]);
		print(v);

		MQTT.pub(secret.mqtt.channel, v, 0);
	},
	null
);
