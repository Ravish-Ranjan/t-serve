const blessed = require("blessed");
const { exec } = require("child_process");
const Database = require("better-sqlite3");

const db = new Database("services.db");

db.prepare(`create table if not exists services(service_id text primary key)`).run();

const addService = db.prepare("insert into services (service_id) values (?)");
const getAllServices = db.prepare("select * from services");
const deleteService = db.prepare("delete from services where service_id=?");
const searchServices = db.prepare("select * from services where service_id like ?")

const screen = blessed.screen({
	smartCSR: true,
	title: "T Serve",
});

function loadServices() {
	let rows = getAllServices.all();
	if (rows.length == 0) {
		addService.run("docker");
		addService.run("ollama");
		addService.run("ssh");
		rows = getAllServices.all();
	}
	return rows.map((s) => s.service_id);
}

let allServices = loadServices();
let services = allServices;

function filterServices(query) {
	query = query.toLowerCase();

	services = searchServices.all(`%${query}%`).map(s => s.service_id);

	list.clearItems();
	list.setItems(services);
	list.select(0);
	screen.render();
}

const list = blessed.list({
	parent: screen,
	label: " {bold}Services{/bold} ",
	width: "20%",
	height: "90%",
	border: { type: "line" },
	style: { selected: { bg: "blue", fg: "black" } },
	items: services,
	keys: true,
	mouse: true,
	tags: true,
});

const details = blessed.box({
	parent: screen,
	left: "20%",
	width: "80%",
	height: "90%",
	label: " {bold}Status Output{/bold} ",
	border: { type: "line" },
	scrollable: true,
	alwaysScroll: true,
	tags: true,
});

const footer = blessed.box({
	parent: screen,
	top: "90%",
	width: "100%",
	height: "10%",
	content:
		" {cyan-fg}[A]{/cyan-fg} Add | " +
		"{magenta-fg}[F]{/magenta-fg} Find | " +
		"{green-fg}[S]{/green-fg} Start | " +
		"{cyan-fg}[R]{/cyan-fg} Restart | " +
		"{red-fg}[X]{/red-fg} Stop | " +
		"{blue-fg}[M]{/blue-fg} Mask | " +
		"{blue-fg}[U]{/blue-fg} UnMask | " +
		"{magenta-fg}[E]{/magenta-fg} Enable | " +
		"{magenta-fg}[D]{/magenta-fg} Disable | " +
		"{red-fg}[Backsp/Del]{/red-fg} Delete | " +
		"{yellow-fg}[Q]{/yellow-fg} Quit",
	tags: true,
	valign: "middle",
});

const inputBox = blessed.textbox({
	parent: screen,
	top: "center",
	left: "center",
	width: "40%",
	height: 3,
	border: { type: "line" },
	hidden: true,
	inputOnFocus: true,
});

const question = blessed.question({
	parent: screen,
	top: "center",
	left: "center",
	width: "40%",
	height: "shrink",
	border: { type: "line" },
	label: " Confirm Action ",
	hidden: true,
});

const searchBox = blessed.textbox({
	parent: screen,
	top: "center",
	left: "center",
	width: "40%",
	height: 3,
	border: { type: "line" },
	label: " Search ",
	inputOnFocus: true,
	hidden: true,
});

function getStatus(serviceName) {
	if (!serviceName) {
		details.setContent("");
		return;
	}
	exec(`systemctl status ${serviceName}`, (err, stdout) => {
		const fullName = (stdout.match(/ - (.*)/) || ["", "Unknown"])[1];
		const activeMatch = (stdout.match(/Active: (.*)/) || [
			"",
			"unknown",
		])[1];
		const mainPid = (stdout.match(/Main PID: (\d+)/) || ["", "N/A"])[1];
		const memory = (stdout.match(/Memory: (.*)/) || ["", "N/A"])[1];
		const loadedLine = (stdout.match(/Loaded: (.*)/) || ["", ""])[1];

		const isActive = activeMatch.includes("active (running)");
		const isDisabled = loadedLine.includes("disabled");
		const isMasked = loadedLine.includes("masked");

		const content = [
			`{bold}${serviceName}{/bold} - ${fullName}`,
			`Active   : ${isActive ? "{green-fg}" : "{red-fg}"}${activeMatch}{/}`,
			`Disabled : ${isDisabled ? "{red-fg}yes{/}" : "{green-fg}no{/}"}`,
			`Masked   : ${isMasked ? "{red-fg}yes{/}" : "{green-fg}no{/}"}`,
			`Main PID : ${mainPid}`,
			`Memory   : ${memory}`,
		].join("\n");

		details.setContent(content);
		screen.render();
	});
}

