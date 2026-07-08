const { spawn } = require("child_process");

function runCommand(command, args, input) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			stdio: ["pipe", "pipe", "pipe"],
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (chunk) => {
			stdout += chunk;
		});

		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});

		child.on("error", reject);

		if (input !== undefined && input !== null) {
			child.stdin.write(input);
			if (!String(input).endsWith("\n")) {
				child.stdin.write("\n");
			}
		}

		child.stdin.end();

		child.on("close", (code, signal) => {
			if (code === 0) {
				resolve({ stdout, stderr });
				return;
			}

			const error = new Error(
				stderr.trim() || `${command} exited with code ${code}`,
			);
			error.code = code;
			error.signal = signal;
			error.stdout = stdout;
			error.stderr = stderr;
			reject(error);
		});
	});
}

function parseSystemctlShow(output) {
	return output.split("\n").reduce((accumulator, line) => {
		if (!line) {
			return accumulator;
		}

		const separatorIndex = line.indexOf("=");
		if (separatorIndex === -1) {
			return accumulator;
		}

		const key = line.slice(0, separatorIndex);
		const value = line.slice(separatorIndex + 1);
		accumulator[key] = value;
		return accumulator;
	}, {});
}

function runSystemctl(args, password) {
	return runCommand("sudo", ["-S", "systemctl", ...args], password).then(
		(result) => result.stdout,
	);
}

function getSystemctlShow(serviceName) {
	return runCommand("systemctl", [
		"show",
		"--property=Description,ActiveState,SubState,UnitFileState,MainPID,MemoryCurrent,CPUUsageNSec,TasksCurrent,FragmentPath",
		serviceName,
	]).then((result) => parseSystemctlShow(result.stdout));
}

module.exports = {
	runSystemctl,
	getSystemctlShow,
	parseSystemctlShow,
};
