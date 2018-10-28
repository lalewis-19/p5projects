// p5js
var canvas;

var blockSize = 32; // pixels

// all arrays
var buildings;
var people;
var godPowers;

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
var speeds = [{name:"x.5", speed: 16}, {name:"x1", speed: 8}, {name:"x2", speed: 4}, {name:"x4", speed: 2}, {name:"x8", speed: 1}];
var speedIndex = 1;

// food eaten per person per year
var foodConsumption = 0.5;

// burning
var burnDamage = 50;
var burnStopChance = 0.3; // chances of a burning building to stop burning 0 - no chance, 1 - 100% chance
var buildingRegenRate = 0.5;

// people
var personHealth = 100.0;
var personSpeed = 320.0; // pixels traveled in a year
var personSpeedRandom = 100; // +/- from the personSpeed
var personBurnDamage = 100; // per year
var personLove = 5; // chance to fall in love % increase every year.

// images
var ss;
var backgroundImage;
//var imageMultiplier = 1; // make images bigger

// game boolean => used to pause and resume game
var running = true;

// changes the display
var debugMode;
var debugKey = 192; // ascii code for `

// TODO: https://www.1001fonts.com/dpcomic-font.html
var font;

// hud
var hudHeight = 64;

var screenManager;

class Sprite {
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

const SPRITES = {
	GRASS_BLOCK: new Sprite(0, 0, 32, 32),
	WOODEN_HOUSE: new Sprite(32, 0, 32, 32),
	FORREST: new Sprite(64, 0, 32, 32),
	FARM: new Sprite(96, 0, 32, 32),
	QUARRY: new Sprite(128, 0, 32, 32),
	STONE_HOUSE: new Sprite(160, 0, 32, 32),
	GRASS: new Sprite(192, 0, 32, 32),
	BUILDING_FIRE: new Sprite(224, 0, 32, 32),
	LIGHTNING_RIGHT: new Sprite(32, 32, 16, 32),
	LIGHTNING_LEFT: new Sprite(48, 32, 15, 31), // check values
	// power effects
	LIGHTNING_POWER_ACTIVE: new Sprite(64, 32, 32, 32),
	LIGHTNING_POWER_UNACTIVE: new Sprite(96, 32, 32, 32),
	SUN_POWER_ACTIVE: new Sprite(128, 32, 32, 32),
	SUN_POWER_UNACTIVE: new Sprite(160, 32, 32, 32),
	SPAWN_POWER_ACTIVE: new Sprite(192, 32, 32, 32),
	SPAWN_POWER_UNACTIVE: new Sprite(224, 32, 32, 32),
	// character models
	CHAR1_MALE: new Sprite(0, 64, 16, 32),
	CHAR1_FEMALE: new Sprite(16, 64, 16, 32),
	CHAR1_MALE_FIRE: new Sprite(32, 64, 16, 32),
	CHAR1_FEMALE_FIRE: new Sprite(48, 64, 16, 32),
	CHAR2_MALE: new Sprite(0, 96, 16, 32),
	CHAR2_FEMALE: new Sprite(16, 96, 16, 32),
	CHAR2_MALE_FIRE: new Sprite(32, 96, 16, 32),
	CHAR2_FEMALE_FIRE: new Sprite(48, 96, 16, 32),
	// other
	PAUSE: new Sprite(288, 0, 24, 24),
	RESUME: new Sprite(288, 24, 24, 24),
	HELP: new Sprite(256, 0, 32, 32),
}

function preload(){
	// https://ff.static.1001fonts.net/d/p/dpcomic.regular.ttf
	font = loadFont("fonts/dpcomic.ttf");
	ss = loadImage("images/ss.png");
	backgroundImage = loadImage("https://i.imgur.com/bLxcjh3.jpg");
}

function setup() {
	debugMode = false;

	// setup canvas
	canvas = createCanvas(640, 320+hudHeight);

	var worldWidth = 20;

	buildings = [];
	people = [new Person(width/2, 0, 0), new Person(width/2, 0, 1)];
	godPowers = [new Lightning(), new Sun(), new SpawnPerson()];
	for (var q = 0; q < worldWidth; q++){
		buildings[q] = new Building();
	}
	
	// setup screens
	screenManager = new SketchScreenManager();
	screenManager.addScreen(new HUD());
	screenManager.addScreen(new GlobalInfo());
	screenManager.addScreen(new Tutorial1());
	screenManager.addScreen(new Tutorial2());
	screenManager.addScreen(new Tutorial3());
	screenManager.addScreen(new Tutorial4());

	//Tutorial1
	//Tutorial1
	// only recieve mouse input when clicked on canvas
	canvas.mousePressed(onMousePressed);

	// assign canvas to html div
	canvas.parent("canvas-holder");

	setFrameRate(32);
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
	screenManager.onKeyReleased();
}

/**
 * draw from p5js
 */
function draw() {
	textFont(font);
	if (running && getFrameRate() != 0 && secondsPerYear != 0){
		gameYear += 1/(getFrameRate()*secondsPerYear);
	}
	//background(255);
	//new Sprite(0, 32, 32, 32).drawSprite(0, 0, 640, 320);
	///*
	image(backgroundImage, 0, 0, width, getGameHeight());
	fill(99,83,32);
	noStroke();
	rect(0, getGameHeight(), width, hudHeight);
	//console.log(getFrameRate());
	builderAI();
	for (var q = 0; q < buildings.length; q++){
		// draw grass below building
		SPRITES.GRASS_BLOCK.drawSprite(q*blockSize, getGameHeight()-blockSize, blockSize, blockSize);
		buildings[q].draw(q*blockSize);
		if (running)
			buildings[q].update();
	}
	for (var q = 0; q < people.length; q++){
		people[q].draw();
		if (running)
			people[q].update();
	}
	for (var q = 0; q < godPowers.length; q++){
		godPowers[q].draw();
		godPowers[q].update();
	}
	screenManager.draw();
	//*/
}

function pause(){
	running = false;
}

function resume(){
	running = true;
}

function onMousePressed() {
	for (var q = 0; q < godPowers.length; q++){
		if (godPowers[q].isActive() && mouseY < getGameHeight())
			godPowers[q].mouseClicked();
	}
	screenManager.onMouseReleased();
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

function toggleSpeed(){
	speedIndex++;
	if (speedIndex >= speeds.length)
		speedIndex = 0;
	secondsPerYear = speeds[speedIndex].speed;
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
 * @returns the god power that matches the class otherwise null.
 * @param {class} power class of the god power.
 */
function getGodPower(power){
	for (var q = 0; q < godPowers.length; q++){
		if (godPowers[q].constructor.name == power){
			return godPowers[q];
		}
	}
	return null;
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

/**
 * @returns the height of the game excluding the hud at the bottom.
 */
function getGameHeight(){
	return height-hudHeight;
}

// html:
// https://p5js.org/examples/dom-input-and-button.html
