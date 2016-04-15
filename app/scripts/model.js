'use strict';
function Kanban(name, numberOfColumns) {
	return {
		name: name,
		numberOfColumns: numberOfColumns,
		columns: [],
		archived: [],
		users: [],
		settings: {}
	};
}

function KanbanColumn(name){
	return {
		name: name,
		cards: [],
		settings: {}
	};
}

function KanbanColumn(name, settings){
	return {
		name: name,
		cards: [],
		settings: settings
	};
}

function KanbanCard(name, details, color, owner){
	this.name = name;
	this.details = details;
	this.color = color;
	this.owner = owner;
	return this;
}

function KanbanUser(name, initials, icon, color){
	this.name = name;
	this.initials = initials;
	this.icon = icon;
	this.color = color;
	return this;
}