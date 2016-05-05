'use strict';
function Kanban(id, name, numberOfColumns) {
	return {
	    id: id,
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

function KanbanCard(id, name, details, color, owner, createdOn, lastChange){
    this.id = id;
	this.name = name;
	this.details = details;
	this.color = color;
	this.owner = owner;
	this.createdOn = createdOn;
	this.lastChange = lastChange;
	return this;
}

function KanbanUser(id, name, initials, icon, color){
    this.id = id;
	this.name = name;
	this.initials = initials;
	this.icon = icon;
	this.color = color;
	return this;
}

