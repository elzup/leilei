load("api_config.js");
load("api_mqtt.js");
load("api_net.js");
load("api_sys.js");
load("api_timer.js");
load("api_i2c.js");

let address = 0x44;
let bus = I2C.get_default();

let get_temps = function() {
	// Get raw data
	let d = "\x2C\x06";
	I2C.write(bus, address, d, d.length, true);
	Sys.usleep(1000);

	let data = I2C.read(bus, address, 6, true);

	print(data);

	let temp = data.at(0) * 256 + data.at(1);
	let cTemp = -45 + 175 * temp / 65535.0;
	let fTemp = -49 + 315 * temp / 65535.0;
	let humidity = 100 * (data.at(3) * 256 + data.at(4)) / 65535.0;

	return [temp, cTemp, fTemp, humidity];
};

Timer.set(
	1000 * 5,
	true /* repeat */,
	function() {
		let res = get_temps();
		print("t:");
		print(res[1]);
		print("h:");
		print(res[3]);
		// MQTT.pub('home/livingroom/brightness', JSON.stringify(lux), 0);
	},
	null
);
