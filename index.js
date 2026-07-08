const {
	screen,
	list,
	details,
	inputBox,
	question,
	searchBox,
} = require("./ui");
const {
	loadServices,
	addService,
	deleteService,
	searchServices,
} = require("./database");
const {
	formatBytes,
	formatNanoseconds,
	formatCommandError,
} = require("./formatters");
const { runSystemctl, getSystemctlShow } = require("./systemd");

let allServices = loadServices();
let services = [...allServices];

let statusRequestId = 0;
let listStatusRequestId = 0;
let searchDebounceTimer = null;
const serviceStates = new Map();
const SERVICE_DIAMOND = "◆";
let suppressListSelection = false;

function getSelectedServiceName() {
	return services[list.selected] || null;
}

function validateServiceName(serviceName) {
	if (!serviceName) {
		return "Service name cannot be empty.";
	}

	if (!/^[A-Za-z0-9@._:-]+$/.test(serviceName)) {
		return "Service name can only contain letters, numbers, and @ . _ : - characters.";
	}

	return null;
}

function formatServiceItem(serviceName) {
	const activeState = serviceStates.get(serviceName);
	const color = activeState === "active" ? "green-fg" : activeState === "unknown" ? "white-fg" : "red-fg";

	return `{${color}}${SERVICE_DIAMOND}{/} ${serviceName}`;
}

function renderServiceList(selectedServiceName = getSelectedServiceName()) {
	suppressListSelection = true;

	try {
		list.clearItems();
		list.setItems(services.map(formatServiceItem));

		if (services.length > 0) {
			const selectedIndex = selectedServiceName
				? services.findIndex((service) => service === selectedServiceName)
				: 0;

			list.select(selectedIndex >= 0 ? selectedIndex : 0);
		} else {
			details.setContent("{yellow-fg}No services found.{/}");
		}

		screen.render();
	} finally {
		suppressListSelection = false;
	}
}

function refreshServiceStatuses(nextServices = services) {
	if (nextServices.length === 0) {
		return;
	}

	const requestId = ++listStatusRequestId;

	for (const serviceName of nextServices) {
		getSystemctlShow(serviceName)
			.then((status) => {
				if (requestId !== listStatusRequestId) {
					return;
				}

				serviceStates.set(serviceName, status.ActiveState || "unknown");
				renderServiceList();
			})
			.catch(() => {
				if (requestId !== listStatusRequestId) {
					return;
				}

				serviceStates.set(serviceName, "unknown");
				renderServiceList();
			});
	}
}

function refreshServiceList(nextServices, selectedServiceName = null) {
	services = [...nextServices];
	if (selectedServiceName) {
		renderServiceList(selectedServiceName);
	} else {
		renderServiceList();
	}
}

async function getStatus(serviceName) {
	const requestId = ++statusRequestId;

	if (!serviceName) {
		details.setContent("");
		screen.render();
		return;
	}

	try {
		const status = await getSystemctlShow(serviceName);
		const description = status.Description || "Unknown";
		const activeState = status.ActiveState || "unknown";
		const subState = status.SubState || "unknown";
		const unitFileState = status.UnitFileState || "unknown";
		const mainPid =
			status.MainPID && status.MainPID !== "0" ? status.MainPID : "N/A";
		const memory = formatBytes(status.MemoryCurrent);
		const cpu = formatNanoseconds(status.CPUUsageNSec);
		const tasks = status.TasksCurrent || "N/A";
		const fragmentPath = status.FragmentPath || "N/A";
		const activeColor = activeState === "active" ? "green-fg" : "red-fg";

		serviceStates.set(serviceName, activeState);

		const content = [
			`{bold}${serviceName}{/bold} - ${description}`,
			`Active   : {${activeColor}}${activeState}{/}${subState ? ` (${subState})` : ""}`,
			`Enabled  : ${unitFileState.startsWith("enabled") ? "{green-fg}yes{/}" : "{red-fg}no{/}"}`,
			`Masked   : ${unitFileState.includes("masked") ? "{red-fg}yes{/}" : "{green-fg}no{/}"}`,
			`Main PID : ${mainPid}`,
			`Memory   : ${memory}`,
			`CPU      : ${cpu}`,
			`Tasks    : ${tasks}`,
			`Path     : ${fragmentPath}`,
		].join("\n");

		if (requestId !== statusRequestId) {
			return;
		}

		serviceStates.set(serviceName, activeState);
		details.setContent(content);
		renderServiceList(serviceName);
	} catch (error) {
		if (requestId !== statusRequestId) {
			return;
		}

		details.setContent(formatCommandError(serviceName, error));
		screen.render();
	}
}

let mode = "sudo";
let pendingAction = null;

function closeInput() {
	inputBox.hide();
	inputBox.clearValue();
	list.focus();
	screen.render();
}

