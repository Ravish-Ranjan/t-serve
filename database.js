const Database = require("better-sqlite3");

const db = new Database("services.db");

db.prepare(
	`create table if not exists services(service_id text primary key)`,
).run();

const addServiceStatement = db.prepare(
	"insert into services (service_id) values (?)",
);
const getAllServicesStatement = db.prepare("select * from services");
const deleteServiceStatement = db.prepare(
	"delete from services where service_id=?",
);
const searchServicesStatement = db.prepare(
	"select * from services where lower(service_id) like ?",
);

function loadServices() {
	return getAllServicesStatement.all().map((service) => service.service_id);
}

function addService(serviceId) {
	addServiceStatement.run(serviceId);
}

function deleteService(serviceId) {
	deleteServiceStatement.run(serviceId);
}

function searchServices(query) {
	return searchServicesStatement
		.all(`%${query.toLowerCase()}%`)
		.map((service) => service.service_id);
}

module.exports = {
	loadServices,
	addService,
	deleteService,
	searchServices,
};