let mode = "sudo";
let pendingAction = null;

const openInput = (label, isCensor, actionType) => {
	mode = actionType;
	inputBox.setLabel(` ${label} `);
	inputBox.censor = isCensor;
	inputBox.show();
	inputBox.focus();
	screen.render();
};

inputBox.key(["escape"], () => {
	inputBox.hide();
	inputBox.clearValue();
	list.focus();
	screen.render();
});

inputBox.on("submit", (value) => {
	if (mode === "sudo") {
		const selectedService = services[list.selected];
		const cmd = `echo "${value}" | sudo -S systemctl ${pendingAction} ${selectedService}`;
		exec(cmd, () => {
			inputBox.hide();
			inputBox.clearValue();
			list.focus();
			getStatus(selectedService);
		});
	} else if (mode === "add" && value.trim()) {
		const newService = value.trim();
		if (!services.includes(newService)) {
			addService.run(newService);
			list.clearItems();
			allServices = getAllServices.all().map((s) => s.service_id);
			services = [...allServices];
			list.setItems(services);
		}
		inputBox.hide();
		inputBox.clearValue();
		list.focus();
		screen.render();
	}
});

screen.key(["delete", "backspace"], () => {
	const selectedIndex = list.selected;
	const serviceName = services[selectedIndex];
	if (!serviceName) return;

	question.ask(
		`Are you sure you want to remove ${serviceName}?`,
		(err, data) => {
			if (data) {
				deleteService.run(serviceName);
				list.clearItems();
				allServices = getAllServices.all().map((s) => s.service_id);
				services = [...allServices];
				list.setItems(services);
				if (services.length > 0) {
					list.select(Math.max(0, selectedIndex - 1));
					getStatus(services[list.selected]);
				} else {
					details.setContent("{yellow-fg}No services left.{/}");
				}
			}
			screen.render();
		},
	);
});

searchBox.on("keypress", (ch,key) => {
	if (key.name === "escape" || key.name === "enter") return;
	setImmediate(() => {
		const value = searchBox.getValue();
		if (value.trim() == "") {
			services = [...allServices];
			list.clearItems();
			list.setItems(services);
			screen.render();
		} else filterServices(value);
	});
});

searchBox.key("escape", () => {
	searchBox.hide();
	searchBox.clearValue();

	services = [...allServices];
	list.clearItems();
	list.setItems(services);
	list.select(0);
	list.focus();

	screen.render();
});

searchBox.on("submit", () => {
	const value = searchBox.getValue();
	searchBox.hide();
	searchBox.clearValue();
	let idx = allServices.findIndex((s) => s.toLowerCase() === value.toLowerCase());
	services = [...allServices];
	list.clearItems();
	list.setItems(services);
	list.select(Math.max(0, idx));
	list.focus();
	screen.render();
});

screen.key(["a"], () => openInput("Enter Service Name", false, "add"));
screen.key(["s"], () => {
	pendingAction = "start";
	openInput("Enter Password", true, "sudo");
});
screen.key(["r"], () => {
	pendingAction = "restart";
	openInput("Enter Password", true, "sudo");
});
screen.key(["x"], () => {
	pendingAction = "stop";
	openInput("Enter Password", true, "sudo");
});
screen.key(["m"], () => {
	pendingAction = "mask";
	openInput("Enter Password", true, "sudo");
});
screen.key(["u"], () => {
	pendingAction = "unmask";
	openInput("Enter Password", true, "sudo");
});
screen.key(["e"], () => {
	pendingAction = "enable";
	openInput("Enter Password", true, "sudo");
});
screen.key(["d"], () => {
	pendingAction = "disable";
	openInput("Enter Password", true, "sudo");
});
screen.key(["f"], () => {
	searchBox.show();
	searchBox.focus();
	screen.render();
});
screen.key(["q", "C-c"], () => process.exit(0));

list.on("select item", () => getStatus(services[list.selected]));

list.focus();
if (services.length > 0) getStatus(services[0]);
screen.render();
