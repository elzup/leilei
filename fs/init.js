load("api_config.js");
load("api_mqtt.js");
load("api_net.js");
load("api_sys.js");
load("api_timer.js");
load("api_i2c.js");

let taddr = 0x44;
let daddr = 0x3e;
let bus = I2C.get_default();

let _clear = "\x0c";
let _displayOn = "\x01";
let _home = "\x02";
let _line2 = "\xc0";
let _data = "\x40";

let _loadTmp = "\x2C\x06";

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

	let data = I2C.read(bus, taddr, 6, true);

	print(data);

	let temp = data.at(0) * 256 + data.at(1);
	let cTemp = -45 + 175 * temp / 65535.0;
	let fTemp = -49 + 315 * temp / 65535.0;
	let humidity = 100 * (data.at(3) * 256 + data.at(4)) / 65535.0;

	return [temp, cTemp, fTemp, humidity];
};

let writeLCD = function() {
	// mojilist = [];
	// for (let i = 0; i < message.length; i++) {
	// 	// mojilist.push(ord())
	// }
	commandReg(_home, daddr);
	I2C.writeRegN(bus, daddr, 0x40, 2, "\x84\x58");
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

initDisplay();
Timer.set(
	1000 * 5,
	true /* repeat */,
	function() {
		let res = get_temps();
		writeLCD();
		print("t:");
		print(res[1]);
		print("h:");
		print(res[3]);
		// MQTT.pub('home/livingroom/brightness', JSON.stringify(lux), 0);
	},
	null
);
