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
var yearsPerSecond = .5;

// food eaten per person per second
var foodConsumption = 0.5;

// burning
var burnDamage = 4;
var burnStopChance = 0.3; // chances of a burning building to stop burning 0 - no chance, 1 - 100% chance
var buildingRegenRate = 0.5;

// people
var personHealth = 100.0;
var personSpeed = 32.0;
var personSpeedRandom = 16; // +/- from the personSpeed
var personBurnDamage = 10;

// images
var ss;
var backgroundImage;
//var imageMultiplier = 1; // make images bigger

// game boolean => used to pause and resume game
var running = true;

// changes the display
var debugMode;
var debugKey = 192; // ascii code for `

// hud
var hudHeight = 64;

var screenManager;

function setup() {
	debugMode = false;

	// setup canvas
	canvas = createCanvas(640, 320+hudHeight);
	
	// setup screens
	screenManager = new SketchScreenManager();
	screenManager.addScreen(new HUD());
	screenManager.addScreen(new GlobalInfo());

	// only recieve mouse input when clicked on canvas
	canvas.mousePressed(onMousePressed);
	

	// assign canvas to html div
	canvas.parent("canvas-holder");

	ss = loadImage("https://i.imgur.com/2xdommg.png");
	backgroundImage = loadImage("https://i.imgur.com/bLxcjh3.jpg");

	setFrameRate(32);

	setUpWorld(20);
}

/**
 * called when the a key is realesed
 */
function keyReleased(){	
	console.log(keyCode);
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
	image(backgroundImage, 0, 0, width, getGameHeight());
	fill(0,255,255);
	rect(0, getGameHeight(), width, hudHeight);
	//console.log(getFrameRate());
	builderAI();
	for (var q = 0; q < buildings.length; q++){
		// draw grass below building
		image(ss,q*blockSize,getGameHeight()-blockSize,blockSize,blockSize,0,0,31,32);
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
}

function pause(){
	running = false;
}

function resume(){
	running = true;
}

/**
 * initalizes the buildings and people array.
 * @param {number} worldWidth the number of buildings on the map.
 */
function setUpWorld(worldWidth){
	buildings = [];
	people = [new Person(width/2, 0, 0), new Person(width/2, 0, 1)];
	godPowers = [new Lightning()];
	for (var q = 0; q < worldWidth; q++){
		buildings[q] = new Building();
	}
}

function onMousePressed() {
	for (var q = 0; q < godPowers.length; q++){
		if (godPowers[q].isActive())
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
	return getBuildingsByType(BUILDING_TYPE.FARM) > getPeopleByOccupation(OCCUPATION.FARMER);
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
	return getBuildingsByType(BUILDING_TYPE.FORREST) > getPeopleByOccupation(OCCUPATION.FORREST_WORKER);
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
	return getBuildingsByType(BUILDING_TYPE.QUARRY) > getPeopleByOccupation(OCCUPATION.QUARRY_WORKER);
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

/**
 * @returns the height of the game excluding the hud at the bottom.
 */
function getGameHeight(){
	return height-hudHeight;
}

// html:
// https://p5js.org/examples/dom-input-and-button.html