function openInput(label, isCensor, actionType) {
	mode = actionType;
	inputBox.setLabel(` ${label} `);
	inputBox.censor = isCensor;
	inputBox.show();
	inputBox.focus();
	screen.render();
}

inputBox.key(["escape"], closeInput);

inputBox.on("submit", async (value) => {
	if (mode === "sudo") {
		const selectedService = services[list.selected];
		const password = value || "";

		try {
			if (!selectedService || !pendingAction) {
				details.setContent(
					"{red-fg}No service selected for this action.{/}",
				);
				screen.render();
				return;
			}

			await runSystemctl([pendingAction, selectedService], password);
			await getStatus(selectedService);
		} catch (error) {
			details.setContent(
				formatCommandError(
					`${pendingAction} ${selectedService}`,
					error,
				),
			);
			screen.render();
		} finally {
			pendingAction = null;
			closeInput();
		}
		return;
	}

	if (mode === "add") {
		const newService = value.trim();
		const validationError = validateServiceName(newService);

		if (validationError) {
			details.setContent(`{red-fg}${validationError}{/}`);
			screen.render();
			inputBox.focus();
			return;
		}

		if (allServices.includes(newService)) {
			details.setContent("{red-fg}Service already exists in the watch list.{/}");
			screen.render();
			inputBox.focus();
			return;
		}

		try {
			addService(newService);
			allServices = loadServices();
			refreshServiceList(allServices, newService);
			await getStatus(newService);
		} catch (error) {
			details.setContent(formatCommandError(`add ${newService}`, error));
			screen.render();
		} finally {
			closeInput();
		}
	}
});

screen.key(["delete", "backspace"], () => {
	const selectedIndex = list.selected;
	const serviceName = services[selectedIndex];

	if (!serviceName) {
		return;
	}

	question.ask(
		`Are you sure you want to remove ${serviceName}?`,
		(err, data) => {
			if (err || !data) {
				screen.render();
				return;
			}

			deleteService(serviceName);
			allServices = loadServices();
			refreshServiceList(allServices);

			if (services.length > 0) {
				list.select(Math.max(0, selectedIndex - 1));
				getStatus(services[list.selected]);
			}
		},
	);
});

searchBox.on("keypress", (ch, key) => {
	if (key.name === "escape" || key.name === "enter") {
		return;
	}

	if (searchDebounceTimer) {
		clearTimeout(searchDebounceTimer);
	}

	searchDebounceTimer = setTimeout(() => {
		const value = searchBox.getValue();

		if (value.trim() === "") {
			refreshServiceList(allServices);
			return;
		}

		const filtered = searchServices(value);
		refreshServiceList(filtered);
	}, 120);
});

searchBox.key("escape", () => {
	if (searchDebounceTimer) {
		clearTimeout(searchDebounceTimer);
	}

	searchBox.hide();
	searchBox.clearValue();
	refreshServiceList(allServices);
	list.focus();
});

searchBox.on("submit", () => {
	if (searchDebounceTimer) {
		clearTimeout(searchDebounceTimer);
	}

	const value = searchBox.getValue();
	searchBox.hide();
	searchBox.clearValue();

	const index = allServices.findIndex(
		(service) => service.toLowerCase() === value.toLowerCase(),
	);

	refreshServiceList(allServices);
	list.select(Math.max(0, index));
	list.focus();
	screen.render();
});

screen.key(["a"], () => openInput("Enter Service Name", false, "add"));

const keyMap = {
	s: ["start", "Starting"],
	r: ["restart", "Restarting"],
	x: ["stop", "Stopping"],
	m: ["mask", "Masking"],
	u: ["unmask", "Unmasking"],
	e: ["enable", "Enabling"],
	d: ["disable", "Disabling"],
};

for (const key in keyMap) {
	if (!Object.hasOwn(keyMap, key)) continue;

	screen.key([key], () => {
		if (services.length === 0 || list.selected < 0) {
			details.setContent("{yellow-fg}No service selected.{/}");
			screen.render();
			return;
		}

		pendingAction = keyMap[key][0];
		openInput(
			`Enter Password (${keyMap[key][1]} ${services[list.selected]})`,
			true,
			"sudo",
		);
	});
}

screen.key(["f"], () => {
	searchBox.show();
	searchBox.focus();
	screen.render();
});
function exitApp() {
	if (searchDebounceTimer) {
		clearTimeout(searchDebounceTimer);
	}

	screen.destroy();
	process.exit(0);
}

screen.key(["q", "C-c"], exitApp);

list.on("select item", () => {
	if (suppressListSelection) {
		return;
	}

	getStatus(services[list.selected]);
});

list.focus();
if (services.length > 0) {
	refreshServiceList(allServices, services[0]);
	refreshServiceStatuses(allServices);
	getStatus(services[0]);
} else {
	details.setContent(
		"{yellow-fg}No services saved. Press [A] to add one.{/}",
	);
}
screen.render();
