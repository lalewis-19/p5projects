// p5js
var canvas;

var blockSize = 32; // pixels
var mapName = "";
var mapData;

// all arrays
var buildings;
var people;
var years; // different weather
var repeatYears; // after years complete cycle through this

// currently owned
var stone = 0.0;
var wood = 50.0;
var food = 120.0;

// recieved per person working per year
var foodProduction = 5.0;
var stoneProduction = 0.5;
var woodProduction = 1.0;

// seconds to one year TODO
var secondsPerYear = 8;
var gameYear = 0.0;
var speeds = [{name:"x1/2", speed: 35}, {name:"x1", speed: 20}, {name:"x2", speed: 15}, {name:"x4", speed: 10}, {name:"x8", speed: 5}];
var speedIndex = 1;

// food eaten per person per year
var foodConsumption = 0.5;

// burning
var burnDamage = 50;
var buildingRegenRate = 1; // TODO improve!

// people
var personHealth = 100.0;
var personSpeed = 640.0; // pixels traveled in a year
var personSpeedRandom = 240; // +/- from the personSpeed
var personLove = 5; // chance to fall in love % increase every year.
var repopulating = true;

// images
var ss;
var backgroundImage;

// game boolean => used to pause and resume game
var running = true;

// changes the display
var debugMode;
var debugKey = 192; // ascii code for `

// TODO: https://www.1001fonts.com/dpcomic-font.html
var font;


var mouseBuildingController, mouseResourcesController;

class AnimatedSpriteCounter {
	constructor(speed, imgs){
		this.speed = speed;
		this.imgs = imgs;
		this.index = 0;
		this.lastTime = new Date().getTime();
	}

	setSpeed(speed){
		this.speed = speed;
	}

	getSpeed(){
		return this.speed;
	}

	updateIndex(){
		var interval = 1/(this.imgs*this.speed);
		if (new Date().getTime()-this.lastTime>=interval){
			this.lastTime = new Date().getTime();
			this.index++;
			if (this.index>=this.imgs)
				this.index = 0;
		}
	}

	getIndex(update = true){
		if (update)
			this.updateIndex();
		return this.index;
	}
}

class Sprite {
	constructor(imgs){
		this.imgs = imgs;
	}

	drawSprite(x, y, w, h, i = 0){
		this.imgs[i].drawSprite(x, y, w, h);
	}

	getImage(i){
		return this.imgs[i];
	}

	imageLength(){
		return this.imgs.length;
	}
}

class SpriteImage {
	constructor(x, y, w, h){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	drawSprite(x, y, w, h){
		image(ss, x, y, w, h, this.x, this.y, this.w, this.h);
	}

	getX(){
		return this.x;
	}

	getY(){
		return this.y;
	}

	getWidth(){
		return this.w;
	}

	getHeight(){
		return this.h;
	}

}

class MouseController{
	constructor(){
		this.control = false;
	}

	onMouseMoved(){}
	onMousePressed(){}
	draw(){}

	giveControl(){
		this.control = true;
	}

	removeControl(){
		this.control = false;
	}

	hasControl(){
		return this.control;
	}
}

class ResourcesMouseController extends MouseController{
	constructor(){
		super();
	}
	
	draw(){
		if (this.hasControl()){
			updateResourcesHtml();
		}
	}
}

class BuildingMouseController extends MouseController{
	constructor(){
		super();
		this.building = BUILDING_TYPE.EMPTY;
		this.index = 0;
	}

	open(building){
		this.building = building;
		openBuildingMouseController();
	}

	draw(){
		if (this.hasControl())
			this.building.sprite.drawSprite(this.index*blockSize, height-blockSize*2,blockSize,blockSize)
	}

	onMouseMoved(){
		this.index = parseInt(limit(mouseX/blockSize, buildings.length-1, 0));
	}

	onMousePressed(){
		if (!this.hasControl())
			return;
		if (this.building == BUILDING_TYPE.EMPTY)
			buildings[index].resetType();
		buildBuilding(this.building, this.index);
	}

