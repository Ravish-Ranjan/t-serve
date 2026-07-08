function formatBytes(bytes) {
	const value = Number(bytes);
	if (!Number.isFinite(value) || value <= 0) {
		return "N/A";
	}

	const units = ["B", "KiB", "MiB", "GiB", "TiB"];
	let current = value;
	let unitIndex = 0;

	while (current >= 1024 && unitIndex < units.length - 1) {
		current /= 1024;
		unitIndex += 1;
	}

	return `${current.toFixed(current >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatNanoseconds(nanoseconds) {
	const value = Number(nanoseconds);
	if (!Number.isFinite(value) || value < 0) {
		return "N/A";
	}

	const seconds = Math.floor(value / 1_000_000_000);
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	return `${hours}h ${minutes}m ${remainingSeconds}s`;
}

function getServiceErrorMessage(error) {
	return error?.stderr?.trim() || error?.message || "Unknown error";
}

function formatCommandError(title, error) {
	const message = getServiceErrorMessage(error);
	const details = [
		`{bold}${title}{/bold}`,
		"",
		"{red-fg}Command failed{/}",
		`Reason   : ${message}`,
		`Exit code: ${error?.code ?? "N/A"}`,
	];

	if (error?.stderr?.trim()) {
		details.push(`Stderr   : ${error.stderr.trim()}`);
	}

	if (error?.stdout?.trim()) {
		details.push(`Stdout   : ${error.stdout.trim()}`);
	}

	return details.join("\n");
}

module.exports = {
	formatBytes,
	formatNanoseconds,
	formatCommandError,
};
