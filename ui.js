const blessed = require("blessed");

const screen = blessed.screen({
	smartCSR: true,
	title: "T Serve",
});

const list = blessed.list({
	parent: screen,
	label: " {bold}Services{/bold} ",
	width: "20%",
	height: "90%",
	border: { type: "line" },
	style: { selected: { bg: "yellow", fg: "black" } },
	items: [],
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

module.exports = {
	screen,
	list,
	details,
	footer,
	inputBox,
	question,
	searchBox,
};