	getIndex(){
		return this.index;
	}
}

const SPRITES = {
	GRASS_BLOCK: new Sprite([new SpriteImage(0, 0, 32, 32)]),
	WOODEN_HOUSE: new Sprite([new SpriteImage(32, 0, 32, 32)]),
	FORREST: new Sprite([new SpriteImage(64, 0, 32, 32)]),
	FARM: new Sprite([new SpriteImage(96, 0, 32, 32)]),
	QUARRY: new Sprite([new SpriteImage(128, 0, 32, 32)]),
	STONE_HOUSE: new Sprite([new SpriteImage(160, 0, 32, 32)]),
	GRASS: new Sprite([new SpriteImage(192, 0, 32, 32)]),
	BUILDING_FIRE: new Sprite([new SpriteImage(224, 0, 32, 32)]),
	// weather
	RAIN_STRAIGHT: new Sprite([new SpriteImage(288, 64, 32, 32),
		new SpriteImage(288, 96, 32, 32),new SpriteImage(288, 128, 32, 32),
		new SpriteImage(288, 160, 32, 32),new SpriteImage(288, 192, 32, 32),
		new SpriteImage(288, 224, 32, 32),new SpriteImage(288, 256, 32, 32),
		new SpriteImage(288, 288, 32, 32)]),
	SNOW_STRAIGHT: new Sprite([new SpriteImage(256, 64, 32, 32),
		new SpriteImage(256, 96, 32, 32),new SpriteImage(256, 128, 32, 32),
		new SpriteImage(256, 160, 32, 32),new SpriteImage(256, 192, 32, 32),
		new SpriteImage(256, 224, 32, 32),new SpriteImage(256, 256, 32, 32),
		new SpriteImage(256, 288, 32, 32)]),
	LIGHTNING_RIGHT: new Sprite([new SpriteImage(32, 32, 16, 32)]),
	LIGHTNING_LEFT: new Sprite([new SpriteImage(48, 32, 15, 31)]), // check values
	// power effects - unused
	LIGHTNING_POWER_ACTIVE: new Sprite([new SpriteImage(64, 32, 32, 32)]),
	LIGHTNING_POWER_UNACTIVE: new Sprite([new SpriteImage(96, 32, 32, 32)]),
	SUN_POWER_ACTIVE: new Sprite([new SpriteImage(128, 32, 32, 32)]),
	SUN_POWER_UNACTIVE: new Sprite([new SpriteImage(160, 32, 32, 32)]),
	SPAWN_POWER_ACTIVE: new Sprite([new SpriteImage(192, 32, 32, 32)]),
	SPAWN_POWER_UNACTIVE: new Sprite([new SpriteImage(224, 32, 32, 32)]),
	// character models
	CHAR1_MALE: new Sprite([new SpriteImage(0, 64, 16, 32)]),
	CHAR1_FEMALE: new Sprite([new SpriteImage(16, 64, 16, 32)]),
	CHAR1_MALE_FIRE: new Sprite([new SpriteImage(32, 64, 16, 32)]),
	CHAR1_FEMALE_FIRE: new Sprite([new SpriteImage(48, 64, 16, 32)]),
	CHAR2_MALE: new Sprite([new SpriteImage(0, 96, 16, 32)]),
	CHAR2_FEMALE: new Sprite([new SpriteImage(16, 96, 16, 32)]),
	CHAR2_MALE_FIRE: new Sprite([new SpriteImage(32, 96, 16, 32)]),
	CHAR2_FEMALE_FIRE: new Sprite([new SpriteImage(48, 96, 16, 32)])
}

function preload(){
	// https://ff.static.1001fonts.net/d/p/dpcomic.regular.ttf
	font = loadFont("fonts/dpcomic.ttf");
	ss = loadImage("images/ss.png");
	backgroundImage = loadImage("https://i.imgur.com/bLxcjh3.jpg");
	var url_string = window.location.href;
	var url = new URL(url_string);
	var map = url.searchParams.get("map");
	var mapLoc = "maps/test-map.json";
	if (map!=null){
		mapLoc = "maps/"+map+".json";
	}
	mapData = loadJSON(mapLoc, loadMap);
}

function setup() {
	debugMode = false;

	// setup canvas
	canvas = createCanvas(640, 320);

	// TODO: there is an issue where the mouseMoved() is being called before mouseBuildingController
	// is initialized.
	mouseBuildingController = new BuildingMouseController();
	mouseResourcesController = new ResourcesMouseController();

	secondsPerYear = speeds[speedIndex].speed;

	//Tutorial1
	//Tutorial1
	// only recieve mouse input when clicked on canvas
	canvas.mousePressed(onMousePressed);

	// assign canvas to html div
	canvas.parent("canvas-holder");

	setFrameRate(30);
}

/**
 * called when the a key is realesed
 */
function keyReleased(){	
	//console.log(keyCode);
	if (keyCode==debugKey){
		debugMode = !debugMode;
		console.log("debug mode: " + debugMode);
	}
}

/**
 * draw from p5js
 */
function draw() {
	updateControllerHtml();
	mouseResourcesController.draw();
	textFont(font);
	if (running && getFrameRate() != 0 && secondsPerYear != 0){
		gameYear += 1/(getFrameRate()*secondsPerYear);
	}
	//background(255);
	//new Sprite(0, 32, 32, 32).drawSprite(0, 0, 640, 320);
	///*
	image(backgroundImage, 0, 0, width, height);
	//console.log(getFrameRate());
	//builderAI();
	for (var q = 0; q < buildings.length; q++){
		// draw grass below building
		SPRITES.GRASS_BLOCK.drawSprite(q*blockSize, height-blockSize, blockSize, blockSize);
		if (mouseBuildingController.hasControl() && mouseBuildingController.getIndex()==q)
			continue;
		buildings[q].draw(q*blockSize);
		if (running)
			buildings[q].update();
	}
	mouseBuildingController.draw();
	for (var q = 0; q < people.length; q++){
		people[q].draw();
		if (running)
			people[q].update();
	}
	// update and draw weather
	getCurrentWeather().update();
	getCurrentWeather().draw();
	// darkness from weather
	var maxDark = 120;
	fill(0, 0, 0, maxDark-maxDark*getCurrentWeather().getLighting());
	noStroke();
	rect(0, 0, width, height);
	textAlign(CENTER);
	textSize(20);
	// draw year
	fill(99,83,32);
	stroke(0);
	var sideLength = 32;
	rect(width/2-sideLength, 0, sideLength*2, 32);
	
	fill(255);
	stroke(0);
	text("YEAR", width/2, 16);
	text(""+parseInt(gameYear), width/2, 30);
	textAlign(RIGHT);
	text(weathText, width-padding, 12+padding);

	// weather
	fill(99,83,32);
	stroke(0);
	textSize(16);
	var weathText = "Weather: " + getCurrentWeather().getName();
	var padding = 6;
	var weathWidth = textWidth(weathText)+padding*2;
	rect(width-weathWidth, 0, weathWidth, 12+padding*2);

	fill(255);
	stroke(0);
	textAlign(RIGHT);
	text(weathText, width-padding, 12+padding);

	// map
	fill(99,83,32);
	stroke(0);
	textSize(16);
	var weathText = "Map: " + mapName;
	var padding = 6;
	var weathWidth = textWidth(weathText)+padding*2;
	rect(0, 0, weathWidth, 12+padding*2);

	fill(255);
	stroke(0);
	textAlign(LEFT);
	text(weathText, padding, 12+padding);

	// testing
}

function pause(){
	running = false;
}

function resume(){
	running = true;
}

function toggleGameRunning(){
	if (running){
		pause();
	} else {
		resume();
	}
}

function mouseMoved(){
	mouseBuildingController.onMouseMoved();
}

function openBuildingMouseController(){
	removeAllMouseControllers();
	mouseBuildingController.giveControl();
}

function openResourcesMouseController(){
	removeAllMouseControllers();
	mouseResourcesController.giveControl();
}

function removeAllMouseControllers(){
	mouseBuildingController.removeControl();
	mouseResourcesController.removeControl();
}

/**
 * @returns a number limited by the bounds given.
 * @param {*} value raw number.
 * @param {*} max the maximum number allowed.
 * @param {*} min the minimum number allowed.
 */
function limit(value, max, min){
	return Math.max(min, Math.min(value, max));
}

function onMousePressed(){
	mouseBuildingController.onMousePressed();
	mouseResourcesController.onMousePressed();
}

function closeAllPopups(){
	removeAllMouseControllers();
	var popups = document.getElementsByClassName("popups");
	for(var q = 0; q < popups.length; q++){
		popups[q].style.display = "none";
	}
}

function openPopup(id){
	closeAllPopups();
	document.getElementById(id).style.display = "block";
}

function openBuilding(){
	openPopup("popup-building");
	updateMouseBuilding();
}

function openResources(){
	openPopup("popup-resources");
	openResourcesMouseController();
}

function updateMouseBuilding(){
	var buildingSelected = document.querySelector('input[name="building-button"]:checked').value;
	switch (buildingSelected){
		case "REMOVE":
			mouseBuildingController.open(BUILDING_TYPE.EMPTY)
			break;
		case "WOODEN_HOUSE":
			mouseBuildingController.open(BUILDING_TYPE.WOODEN_HOUSE)
			break;
		case "STONE_HOUSE":
			mouseBuildingController.open(BUILDING_TYPE.STONE_HOUSE)
			break;
		case "FARM":
			mouseBuildingController.open(BUILDING_TYPE.FARM)
			break;
		case "FORREST":
			mouseBuildingController.open(BUILDING_TYPE.FORREST)
			break;
		case "QUARRY":
			mouseBuildingController.open(BUILDING_TYPE.QUARRY)
			break;
	}
}

/**
 * toggles whether or not the peasants are repopulating.
 */
function toggleRepopulation(){
	repopulating = !repopulating;
}

/**
 * @returns true needFarmers() returns false and needFoodProduction returns true.
 */
function needFarms(){
	return !needFarmers() && needFoodProduction();
}

/**
 * @returns true if there are more farms then there are farmers.
 */
function needFarmers(){
	return getUseableBuildingsByType(BUILDING_TYPE.FARM) > getPeopleByOccupation(OCCUPATION.FARMER);
}

/**
 * @returns true if getTotalFoodProduction() is less than getTotalFoodConsumption() * 1.5.
 */
function needFoodProduction(){
	return getTotalFoodProduction() < getTotalFoodConsumption()*1.5;
}

/**
 * @returns true if getPopulation() is greater than getTotalHousingSpace().
 */
function needHouses(){
	return getPopulation() > getTotalHousingSpace() || 
			(getBuildingsByType(BUILDING_TYPE.STONE_HOUSE) == 0 && 
			getBuildingsByType(BUILDING_TYPE.WOODEN_HOUSE) == 0);
}

/**
 * @returns true if needForrestWorkers() is false and there is not a forrest for every 10 people.
 * TODO: this is currently designed to have a forrest every 10 people.
 */
function needForrests(){
	return !needForrestWorkers() && getPopulation()/10 >= getForrests();
}

/**
 * @returns true if there are more forrests than forrest workers.
 */
function needForrestWorkers(){
	return getUseableBuildingsByType(BUILDING_TYPE.FORREST) > getPeopleByOccupation(OCCUPATION.FORREST_WORKER);
}

/**
 * @returns true if needQuarryWorkers() is false and there is not a quarry for every 15 people.
 * TODO: this is currently designed to have a quarry every 15 people.
 */
function needQuarries(){
	return !needQuarryWorkers() && getPopulation()/15 >= getQuarries();
}

/**
 * @returns true if there are more quarries than there are quarry workers.
 */
function needQuarryWorkers(){
	return getUseableBuildingsByType(BUILDING_TYPE.QUARRY) > getPeopleByOccupation(OCCUPATION.QUARRY_WORKER);
}

/**
 * @returns people.length
 */
function getPopulation(){
	return people.length;
}

/**
 * @returns the number of farms.
 */
function getFarms(){
	return getBuidlingsByType(BUILDING_TYPE.FARM);
}

/**
 * @returns the number of forrests.
 */
function getForrests(){
	return getBuildingsByType(BUILDING_TYPE.FORREST);
}

/**
 * @returns the number of quarries.
 */
function getQuarries(){
	return getBuildingsByType(BUILDING_TYPE.QUARRY);
}

/**
 * @returns the sum of buildings that match the building type.
 * @param {Object} bType the BUILDING_TYPE value for which building it is.
 */
function getBuildingsByType(bType){
	var sum = 0;
	for (var q = 0; q < buildings.length; q++){
		if (buildings[q].getType()==bType){
			sum++;
		}
	}
	return sum;
}

/**
 * @returns the sum of the buildings that match the building type
 * @param {Object} bType the BUILDING_TYPE value for which building it is.
 */
function getUseableBuildingsByType(bType){
	var sum = 0;
	for (var q = 0; q < buildings.length; q++){
		if (buildings[q].getType()==bType && buildings[q].isUseable()){
			sum++;
		}
	}
	return sum;
}

/**
 * toggles the speed of the game between the values in speeds.
 */
function toggleSpeed(){
	speedIndex++;
	if (speedIndex >= speeds.length)
		speedIndex = 0;
	secondsPerYear = speeds[speedIndex].speed;
	updateControllerHtml();
}

/**
 * @returns the sum of the buildings that do not match the building type.
 * @param {Object} bType the BUILDING_TYPE value for which building it is not.
 */
function getBuildingsNotByType(bType){
	var sum = 0;
	for (var q = 0; q < buildings.length; q++){
		if (buildings[q].getType()!=bType){
			sum++;
		}
	}
	return sum;
}

/**
 * @returns the sum of the people that match that occupation.
 * @param {Object} occ the OCCUPAITON value for the person.
 */
function getPeopleByOccupation(occ){
	var sum = 0;
	for (var q = 0; q < people.length; q++){
		if (people[q].getOccupation()==occ){
			sum++;
		}
	}
	return sum;
}

/**
 * @returns the sum of the buildings housing space.
 */
function getTotalHousingSpace(){
	var sum = 0;
	for (var q = 0; q < buildings.length; q++){
		sum+=buildings[q].getHousingSpace();
	}
	return sum;
}

/**
 * @returns the potential total food production if every farm is being used.
 */
function getTotalFoodProduction(){
	var sum = 0;
	for (var q = 0; q < buildings.length; q++){
		if (buildings[q].getType()==BUILDING_TYPE.FARM){
			sum+=buildings[q].getHousingSpace()*foodProduction;
		}
	}
	return sum;
}

/**
 * @returns the current total food production of the farms being used.
 */
function getCurrentFoodProduction(){
	var sum = 0;
	for (var q = 0; q < buildings.length; q++){
		if (buildings[q].getType()==BUILDING_TYPE.FARM){
			sum+=buildings[q].getInhabitants()*foodProduction;
		}
	}
	return sum;
}

/**
 * @returns the total food consumption of the town as whole per second.
 */
function getTotalFoodConsumption(){
	return people.length*foodConsumption;
}

/**
 * kills a random person.
 */
function randomDeath(){
	var index = Math.random()*people.length;
	console.log(index);
	people[parseInt(index)].die("testing");
}

/**
 * @returns a random index in buildings that is empty. -1 if there are no empty slots.
 */
function getOpenLand(){
	if (getBuildingsByType(BUILDING_TYPE.EMPTY) == 0)
		return -1;
	var index = -1;
	do {
		index = Math.random()*buildings.length;
	} while (buildings[parseInt(index)].getType() != BUILDING_TYPE.EMPTY);
	return parseInt(index);
}

/**
 * checks to see if any buildings can be built priortizing forrest => farms => houses => quarry
 */
function builderAI(){
	// have empty spots
	if (getBuildingsByType(BUILDING_TYPE.EMPTY) == 0)
		return;
	
	if (needForrests()){
		if (canBuild(BUILDING_TYPE.FORREST)){
			buildBuilding(BUILDING_TYPE.FORREST, getOpenLand());
			console.log("Building forrest...");
		}
	}
	else if (needHouses()){
		if (canBuild(BUILDING_TYPE.STONE_HOUSE)){
			buildBuilding(BUILDING_TYPE.STONE_HOUSE, getOpenLand());
			console.log("Building stone house...");
		} 
		else if (canBuild(BUILDING_TYPE.WOODEN_HOUSE)) {
			buildBuilding(BUILDING_TYPE.WOODEN_HOUSE, getOpenLand());
			console.log("Building wooden house...");
		}
	}
	else if (needFarms()){
		if (canBuild(BUILDING_TYPE.FARM)){
			buildBuilding(BUILDING_TYPE.FARM, getOpenLand());
			console.log("Building farm...");
		} else {
			console.log("cannot build");
		}
	}
	else if (needQuarries()){
		if (canBuild(BUILDING_TYPE.QUARRY)){
			buildBuilding(BUILDING_TYPE.QUARRY, getOpenLand());
			console.log("Building quarries...");
		}
	}
}

/**
 * @returns true if building it was successful, false otherwise.
 * @param {Object} bType the BUILDING_TYPE for which the building should be.
 * @param {number} index place in buildings array.
 */
function buildBuilding(bType, index){
	// make sure they have the required resources
	if (!canBuild(bType))
		return false;
	// remove resources
	stone -= bType.stoneCost;
	wood -= bType.woodCost;
	// set the building
	buildings[index].resetType(bType);
	return true;
}

/**
 * @returns true if that building can be built now, false otherwise.
 * @param {Object} bType the BUILDING_TYPE for which building should be checked. 
 */
function canBuild(bType){
	if (bType.woodCost>wood || bType.stoneCost>stone)
		return false;
	return true;
}

/**
 * @returns Person object that matches that id, null if no person matches that id.
 * @param {number} id id of person.
 */
function getPersonByID(id){
	for (var q = 0; q < people.length; q++){
		if (people[q].getID()==id){
			return people[q];
		}
	}
	return null;
}

/**
 * sets a building on fire and kicks out all the occupants setting them on fire.
 * @param {number} index index in buildings array.
 */
function burnBuilding(index){
	// check to see if building can burn
	var build = buildings[index];
	// set building on fire
	if (!build.canBurn())
		return;
	build.setBurning(true);
	// kick out all the people and set them on fire.
	for (var q = 0; q < people.length; q++){
		var person = people[q];
		if (person.isInBuilding() && person.getBuilding() == index){
			person.setBurning(true);
			person.newObjective();
			build.removePerson();
		}
	}
}

/**
 * causes an explosion that damages and set building on fire
 * @param {number} x the x position of the explosion
 * @param {number} radius the radius of the explosion
 * @param {number} max the maximum damage at the center
 * @param {number} min the minimum damage at the edge or perimeter
 * @param {string} reason if a person dies the this then this reason will be displayed
 */
function explosion(x, radius, max, min = 0, reason = "explosion"){
	if (min>max)
		return;
	var x1 = x-radius;
	var x2 = x+radius;
	var damageDiff = max-min;
	// buildings
	for (var q = 0; q < buildings.length; q++){
		var center = q*blockSize+blockSize/2;
		if (center > x1 && center < x2){
			var distance = Math.abs(center-x);
			var damage = damageDiff*(1-(distance/radius))+min;
			burnBuilding(q);
			buildings[q].takeDamage(damage);
		}
	}
	// people
	for (var q = 0; q < people.length; q++){
		var center = people[q].getX();
		if (center > x1 && center < x2){
			var distance = Math.abs(center-x);
			var damage = damageDiff*(1-(distance/radius))+min;
			people[q].setBurning(true);
			people[q].takeDamage(damage, reason);
		}
	}
}

/**
 * @returns True if there is enough empty space in at least one house.
 * @param {number} space the number of space needed in a house.
 */
function openSpaceInHouse(space){
	for (var q = 0; q < buildings.length; q++){
		if ((buildings[q].getType()==BUILDING_TYPE.STONE_HOUSE || 
				buildings[q].getType()==BUILDING_TYPE.WOODEN_HOUSE) 
				&& buildings[q].getEmptySpace() >= space)
			return true;
	}
	return false;
}

/**
 * @returns the index of the closest building that matches the BUILDING_TYPE, -1 if none can be found
 * @param {*} x position to find the closest building to.
 * @param {*} bType the BUILDING_TYPE looking for.
 * @param {number} space the number of space need in the closest building.
 */
function findClosestBuilding(x, bType, space = 1){
	var index = -1;
	var distance = -1;
	// find closest building
	for (var q = 0; q < buildings.length; q++){
		if ((Math.abs((q*blockSize)+(blockSize/2)-x)<distance || distance<0) && buildings[q].getType() == bType && buildings[q].getEmptySpace() >= space && buildings[q].isUseable()){
			index = q;
			distance = Math.abs((q*blockSize)+(blockSize/2)-x);
		}
	}
	return index;
}

/**
 * @returns the number of the people with this sex.
 * @param {*} sex the sex to check for use SEX.MALE or SEX.FEMALE
 */
function getPopulationBySex(sex){
	var sum = 0;
	for (var q = 0; q < people.length; q++){
		if (people[q].getSex()==sex){
			sum++;
		}
	}
	return sum;
}

function spawnNewPerson(){
	people[people.length] = new Person();
}

/**
 * @returns the current weather in the world. First it will use the years array, after
 * the game year has gone passed the size of the years array it uses repeat years.
 */
function getCurrentWeather(){
	var year = parseInt(gameYear);
	if (year < years.length){
		return years[year];
	} else {
		return repeatYears[(year-years.length)%repeatYears.length];
	}
}

/**
 * updates the buttons in the controller on the bottom of the screen.
 */
function updateControllerHtml(){
	document.getElementById("control-population").innerHTML = "Population ("+getPopulation()+")";
	document.getElementById("control-resources").innerHTML = "Food ("+parseInt(food)+") Wood ("+parseInt(wood)+") Stone ("+parseInt(stone)+")";
	document.getElementById("control-speed").innerHTML = "Speed ("+speeds[speedIndex].name+")";
	if (running){
		document.getElementById("control-pause-resume").style.background = "url(images/pause.png)";
	} else {
		document.getElementById("control-pause-resume").style.background = "url(images/resume.png)";
	}
}

function updateResourcesHtml(){
	document.getElementById("popup-res-food").innerHTML = ""+parseInt(food);
	document.getElementById("popup-res-wood").innerHTML = ""+parseInt(wood);
	document.getElementById("popup-res-stone").innerHTML = ""+parseInt(stone);

	document.getElementById("popup-res-houses").innerHTML = 
			""+(getBuildingsByType(BUILDING_TYPE.STONE_HOUSE)
			+getBuildingsByType(BUILDING_TYPE.WOODEN_HOUSE));
	document.getElementById("popup-res-population").innerHTML = ""+people.length;
	document.getElementById("popup-res-females").innerHTML = ""+getPopulationBySex(SEX.FEMALE);
	document.getElementById("popup-res-males").innerHTML = ""+getPopulationBySex(SEX.MALE);
	document.getElementById("popup-res-hs").innerHTML = ""+getTotalHousingSpace();

	document.getElementById("popup-res-farms").innerHTML = ""+getBuildingsByType(BUILDING_TYPE.FARM);
	//document.getElementById("popup-res-activefarms").innerHTML = ""+getTotalHousingSpace(); // todo
	document.getElementById("popup-res-foodproduction").innerHTML = ""+getTotalFoodProduction();
	document.getElementById("popup-res-foodconsumption").innerHTML = ""+getTotalFoodConsumption();

	document.getElementById("popup-res-forrests").innerHTML = ""+getBuildingsByType(BUILDING_TYPE.FORREST);
	//document.getElementById("popup-res-activeforrests").innerHTML = ""+getTotalFoodConsumption();
	//document.getElementById("popup-res-woodproduction").innerHtml = ""+getWoodProduction();

	document.getElementById("popup-res-quarries").innerHTML = ""+getBuildingsByType(BUILDING_TYPE.QUARRY);
	//document.getElementById("popup-res-activequarries").innerHTML = ""+getTotalFoodConsumption();
	//document.getElementById("popup-res-stoneproduction").innerHtml = ""+getStoneProduction();
}

// html:
// https://p5js.org/examples/dom-input-and-button.html


function loadMap(data){
	mapName = data.name;
	wood = data.wood;
	stone = data.stone;
	food = data.food;
	buildings = [];
	for (var q = 0; q < data.buildings.length; q++){
		buildings[q] = new Building(getBuildingType(data.buildings[q]));
	}
	years = [];
	for (var q = 0; q < data.years.length; q++){
		var year = data.years[q];
		years[q] = getWeather(year.name, year.params);
	}
	repeatYears = [];
	for (var q = 0; q < data.repeatyears.length; q++){
		var year = data.repeatyears[q];
		repeatYears[q] = getWeather(year.name, year.params);
	}
	people = [];
	for (var q = 0; q < data.people.length; q++){
		var person = data.people[q];
		people[q] = new Person(person.x, person.age, getSex(person.sex));
	}
	ss = loadImage(data.ss);
	backgroundImage = loadImage(data.background);
	SPRITES.GRASS_BLOCK = new Sprite([new SpriteImage(data.grassblock.x,data.grassblock.y, data.grassblock.w, data.grassblock.h)]);
	SPRITES.WOODEN_HOUSE = new Sprite([new SpriteImage(data.woodenhouse.x, data.woodenhouse.y, data.woodenhouse.w, data.woodenhouse.h)]);
	SPRITES.FORREST = new Sprite([new SpriteImage(data.forrest.x, data.forrest.y, data.forrest.w, data.forrest.h)]);
	SPRITES.FARM = new Sprite([new SpriteImage(data.farm.x, data.farm.y, data.farm.w, data.farm.h)]);
	SPRITES.QUARRY = new Sprite([new SpriteImage(data.quarry.x, data.quarry.y, data.quarry.w, data.quarry.h)]);
	SPRITES.STONE_HOUSE = new Sprite([new SpriteImage(data.stonehouse.x, data.stonehouse.y, data.stonehouse.w, data.stonehouse.h)]);
	SPRITES.GRASS = new Sprite([new SpriteImage(data.grass.x, data.grass.y, data.grass.w, data.grass.h)]);
}